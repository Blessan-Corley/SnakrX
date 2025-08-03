/**
 * SnakrX Authentication Hook - V3 (Robust & Fully-Featured)
 * Manages all aspects of user authentication, profile creation,
 * data management, and session state for the SnakrX application.
 *
 * @version 3.0.0
 */

import { useState, useEffect, useContext, createContext, useCallback } from 'react';
import {
  auth,
  db,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  collection,
  where,
  getDocs,
  serverTimestamp,
  arrayUnion,
  increment,
  COLLECTIONS,
  firestoreOperations,
  gameOperations,
} from '@/services/firebase';
import { isValidEmail, isValidUsername, isValidPassword } from '@/utils/gameUtils';
import toast from 'react-hot-toast';

// Create the context to hold authentication state.
const AuthContext = createContext({});

/**
 * Create default user profile structure - FIXED to match correct Firebase structure
 */
const createDefaultUserProfile = (firebaseUser) => ({
  username: firebaseUser.email.split('@')[0],
  displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
  email: firebaseUser.email,
  createdAt: serverTimestamp(),
  lastLoginAt: serverTimestamp(),
  role: 'player',
  stats: {
    totalGames: 0,
    totalWins: 0,
    totalScore: 0,
    bestScore: 0,
    totalPlayTime: 0,
    achievementPoints: 0,
    achievements: [],
    classicGames: 0,
    classicWins: 0,
    classicBestScore: 0,
    vsAIGames: 0,
    vsAIWins: 0,
    vsAIBestScore: 0,
    multiplayerGames: 0,
    multiplayerWins: 0,
    multiplayerBestScore: 0,
    wallHits: 0,
    selfHits: 0,
    foodEaten: 0,
    maxSpeed: 1,
    maxSurvivalTime: 0,
    currentWinStreak: 0,
    bestWinStreak: 0,
    aiEasyWins: 0,
    aiMediumWins: 0,
    aiImpossibleWins: 0,
  },
  settings: {
    soundEnabled: true,
    soundVolume: 0.7,
    showGrid: true,
  },
  preferences: {
    favoriteGameMode: 'classic',
    snakeColor: '#10b981',
  }
});

/**
 * Create basic profile for offline mode
 */
const createBasicProfile = (firebaseUser) => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email,
  displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
  username: firebaseUser.email.split('@')[0],
  stats: createDefaultUserProfile(firebaseUser).stats
});

/**
 * AuthProvider Component
 * This component wraps the application and provides the authentication context to all children.
 * It is responsible for listening to Firebase auth state changes and managing the user session.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The child components to be rendered within the provider.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Holds the raw Firebase user object
  const [userProfile, setUserProfile] = useState(null); // Holds the user profile data from Firestore
  const [loading, setLoading] = useState(true); // General loading state for async operations
  const [initialized, setInitialized] = useState(false); // Tracks if the initial auth check has completed

  // This effect runs once on mount to set up the Firebase auth state listener.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // User is signed in.
          setUser(firebaseUser);
          
          try {
            const userDocRef = doc(db, COLLECTIONS.USERS, firebaseUser.uid);
            const userDoc = await firestoreOperations.getDocument(userDocRef);
            
            if (userDoc.exists()) {
              // Profile exists, load it into state.
              const userData = userDoc.data();
              setUserProfile({ 
                uid: firebaseUser.uid, 
                email: firebaseUser.email, 
                ...userData 
              });
              
              // Update last login timestamp in the background
              firestoreOperations.updateDocument(userDocRef, { 
                lastLoginAt: serverTimestamp() 
              }).catch(console.warn);
            } else {
              // User exists in Auth but not in Firestore - create profile
              console.warn(`User ${firebaseUser.uid} exists in Auth but not in Firestore. Creating profile...`);
              const newProfile = createDefaultUserProfile(firebaseUser);
              await firestoreOperations.setDocument(userDocRef, newProfile);
              setUserProfile({ uid: firebaseUser.uid, ...newProfile });
            }
          } catch (error) {
            // Handle offline mode or Firestore errors gracefully
            console.warn("Could not load user profile:", error.message);
            // Create a basic profile for offline mode
            const basicProfile = createBasicProfile(firebaseUser);
            setUserProfile(basicProfile);
          }
        } else {
          // User is signed out.
          setUser(null);
          setUserProfile(null);
        }
      } catch (error) {
        console.error("Auth State Change Error:", error);
        
        // Handle specific error cases
        if (error.code === 'auth/invalid-api-key') {
          toast.error("Authentication configuration error. Please check your settings.");
        } else if (error.code === 'auth/network-request-failed' || error.message?.includes('offline')) {
          // Handle offline mode gracefully
          console.log("Working in offline mode - authentication features will be limited");
          setUser(null);
          setUserProfile(null);
        } else if (error.code === 'auth/web-storage-unsupported') {
          toast.error("Browser storage is not available. Please enable cookies.");
        } else {
          console.warn("Auth error (non-critical):", error.message);
          // Don't clear user state for non-critical errors
        }
      } finally {
        // This is crucial for the app's routing logic.
        setLoading(false);
        setInitialized(true); // Mark initialization as complete.
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []); // Empty dependency array ensures this runs only once.

  // The value provided to all consuming components.
  const value = {
    user,
    userProfile,
    loading,
    initialized // This is used by ProtectedRoute and PublicRoute
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to easily access the auth context.
 * @returns {object} The authentication context value.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Custom hook for authentication operations (sign-up, sign-in, etc.).
 * This keeps the UI components clean and separates the logic.
 * @returns {object} An object containing all authentication-related functions.
 */
