/**
 * Firebase Module - Main Export
 * Central export point for all Firebase functionality
 */

// Export Firebase configuration and instances
export {
  db,
  auth,
  storage,
  functions,
  googleProvider,
  COLLECTIONS
} from './config.js';

// Export all auth functions
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
} from './config.js';

// Export all Firestore functions
export {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  runTransaction,
  deleteDoc,
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

// Export support operations
export { supportOperations } from './support.js';

// Export admin operations
export { adminOperations } from './admin.js';

// Export backend-owned achievement and friend stat sync operations
export { achievementOperations } from './achievements.js';
export { syncFriendStats } from './friendStats.js';

// Export profile avatar operations
export { uploadUserAvatar, removeUserAvatar } from './profileAvatar.js';
export { validateAvatarFile } from './avatarValidation.js';
