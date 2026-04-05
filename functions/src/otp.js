const { functions, admin, crypto, db } = require('./runtime');
const {
  OTP_COLLECTION,
  OTP_RATE_LIMITS,
  OTP_TTL_MS,
  RESEND_COOLDOWN_MS,
  MAX_REQUESTS_PER_HOUR,
  MAX_VERIFY_ATTEMPTS,
  MAX_IP_REQUESTS_PER_HOUR,
  MAX_IP_VERIFY_PER_HOUR,
  getEmailKey,
  hashOtp,
  getIpHash,
  getClientIp,
  checkRateLimit,
  getTransporter,
  getOtpSalt,
  buildOtpEmail,
} = require('./shared/utils');
const { logCallableError } = require('./shared/observability');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_CODE_REGEX = /^\d{6}$/;

const normalizeEmail = (value = '') => (typeof value === 'string' ? value.trim().toLowerCase() : '');
const isValidEmail = (email) => EMAIL_REGEX.test(email);
const isValidOtpCode = (code) => OTP_CODE_REGEX.test(code);

const toMillis = (value, fallback = Date.now()) => (
  value?.toMillis ? value.toMillis() : (value ?? fallback)
);

const createHttpsError = (runtimeFunctions, code, message, details) => (
  new runtimeFunctions.https.HttpsError(code, message, details)
);

const resolveNow = (clock) => (typeof clock === 'function' ? clock() : (clock ?? Date.now()));

