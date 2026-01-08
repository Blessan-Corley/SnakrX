/**
 * Email OTP Firebase Functions client
 */

import { fetchSignInMethodsForEmail } from 'firebase/auth';
import { auth, functions, httpsCallable } from './config.js';

const normalizeErrorCode = (code = '') => code.replace(/^functions\//, '').replace(/^auth\//, '');

const buildOtpError = (message, code, retryAfterMs = 0) => {
  const error = new Error(message);
  error.code = code;
  if (retryAfterMs > 0) {
    error.retryAfterMs = retryAfterMs;
  }
  return error;
};

const getRetryAfterMs = (error) => {
  const retryAfterMs = Number(error?.details?.retryAfterMs || 0);
  return Number.isFinite(retryAfterMs) && retryAfterMs > 0 ? retryAfterMs : 0;
};

const mapOtpError = (error, fallbackMessage) => {
  const code = normalizeErrorCode(error?.code || '');
  const retryAfterMs = getRetryAfterMs(error);

  if (code === 'already-exists') {
    return buildOtpError('Email is already registered. Please sign in or reset your password.', code);
  }
  if (code === 'resource-exhausted') {
    const retryHint = retryAfterMs > 0
      ? ` Try again in ${Math.ceil(retryAfterMs / 1000)}s.`
      : '';
    return buildOtpError(`Too many requests.${retryHint}`, code, retryAfterMs);
  }
  if (code === 'deadline-exceeded') {
    return buildOtpError('Code has expired. Please request a new one.', code);
  }
  if (code === 'permission-denied') {
    return buildOtpError('Invalid verification code. Please check and try again.', code);
  }
  if (code === 'not-found') {
    return buildOtpError('No verification code found for this email. Request a new code.', code);
  }
  if (code === 'invalid-argument') {
    return buildOtpError('Please enter a valid email and verification code.', code);
  }
  if (code === 'failed-precondition') {
    return buildOtpError(
      error?.message || 'OTP email service is temporarily unavailable. Please try again later.',
      code
    );
  }
  if (code === 'internal' || code === 'unavailable') {
    return buildOtpError('Unable to send verification code right now. Please try again.', code);
  }

  return buildOtpError(error?.message || fallbackMessage, code || 'unknown');
};

export const requestEmailOtp = async (email) => {
  const normalizedEmail = String(email || '').trim().toLowerCase();

  try {
    const existingMethods = await fetchSignInMethodsForEmail(auth, normalizedEmail);
    if (existingMethods.length > 0) {
      throw buildOtpError(
        'Email is already registered. Please sign in or reset your password.',
        'already-exists'
      );
    }

    const callable = httpsCallable(functions, 'requestEmailOtp');
    const response = await callable({ email: normalizedEmail });
    return response.data;
  } catch (error) {
    if (error?.code === 'already-exists') {
      throw error;
    }
    throw mapOtpError(error, 'Unable to send verification code.');
  }
};

export const verifyEmailOtp = async (email, code) => {
  const callable = httpsCallable(functions, 'verifyEmailOtp');

  try {
    const response = await callable({ email: String(email || '').trim().toLowerCase(), code: String(code || '').trim() });
    return response.data;
  } catch (error) {
    throw mapOtpError(error, 'Verification failed. Please try again.');
  }
};
