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
  avatar: firebaseUser.photoURL || null,
  avatarPath: null,
  createdAt: serverTimestamp(),
  lastLoginAt: serverTimestamp(),
  role: 'player',
  stats: {
    // Basic game statistics
    totalGames: 0,
    totalWins: 0,
    competitiveGames: 0,
    competitiveWins: 0,
    totalScore: 0,
    bestScore: 0,
    bestScoreMode: null,
    totalPlayTime: 0,
    achievementPoints: 0,
    achievements: [],
    uncollectedAchievements: [],
    xp: 0,
    level: 1,

    // Mode-specific statistics
    classicGames: 0,
    classicWins: 0,
    classicBestScore: 0,
    classicBestScoreAt: null,
    transparentGames: 0,
    transparentWins: 0,
    transparentBestScore: 0,
    transparentBestScoreAt: null,
    vsaiGames: 0,
    vsaiWins: 0,
    vsaiBestScore: 0,
    vsaiBestScoreAt: null,
    multiplayerGames: 0,
    multiplayerWins: 0,
    multiplayerBestScore: 0,
    multiplayerBestScoreAt: null,
    multiplayerGames4Player: 0,
    multiplayerWins4Player: 0,
    multiplayerWins4PlayerAllAbove50: 0,
    bestScoreAt: null,

    // Performance and failure tracking
    wallHits: 0,
    selfHits: 0,
    foodEaten: 0,
    maxSpeed: 1,
    maxLength: 1,
    maxSurvivalTime: 0,
    moves: 0,
    closeCalls: 0,
    fastEats: 0,
    quickDeaths: 0,

    // Streak tracking
    currentWinStreak: 0,
    bestWinStreak: 0,

    // AI difficulty specific wins
    aiEasyWins: 0,
    aiMediumWins: 0,
    aiImpossibleWins: 0,
    aiImpossibleStreak: 0,
    friendsCount: 0,
    leaderboardTop100Finishes: 0,
    leaderboardTop10Finishes: 0,
    leaderboardTop3Finishes: 0,
    leaderboardRank1Finishes: 0,
    achievementLeaderboardTop10Finishes: 0,
    overallLeaderboardTop10Finishes: 0,
    leaderboardTop3WeekStreak: 0,
    leaderboardTop3BestWeekStreak: 0,
    leaderboardTop3LastWeekKey: null,
    weeklyLeaderboardTop100Finishes: 0,
    weeklyLeaderboardTop10Finishes: 0,
    weeklyLeaderboardTop3Finishes: 0,
    weeklyLeaderboardRank1Finishes: 0,
    weeklyOverallTop10Finishes: 0,
    weeklyTop3WeekStreak: 0,
    weeklyTop3BestWeekStreak: 0,
    weeklyTop3LastWeekKey: null,
    weeklyLastProcessedWeekKey: null,

    // Special achievement tracking
    transparentScore: 0,
    perfectGames: 0,

    // Time tracking
    lastGameDuration: 0,
    totalPlayTimeSeconds: 0,
    lastGameAt: null
  },
  settings: {
    soundEnabled: true,
    soundVolume: 0.7,
    showGrid: true,
  },
  preferences: {
    favoriteGameMode: 'classic',
    snakeColor: '#10b981',
    privateLeaderboard: false
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
  avatar: firebaseUser.photoURL || null,
  avatarPath: null,
  stats: createDefaultUserProfile(firebaseUser).stats
});