const requestEmailOtpCore = async (data, services = {}) => {
  const runtimeFunctions = services.functions || functions;
  const runtimeAdmin = services.admin || admin;
  const runtimeCrypto = services.crypto || crypto;
  const runtimeDb = services.db || db;
  const otpCollection = services.OTP_COLLECTION || OTP_COLLECTION;
  const otpRateLimitsCollection = services.OTP_RATE_LIMITS || OTP_RATE_LIMITS;
  const otpTtlMs = services.OTP_TTL_MS || OTP_TTL_MS;
  const resendCooldownMs = services.RESEND_COOLDOWN_MS || RESEND_COOLDOWN_MS;
  const maxRequestsPerHour = services.MAX_REQUESTS_PER_HOUR || MAX_REQUESTS_PER_HOUR;
  const maxIpRequestsPerHour = services.MAX_IP_REQUESTS_PER_HOUR || MAX_IP_REQUESTS_PER_HOUR;
  const getEmailKeyValue = services.getEmailKey || getEmailKey;
  const email = normalizeEmail(data.email);

  if (!email) {
    throw createHttpsError(runtimeFunctions, 'invalid-argument', 'Email is required.');
  }

  if (!isValidEmail(email)) {
    throw createHttpsError(runtimeFunctions, 'invalid-argument', 'Please provide a valid email address.');
  }

  const ip = (services.getClientIp || getClientIp)(services.context || {});
  const ipHash = (services.getIpHash || getIpHash)(ip);
  const emailKey = getEmailKeyValue(email);
  const docRef = runtimeDb.collection(otpCollection).doc(emailKey);

  const authLookupPromise = runtimeAdmin.auth().getUserByEmail(email)
    .then(() => ({ exists: true }))
    .catch((error) => {
      if (error?.code === 'auth/user-not-found') {
        return { exists: false };
      }

      throw error;
    });
  const ipCheckPromise = ipHash
    ? (services.checkRateLimit || checkRateLimit)(
        runtimeDb.collection(otpRateLimitsCollection).doc(ipHash),
        maxIpRequestsPerHour,
        60 * 60 * 1000,
        'request'
      )
    : Promise.resolve({ allowed: true });
  const existingOtpPromise = docRef.get();

  const [authLookup, ipCheck, doc] = await Promise.all([
    authLookupPromise,
    ipCheckPromise,
    existingOtpPromise
  ]);

  if (authLookup.exists) {
    throw createHttpsError(runtimeFunctions, 'already-exists', 'Email is already in use.');
  }

  if (!ipCheck.allowed) {
    throw createHttpsError(
      runtimeFunctions,
      'resource-exhausted',
      'Too many requests. Please try again later.',
      { retryAfterMs: ipCheck.retryAfterMs || 0 }
    );
  }

  const now = resolveNow(services.now);
  const dataExisting = doc.exists ? doc.data() : null;

  if (dataExisting && dataExisting.lastRequestedAt) {
    const lastRequestedAt = toMillis(dataExisting.lastRequestedAt, now);
    if (now - lastRequestedAt < resendCooldownMs) {
      throw createHttpsError(
        runtimeFunctions,
        'resource-exhausted',
        'Please wait before requesting another code.',
        { retryAfterMs: Math.max(0, resendCooldownMs - (now - lastRequestedAt)) }
      );
    }
  }

  const windowStart = dataExisting && dataExisting.windowStart
    ? toMillis(dataExisting.windowStart, now)
    : now;

  const requestCount = dataExisting && dataExisting.requestCount ? dataExisting.requestCount : 0;
  const withinWindow = now - windowStart < 60 * 60 * 1000;
  const nextCount = withinWindow ? requestCount + 1 : 1;
  const nextWindowStart = withinWindow ? windowStart : now;

  if (withinWindow && nextCount > maxRequestsPerHour) {
    throw createHttpsError(
      runtimeFunctions,
      'resource-exhausted',
      'Too many requests. Please try again later.',
      { retryAfterMs: Math.max(0, (60 * 60 * 1000) - (now - nextWindowStart)) }
    );
  }

  const otp = String(runtimeCrypto.randomInt(0, 1000000)).padStart(6, '0');
  const salt = (services.getOtpSalt || getOtpSalt)();
  const codeHash = (services.hashOtp || hashOtp)(otp, salt);
  const expiresAt = now + otpTtlMs;

  const transporter = (services.getTransporter || getTransporter)();
  const emailTemplate = (services.buildOtpEmail || buildOtpEmail)({
    code: otp,
    expiresMinutes: Math.floor(otpTtlMs / 60000)
  });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM ? process.env.EMAIL_FROM : `SnakrX <${process.env.EMAIL_USER}>`,
      to: email,
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html
    });
  } catch (error) {
    (services.logCallableError || logCallableError)('requestEmailOtp.sendMail', error, {
      responseCode: error?.responseCode || null
    });

    if (error?.code === 'EAUTH') {
      throw createHttpsError(
        runtimeFunctions,
        'failed-precondition',
        'Email provider authentication failed. Contact support.'
      );
    }

    throw createHttpsError(
      runtimeFunctions,
      'internal',
      'Unable to send verification email right now. Please try again.'
    );
  }

  await docRef.set({
    email,
    codeHash,
    attempts: 0,
    verified: false,
    consumedAt: null,
    consumedByUid: null,
    createdAt: runtimeAdmin.firestore.Timestamp.fromMillis(now),
    lastRequestedAt: runtimeAdmin.firestore.Timestamp.fromMillis(now),
    expiresAt: runtimeAdmin.firestore.Timestamp.fromMillis(expiresAt),
    requestCount: nextCount,
    windowStart: runtimeAdmin.firestore.Timestamp.fromMillis(nextWindowStart)
  }, { merge: true });

  return { expiresAt };
};

const requestEmailOtp = functions.https.onCall(async (data, context) => (
  requestEmailOtpCore(data, { context })
));

