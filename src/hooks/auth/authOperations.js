/**
 * Auth Operations Module
 * Sign up, sign in, password reset operations
 */

import { useState, useCallback } from 'react';
import {
  auth,
  db,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  doc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  COLLECTIONS,
  firestoreOperations
} from '../../services/firebase/index.js';
import { isValidEmail, isValidUsername, isValidPassword } from '../../utils/gameUtils.js';
import toast from 'react-hot-toast';
import logger from '../../utils/logger.js';
import { createDefaultUserProfile } from './constants.js';
import { useRateLimit } from './rateLimit.js';

/**
 * Custom hook for authentication operations
 */
export const useAuthOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { checkRateLimit, recordFailedAttempt, resetAttempts } = useRateLimit();

  /**
   * Check if username is available
   */
  const checkUsernameAvailability = useCallback(async (username) => {
    try {
      const usersRef = collection(db, COLLECTIONS.USERS);
      const q = query(usersRef, where('username', '==', username.toLowerCase()));
      const querySnapshot = await getDocs(q);
      return querySnapshot.empty;
    } catch (err) {
      logger.error('Error checking username:', err);
      toast.error("Could not verify username. Please try again.");
      return false;
    }
  }, []);

  /**
   * Register a new user
   */
  const signUp = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const { username, email, password, securityAnswer } = userData;

      // Validate input
      if (!isValidUsername(username) || !isValidEmail(email) || !isValidPassword(password) || !securityAnswer) {
        throw new Error('Invalid registration data. Please check all fields.');
      }

      const isUsernameAvailable = await checkUsernameAvailability(username);
      if (!isUsernameAvailable) {
        throw new Error('This username is already taken. Please choose another.');
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user profile
      const userProfileData = {
        ...createDefaultUserProfile(user),
        username: username.toLowerCase(),
        displayName: username,
        email: email.toLowerCase(),
        securityAnswer: securityAnswer.toLowerCase().trim(),
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastActiveAt: serverTimestamp()
      };

      const userDocRef = doc(db, COLLECTIONS.USERS, user.uid);
      await firestoreOperations.setDocument(userDocRef, userProfileData);
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
   * Sign in user
   */
  const signIn = useCallback(async (identifier, password) => {
    if (!checkRateLimit()) {
      return { success: false, error: 'Too many attempts. Please try again later.' };
    }

    setLoading(true);
    setError(null);
    try {
      let email = identifier;

      // If identifier is username, get email
      if (!identifier.includes('@')) {
        const usersRef = collection(db, COLLECTIONS.USERS);
        const q = query(usersRef, where('username', '==', identifier.toLowerCase()));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) throw new Error('User not found.');
        email = querySnapshot.docs[0].data().email;
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
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
   * Verify security answer
   */
  const verifySecurityAnswer = useCallback(async (identifier, securityAnswer) => {
    setLoading(true);
    setError(null);
    try {
      const usersRef = collection(db, COLLECTIONS.USERS);
      const field = identifier.includes('@') ? 'email' : 'username';
      const q = query(usersRef, where(field, '==', identifier.toLowerCase()));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) throw new Error('User not found.');

      const userData = querySnapshot.docs[0].data();
      if (userData.securityAnswer?.toLowerCase().trim() !== securityAnswer.toLowerCase().trim()) {
        throw new Error('Security answer is incorrect.');
      }

      return { success: true, email: userData.email };
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Reset password
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
   * Sign out
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
   * Update profile
   */
  const updateProfile = useCallback(async (updates) => {
    setLoading(true);
    setError(null);
    try {
      if (!auth.currentUser) throw new Error('You must be signed in to update your profile.');
      const userDocRef = doc(db, COLLECTIONS.USERS, auth.currentUser.uid);
      await firestoreOperations.updateDocument(userDocRef, {
        ...updates,
        updatedAt: serverTimestamp()
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
    verifySecurityAnswer,
    resetPassword,
    logout,
    updateProfile,
    checkUsernameAvailability,
    loading,
    error,
    setError
  };
};

// Error message helpers
function getSignUpErrorMessage(err) {
  switch (err.code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Please try signing in instead.';
    case 'auth/invalid-email':
      return 'Invalid email address format.';
    case 'auth/operation-not-allowed':
      return 'Email/password accounts are not enabled. Please contact support.';
    case 'auth/weak-password':
      return 'Password is too weak. Please choose a stronger password with at least 6 characters.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection and try again.';
    default:
      if (err.message && (
        err.message.includes('Invalid registration data') ||
        err.message.includes('username is already taken') ||
        err.message.includes('validation')
      )) {
        return err.message;
      }
      return err.message || 'An unknown error occurred during sign-up.';
  }
}

function getSignInErrorMessage(err) {
  switch (err.code) {
    case 'auth/user-not-found':
      return 'No account found with this email or username.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect password. Please try again.';
    case 'auth/invalid-email':
      return 'Invalid email address format.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/too-many-requests':
      return 'Too many failed login attempts. Please try again later or reset your password.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection and try again.';
    default:
      if (err.message === 'User not found.') {
        return 'No account found with this username.';
      }
      return err.message || 'An unknown error occurred.';
  }
}

function getPasswordResetErrorMessage(err) {
  switch (err.code) {
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/invalid-email':
      return 'Invalid email address format.';
    case 'auth/too-many-requests':
      return 'Too many password reset requests. Please wait before trying again.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection and try again.';
    default:
      return err.message || 'Failed to send password reset email.';
  }
}
