import {
  auth,
  functions,
  httpsCallable,
  signInWithEmailAndPassword
} from './config.js';

let completeEmailRegistrationCallable;

const normalizeCallableCode = (code = '') =>
  String(code || '').replace(/^functions\//, '').replace(/^auth\//, '');

const buildRegistrationError = (message, code) => {
  const error = new Error(message);
  error.code = code;
  return error;
};

const mapRegistrationError = (error) => {
  const code = normalizeCallableCode(error?.code);

  if (code === 'already-exists') {
    return buildRegistrationError(
      error?.message || 'An account with this email or username already exists.',
      code
    );
  }

  if (code === 'failed-precondition') {
    return buildRegistrationError(
      error?.message || 'Verify your email address before creating an account.',
      code
    );
  }

  if (code === 'deadline-exceeded') {
    return buildRegistrationError(
      error?.message || 'Email verification expired. Request a new code and try again.',
      code
    );
  }

  if (code === 'invalid-argument') {
    return buildRegistrationError(
      error?.message || 'Please review your registration details and try again.',
      code
    );
  }

  if (code === 'internal' || code === 'unavailable') {
    return buildRegistrationError(
      'Unable to complete signup right now. Please try again.',
      code
    );
  }

  return buildRegistrationError(
    error?.message || 'Unable to complete signup right now. Please try again.',
    code || 'unknown'
  );
};

const getCompleteEmailRegistrationCallable = () => {
  if (!completeEmailRegistrationCallable) {
    completeEmailRegistrationCallable = httpsCallable(functions, 'completeEmailRegistration');
  }

  return completeEmailRegistrationCallable;
};

export const completeEmailRegistration = async ({
  email,
  password,
  username,
  displayName
}) => {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const normalizedUsername = String(username || '').trim().toLowerCase();
  const normalizedDisplayName = String(displayName || username || '').trim() || normalizedUsername;

  try {
    const callable = getCompleteEmailRegistrationCallable();
    await callable({
      email: normalizedEmail,
      password,
      username: normalizedUsername,
      displayName: normalizedDisplayName
    });

    const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
    if (typeof userCredential?.user?.getIdToken === 'function') {
      await userCredential.user.getIdToken(true);
    }

    return userCredential.user;
  } catch (error) {
    if (normalizeCallableCode(error?.code)) {
      throw mapRegistrationError(error);
    }

    throw error;
  }
};

export const __private__ = {
  resetCallables() {
    completeEmailRegistrationCallable = undefined;
  }
};
