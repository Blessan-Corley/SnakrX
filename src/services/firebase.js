/**
 * Firebase Configuration - V3 (Optimized & Production Ready)
 * Enhanced Firebase configuration with better error handling, retry logic,
 * and optimized Firestore operations for the SnakrX game.
 *
 * @version 3.0.0
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
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
  writeBatch,
  enableNetwork,
  disableNetwork,
  connectFirestoreEmulator,
  CACHE_SIZE_UNLIMITED
} from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updatePassword,
  updateProfile,
  connectAuthEmulator
} from 'firebase/auth';

// Firebase configuration with validation
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validate Firebase configuration
const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
for (const key of requiredKeys) {
  if (!firebaseConfig[key]) {
    throw new Error(`Missing required Firebase configuration: ${key}`);
  }
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with optimized settings
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Development emulator connection (only in development)
if (import.meta.env.DEV && !window.location.hostname.includes('firebase')) {
  try {
    // Uncomment these lines if you want to use Firebase emulators in development
    // connectAuthEmulator(auth, 'http://localhost:9099');
    // connectFirestoreEmulator(db, 'localhost', 8080);
  } catch (error) {
    console.warn('Firebase emulator connection failed:', error);
  }
}

// =====================================
// ENHANCED FIRESTORE OPERATIONS
// =====================================

/**
 * Enhanced document operations with retry logic
 */
