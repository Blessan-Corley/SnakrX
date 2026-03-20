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
  signOut,
  doc,
  COLLECTIONS
} from '../services/firebase/config.js';
import { firestoreOperations } from '../services/firebase/firestore.js';
import logger from '../utils/logger.js';
import { AuthContext } from './auth/context.js';
import { createBasicProfile } from './auth/constants.js';
import {
  bindRealtimeProfileSnapshot,
  ensurePublicProfileDocument,
  ensureUsernameReservation,
  handleAuthStateError,
  syncProfileActivityTimestamps
} from './auth/authProviderHelpers.js';
import { hydrateUserProfileState, refreshUserProfile } from './auth/profileRefresh.js';
import { useMountedState } from './auth/useMountedState.js';

/**
 * AuthProvider Component
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const { isMountedRef, setIfMounted } = useMountedState();

  // Refresh user profile
  const refreshProfile = useCallback(async () => {
    if (user) {
      return refreshUserProfile(user, (nextProfile) => {
        setIfMounted(() => setUserProfile(nextProfile));
      });
    }
    return null;
  }, [setIfMounted, user]);

  // Auth state listener
  useEffect(() => {
    isMountedRef.current = true;
    let profileSnapshotUnsubscribe = null;
    let isActive = true;

    const stopProfileSnapshot = () => {
      if (profileSnapshotUnsubscribe) {
        profileSnapshotUnsubscribe();
        profileSnapshotUnsubscribe = null;
      }
    };

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isActive || !isMountedRef.current) {
        return;
      }

      try {
        if (firebaseUser) {
          setIfMounted(() => setUser(firebaseUser));

          try {
            const userDocRef = doc(db, COLLECTIONS.USERS, firebaseUser.uid);
            const userDoc = await firestoreOperations.getDocument(userDocRef);
            if (!isActive || !isMountedRef.current) {
              return;
            }

            if (userDoc.exists()) {
              const userData = userDoc.data();
              await ensureUsernameReservation(
                firebaseUser,
                userData.username || firebaseUser.email.split('@')[0]
              );
              if (!isActive || !isMountedRef.current) {
                return;
              }

              setIfMounted(() => {
                hydrateUserProfileState(firebaseUser, userData, setUserProfile);
              });

              const publicProfileRef = await ensurePublicProfileDocument(firebaseUser, userData);
              if (!isActive || !isMountedRef.current) return;

              syncProfileActivityTimestamps(userDocRef, publicProfileRef);

              stopProfileSnapshot();
              if (!isActive || !isMountedRef.current) return;
              profileSnapshotUnsubscribe = bindRealtimeProfileSnapshot({
                firebaseUser,
                isMountedRef,
                setIfMounted,
                setUserProfile,
                userDocRef
              });
            } else {
              logger.warn(
                `User ${firebaseUser.uid} exists in Auth but not in Firestore. Refusing implicit profile creation.`
              );
              await signOut(auth);
              if (!isActive || !isMountedRef.current) {
                return;
              }

              setIfMounted(() => {
                setUser(null);
                setUserProfile(null);
              });
              return;
            }
          } catch (error) {
            logger.warn("Could not load user profile:", error.message);
            const basicProfile = createBasicProfile(firebaseUser);
            setIfMounted(() => setUserProfile(basicProfile));
          }
        } else {
          stopProfileSnapshot();
          setIfMounted(() => {
            setUser(null);
            setUserProfile(null);
          });
        }
      } catch (error) {
        handleAuthStateError({ error, setIfMounted, setUser, setUserProfile });
      } finally {
        setIfMounted(() => {
          setLoading(false);
          setInitialized(true);
        });
      }
    });

    return () => {
      isActive = false;
      isMountedRef.current = false;
      stopProfileSnapshot();
      unsubscribe();
    };
  }, [isMountedRef, setIfMounted]);

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

export { refreshUserProfile } from './auth/profileRefresh.js';

// Re-export from modular components
export { useAuth } from './auth/context.js';
export { useAuthOperations } from './auth/authOperations.js';
export { useUserStats } from './auth/userStats.js';
