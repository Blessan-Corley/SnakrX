const GAME_MODES = {
  CLASSIC: 'classic',
  CLASSIC_TRANSPARENT: 'classic_transparent',
  VS_AI: 'vsai',
  MULTIPLAYER: 'multiplayer'
};

const AI_DIFFICULTIES = {
  EASY: 'easy',
  MEDIUM: 'medium',
  IMPOSSIBLE: 'impossible'
};

const SPEED_CONFIGS = {
  INITIAL: 200
};

const MAX_PLAYER_LEVEL = 35;
const BASE_XP_PER_LEVEL = 120;
const XP_STEP_PER_LEVEL = 45;

const getModeStatsKey = (mode) => {
  if (mode === GAME_MODES.CLASSIC_TRANSPARENT) return 'transparent';
  return String(mode || '').replace('_', '');
};

const getIsoWeekParts = (date = new Date()) => {
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNumber = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayNumber);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((utcDate - yearStart) / 86400000) + 1) / 7);

  return {
    year: utcDate.getUTCFullYear(),
    week
  };
};

const getIsoWeekKey = (date = new Date()) => {
  const { year, week } = getIsoWeekParts(date);
  return `${year}-W${String(week).padStart(2, '0')}`;
};

const isPreviousIsoWeek = (previousKey, currentKey) => {
  if (!previousKey || !currentKey) return false;

  const parseKey = (key) => {
    const match = /^(\d{4})-W(\d{2})$/.exec(key);
    if (!match) return null;
    return {
      year: Number(match[1]),
      week: Number(match[2])
    };
  };

  const previous = parseKey(previousKey);
  const current = parseKey(currentKey);
  if (!previous || !current) return false;

  if (previous.year === current.year) {
    return current.week - previous.week === 1;
  }

  if (current.year - previous.year === 1 && current.week === 1) {
    const dec28 = new Date(Date.UTC(previous.year, 11, 28));
    const { week: lastWeekOfYear } = getIsoWeekParts(dec28);
    return previous.week === lastWeekOfYear;
  }

  return false;
};

const sanitizeXp = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) return 0;
  return Math.floor(numeric);
};

const getXpRequiredForLevel = (level) => {
  const safeLevel = Math.max(1, Math.min(MAX_PLAYER_LEVEL, Math.floor(level)));
  let total = 0;
  for (let currentLevel = 1; currentLevel < safeLevel; currentLevel += 1) {
    total += BASE_XP_PER_LEVEL + ((currentLevel - 1) * XP_STEP_PER_LEVEL);
  }
  return total;
};

const getLevelFromXp = (xp) => {
  const normalizedXp = sanitizeXp(xp);

  for (let level = MAX_PLAYER_LEVEL; level >= 1; level -= 1) {
    if (normalizedXp >= getXpRequiredForLevel(level)) {
      return level;
    }
  }

  return 1;
};

const calculateGameXpGain = ({
  mode = GAME_MODES.CLASSIC,
  difficulty = null,
  duration = 0,
  foodEaten = 0,
  score = 0,
  victory = false
} = {}) => {
  const baseByMode = {
    [GAME_MODES.CLASSIC]: 20,
    [GAME_MODES.CLASSIC_TRANSPARENT]: 24,
    [GAME_MODES.VS_AI]: 28,
    [GAME_MODES.MULTIPLAYER]: 24
  };

  const difficultyBonus = difficulty === AI_DIFFICULTIES.IMPOSSIBLE
    ? 14
    : difficulty === AI_DIFFICULTIES.MEDIUM
      ? 8
      : difficulty === AI_DIFFICULTIES.EASY
        ? 4
        : 0;

  const normalizedDuration = Math.max(0, Number(duration) || 0);
  const normalizedFood = Math.max(0, Number(foodEaten) || 0);
  const normalizedScore = Math.max(0, Number(score) || 0);

  const durationBonus = Math.min(30, Math.floor(normalizedDuration / 20));
  const foodBonus = Math.min(20, Math.floor(normalizedFood / 4));
  const scoreBonus = Math.min(35, Math.floor(normalizedScore / 200));
  const victoryBonus = victory ? 18 : 0;

  return (
    (baseByMode[mode] || 20) +
    difficultyBonus +
    durationBonus +
    foodBonus +
    scoreBonus +
    victoryBonus
  );
};

const getSpeedMultiplier = (currentSpeed) => {
  if (!currentSpeed || currentSpeed <= 0) return 1;
  const multiplier = SPEED_CONFIGS.INITIAL / currentSpeed;
  return Math.round(multiplier * 10) / 10;
};