export const firestoreOperations = {
  /**
   * Get document with retry logic and offline handling
   */
  async getDocument(docRef, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        const docSnap = await getDoc(docRef);
        return docSnap;
      } catch (error) {
        console.warn(`Firestore get attempt ${i + 1} failed:`, error);
        
        // Handle offline mode gracefully
        if (error.code === 'unavailable' || error.message?.includes('offline')) {
          console.log('Working in offline mode - document operations will be limited');
          throw new Error('offline');
        }
        
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  },

  /**
   * Set document with retry logic and offline handling
   */
  async setDocument(docRef, data, options = {}) {
    const retries = 3;
    for (let i = 0; i < retries; i++) {
      try {
        await setDoc(docRef, data, options);
        return true;
      } catch (error) {
        console.warn(`Firestore set attempt ${i + 1} failed:`, error);
        
        // Handle offline mode gracefully
        if (error.code === 'unavailable' || error.message?.includes('offline')) {
          console.log('Working in offline mode - document writes will be cached');
          return false; // Return false instead of throwing to allow graceful degradation
        }
        
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  },

  /**
   * Update document with retry logic and offline handling
   */
  async updateDocument(docRef, data) {
    const retries = 3;
    for (let i = 0; i < retries; i++) {
      try {
        await updateDoc(docRef, data);
        return true;
      } catch (error) {
        console.warn(`Firestore update attempt ${i + 1} failed:`, error);
        
        // Handle offline mode gracefully
        if (error.code === 'unavailable' || error.message?.includes('offline')) {
          console.log('Working in offline mode - document updates will be cached');
          return false; // Return false instead of throwing to allow graceful degradation
        }
        
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  },

  /**
   * Batch write operations
   */
  async batchWrite(operations) {
    const batch = writeBatch(db);
    
    operations.forEach(op => {
      switch (op.type) {
        case 'set':
          batch.set(op.ref, op.data, op.options || {});
          break;
        case 'update':
          batch.update(op.ref, op.data);
          break;
        case 'delete':
          batch.delete(op.ref);
          break;
      }
    });

    return await batch.commit();
  }
};

// =====================================
// FIRESTORE COLLECTIONS & SCHEMAS
// =====================================

export const COLLECTIONS = {
  USERS: 'users',
  GAMES: 'games',
  LEADERBOARDS: 'leaderboards',
  ACHIEVEMENTS: 'achievements',
  ADMIN_ANALYTICS: 'admin_analytics'
};

export const SUBCOLLECTIONS = {
  USER_GAMES: 'user_games',
  USER_ACHIEVEMENTS: 'user_achievements',
  USER_SESSIONS: 'user_sessions'
};

// =====================================
// FIRESTORE DOCUMENT SCHEMAS
// =====================================

/**
 * User document schema
 */
export const USER_SCHEMA = {
  uid: '',                    // Firebase Auth UID
  username: '',               // Unique username (3-20 chars)
  email: '',                 // User email
  displayName: '',           // Display name
  photoURL: '',              // Profile picture URL
  isOnline: false,           // Online status
  lastActive: null,          // Last activity timestamp
  createdAt: null,           // Account creation timestamp
  updatedAt: null,           // Last profile update timestamp
  
  // Game statistics
  stats: {
    // Game totals
    totalGamesPlayed: 0,
    totalWins: 0,
    totalLosses: 0,
    totalScore: 0,
    highestScore: 0,
    totalPlayTime: 0,        // In seconds
    totalFoodEaten: 0,
    
    // Best performances
    longestGame: 0,          // In seconds
    fastestWin: 0,           // In seconds
    mostFoodInOneGame: 0,
    highestSpeedReached: 0,
    
    // Mode-specific stats
    classicStats: {
      gamesPlayed: 0,
      wins: 0,
      highScore: 0,
      totalScore: 0
    },
    vsAIStats: {
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      easyWins: 0,
      mediumWins: 0,
      impossibleWins: 0,
      highScore: 0
    },
    multiplayerStats: {
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      highScore: 0
    },
    
    // Achievement data
    achievements: [],         // Array of {id, unlockedAt, timestamp}
    achievementPoints: 0,     // Total points from achievements
    
    // Streak data
    currentWinStreak: 0,
    longestWinStreak: 0,
    currentPlayStreak: 0,    // Daily play streak
    longestPlayStreak: 0,
    
    // Weekly/Monthly stats
    weeklyStats: {
      gamesPlayed: 0,
      totalScore: 0,
      weekStart: null
    },
    monthlyStats: {
      gamesPlayed: 0,
      totalScore: 0,
      monthStart: null
    }
  },
  
  // User preferences
  preferences: {
    soundEnabled: true,
    musicEnabled: true,
    vibrationEnabled: true,
    theme: 'dark',           // 'dark', 'light', 'auto'
    language: 'en',
    controls: {
      player1: 'arrows',     // 'arrows', 'wasd'
      sensitivity: 1.0
    }
  },
  
  // Security & Recovery
  security: {
    securityQuestion: '',    // Encrypted security question answer
    lastPasswordChange: null,
    loginAttempts: 0,
    lockedUntil: null
  }
};

/**
 * Game session document schema
 */
export const GAME_SCHEMA = {
  gameId: '',                // Unique game identifier
  userId: '',                // Player's user ID
  username: '',              // Player's username (for leaderboards)
  
  // Game configuration
  mode: '',                  // 'classic', 'vsai', 'multiplayer'
  difficulty: '',            // 'easy', 'medium', 'impossible' (for vsai)
  playerCount: 1,            // Number of players (1-4)
  
  // Game results
  score: 0,                  // Final score
  duration: 0,               // Game duration in seconds
  foodEaten: 0,              // Number of food items eaten
  speedReached: 0,           // Maximum speed reached
  result: '',                // 'won', 'lost', 'quit', 'draw'
  
  // Game statistics
  stats: {
    moves: 0,                // Total moves made
    wallHits: 0,             // Number of wall collisions
    selfHits: 0,             // Number of self collisions
    maxLength: 0,            // Maximum snake length reached
    averageSpeed: 0,         // Average speed during game
    efficiency: 0,           // Score per move ratio
    
    // Time-based stats
    timeToFirstFood: 0,      // Seconds to eat first food
    timeToMaxLength: 0,      // Seconds to reach max length
    
    // AI-specific stats (for vsai mode)
    aiMoves: 0,
    aiCollisions: 0,
    aiScore: 0
  },
  
  // Multiplayer data (if applicable)
  multiplayer: {
    players: [],             // Array of player data
    winner: '',              // Winner's user ID
    finalScores: [],         // Final scores for each player
    eliminations: []         // Elimination order and times
  },
  
  // Performance metrics
  performance: {
    fps: 0,                  // Average FPS during game
    inputLag: 0,             // Average input lag in ms
    renderTime: 0,           // Average render time in ms
    memoryUsage: 0           // Peak memory usage in MB
  },
  
  // Timestamps
  startedAt: null,           // Game start timestamp
  endedAt: null,             // Game end timestamp
  createdAt: null,           // Document creation timestamp
  updatedAt: null            // Last update timestamp
};

/**
 * Leaderboard document schema
 */
export const LEADERBOARD_SCHEMA = {
  mode: '',                  // Game mode
  difficulty: '',            // Difficulty (for vsai mode)
  period: '',                // 'daily', 'weekly', 'monthly', 'alltime'
  
  // Top entries (limited to 100)
  entries: [],               // Array of leaderboard entries
  
  // Metadata
  totalEntries: 0,           // Total number of scores submitted
  lastUpdated: null,         // Last update timestamp
  periodStart: null,         // Period start date
  periodEnd: null,           // Period end date (for closed periods)
  
  // Statistics
  stats: {
    averageScore: 0,
    medianScore: 0,
    highestScore: 0,
    lowestScore: 0,
    totalGames: 0
  }
};

/**
 * Leaderboard entry schema
 */
export const LEADERBOARD_ENTRY_SCHEMA = {
  userId: '',                // Player's user ID
  username: '',              // Player's username
  score: 0,                  // Game score
  duration: 0,               // Game duration in seconds
  foodEaten: 0,              // Food items eaten
  rank: 0,                   // Current rank (updated periodically)
  
  // Additional game data
  gameId: '',                // Reference to game session
  mode: '',                  // Game mode
  difficulty: '',            // Difficulty level
  
  // Metadata
  timestamp: null,           // Score submission timestamp
  verified: true,            // Whether score is verified
  
  // Performance indicators
  efficiency: 0,             // Score per second ratio
  speedReached: 0           // Maximum speed reached
};

/**
 * Achievement document schema
 */
export const ACHIEVEMENT_SCHEMA = {
  id: '',                    // Unique achievement ID
  title: '',                 // Achievement title
  description: '',           // Achievement description
  icon: '',                  // Achievement icon/emoji
  tier: '',                  // 'common', 'rare', 'epic', 'legendary'
  category: '',              // 'scoring', 'endurance', 'skill', 'social'
  points: 0,                 // Points awarded for achievement
  
  // Requirements to unlock
  requirements: {},          // Dynamic requirements object
  
  // Statistics
  stats: {
    totalUnlocked: 0,        // Total users who unlocked this
    unlockRate: 0,           // Percentage of users who unlocked
    averageUnlockTime: 0,    // Average time to unlock (in days)
    firstUnlockedBy: '',     // User ID who unlocked first
    firstUnlockedAt: null    // When it was first unlocked
  },
  
  // Metadata
  isActive: true,            // Whether achievement is currently active
  createdAt: null,           // Achievement creation timestamp
  updatedAt: null            // Last update timestamp
};

/**
 * Admin analytics document schema
 */
export const ADMIN_ANALYTICS_SCHEMA = {
  period: '',                // 'daily', 'weekly', 'monthly'
  date: '',                  // Date string (YYYY-MM-DD)
  
  // User metrics
  users: {
    total: 0,                // Total registered users
    active: 0,               // Active users in period
    new: 0,                  // New registrations in period
    returning: 0,            // Returning users in period
    retention: {
      daily: 0,              // Daily retention rate
      weekly: 0,             // Weekly retention rate
      monthly: 0             // Monthly retention rate
    }
  },
  
  // Game metrics
  games: {
    total: 0,                // Total games played in period
    completed: 0,            // Games completed (not quit)
    averageDuration: 0,      // Average game duration
    averageScore: 0,         // Average score
    
    // By mode
    byMode: {
      classic: 0,
      vsai: 0,
      multiplayer: 0
    },
    
    // By difficulty (vsai only)
    byDifficulty: {
      easy: 0,
      medium: 0,
      impossible: 0
    }
  },
  
  // Achievement metrics
  achievements: {
    totalUnlocked: 0,        // Total achievements unlocked in period
    uniqueUnlockers: 0,      // Unique users who unlocked achievements
    mostUnlocked: '',        // Most unlocked achievement ID
    rarest: '',              // Rarest achievement unlocked
    
    // By tier
    byTier: {
      common: 0,
      rare: 0,
      epic: 0,
      legendary: 0
    }
  },
  
  // Performance metrics
  performance: {
    averageFPS: 0,           // Average FPS across all games
    averageLoadTime: 0,      // Average page load time
    errorRate: 0,            // Error rate percentage
    crashRate: 0             // Game crash rate percentage
  },
  
  // Platform metrics
  platforms: {
    desktop: 0,              // Desktop users percentage
    mobile: 0,               // Mobile users percentage
    tablet: 0                // Tablet users percentage
  },
  
  // Geographic data (if available)
  geography: {
    topCountries: [],        // Top 10 countries by user count
    topCities: []            // Top 10 cities by user count
  },
  
  // Timestamps
  createdAt: null,           // Document creation timestamp
  updatedAt: null            // Last update timestamp
};

// =====================================
// SCHEMA VALIDATION & HELPER FUNCTIONS
// =====================================

/**
 * Create a new user document with proper schema
 */
export const createUserDocument = (userData) => {
  const defaultUser = JSON.parse(JSON.stringify(USER_SCHEMA));
  
  return {
    ...defaultUser,
    uid: userData.uid,
    username: userData.username,
    email: userData.email,
    displayName: userData.displayName || userData.username,
    photoURL: userData.photoURL || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastActive: serverTimestamp(),
    isOnline: true,
    
    // Initialize security with provided data
    security: {
      ...defaultUser.security,
      securityQuestion: userData.securityAnswer || ''
    }
  };
};

/**
 * Create a new game session document with proper schema
 */
export const createGameDocument = (gameData) => {
  const defaultGame = JSON.parse(JSON.stringify(GAME_SCHEMA));
  
  return {
    ...defaultGame,
    ...gameData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    startedAt: gameData.startedAt || serverTimestamp()
  };
};

/**
 * Create a new leaderboard entry with proper schema
 */
export const createLeaderboardEntry = (entryData) => {
  const defaultEntry = JSON.parse(JSON.stringify(LEADERBOARD_ENTRY_SCHEMA));
  
  return {
    ...defaultEntry,
    ...entryData,
    timestamp: serverTimestamp(),
    efficiency: entryData.duration > 0 ? entryData.score / entryData.duration : 0
  };
};

/**
 * Create analytics document with proper schema
 */
export const createAnalyticsDocument = (analyticsData) => {
  const defaultAnalytics = JSON.parse(JSON.stringify(ADMIN_ANALYTICS_SCHEMA));
  
  return {
    ...defaultAnalytics,
    ...analyticsData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
};

/**
 * Validate document against schema
 */
export const validateDocumentSchema = (document, schema) => {
  const errors = [];
  
  const validateObject = (obj, schemaObj, path = '') => {
    for (const [key, schemaValue] of Object.entries(schemaObj)) {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (!(key in obj)) {
        if (schemaValue !== null && schemaValue !== '') {
          errors.push(`Missing required field: ${currentPath}`);
        }
        continue;
      }
      
      const objValue = obj[key];
      
      // Type checking
      if (typeof schemaValue === 'object' && schemaValue !== null && !Array.isArray(schemaValue)) {
        if (typeof objValue !== 'object' || objValue === null) {
          errors.push(`Field ${currentPath} should be an object`);
        } else {
          validateObject(objValue, schemaValue, currentPath);
        }
      } else if (Array.isArray(schemaValue)) {
        if (!Array.isArray(objValue)) {
          errors.push(`Field ${currentPath} should be an array`);
        }
      } else if (typeof schemaValue === 'string' && typeof objValue !== 'string') {
        errors.push(`Field ${currentPath} should be a string`);
      } else if (typeof schemaValue === 'number' && typeof objValue !== 'number') {
        errors.push(`Field ${currentPath} should be a number`);
      } else if (typeof schemaValue === 'boolean' && typeof objValue !== 'boolean') {
        errors.push(`Field ${currentPath} should be a boolean`);
      }
    }
  };
  
  validateObject(document, schema);
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Get collection reference
 */
export const getCollectionRef = (collectionName) => collection(db, collectionName);

/**
 * Get document reference
 */
export const getDocumentRef = (collectionName, documentId) => doc(db, collectionName, documentId);

/**
 * Get subcollection reference
 */
export const getSubcollectionRef = (parentCollection, parentDocId, subcollection) => 
  collection(db, parentCollection, parentDocId, subcollection);

// =====================================
// GAME DATA OPERATIONS
// =====================================

export const gameOperations = {
  /**
   * Save game session data
   */
  async saveGameSession(userId, gameData) {
    try {
      const gameRef = doc(collection(db, COLLECTIONS.GAMES));
      const gameSession = createGameDocument({
        userId,
        gameId: gameData.gameId,
        username: gameData.username || 'Anonymous',
        mode: gameData.mode,
        difficulty: gameData.difficulty || null,
        playerCount: gameData.playerCount || 1,
        score: gameData.score,
        duration: gameData.duration,
        foodEaten: gameData.foodEaten,
        speedReached: gameData.speedReached,
        result: gameData.result, // 'won', 'lost', 'quit'
        stats: {
          moves: gameData.stats?.moves || 0,
          wallHits: gameData.stats?.wallHits || 0,
          selfHits: gameData.stats?.selfHits || 0,
          maxLength: gameData.stats?.maxLength || 1,
          averageSpeed: gameData.stats?.averageSpeed || 1,
          efficiency: gameData.stats?.efficiency || 0,
          timeToFirstFood: gameData.stats?.timeToFirstFood || 0,
          timeToMaxLength: gameData.stats?.timeToMaxLength || 0
        },
        performance: gameData.performance || {},
        startedAt: gameData.startedAt || serverTimestamp(),
        endedAt: gameData.endedAt || serverTimestamp()
      });

      const success = await firestoreOperations.setDocument(gameRef, gameSession);
      if (success) {
        console.log('Game session saved successfully:', gameRef.id);
        return gameRef.id;
      }
      return null;
    } catch (error) {
      console.error('Error saving game session:', error);
      return null;
    }
  },

  /**
   * Get user's recent games
   */
  async getUserGames(userId, limit = 10) {
    try {
      const gamesQuery = query(
        collection(db, COLLECTIONS.GAMES),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limit)
      );

      const snapshot = await getDocs(gamesQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching user games:', error);
      return [];
    }
  },

  /**
   * Update leaderboard
   */
  async updateLeaderboard(userId, gameData) {
    try {
      const leaderboardId = `${gameData.mode}_${gameData.difficulty || 'default'}`;
      const leaderboardRef = doc(db, COLLECTIONS.LEADERBOARDS, leaderboardId);
      
      // Get current leaderboard
      const leaderboardDoc = await firestoreOperations.getDocument(leaderboardRef);
      let currentEntries = [];
      
      if (leaderboardDoc.exists()) {
        currentEntries = leaderboardDoc.data()?.entries || [];
      }

      // Create new entry
      const newEntry = createLeaderboardEntry({
        userId,
        username: gameData.username,
        score: gameData.score,
        duration: gameData.duration,
        foodEaten: gameData.foodEaten,
        gameId: gameData.gameId,
        mode: gameData.mode,
        difficulty: gameData.difficulty || null,
        speedReached: gameData.speedReached
      });

      // Add new entry and sort
      currentEntries.push(newEntry);
      currentEntries.sort((a, b) => b.score - a.score);
      
      // Keep only top 100 entries
      const topEntries = currentEntries.slice(0, 100);

      // Update ranks
      topEntries.forEach((entry, index) => {
        entry.rank = index + 1;
      });

      const leaderboardData = {
        mode: gameData.mode,
        difficulty: gameData.difficulty || null,
        period: 'alltime',
        entries: topEntries,
        totalEntries: currentEntries.length,
        lastUpdated: serverTimestamp(),
        stats: {
          averageScore: topEntries.length > 0 ? 
            Math.floor(topEntries.reduce((sum, entry) => sum + entry.score, 0) / topEntries.length) : 0,
          highestScore: topEntries.length > 0 ? topEntries[0].score : 0,
          lowestScore: topEntries.length > 0 ? topEntries[topEntries.length - 1].score : 0,
          totalGames: topEntries.length
        }
      };

      await firestoreOperations.setDocument(leaderboardRef, leaderboardData);
      console.log('Leaderboard updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating leaderboard:', error);
      return false;
    }
  },

  /**
   * Get leaderboard data
   */
  async getLeaderboard(mode = 'classic', difficulty = null, limit = 10) {
    try {
      const leaderboardId = `${mode}_${difficulty || 'default'}`;
      const leaderboardRef = doc(db, COLLECTIONS.LEADERBOARDS, leaderboardId);
      
      const leaderboardDoc = await firestoreOperations.getDocument(leaderboardRef);
      
      if (leaderboardDoc.exists()) {
        const data = leaderboardDoc.data();
        return {
          entries: (data.entries || []).slice(0, limit),
          stats: data.stats || {},
          lastUpdated: data.lastUpdated,
          totalEntries: data.totalEntries || 0
        };
      }
      
      return {
        entries: [],
        stats: {},
        lastUpdated: null,
        totalEntries: 0
      };
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return {
        entries: [],
        stats: {},
        lastUpdated: null,
        totalEntries: 0
      };
    }
  },

  /**
   * Get top players across all modes
   */
  async getTopPlayersOverall(limit = 10) {
    try {
      // Get leaderboards for all modes
      const modes = [
        { mode: 'classic', difficulty: null },
        { mode: 'vsai', difficulty: 'easy' },
        { mode: 'vsai', difficulty: 'medium' },
        { mode: 'vsai', difficulty: 'impossible' },
        { mode: 'multiplayer', difficulty: null }
      ];

      const allEntries = [];
      
      for (const modeConfig of modes) {
        const leaderboard = await this.getLeaderboard(modeConfig.mode, modeConfig.difficulty, 50);
        allEntries.push(...leaderboard.entries);
      }

      // Group by user and get their best scores
      const userBestScores = {};
      allEntries.forEach(entry => {
        if (!userBestScores[entry.userId] || userBestScores[entry.userId].score < entry.score) {
          userBestScores[entry.userId] = entry;
        }
      });

      // Convert to array and sort
      const topPlayers = Object.values(userBestScores)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((entry, index) => ({
          ...entry,
          rank: index + 1
        }));

      return topPlayers;
    } catch (error) {
      console.error('Error fetching top players:', error);
      return [];
    }
  },

  /**
   * Get user's rank in a specific leaderboard
   */
  async getUserRank(userId, mode = 'classic', difficulty = null) {
    try {
      const leaderboard = await this.getLeaderboard(mode, difficulty, 1000);
      const userEntry = leaderboard.entries.find(entry => entry.userId === userId);
      
      if (userEntry) {
        return {
          rank: userEntry.rank,
          score: userEntry.score,
          totalPlayers: leaderboard.totalEntries
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching user rank:', error);
      return null;
    }
  }
};

// =====================================
// NETWORK STATUS HANDLING
// =====================================

export const networkOperations = {
  async enableOfflineSupport() {
    try {
      await enableNetwork(db);
    } catch (error) {
      console.warn('Failed to enable network:', error);
    }
  },

  async disableOfflineSupport() {
    try {
      await disableNetwork(db);
    } catch (error) {
      console.warn('Failed to disable network:', error);
    }
  }
};

// Re-export all Firestore and Auth functions
export {
  // Firestore Core
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
  writeBatch,
  
  // Auth Core
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updatePassword,
  updateProfile
};

// Default export for convenience
export default {
  // Firebase instances
  db,
  auth,
  googleProvider,
  
  // Collections and schemas
  COLLECTIONS,
  SUBCOLLECTIONS,
  USER_SCHEMA,
  GAME_SCHEMA,
  LEADERBOARD_SCHEMA,
  LEADERBOARD_ENTRY_SCHEMA,
  ACHIEVEMENT_SCHEMA,
  ADMIN_ANALYTICS_SCHEMA,
  
  // Operations
  firestoreOperations,
  gameOperations,
  networkOperations,
  
  // Schema helpers
  createUserDocument,
  createGameDocument,
  createLeaderboardEntry,
  createAnalyticsDocument,
  validateDocumentSchema,
  
  // References
  getCollectionRef,
  getDocumentRef,
  getSubcollectionRef
};
