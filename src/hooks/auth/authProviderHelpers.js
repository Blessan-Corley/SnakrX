import { onSnapshot } from 'firebase/firestore';
import toast from 'react-hot-toast';
import {
  COLLECTIONS,
  db,
  doc,
  serverTimestamp
} from '../../services/firebase/config.js';
import { firestoreOperations } from '../../services/firebase/firestore.js';
import {
  buildPublicProfileIdentity,
  buildPublicProfilePreferences
} from '../../services/firebase/publicProfileStats.js';
import logger from '../../utils/logger.js';
import { hydrateUserProfileState } from './profileRefresh.js';

export const ensureUsernameReservation = async (firebaseUser, username) => {
  const normalizedUsername = typeof username === 'string' ? username.trim().toLowerCase() : '';
  if (!normalizedUsername) return;

  try {
    const usernameRef = doc(db, COLLECTIONS.USERNAMES, normalizedUsername);
    await firestoreOperations.setDocument(usernameRef, {
      username: normalizedUsername,
      userId: firebaseUser.uid,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    logger.warn('Unable to ensure username reservation:', error);
  }
};

export const ensurePublicProfileDocument = async (firebaseUser, profileData) => {
  const publicProfileRef = doc(db, COLLECTIONS.PUBLIC_PROFILES, firebaseUser.uid);
  const publicProfileDoc = await firestoreOperations.getDocument(publicProfileRef);

  if (!publicProfileDoc.exists()) {
    const publicIdentity = buildPublicProfileIdentity(firebaseUser, profileData);
    await firestoreOperations.setDocument(publicProfileRef, {
      ...publicIdentity,
      preferences: buildPublicProfilePreferences(profileData),
      lastActiveAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  return publicProfileRef;
};

export const syncProfileActivityTimestamps = (userDocRef, publicProfileRef) => {
  firestoreOperations.updateDocument(userDocRef, {
    lastLoginAt: serverTimestamp(),
    lastActiveAt: serverTimestamp()
  }).catch(logger.warn);

  firestoreOperations.updateDocument(publicProfileRef, {
    lastActiveAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }).catch(logger.warn);
};

export const bindRealtimeProfileSnapshot = ({
  firebaseUser,
  isMountedRef,
  setIfMounted,
  setUserProfile,
  userDocRef
}) => onSnapshot(
  userDocRef,
  (snapshot) => {
    if (!snapshot.exists() || !isMountedRef.current) return;
    const userData = snapshot.data();
    setIfMounted(() => {
      hydrateUserProfileState(firebaseUser, userData, setUserProfile);
    });
  },
  (error) => {
    logger.warn('Realtime user profile listener error:', error);
  }
);

export const handleAuthStateError = ({ error, setIfMounted, setUser, setUserProfile }) => {
  logger.error('Auth State Change Error:', error);

  if (error.code === 'auth/invalid-api-key') {
    toast.error('Authentication configuration error. Please check your settings.');
    return;
  }

  if (error.code === 'auth/network-request-failed' || error.message?.includes('offline')) {
    logger.info('Working in offline mode - authentication features will be limited');
    setIfMounted(() => {
      setUser(null);
      setUserProfile(null);
    });
    return;
  }

  if (error.code === 'auth/web-storage-unsupported') {
    toast.error('Browser storage is not available. Please enable cookies.');
    return;
  }

  logger.warn('Auth error (non-critical):', error.message);
};