const isCountKey = (key) => (
  key.includes('Games') ||
  key === 'totalGames' ||
  key === 'totalWins' ||
  key.includes('Wins') ||
  key.includes('wins')
);

const isMaxKey = (key) => (
  key.endsWith('BestScore') ||
  key.endsWith('bestScore') ||
  key === 'bestScore' ||
  key === 'maxSpeed' ||
  key === 'maxLength' ||
  key === 'bestWinStreak' ||
  key === 'leaderboardTop3BestWeekStreak' ||
  key === 'weeklyTop3BestWeekStreak' ||
  key === 'maxSurvivalTime' ||
  key === 'transparentScore' ||
  key === 'level'
);

const isTimestampKey = (key) => key.endsWith('At');

const applyStatUpdates = (currentStats = {}, statUpdates = {}) => {
  const nextStats = { ...currentStats };

  for (const [key, value] of Object.entries(statUpdates)) {
    if (typeof value === 'number') {
      if (!Number.isFinite(value)) {
        continue;
      }

      if (isTimestampKey(key)) {
        nextStats[key] = value;
        continue;
      }

      if (isCountKey(key)) {
        nextStats[key] = (nextStats[key] || 0) + value;
        continue;
      }

      if (isMaxKey(key)) {
        nextStats[key] = Math.max(nextStats[key] || 0, value);
        continue;
      }

      if (
        key === 'currentWinStreak' ||
        key === 'aiImpossibleStreak' ||
        key === 'leaderboardTop3WeekStreak' ||
        key === 'weeklyTop3WeekStreak' ||
        key === 'lastGameDuration' ||
        key === 'leaderboardTop3LastWeekKey'
      ) {
        nextStats[key] = value;
        continue;
      }

      nextStats[key] = (nextStats[key] || 0) + value;
      continue;
    }

    if (Array.isArray(value)) {
      nextStats[key] = value;
      continue;
    }

    nextStats[key] = value;
  }

  return nextStats;
};

const isQualifiedCompetitiveWin = ({ mode, victory, playerScore }) => {
  if (!victory) return false;
  if (mode === GAME_MODES.VS_AI) {
    return (Number(playerScore) || 0) > 100;
  }

  return mode === GAME_MODES.MULTIPLAYER;
};