const verifyEmailOtpCore = async (data, services = {}) => {
  const runtimeFunctions = services.functions || functions;
  const runtimeAdmin = services.admin || admin;
  const runtimeDb = services.db || db;
  const otpCollection = services.OTP_COLLECTION || OTP_COLLECTION;
  const otpRateLimitsCollection = services.OTP_RATE_LIMITS || OTP_RATE_LIMITS;
  const maxIpVerifyPerHour = services.MAX_IP_VERIFY_PER_HOUR || MAX_IP_VERIFY_PER_HOUR;
  const getEmailKeyValue = services.getEmailKey || getEmailKey;
  const email = normalizeEmail(data.email);
  const code = typeof data.code === 'string' ? data.code.trim() : '';

  if (!email || !code) {
    throw createHttpsError(runtimeFunctions, 'invalid-argument', 'Email and code are required.');
  }

  if (!/^\d{6}$/.test(code)) {
    throw createHttpsError(runtimeFunctions, 'invalid-argument', 'Invalid code format.');
  }

  const ip = (services.getClientIp || getClientIp)(services.context || {});
  const ipHash = (services.getIpHash || getIpHash)(ip);
  const emailKey = getEmailKeyValue(email);
  const docRef = runtimeDb.collection(otpCollection).doc(emailKey);
  const ipCheckPromise = ipHash
    ? (services.checkRateLimit || checkRateLimit)(
        runtimeDb.collection(otpRateLimitsCollection).doc(ipHash),
        maxIpVerifyPerHour,
        60 * 60 * 1000,
        'verify'
      )
    : Promise.resolve({ allowed: true });
  const docPromise = docRef.get();
  const [ipCheck, doc] = await Promise.all([ipCheckPromise, docPromise]);

  if (!ipCheck.allowed) {
    throw createHttpsError(
      runtimeFunctions,
      'resource-exhausted',
      'Too many verification attempts. Please try again later.',
      { retryAfterMs: ipCheck.retryAfterMs || 0 }
    );
  }

  if (!doc.exists) {
    throw createHttpsError(runtimeFunctions, 'not-found', 'No verification request found for this email.');
  }

  const dataExisting = doc.data();
  const now = resolveNow(services.now);
  const expiresAt = toMillis(dataExisting.expiresAt, now);

  if (now > expiresAt) {
    throw createHttpsError(runtimeFunctions, 'deadline-exceeded', 'Verification code has expired.');
  }

  if (dataExisting.consumedAt) {
    throw createHttpsError(
      runtimeFunctions,
      'failed-precondition',
      'This verification code was already used. Please request a new code.'
    );
  }

  if (dataExisting.verified) {
    return {
      verified: true,
      expiresAt,
      verifiedAt: dataExisting.verifiedAt?.toMillis
        ? dataExisting.verifiedAt.toMillis()
        : dataExisting.verifiedAt || now
    };
  }

  const attempts = dataExisting.attempts || 0;
  if (attempts >= MAX_VERIFY_ATTEMPTS) {
    throw createHttpsError(
      runtimeFunctions,
      'resource-exhausted',
      'Too many verification attempts. Please request a new code.'
    );
  }

  const salt = (services.getOtpSalt || getOtpSalt)();
  const candidateHash = (services.hashOtp || hashOtp)(code, salt);

  if (candidateHash !== dataExisting.codeHash) {
    await docRef.set({
      attempts: attempts + 1,
      updatedAt: runtimeAdmin.firestore.Timestamp.fromMillis(now)
    }, { merge: true });

    throw createHttpsError(runtimeFunctions, 'permission-denied', 'Invalid verification code.');
  }

  await docRef.set({
    verified: true,
    verifiedAt: runtimeAdmin.firestore.Timestamp.fromMillis(now),
    updatedAt: runtimeAdmin.firestore.Timestamp.fromMillis(now)
  }, { merge: true });

  return {
    verified: true,
    expiresAt,
    verifiedAt: now
  };
};

const verifyEmailOtp = functions.https.onCall(async (data, context) => (
  verifyEmailOtpCore(data, { context })
));

const __private__ = {
  normalizeEmail,
  isValidEmail,
  isValidOtpCode,
  requestEmailOtpCore,
  verifyEmailOtpCore
};

module.exports = {
  requestEmailOtp,
  verifyEmailOtp,
  __private__
};


