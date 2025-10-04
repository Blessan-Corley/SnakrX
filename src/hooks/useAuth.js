/**
 * SnakrX Authentication Hook - V4 (Refactored & Modular)
 * Main authentication hook using modular components
 *
 * @version 4.0.0
 */

import { useState, useEffect, useCallback } from 'react';
import {
  auth,
  db,
  onAuthStateChanged,
  doc,
  serverTimestamp,
  COLLECTIONS,
  firestoreOperations
} from '../services/firebase/index.js';
import toast from 'react-hot-toast';
import logger from '../utils/logger.js';
import { AuthContext } from './auth/context.js';
import { createDefaultUserProfile, createBasicProfile } from './auth/constants.js';

/**
 * AuthProvider Component
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Refresh user profile
  const refreshProfile = useCallback(async () => {
    if (user) {
      await refreshUserProfile(user, setUserProfile);
    }
  }, [user]);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setUser(firebaseUser);

          try {
            const userDocRef = doc(db, COLLECTIONS.USERS, firebaseUser.uid);
            const userDoc = await firestoreOperations.getDocument(userDocRef);

            if (userDoc.exists()) {
              const userData = userDoc.data();
              setUserProfile({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                ...userData
              });

              // Update last login
              firestoreOperations.updateDocument(userDocRef, {
                lastLoginAt: serverTimestamp()
              }).catch(logger.warn);
            } else {
              // Create profile
              logger.warn(`User ${firebaseUser.uid} exists in Auth but not in Firestore. Creating profile...`);
              const newProfile = createDefaultUserProfile(firebaseUser);
              await firestoreOperations.setDocument(userDocRef, newProfile);
              logger.log('✅ New user profile created:', newProfile);
              setUserProfile({ uid: firebaseUser.uid, ...newProfile });
            }
          } catch (error) {
            logger.warn("Could not load user profile:", error.message);
            const basicProfile = createBasicProfile(firebaseUser);
            setUserProfile(basicProfile);
          }
        } else {
          setUser(null);
          setUserProfile(null);
        }
      } catch (error) {
        logger.error("Auth State Change Error:", error);

        if (error.code === 'auth/invalid-api-key') {
          toast.error("Authentication configuration error. Please check your settings.");
        } else if (error.code === 'auth/network-request-failed' || error.message?.includes('offline')) {
          logger.info("Working in offline mode - authentication features will be limited");
          setUser(null);
          setUserProfile(null);
        } else if (error.code === 'auth/web-storage-unsupported') {
          toast.error("Browser storage is not available. Please enable cookies.");
        } else {
          logger.warn("Auth error (non-critical):", error.message);
        }
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    userProfile,
    loading,
    initialized,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Refresh user profile from Firestore
 */
export const refreshUserProfile = async (user, setUserProfile) => {
  if (!user) return;

  try {
    const userDocRef = doc(db, COLLECTIONS.USERS, user.uid);
    const userDoc = await firestoreOperations.getDocument(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      logger.log('🔄 User profile refreshed:', userData?.stats);
      setUserProfile({
        uid: user.uid,
        email: user.email,
        ...userData
      });
      return userData;
    }
  } catch (error) {
    logger.warn('Error refreshing user profile:', error);
  }
  return null;
};

// Re-export from modular components
export { useAuth } from './auth/context.js';
export { useAuthOperations } from './auth/authOperations.js';
export { useUserStats } from './auth/userStats.js';
