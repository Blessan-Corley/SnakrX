/**
 * Firebase Configuration Module
 * Handles Firebase initialization and setup
 */

import { initializeApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getStorage } from 'firebase/storage';
import { deleteDoc as firestoreDeleteDoc } from 'firebase/firestore';
import logger from '../../utils/logger.js';
import { normalizeStorageBucket, toStorageBucketUrl } from './storageBucket.js';

// Firebase configuration with validation
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: normalizeStorageBucket(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validate Firebase configuration with helpful error messages
const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
for (const key of requiredKeys) {
  if (!firebaseConfig[key]) {
    const errorMsg = `
    Missing Firebase Configuration: VITE_FIREBASE_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}

    To fix this:
    1. Create a .env file in the project root (copy from .env.example)
    2. Get your Firebase credentials from: https://console.firebase.google.com/
    3. Navigate to: Project Settings > General > Your apps > Firebase SDK snippet > Config
    4. Fill in the VITE_FIREBASE_* variables in your .env file
    5. Restart the development server

    See .env.example for template and instructions.
    `;
    throw new Error(errorMsg);
  }
}

// Initialize Firebase
logger.log('Initializing Firebase with config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain
});

const app = initializeApp(firebaseConfig);

// Initialize Firestore with optimized settings and offline persistence
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache()
});

// Initialize Auth
export const auth = getAuth(app);
export const storage = getStorage(app, toStorageBucketUrl(firebaseConfig.storageBucket));

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});



logger.log('Firebase initialized successfully');
logger.log('Firestore instance:', db.app.name);
logger.log('Auth instance:', auth.app.name);

// Initialize Functions
export const functions = getFunctions(app);
// Export deleteDoc as a direct binding to avoid stale re-export resolution in dev HMR.
export const deleteDoc = firestoreDeleteDoc;

// Development emulator connection (only in development)
if (import.meta.env.DEV && !window.location.hostname.includes('firebase')) {
  logger.info('Firebase emulators: Not configured (enable in firebase/config.js if needed)');
}

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  PUBLIC_PROFILES: 'publicProfiles',
  USERNAMES: 'usernames',
  GAMES: 'games',
  LEADERBOARDS: 'leaderboards',
  WEEKLY_LEADERBOARDS: 'weeklyLeaderboards',
  ACHIEVEMENTS: 'achievements',
  SUPPORT_TICKETS: 'supportTickets'
};

// Re-export auth functions
export {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updatePassword,
  updateProfile,
  verifyPasswordResetCode
} from 'firebase/auth';

// Re-export Firestore functions
export {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  runTransaction,
  onSnapshot,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
  writeBatch
} from 'firebase/firestore';

// Re-export Functions helper
export { httpsCallable };
