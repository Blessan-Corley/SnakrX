import { buildFriendSearchFields } from './friendSearch.js';

export const projectPublicProfileStats = (stats = {}) => ({
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

export const buildPublicProfileIdentity = (firebaseUser, profileData = {}) => {
  const fallbackName = firebaseUser?.email?.split('@')[0] || 'player';
  const isPrivateLeaderboard = typeof profileData?.isPrivateLeaderboard === 'boolean'
    ? profileData.isPrivateLeaderboard
    : profileData?.preferences?.privateLeaderboard === true;

  return {
    uid: profileData?.uid || firebaseUser?.uid || null,
    username: profileData?.username || fallbackName,
    displayName: profileData?.displayName || firebaseUser?.displayName || fallbackName,
    avatar: profileData?.avatar || firebaseUser?.photoURL || null,
    avatarPath: profileData?.avatarPath || null,
    isPrivateLeaderboard,
    ...buildFriendSearchFields({
      username: profileData?.username || fallbackName,
      displayName: profileData?.displayName || firebaseUser?.displayName || fallbackName
    })
  };
};

export const buildPublicProfilePreferences = (profileData = {}) => ({
  hideMatchHistory: profileData?.preferences?.hideMatchHistory === true
});
