import { functions, httpsCallable } from './config.js';

let requestPasswordResetEmailCallable;

const normalizeErrorCode = (code = '') => code.replace(/^functions\//, '').replace(/^auth\//, '');

const buildResetError = (message, code) => {
  const error = new Error(message);
  error.code = code;
  return error;
};

const mapResetError = (error, fallbackMessage) => {
  const code = normalizeErrorCode(error?.code || '');

  if (code === 'invalid-argument') {
    return buildResetError('Please enter a valid email address.', code);
  }

  if (code === 'internal' || code === 'unavailable') {
    return buildResetError('Unable to send a password reset email right now. Please try again.', code);
  }

  return buildResetError(error?.message || fallbackMessage, code || 'unknown');
};

export const requestPasswordResetEmail = async (email) => {
  const normalizedEmail = String(email || '').trim().toLowerCase();

  try {
    if (!requestPasswordResetEmailCallable) {
      requestPasswordResetEmailCallable = httpsCallable(functions, 'requestPasswordResetEmail');
    }

    const response = await requestPasswordResetEmailCallable({ email: normalizedEmail });
    return response.data;
  } catch (error) {
    throw mapResetError(error, 'Unable to send a password reset email.');
  }
};

export const __private__ = {
  resetCallables() {
    requestPasswordResetEmailCallable = undefined;
  }
};
