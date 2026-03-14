const { functions, admin } = require('./runtime');
const { getTransporter, buildPasswordResetEmail } = require('./shared/emailUtils');
const { getRequiredEnv, sanitizeText } = require('./shared/coreUtils');
const { logCallableError, logCallableInfo } = require('./shared/observability');

const DEFAULT_APP_BASE_URL = 'https://snakrx-23b0b.web.app';
const RESET_PATH = '/reset-password';
const RESET_QUERY_KEYS = ['mode', 'oobCode', 'apiKey', 'lang', 'continueUrl', 'tenantId'];

const normalizeEmail = (value) => sanitizeText(value || '', 160).toLowerCase();
const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const getAppBaseUrl = () => {
  const configured = sanitizeText(process.env.PUBLIC_APP_URL || '', 300);
  return configured || DEFAULT_APP_BASE_URL;
};

const buildCustomResetLink = (firebaseLink, appBaseUrl = DEFAULT_APP_BASE_URL) => {
  const source = new URL(firebaseLink);
  const target = new URL(RESET_PATH, appBaseUrl);

  RESET_QUERY_KEYS.forEach((key) => {
    const value = source.searchParams.get(key);
    if (value) {
      target.searchParams.set(key, value);
    }
  });

  return target.toString();
};

const requestPasswordResetEmailCore = async (
  data,
  {
    adminAuth = admin.auth(),
    getTransporter: resolveTransporter = getTransporter,
    getRequiredEnv: resolveRequiredEnv = getRequiredEnv,
    buildPasswordResetEmail: resolveTemplate = buildPasswordResetEmail
  } = {}
) => {
  const email = normalizeEmail(data?.email);
  if (!isValidEmail(email)) {
    throw new functions.https.HttpsError('invalid-argument', 'Please provide a valid email address.');
  }

  try {
    const firebaseLink = await adminAuth.generatePasswordResetLink(email);
    const resetLink = buildCustomResetLink(firebaseLink, getAppBaseUrl());
    const message = resolveTemplate({ resetLink });

    await resolveTransporter().sendMail({
      from: resolveRequiredEnv('EMAIL_FROM'),
      to: email,
      subject: message.subject,
      text: message.text,
      html: message.html
    });

    logCallableInfo('requestPasswordResetEmail', { email });
    return { success: true };
  } catch (error) {
    if (error?.code === 'auth/user-not-found') {
      logCallableInfo('requestPasswordResetEmail', { email, skipped: 'user-not-found' });
      return { success: true };
    }

    logCallableError('requestPasswordResetEmail', error, { email });

    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError(
      'internal',
      'Unable to send a password reset email right now. Please try again.'
    );
  }
};

const requestPasswordResetEmail = functions.https.onCall(async (data) => (
  requestPasswordResetEmailCore(data)
));

module.exports = {
  requestPasswordResetEmail,
  __private__: {
    DEFAULT_APP_BASE_URL,
    RESET_PATH,
    normalizeEmail,
    isValidEmail,
    buildCustomResetLink,
    requestPasswordResetEmailCore
  }
};
