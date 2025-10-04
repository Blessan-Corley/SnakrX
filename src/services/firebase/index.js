/**
 * Firebase Module - Main Export
 * Central export point for all Firebase functionality
 */

// Export Firebase configuration and instances
export {
  db,
  auth,
  googleProvider,
  COLLECTIONS
} from './config.js';

// Export all auth functions
export {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updatePassword,
  updateProfile
} from './config.js';

// Export all Firestore functions
export {
  doc,
  setDoc,
  updateDoc,
  getDoc,
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
} from './config.js';

// Export Firestore operations
export { firestoreOperations } from './firestore.js';

// Export game operations
export { gameOperations } from './game.js';

// Export leaderboard operations
export { leaderboardOperations } from './leaderboard.js';
