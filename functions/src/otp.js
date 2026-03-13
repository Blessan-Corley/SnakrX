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

const requestEmailOtp = functions.https.onCall(async (data, context) => {
  const email = normalizeEmail(data.email);

  if (!email) {
    throw new functions.https.HttpsError('invalid-argument', 'Email is required.');
  }

  if (!isValidEmail(email)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide a valid email address.');
  }

  try {
    await admin.auth().getUserByEmail(email);
    throw new functions.https.HttpsError('already-exists', 'Email is already in use.');
  } catch (error) {
    if (error.code && error.code !== 'auth/user-not-found') {
      throw error;
    }
  }

  const ip = getClientIp(context);
  const ipHash = getIpHash(ip);
  if (ipHash) {
    const ipRef = db.collection(OTP_RATE_LIMITS).doc(ipHash);
    const ipCheck = await checkRateLimit(ipRef, MAX_IP_REQUESTS_PER_HOUR, 60 * 60 * 1000, 'request');
    if (!ipCheck.allowed) {
      throw new functions.https.HttpsError(
        'resource-exhausted',
        'Too many requests. Please try again later.',
        { retryAfterMs: ipCheck.retryAfterMs || 0 }
      );
    }
  }

  const emailKey = getEmailKey(email);
  const docRef = db.collection(OTP_COLLECTION).doc(emailKey);
  const now = Date.now();

  const doc = await docRef.get();
  const dataExisting = doc.exists ? doc.data() : null;

  if (dataExisting && dataExisting.lastRequestedAt) {
    const lastRequestedAt = dataExisting.lastRequestedAt.toMillis
      ? dataExisting.lastRequestedAt.toMillis()
      : dataExisting.lastRequestedAt;
    if (now - lastRequestedAt < RESEND_COOLDOWN_MS) {
      throw new functions.https.HttpsError(
        'resource-exhausted',
        'Please wait before requesting another code.',
        { retryAfterMs: Math.max(0, RESEND_COOLDOWN_MS - (now - lastRequestedAt)) }
      );
    }
  }

  const windowStart = dataExisting && dataExisting.windowStart
    ? (dataExisting.windowStart.toMillis ? dataExisting.windowStart.toMillis() : dataExisting.windowStart)
    : now;

  const requestCount = dataExisting && dataExisting.requestCount ? dataExisting.requestCount : 0;
  const withinWindow = now - windowStart < 60 * 60 * 1000;
  const nextCount = withinWindow ? requestCount + 1 : 1;
  const nextWindowStart = withinWindow ? windowStart : now;

  if (withinWindow && nextCount > MAX_REQUESTS_PER_HOUR) {
    throw new functions.https.HttpsError(
      'resource-exhausted',
      'Too many requests. Please try again later.',
      { retryAfterMs: Math.max(0, (60 * 60 * 1000) - (now - nextWindowStart)) }
    );
  }

  const otp = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
  const salt = getOtpSalt();
  const codeHash = hashOtp(otp, salt);
  const expiresAt = now + OTP_TTL_MS;

  const transporter = getTransporter();
  const emailTemplate = buildOtpEmail({ code: otp, expiresMinutes: Math.floor(OTP_TTL_MS / 60000) });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM ? process.env.EMAIL_FROM : `SnakrX <${process.env.EMAIL_USER}>`,
      to: email,
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html
    });
  } catch (error) {
    logCallableError('requestEmailOtp.sendMail', error, {
      responseCode: error?.responseCode || null
    });

    if (error?.code === 'EAUTH') {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Email provider authentication failed. Contact support.'
      );
    }

    throw new functions.https.HttpsError(
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
    createdAt: admin.firestore.Timestamp.fromMillis(now),
    lastRequestedAt: admin.firestore.Timestamp.fromMillis(now),
    expiresAt: admin.firestore.Timestamp.fromMillis(expiresAt),
    requestCount: nextCount,
    windowStart: admin.firestore.Timestamp.fromMillis(nextWindowStart)
  }, { merge: true });

  return { expiresAt };
});

const verifyEmailOtp = functions.https.onCall(async (data, context) => {
  const email = normalizeEmail(data.email);
  const code = typeof data.code === 'string' ? data.code.trim() : '';

  if (!email || !code) {
    throw new functions.https.HttpsError('invalid-argument', 'Email and code are required.');
  }

  if (!/^\d{6}$/.test(code)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid code format.');
  }

  const ip = getClientIp(context);
  const ipHash = getIpHash(ip);
  if (ipHash) {
    const ipRef = db.collection(OTP_RATE_LIMITS).doc(ipHash);
    const ipCheck = await checkRateLimit(ipRef, MAX_IP_VERIFY_PER_HOUR, 60 * 60 * 1000, 'verify');
    if (!ipCheck.allowed) {
      throw new functions.https.HttpsError(
        'resource-exhausted',
        'Too many verification attempts. Please try again later.',
        { retryAfterMs: ipCheck.retryAfterMs || 0 }
      );
    }
  }

  const emailKey = getEmailKey(email);
  const docRef = db.collection(OTP_COLLECTION).doc(emailKey);
  const doc = await docRef.get();

  if (!doc.exists) {
    throw new functions.https.HttpsError('not-found', 'No verification request found for this email.');
  }

  const dataExisting = doc.data();
  const now = Date.now();
  const expiresAt = dataExisting.expiresAt.toMillis ? dataExisting.expiresAt.toMillis() : dataExisting.expiresAt;

  if (now > expiresAt) {
    throw new functions.https.HttpsError('deadline-exceeded', 'Verification code has expired.');
  }

  if (dataExisting.consumedAt) {
    throw new functions.https.HttpsError(
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
    throw new functions.https.HttpsError('resource-exhausted', 'Too many verification attempts. Please request a new code.');
  }

  const salt = getOtpSalt();
  const candidateHash = hashOtp(code, salt);

  if (candidateHash !== dataExisting.codeHash) {
    await docRef.set({
      attempts: attempts + 1,
      updatedAt: admin.firestore.Timestamp.fromMillis(now)
    }, { merge: true });

    throw new functions.https.HttpsError('permission-denied', 'Invalid verification code.');
  }

  await docRef.set({
    verified: true,
    verifiedAt: admin.firestore.Timestamp.fromMillis(now),
    updatedAt: admin.firestore.Timestamp.fromMillis(now)
  }, { merge: true });

  return {
    verified: true,
    expiresAt,
    verifiedAt: now
  };
});

const __private__ = {
  normalizeEmail,
  isValidEmail,
  isValidOtpCode
};

module.exports = {
  requestEmailOtp,
  verifyEmailOtp,
  __private__
};