const buildStatUpdates = ({
  session,
  previousStats = {},
  victory,
  now = Date.now(),
  quickDeathThresholdSeconds = 5
}) => {
  const modeKey = getModeStatsKey(session.mode);
  const previousBestScore = Number(previousStats.bestScore) || 0;
  const previousModeBestScore = Number(previousStats[`${modeKey}BestScore`]) || 0;
  const reachedOverallBest = session.score > 0 && session.score >= previousBestScore;
  const reachedModeBest = session.score > 0 && session.score >= previousModeBestScore;
  const duration = Math.max(0, Math.floor(Number(session.duration) || 0));
  const xpGain = calculateGameXpGain({
    mode: session.mode,
    difficulty: session.difficulty,
    duration,
    foodEaten: session.foodEaten,
    score: session.score,
    victory
  });
  const nextXp = (Number(previousStats.xp) || 0) + xpGain;
  const nextLevel = getLevelFromXp(nextXp);
  const isCompetitiveMode =
    session.mode === GAME_MODES.VS_AI || session.mode === GAME_MODES.MULTIPLAYER;

  const statUpdates = {
    totalGames: 1,
    totalScore: session.score,
    bestScore: session.score,
    xp: xpGain,
    level: nextLevel,
    foodEaten: session.foodEaten,
    maxSpeed: Number(session.speedReached) || 1,
    maxLength: Number(session.maxLength) || 1,
    wallHits: Number(session.stats?.wallHits) || 0,
    selfHits: Number(session.stats?.selfHits) || 0,
    moves: Number(session.stats?.moves) || 0,
    closeCalls: Number(session.stats?.closeCalls) || 0,
    fastEats: Number(session.stats?.fastEats) || 0,
    bonusFoodsSpawned: Number(session.stats?.bonusFoodsSpawned) || 0,
    bonusFoodsCollected: Number(session.stats?.bonusFoodsCollected) || 0,
    bonusFoodPoints: Number(session.stats?.bonusFoodPoints) || 0,
    totalPlayTime: duration,
    lastGameDuration: duration,
    maxSurvivalTime: duration,
    lastGameAt: now,
    [`${modeKey}Games`]: 1,
    [`${modeKey}BestScore`]: session.score
  };

  if (reachedOverallBest) {
    statUpdates.bestScoreAt = now;
    statUpdates.bestScoreMode = session.mode;
  }

  if (reachedModeBest) {
    statUpdates[`${modeKey}BestScoreAt`] = now;
  }

  if (session.mode === GAME_MODES.CLASSIC_TRANSPARENT) {
    statUpdates.transparentScore = Math.max(previousStats.transparentScore || 0, session.score);
  }

  if (isCompetitiveMode) {
    const qualifiedCompetitiveWin = isQualifiedCompetitiveWin({
      mode: session.mode,
      victory,
      playerScore: session.score
    });

    statUpdates.competitiveGames = 1;
    if (victory) {
      statUpdates.totalWins = 1;
      statUpdates.competitiveWins = 1;
      statUpdates[`${modeKey}Wins`] = 1;
    }

    const currentStreak = previousStats.currentWinStreak || 0;
    if (qualifiedCompetitiveWin) {
      const nextStreak = currentStreak + 1;
      statUpdates.currentWinStreak = nextStreak;
      statUpdates.bestWinStreak = nextStreak;
    } else {
      statUpdates.currentWinStreak = 0;
    }

    if (session.mode === GAME_MODES.VS_AI && session.difficulty === AI_DIFFICULTIES.IMPOSSIBLE) {
      const currentAiImpossibleStreak = previousStats.aiImpossibleStreak || 0;
      statUpdates.aiImpossibleStreak = qualifiedCompetitiveWin ? currentAiImpossibleStreak + 1 : 0;
    }
  }

  if (session.mode === GAME_MODES.MULTIPLAYER && session.playerCount === 4) {
    statUpdates.multiplayerGames4Player = 1;
    if (victory) {
      statUpdates.multiplayerWins4Player = 1;

      const allPlayersAboveFifty = (session.playerScores || [])
        .filter((score) => Number.isFinite(Number(score)))
        .every((score) => Number(score) >= 50);

      if (allPlayersAboveFifty && (session.playerScores || []).length >= 4) {
        statUpdates.multiplayerWins4PlayerAllAbove50 = 1;
      }
    }
  }

  if (!victory && duration < Number(quickDeathThresholdSeconds)) {
    statUpdates.quickDeaths = 1;
  }

  if (session.mode === GAME_MODES.VS_AI && victory && session.difficulty) {
    const difficultyKey = session.difficulty.charAt(0).toUpperCase() + session.difficulty.slice(1);
    statUpdates[`ai${difficultyKey}Wins`] = 1;
  }

  return {
    statUpdates,
    predictedXp: nextXp,
    predictedLevel: nextLevel
  };
};

const buildLeaderboardRankUpdates = ({
  modeRank,
  achievementRank,
  overallRank,
  predictedStatsForAchievements,
  currentDate = new Date()
}) => {
  const rankUpdates = {};

  if (modeRank && modeRank <= 100) {
    rankUpdates.leaderboardTop100Finishes = 1;
  }
  if (modeRank && modeRank <= 10) {
    rankUpdates.leaderboardTop10Finishes = 1;
  }
  if (modeRank && modeRank <= 3) {
    rankUpdates.leaderboardTop3Finishes = 1;
  }
  if (modeRank === 1) {
    rankUpdates.leaderboardRank1Finishes = 1;
  }
  if (achievementRank && achievementRank <= 10) {
    rankUpdates.achievementLeaderboardTop10Finishes = 1;
  }
  if (overallRank && overallRank <= 10) {
    rankUpdates.overallLeaderboardTop10Finishes = 1;
  }

  const currentWeekKey = getIsoWeekKey(currentDate);
  const lastWeekKey = predictedStatsForAchievements.leaderboardTop3LastWeekKey || null;
  const inTopThree = Boolean(modeRank && modeRank <= 3);

  if (inTopThree && lastWeekKey !== currentWeekKey) {
    const nextWeekStreak = isPreviousIsoWeek(lastWeekKey, currentWeekKey)
      ? (Number(predictedStatsForAchievements.leaderboardTop3WeekStreak) || 0) + 1
      : 1;
    rankUpdates.leaderboardTop3WeekStreak = nextWeekStreak;
    rankUpdates.leaderboardTop3BestWeekStreak = nextWeekStreak;
    rankUpdates.leaderboardTop3LastWeekKey = currentWeekKey;
  } else if (!inTopThree && lastWeekKey && lastWeekKey !== currentWeekKey && isPreviousIsoWeek(lastWeekKey, currentWeekKey)) {
    rankUpdates.leaderboardTop3WeekStreak = 0;
    rankUpdates.leaderboardTop3LastWeekKey = currentWeekKey;
  }

  return rankUpdates;
};

