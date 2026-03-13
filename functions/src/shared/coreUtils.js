const { functions, crypto } = require('../runtime');

const getEmailKey = (email) => (
  crypto.createHash('sha256').update(String(email || '').toLowerCase()).digest('hex')
);

const hashOtp = (otp, salt = '') => (
  crypto.createHash('sha256').update(`${otp}:${salt}`).digest('hex')
);

const getIpHash = (ip = '') => {
  if (!ip) return null;
  return crypto.createHash('sha256').update(ip).digest('hex');
};

const getClientIp = (context) => {
  const raw = context?.rawRequest;
  const forwarded = raw?.headers?.['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  return raw?.ip || raw?.connection?.remoteAddress || '';
};

const sanitizeText = (value, maxLength = 1000) => {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
};

const getRequiredEnv = (name) => {
  const value = typeof process.env[name] === 'string' ? process.env[name].trim() : '';
  if (!value) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      `${name} is not configured for this environment.`
    );
  }

  return value;
};

const sanitizeFileName = (value = 'avatar', maxLength = 80) => (
  sanitizeText(value, maxLength).replace(/[^a-zA-Z0-9._-]/g, '_') || 'avatar'
);

const stripBase64Prefix = (value = '') => (
  typeof value === 'string' ? value.replace(/^data:[^;]+;base64,/, '').trim() : ''
);

const escapeHtml = (value = '') => (
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
);

const isAvatarPathOwnedByUser = (path, userId) => {
  const normalizedPath = sanitizeText(path || '', 260);
  return normalizedPath.startsWith(`avatars/${userId}/`);
};

const buildStorageDownloadUrl = (bucketName, path, token) => (
  `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(path)}?alt=media&token=${token}`
);

module.exports = {
  getEmailKey,
  hashOtp,
  getIpHash,
  getClientIp,
  sanitizeText,
  getRequiredEnv,
  sanitizeFileName,
  stripBase64Prefix,
  escapeHtml,
  isAvatarPathOwnedByUser,
  buildStorageDownloadUrl
};
