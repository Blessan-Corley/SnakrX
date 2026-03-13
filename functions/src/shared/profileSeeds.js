const { admin } = require('../runtime');

const createDefaultUserStats = () => ({
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
  currentWinStreak: 0,
  bestWinStreak: 0,
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
  transparentScore: 0,
  perfectGames: 0,
  lastGameDuration: 0,
  totalPlayTimeSeconds: 0,
  lastGameAt: null
});

const projectPublicProfileStats = (stats = {}) => ({
  totalGames: Number(stats.totalGames) || 0,
  totalWins: Number(stats.totalWins) || 0,
  competitiveGames: Number(stats.competitiveGames) || 0,
  competitiveWins: Number(stats.competitiveWins) || 0,
  totalScore: Number(stats.totalScore) || 0,
  bestScore: Number(stats.bestScore) || 0,
  bestScoreAt: stats.bestScoreAt || null,
  bestScoreMode: stats.bestScoreMode || null,
  achievementPoints: Number(stats.achievementPoints) || 0,
  achievementsCompleted: Array.isArray(stats.achievements)
    ? stats.achievements.length
    : Number(stats.achievementsCompleted) || 0,
  foodEaten: Number(stats.foodEaten) || 0,
  totalPlayTime: Number(stats.totalPlayTime) || 0,
  classicGames: Number(stats.classicGames) || 0,
  transparentGames: Number(stats.transparentGames) || 0,
  vsaiGames: Number(stats.vsaiGames) || 0,
  multiplayerGames: Number(stats.multiplayerGames) || 0,
  xp: Number(stats.xp) || 0,
  level: Math.max(1, Number(stats.level) || 1)
});

const createDefaultUserProfileData = ({
  email,
  username,
  displayName,
  avatar = null
}) => {
  const timestamp = admin.firestore.FieldValue.serverTimestamp();
  const stats = createDefaultUserStats();

  return {
    username,
    displayName,
    email,
    avatar,
    avatarPath: null,
    role: 'player',
    banned: false,
    banReason: null,
    bannedAt: null,
    bannedBy: null,
    unbannedAt: null,
    unbannedBy: null,
    stats,
    settings: {
      soundEnabled: true,
      soundVolume: 0.7,
      showGrid: true
    },
    preferences: {
      favoriteGameMode: 'classic',
      snakeColor: '#10b981',
      privateLeaderboard: false,
      hideMatchHistory: false
    },
    createdAt: timestamp,
    lastLoginAt: timestamp,
    updatedAt: timestamp,
    lastActiveAt: timestamp
  };
};

const createDefaultPublicProfileData = ({
  uid,
  username,
  displayName,
  avatar = null,
  stats = createDefaultUserStats()
}) => {
  const timestamp = admin.firestore.FieldValue.serverTimestamp();

  return {
    uid,
    username,
    displayName,
    avatar,
    avatarPath: null,
    isPrivateLeaderboard: false,
    preferences: {
      hideMatchHistory: false
    },
    stats: projectPublicProfileStats(stats),
    createdAt: timestamp,
    updatedAt: timestamp,
    lastActiveAt: timestamp
  };
};

module.exports = {
  createDefaultUserStats,
  createDefaultUserProfileData,
  createDefaultPublicProfileData,
  projectPublicProfileStats
};