const VALID_RESULTS = new Set(['completed', 'won', 'lost', 'quit', 'victory', 'defeat']);

const sanitizeFinalizedSessionPayload = ({ session = {}, sanitizeText, functions, userId, username }) => {
  const mode = sanitizeText(session.mode || '', 64).toLowerCase();
  const difficulty = session.difficulty == null ? null : sanitizeText(session.difficulty, 32).toLowerCase();
  const gameId = sanitizeText(session.gameId || '', 128);

  if (!gameId) {
    throw new functions.https.HttpsError('invalid-argument', 'Game id is required.');
  }

  if (!Object.values(GAME_MODES).includes(mode)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid game mode.');
  }

  if (
    (mode === GAME_MODES.VS_AI && !Object.values(AI_DIFFICULTIES).includes(difficulty)) ||
    (mode !== GAME_MODES.VS_AI && difficulty !== null)
  ) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid game difficulty.');
  }

  const playerCount = Math.max(1, Math.min(4, Math.floor(Number(session.playerCount) || 1)));
  const score = Math.max(0, Math.min(1000000, Math.floor(Number(session.score) || 0)));
  const duration = Math.max(0, Math.min(86400, Math.floor(Number(session.duration) || 0)));
  const foodEaten = Math.max(0, Math.min(100000, Math.floor(Number(session.foodEaten) || 0)));
  const speedReached = Math.max(1, Math.min(100, Number(session.speedReached) || 1));
  const maxLength = Math.max(1, Math.min(100000, Math.floor(Number(session.maxLength) || 1)));
  const result = sanitizeText(session.result || 'completed', 32).toLowerCase();
  const startedAt = Math.floor(Number(session.startedAt) || 0);
  const endedAt = Math.floor(Number(session.endedAt) || 0);

  if (!VALID_RESULTS.has(result)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid game result.');
  }

  if (!startedAt || !endedAt || endedAt < startedAt) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid game timestamps.');
  }

  const rawStats = typeof session.stats === 'object' && session.stats ? session.stats : {};
  const stats = {
    moves: Math.max(0, Math.floor(Number(rawStats.moves) || 0)),
    wallHits: Math.max(0, Math.floor(Number(rawStats.wallHits) || 0)),
    selfHits: Math.max(0, Math.floor(Number(rawStats.selfHits) || 0)),
    closeCalls: Math.max(0, Math.floor(Number(rawStats.closeCalls) || 0)),
    fastEats: Math.max(0, Math.floor(Number(rawStats.fastEats) || 0)),
    bonusFoodsSpawned: Math.max(0, Math.floor(Number(rawStats.bonusFoodsSpawned) || 0)),
    bonusFoodsCollected: Math.max(0, Math.floor(Number(rawStats.bonusFoodsCollected) || 0)),
    bonusFoodPoints: Math.max(0, Math.floor(Number(rawStats.bonusFoodPoints) || 0)),
    maxLength,
    averageSpeed: Math.max(1, Math.min(100, Number(rawStats.averageSpeed) || speedReached)),
    efficiency: Math.max(0, Number(rawStats.efficiency) || 0),
    timeToFirstFood: Math.max(0, Math.floor(Number(rawStats.timeToFirstFood) || 0)),
    timeToMaxLength: Math.max(0, Math.floor(Number(rawStats.timeToMaxLength) || 0))
  };

  const playerScores = Array.isArray(session.playerScores)
    ? session.playerScores
        .slice(0, 4)
        .map((value) => Math.max(0, Math.min(1000000, Math.floor(Number(value) || 0))))
    : [];

  return {
    gameId,
    userId,
    username,
    mode,
    difficulty,
    playerCount,
    score,
    aiScore: mode === GAME_MODES.VS_AI ? Math.max(0, Math.floor(Number(session.aiScore) || 0)) : null,
    duration,
    foodEaten,
    speedReached,
    result,
    maxLength,
    playerScores,
    stats,
    startedAt,
    endedAt
  };
};

module.exports = {
  GAME_MODES,
  AI_DIFFICULTIES,
  getModeStatsKey,
  getIsoWeekKey,
  isPreviousIsoWeek,
  getLevelFromXp,
  calculateGameXpGain,
  getSpeedMultiplier,
  applyStatUpdates,
  buildStatUpdates,
  buildLeaderboardRankUpdates,
  sanitizeFinalizedSessionPayload
};
