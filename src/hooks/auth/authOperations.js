/**
 * Auth Operations Module
 * Sign up, sign in, password reset operations.
 */
import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import {
  auth,
  db,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile as updateAuthProfile,
  COLLECTIONS
} from '../../services/firebase/index.js';
import logger from '../../utils/logger.js';
import { validators } from '../../utils/validation.js';
import { useRateLimit } from './rateLimit.js';
import {
  getPasswordResetErrorMessage,
  getSignInErrorMessage,
  getSignUpErrorMessage
} from './authOperationErrors.js';
import { checkUsernameAvailabilityRequest } from './operations/usernameAvailability.js';
import { registerUserAccount } from './operations/signUpWorkflow.js';
import { updateUserProfileData } from './operations/profileUpdates.js';

/**
 * Custom hook for authentication operations.
 */
export const useAuthOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { checkRateLimit, recordFailedAttempt, resetAttempts } = useRateLimit();

  /**
   * Check if username is available.
   */
  const checkUsernameAvailability = useCallback(async (username) => {
    try {
      return await checkUsernameAvailabilityRequest({
        COLLECTIONS,
        db,
        username,
        validators
      });
    } catch (err) {
      toast.error('Could not verify username. Please try again.');
      return false;
    }
  }, []);

  /**
   * Register a new user.
   */
  const signUp = useCallback(async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const user = await registerUserAccount({
        checkUsernameAvailability,
        userData,
        validators
      });

      toast.success('Welcome to SnakrX! Your account has been created.');
      return { success: true, user };
    } catch (err) {
      logger.error('Sign up error:', err);
      const errorMessage = getSignUpErrorMessage(err);
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [checkUsernameAvailability]);

  /**
   * Sign in user.
   */
  const signIn = useCallback(async (identifier, password) => {
    if (!checkRateLimit()) {
      return { success: false, error: 'Too many attempts. Please try again later.' };
    }

    setLoading(true);
    setError(null);

    try {
      if (!identifier.includes('@')) {
        throw new Error('Please sign in with your email address.');
      }

      const userCredential = await signInWithEmailAndPassword(auth, identifier, password);
      resetAttempts();
      toast.success(`Welcome back, ${userCredential.user.displayName || identifier}!`);
      return { success: true, user: userCredential.user };
    } catch (err) {
      recordFailedAttempt();
      logger.error('Sign in error:', err);
      const errorMessage = getSignInErrorMessage(err);
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [checkRateLimit, recordFailedAttempt, resetAttempts]);

  /**
   * Reset password.
   */
  const resetPassword = useCallback(async (email) => {
    setLoading(true);
    setError(null);

    try {
      await sendPasswordResetEmail(auth, email);
      toast.success(`Password reset link sent to ${email}. Please check your inbox.`);
      return { success: true };
    } catch (err) {
      logger.error('Password reset error:', err);
      const errorMessage = getPasswordResetErrorMessage(err);
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Sign out.
   */
  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      toast.success('You have been signed out.');
    } catch (err) {
      toast.error('Failed to sign out. Please try again.');
    }
  }, []);

  /**
   * Update profile.
   */
  const updateProfile = useCallback(async (updates) => {
    setLoading(true);
    setError(null);

    try {
      await updateUserProfileData({
        COLLECTIONS,
        updateAuthProfile,
        updates
      });

      toast.success('Profile updated successfully!');
      return { success: true };
    } catch (err) {
      setError(err.message);
      toast.error('Failed to update profile.');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    signUp,
    signIn,
    resetPassword,
    logout,
    updateProfile,
    checkUsernameAvailability,
    loading,
    error,
    setError
  };
};
