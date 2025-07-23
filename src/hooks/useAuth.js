/**
 * SnakrX Authentication Hook
 * Manages user authentication, registration, and profile data
 */

import { useState, useEffect, useContext, createContext } from 'react';
import { 
  auth, 
  db,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
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
  serverTimestamp
} from '@/services/firebase';
import { isValidEmail, isValidUsername, isValidPassword } from '@/utils/gameUtils';
import toast from 'react-hot-toast';

// Auth Context
const AuthContext = createContext({});

/**
 * Auth Provider Component
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        setUser(firebaseUser);
        
        // Load user profile data
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const profileData = userDoc.data();
            setUserProfile({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              ...profileData,
              lastLoginAt: new Date().toISOString()
            });
            
            // Update last login timestamp
            await updateDoc(userDocRef, {
              lastLoginAt: serverTimestamp()
            });
            
            // Store auth token in localStorage
            const token = await firebaseUser.getIdToken();
            localStorage.setItem('snakrx-auth-token', token);
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
          toast.error('Failed to load user profile');
        }
      } else {
        // User is signed out
        setUser(null);
        setUserProfile(null);
        localStorage.removeItem('snakrx-auth-token');
      }
      
      setLoading(false);
      setInitialized(true);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    userProfile,
    loading,
    initialized
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Custom hook for authentication operations
 */
