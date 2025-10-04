/**
 * Auth Constants and Configuration
 */

import { serverTimestamp } from '../../services/firebase/index.js';

// Rate limiting configuration
export const RATE_LIMIT = {
  MAX_ATTEMPTS: 5,
  LOCKOUT_DURATION: 300000, // 5 minutes in milliseconds
  ATTEMPT_WINDOW: 60000 // 1 minute
};

/**
 * Create default user profile structure
 */
export const createDefaultUserProfile = (firebaseUser) => ({
  username: firebaseUser.email.split('@')[0],
  displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
  email: firebaseUser.email,
  createdAt: serverTimestamp(),
  lastLoginAt: serverTimestamp(),
  role: 'player',
  stats: {
    // Basic game statistics
    totalGames: 0,
    totalWins: 0,
    totalScore: 0,
    bestScore: 0,
    totalPlayTime: 0,
    achievementPoints: 0,
    achievements: [],
    uncollectedAchievements: [],

    // Mode-specific statistics
    classicGames: 0,
    classicWins: 0,
    classicBestScore: 0,
    vsaiGames: 0,
    vsaiWins: 0,
    vsaiBestScore: 0,
    multiplayerGames: 0,
    multiplayerWins: 0,
    multiplayerBestScore: 0,

    // Performance and failure tracking
    wallHits: 0,
    selfHits: 0,
    foodEaten: 0,
    maxSpeed: 1,
    maxLength: 1,
    maxSurvivalTime: 0,
    moves: 0,
    quickDeaths: 0,

    // Streak tracking
    currentWinStreak: 0,
    bestWinStreak: 0,

    // AI difficulty specific wins
    aiEasyWins: 0,
    aiMediumWins: 0,
    aiImpossibleWins: 0,

    // Special achievement tracking
    transparentScore: 0,
    perfectGames: 0,

    // Time tracking
    lastGameDuration: 0,
    totalPlayTimeSeconds: 0
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
export const createBasicProfile = (firebaseUser) => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email,
  displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
  username: firebaseUser.email.split('@')[0],
  stats: createDefaultUserProfile(firebaseUser).stats
});
