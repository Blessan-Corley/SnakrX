// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBzbclcSUKlcORdhZJ2uN76enrbn3QUOyI",
  authDomain: "snakrx-23b0b.firebaseapp.com",
  projectId: "snakrx-23b0b",
  storageBucket: "snakrx-23b0b.firebasestorage.app",
  messagingSenderId: "546174196180",
  appId: "1:546174196180:web:38e030033c790dd86f9e41",
  measurementId: "G-5VQZQDHK4P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

// Connect to emulators in development (optional)
if (import.meta.env.DEV && typeof window !== 'undefined') {
  // Uncomment these if you want to use Firebase emulators in development
  // connectAuthEmulator(auth, "http://localhost:9099");
  // connectFirestoreEmulator(db, 'localhost', 8080);
  // connectStorageEmulator(storage, "localhost", 9199);
}

export default app;

// Export commonly used Firebase functions for easy importing
export {
  // Auth functions
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  onAuthStateChanged
} from "firebase/auth";

export {
  // Firestore functions
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove
} from "firebase/firestore";

export {
  // Storage functions
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "firebase/storage";