export const useAuthOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Checks if a username is already taken in the database.
   * @param {string} username - The username to check.
   * @returns {Promise<boolean>} True if the username is available, false otherwise.
   */
  const checkUsernameAvailability = useCallback(async (username) => {
    try {
      const usersRef = collection(db, COLLECTIONS.USERS);
      const q = query(usersRef, where('username', '==', username.toLowerCase()));
      const querySnapshot = await getDocs(q);
      return querySnapshot.empty;
    } catch (err) {
      console.error('Error checking username:', err);
      toast.error("Could not verify username. Please try again.");
      return false;
    }
  }, []);

  /**
   * Registers a new user with email, password, and creates a detailed profile.
   * @param {object} userData - The user's registration data.
   * @returns {Promise<object>} An object indicating success or failure.
   */
  const signUp = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const { username, email, password, securityAnswer } = userData;

      // Server-side validation is crucial, but client-side checks improve UX.
      if (!isValidUsername(username) || !isValidEmail(email) || !isValidPassword(password) || !securityAnswer) {
        throw new Error('Invalid registration data. Please check all fields.');
      }

      const isUsernameAvailable = await checkUsernameAvailability(username);
      if (!isUsernameAvailable) {
        throw new Error('This username is already taken. Please choose another.');
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create a detailed, default user profile in Firestore with proper timestamps
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
      console.error('Sign up error:', err);
      let errorMessage = 'An unknown error occurred during sign-up.';
      
      // Handle Firebase authentication errors
      switch (err.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists. Please try signing in instead.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address format.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled. Please contact support.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please choose a stronger password with at least 6 characters.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection and try again.';
          break;
        default:
          // Handle custom validation errors
          if (err.message && (
            err.message.includes('Invalid registration data') ||
            err.message.includes('username is already taken') ||
            err.message.includes('validation')
          )) {
            errorMessage = err.message;
          } else if (err.message?.includes('fetch')) {
            errorMessage = 'Network error. Please check your connection and try again.';
          } else if (err.message) {
            errorMessage = err.message;
          }
          break;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [checkUsernameAvailability]);

  /**
   * Signs in a user with either their email or username.
   * @param {string} identifier - The user's email or username.
   * @param {string} password - The user's password.
   * @returns {Promise<object>} An object indicating success or failure.
   */
  const signIn = useCallback(async (identifier, password) => {
    setLoading(true);
    setError(null);
    try {
      let email = identifier;
      // If the identifier doesn't look like an email, assume it's a username.
      if (!identifier.includes('@')) {
        const usersRef = collection(db, COLLECTIONS.USERS);
        const q = query(usersRef, where('username', '==', identifier.toLowerCase()));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) throw new Error('User not found.');
        email = querySnapshot.docs[0].data().email;
      }
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      toast.success(`Welcome back, ${userCredential.user.displayName || identifier}!`);
      return { success: true, user: userCredential.user };
    } catch (err) {
      console.error('Sign in error:', err);
      let errorMessage = 'An unknown error occurred.';
      
      // Handle Firebase authentication errors
      switch (err.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email or username.';
          break;
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          errorMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address format.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled. Please contact support.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed login attempts. Please try again later or reset your password.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection and try again.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password sign-in is not enabled. Please contact support.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please choose a stronger password.';
          break;
        default:
          // Handle custom errors (like 'User not found.')
          if (err.message === 'User not found.') {
            errorMessage = 'No account found with this username.';
          } else if (err.message.includes('fetch')) {
            errorMessage = 'Network error. Please check your connection and try again.';
          } else if (err.message) {
            errorMessage = err.message;
          }
          break;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Verifies the user's security answer for password recovery.
   * @param {string} identifier - The user's email or username.
   * @param {string} securityAnswer - The provided security answer.
   * @returns {Promise<object>} An object with success status and user email.
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
   * Sends a password reset email to the user.
   * @param {string} email - The user's email address.
   * @returns {Promise<object>} An object indicating success or failure.
   */
  const resetPassword = useCallback(async (email) => {
    setLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success(`Password reset link sent to ${email}. Please check your inbox.`);
      return { success: true };
    } catch (err) {
      console.error('Password reset error:', err);
      let errorMessage = 'Failed to send password reset email.';
      
      // Handle Firebase authentication errors
      switch (err.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address format.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many password reset requests. Please wait before trying again.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection and try again.';
          break;
        default:
          if (err.message?.includes('fetch')) {
            errorMessage = 'Network error. Please check your connection and try again.';
          } else if (err.message) {
            errorMessage = err.message;
          }
          break;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Signs out the current user.
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
   * Updates the user's profile data in Firestore.
   * @param {object} updates - An object containing the fields to update.
   * @returns {Promise<object>} An object indicating success or failure.
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

  /**
   * Updates user game statistics with proper Firebase timestamps and structure
   * @param {object} statUpdates - An object with stats to update (e.g., { totalScore: 100 }).
   */
  const updateUserStats = useCallback(async (statUpdates) => {
    if (!auth.currentUser) {
      console.warn('No authenticated user - cannot update stats');
      return false;
    }
    
    try {
      const userDocRef = doc(db, COLLECTIONS.USERS, auth.currentUser.uid);
      
      // Get current stats to calculate proper updates
      const userDoc = await firestoreOperations.getDocument(userDocRef);
      const currentStats = userDoc.exists() ? userDoc.data()?.stats || {} : {};
      
      const validatedUpdates = {};
      
      for (const [key, value] of Object.entries(statUpdates)) {
        // Validate numeric values
        if (typeof value === 'number') {
          // Prevent unreasonably large numbers (security check)
          if (value > 1000000) {
            console.warn(`Skipping suspiciously large stat update: ${key} = ${value}`);
            continue;
          }
          
          // Handle different types of stats appropriately
          if (key.includes('Games') || key === 'totalGames' || key === 'totalWins' || 
              key.includes('Wins') || key.includes('wins')) {
            // For game counts and wins, increment by the provided value
            validatedUpdates[`stats.${key}`] = (currentStats[key] || 0) + value;
          } else if (key.includes('BestScore') || key.includes('bestScore') || key === 'bestScore' ||
                     key === 'maxSpeed' || key === 'bestWinStreak' || key === 'maxSurvivalTime') {
            // For "best" stats, use the maximum value
            validatedUpdates[`stats.${key}`] = Math.max(currentStats[key] || 0, value);
          } else if (key === 'currentWinStreak') {
            // Special handling for current win streak - direct assignment
            validatedUpdates[`stats.${key}`] = value;
          } else {
            // For accumulative stats (totalScore, totalPlayTime, foodEaten, etc.), add to current value
            validatedUpdates[`stats.${key}`] = (currentStats[key] || 0) + value;
          }
        } else if (Array.isArray(value)) {
          // Handle arrays (like achievements)
          validatedUpdates[`stats.${key}`] = arrayUnion(...value);
        } else {
          // Direct assignment for other types
          validatedUpdates[`stats.${key}`] = value;
        }
      }
      
      if (Object.keys(validatedUpdates).length > 0) {
        // Add proper timestamps
        validatedUpdates['stats.updatedAt'] = serverTimestamp();
        validatedUpdates['updatedAt'] = serverTimestamp();
        validatedUpdates['lastActiveAt'] = serverTimestamp();
        
        await firestoreOperations.updateDocument(userDocRef, validatedUpdates);
        console.log('Stats updated successfully:', validatedUpdates);
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Stats update error:', err);
      return false;
    }
  }, []);

  /**
   * Adds a new achievement to the user's profile.
   * @param {string} achievementId - The ID of the achievement to unlock.
   * @returns {Promise<boolean>} True if the achievement was unlocked, false otherwise.
   */
  const unlockAchievement = useCallback(async (achievementId) => {
    if (!auth.currentUser) return false;
    
    try {
      const userDocRef = doc(db, COLLECTIONS.USERS, auth.currentUser.uid);
      
      // Check if achievement is already unlocked
      const userDoc = await firestoreOperations.getDocument(userDocRef);
      const currentAchievements = userDoc.data()?.stats?.achievements || [];
      
      if (currentAchievements.some(ach => ach.id === achievementId)) {
        console.log(`Achievement ${achievementId} already unlocked`);
        return false;
      }
      
      // Unlock the achievement
      const achievementData = {
        id: achievementId,
        unlockedAt: serverTimestamp(),
        timestamp: Date.now() // For sorting
      };
      
      await firestoreOperations.updateDocument(userDocRef, {
        'stats.achievements': arrayUnion(achievementData),
        'stats.updatedAt': serverTimestamp()
      });
      
      console.log(`Achievement unlocked: ${achievementId}`);
      return true;
    } catch (err) {
      console.error('Achievement unlock error:', err);
      return false;
    }
  }, []);

  return {
    signUp,
    signIn,
    verifySecurityAnswer,
    resetPassword,
    logout,
    updateProfile,
    updateUserStats,
    unlockAchievement,
    checkUsernameAvailability,
    loading,
    error,
    setError
  };
};
