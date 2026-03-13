const { functions } = require('../runtime');
const {
  WEEKLY_ACHIEVEMENT_RULES,
  WEEKLY_LEADERBOARD_COLLECTION,
  WEEKLY_LEADERBOARD_JOB_COLLECTION,
  WEEKLY_LEADERBOARD_LIMIT,
  WEEKLY_LEADERBOARD_META_DOC
} = require('./constants');
const { sanitizeText } = require('./coreUtils');

const getModeDifficulty = (mode, difficulty) => {
  if (mode === 'vsai') return sanitizeText(difficulty || 'medium', 32).toLowerCase();
  return null;
};

const getLeaderboardBoardId = (mode, difficulty = null) => `${mode}_${difficulty || 'default'}`;

const getWeeklyLeaderboardDocId = (mode, difficulty, weekKey) => {
  const boardId = getLeaderboardBoardId(mode, difficulty);
  return `${boardId}_${weekKey}`;
};

const compareLeaderboardEntries = (left, right) => {
  if (right.score !== left.score) return right.score - left.score;
  if (left.duration !== right.duration) return left.duration - right.duration;
  if (left.timestamp !== right.timestamp) return left.timestamp - right.timestamp;
  return String(left.username || '').localeCompare(String(right.username || ''));
};

const compareOverallEntries = (left, right) => {
  if (right.score !== left.score) return right.score - left.score;
  if (right.gamesPlayed !== left.gamesPlayed) return right.gamesPlayed - left.gamesPlayed;
  if (left.duration !== right.duration) return left.duration - right.duration;
  if (left.timestamp !== right.timestamp) return left.timestamp - right.timestamp;
  return String(left.username || '').localeCompare(String(right.username || ''));
};

const sanitizeLeaderboardSubmission = (data = {}) => {
  const mode = sanitizeText(data.mode || '', 64).toLowerCase();
  if (!['classic', 'classic_transparent', 'vsai', 'multiplayer'].includes(mode)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid leaderboard mode.');
  }

  const difficulty = getModeDifficulty(mode, data.difficulty);
  const username = sanitizeText(data.username || '', 64).toLowerCase();

  return {
    mode,
    difficulty,
    username,
    score: Math.max(0, Math.floor(Number(data.score) || 0)),
    duration: Math.max(0, Math.floor(Number(data.duration) || 0)),
    foodEaten: Math.max(0, Math.floor(Number(data.foodEaten) || 0)),
    speedReached: Math.max(1, Number(data.speedReached) || 1)
  };
};

const normalizeAchievementRecord = (achievement) => {
  if (!achievement) return null;

  if (typeof achievement === 'string') {
    return {
      id: achievement,
      unlockedAt: Date.now(),
      timestamp: Date.now(),
      collected: false,
      points: 0
    };
  }

  if (!achievement.id) return null;
  return {
    ...achievement,
    collected: !!achievement.collected,
    timestamp: typeof achievement.timestamp === 'number' ? achievement.timestamp : Date.now(),
    unlockedAt: typeof achievement.unlockedAt === 'number' ? achievement.unlockedAt : Date.now(),
    points: typeof achievement.points === 'number' ? achievement.points : 0
  };
};

const createWeeklyAchievementUnlock = (id, points, timestampMs) => ({
  id,
  unlockedAt: timestampMs,
  timestamp: timestampMs,
  collected: false,
  points
});

module.exports = {
  WEEKLY_ACHIEVEMENT_RULES,
  WEEKLY_LEADERBOARD_COLLECTION,
  WEEKLY_LEADERBOARD_JOB_COLLECTION,
  WEEKLY_LEADERBOARD_LIMIT,
  WEEKLY_LEADERBOARD_META_DOC,
  getModeDifficulty,
  getLeaderboardBoardId,
  getWeeklyLeaderboardDocId,
  compareLeaderboardEntries,
  compareOverallEntries,
  sanitizeLeaderboardSubmission,
  normalizeAchievementRecord,
  createWeeklyAchievementUnlock
};