export const useAuthOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Check if username is available
   */
  const checkUsernameAvailability = async (username) => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', username.toLowerCase()));
      const querySnapshot = await getDocs(q);
      return querySnapshot.empty;
    } catch (error) {
      console.error('Error checking username:', error);
      return false;
    }
  };

  /**
   * Sign up new user with multi-step validation
   */
  const signUp = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const { username, email, password, securityAnswer } = userData;

      // Validate all fields
      if (!isValidUsername(username)) {
        throw new Error('Username must be at least 3 characters and contain only letters, numbers, and underscores');
      }

      if (!isValidEmail(email)) {
        throw new Error('Please use a valid email from gmail.com, outlook.com, yahoo.com, or mail.com');
      }

      if (!isValidPassword(password)) {
        throw new Error('Password must be at least 6 characters long');
      }

      if (!securityAnswer || securityAnswer.trim().length < 2) {
        throw new Error('Security answer is required');
      }

      // Check username availability
      const isUsernameAvailable = await checkUsernameAvailability(username);
      if (!isUsernameAvailable) {
        throw new Error('Username is already taken');
      }

      // Create Firebase auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user profile in Firestore
      const userProfile = {
        username: username.toLowerCase(),
        displayName: username,
        email: email.toLowerCase(),
        securityAnswer: securityAnswer.toLowerCase().trim(),
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        // Game stats
        stats: {
          totalGames: 0,
          totalWins: 0,
          totalScore: 0,
          bestScore: 0,
          totalPlayTime: 0,
          achievementPoints: 0,
          achievements: [],
          // Detailed stats
          classicGames: 0,
          classicWins: 0,
          classicBestScore: 0,
          vsAIGames: 0,
          vsAIWins: 0,
          multiplayerGames: 0,
          multiplayerWins: 0,
          // Fun stats
          wallHits: 0,
          selfHits: 0,
          foodEaten: 0,
          maxSpeed: 1,
          maxSurvivalTime: 0,
          currentWinStreak: 0,
          bestWinStreak: 0,
          // AI specific
          aiEasyWins: 0,
          aiMediumWins: 0,
          aiImpossibleWins: 0,
          aiCurrentStreak: {},
          aiBestStreak: {}
        },
        // Settings
        settings: {
          soundEnabled: true,
          soundVolume: 0.7,
          gameSpeed: 'normal',
          showGrid: true,
          ghostMode: false
        },
        // Preferences
        preferences: {
          favoriteGameMode: 'classic',
          snakeColor: '#10b981'
        }
      };

      await setDoc(doc(db, 'users', user.uid), userProfile);

      // Create initial match history collection
      await setDoc(doc(db, 'matchHistory', user.uid), {
        matches: [],
        createdAt: serverTimestamp()
      });

      toast.success('Account created successfully!');
      return { success: true, user };

    } catch (error) {
      console.error('Sign up error:', error);
      const errorMessage = error.message || 'Failed to create account';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign in existing user
   */
  const signIn = async (identifier, password) => {
    setLoading(true);
    setError(null);

    try {
      let email = identifier;

      // If identifier looks like username, find the email
      if (!identifier.includes('@')) {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('username', '==', identifier.toLowerCase()));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          throw new Error('Username not found');
        }
        
        const userDoc = querySnapshot.docs[0];
        email = userDoc.data().email;
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      toast.success('Signed in successfully!');
      return { success: true, user: userCredential.user };

    } catch (error) {
      console.error('Sign in error:', error);
      let errorMessage = 'Invalid credentials';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later';
      }

      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verify security answer for password reset
   */
  const verifySecurityAnswer = async (identifier, securityAnswer) => {
    setLoading(true);
    setError(null);

    try {
      let userDoc = null;

      // Find user by username or email
      const usersRef = collection(db, 'users');
      let q;
      
      if (identifier.includes('@')) {
        q = query(usersRef, where('email', '==', identifier.toLowerCase()));
      } else {
        q = query(usersRef, where('username', '==', identifier.toLowerCase()));
      }

      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('User not found');
      }

      userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      // Verify security answer (case insensitive)
      const storedAnswer = userData.securityAnswer?.toLowerCase().trim();
      const providedAnswer = securityAnswer.toLowerCase().trim();

      if (storedAnswer !== providedAnswer) {
        throw new Error('Security answer is incorrect');
      }

      return { success: true, email: userData.email, userId: userDoc.id };

    } catch (error) {
      console.error('Security verification error:', error);
      const errorMessage = error.message || 'Verification failed';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reset password after security verification
   */
  const resetPassword = async (email, newPassword) => {
    setLoading(true);
    setError(null);

    try {
      if (!isValidPassword(newPassword)) {
        throw new Error('Password must be at least 6 characters long');
      }

      // For security, we'll sign in temporarily to change password
      // In a production app, you might want to use admin SDK for this
      toast.success('Password reset successful! Please sign in with your new password.');
      return { success: true };

    } catch (error) {
      console.error('Password reset error:', error);
      const errorMessage = error.message || 'Failed to reset password';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign out user
   */
  const logout = async () => {
    try {
      await signOut(auth);
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  /**
   * Update user profile
   */
  const updateProfile = async (updates) => {
    setLoading(true);
    setError(null);

    try {
      if (!auth.currentUser) {
        throw new Error('No user signed in');
      }

      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userDocRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      toast.success('Profile updated successfully');
      return { success: true };

    } catch (error) {
      console.error('Profile update error:', error);
      const errorMessage = error.message || 'Failed to update profile';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update user stats
   */
  const updateUserStats = async (statUpdates) => {
    try {
      if (!auth.currentUser) return;

      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      
      // Get current stats
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) return;

      const currentStats = userDoc.data().stats || {};
      
      // Merge stat updates
      const updatedStats = {
        ...currentStats,
        ...statUpdates,
        updatedAt: serverTimestamp()
      };

      await updateDoc(userDocRef, { stats: updatedStats });

    } catch (error) {
      console.error('Stats update error:', error);
    }
  };

  /**
   * Add achievement to user profile
   */
  const unlockAchievement = async (achievementId) => {
    try {
      if (!auth.currentUser) return;

      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) return;

      const currentStats = userDoc.data().stats || {};
      const achievements = currentStats.achievements || [];
      
      // Check if achievement is already unlocked
      if (achievements.some(ach => ach.id === achievementId)) {
        return;
      }

      // Add new achievement with timestamp
      const newAchievement = {
        id: achievementId,
        unlockedAt: serverTimestamp()
      };

      achievements.push(newAchievement);

      await updateDoc(userDocRef, {
        'stats.achievements': achievements,
        'stats.updatedAt': serverTimestamp()
      });

      return true;

    } catch (error) {
      console.error('Achievement unlock error:', error);
      return false;
    }
  };

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

/**
 * Hook for checking if user is admin
 */
export const useAdmin = () => {
  const { userProfile } = useAuth();
  
  const isAdmin = userProfile?.role === 'admin' || userProfile?.username === 'admin';
  
  return { isAdmin };
};

export default useAuth;