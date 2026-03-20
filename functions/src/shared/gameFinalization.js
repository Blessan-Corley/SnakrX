const MAX_PLAYER_LEVEL = 35;
const BASE_XP_PER_LEVEL = 120;
const XP_STEP_PER_LEVEL = 45;
const QUICK_DEATH_THRESHOLD_SECONDS = 5;

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

const normalizeStoredXpGain = (value) => {
  if (value == null || value === '') return null;

  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) return 0;
  return Math.floor(numeric);
};

const isVictoryResult = (result) => {
  const normalizedResult = String(result || '').toLowerCase();
  return normalizedResult === 'won' || normalizedResult === 'victory';
};

const resolveGameXpGain = ({
  xpGained,
  mode = GAME_MODES.CLASSIC,
  difficulty = null,
  duration = 0,
  foodEaten = 0,
  score = 0,
  result = 'completed',
  victory
} = {}) => {
  const storedXpGain = normalizeStoredXpGain(xpGained);
  if (storedXpGain !== null) {
    return storedXpGain;
  }

  return calculateGameXpGain({
    mode,
    difficulty,
    duration,
    foodEaten,
    score,
    victory: typeof victory === 'boolean' ? victory : isVictoryResult(result)
  });
};

const getModeStatsKey = (mode) => {
  switch (mode) {
    case GAME_MODES.CLASSIC_TRANSPARENT:
      return 'transparent';
    case GAME_MODES.VS_AI:
      return 'vsai';
    case GAME_MODES.MULTIPLAYER:
      return 'multiplayer';
    case GAME_MODES.CLASSIC:
    default:
      return 'classic';
  }
};

const isQualifiedCompetitiveWinSafe = ({ mode, victory, playerScore }) => {
  if (!victory) return false;
  if (mode === GAME_MODES.VS_AI) {
    return (Number(playerScore) || 0) > 100;
  }
  return mode === GAME_MODES.MULTIPLAYER;
};

const shouldRecordQuickDeath = ({
  victory = false,
  duration = 0,
  thresholdSeconds = QUICK_DEATH_THRESHOLD_SECONDS
} = {}) => !victory && Number(duration) < Number(thresholdSeconds);

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
        key === 'lastGameDuration'
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

const buildStatUpdatesFromSession = ({
  sessionData,
  previousStats = {},
  now = Date.now()
}) => {
  const modeKey = getModeStatsKey(sessionData.mode);
  const previousBestScore = Number(previousStats.bestScore) || 0;
  const previousModeBestScore = Number(previousStats[`${modeKey}BestScore`]) || 0;
  const reachedOverallBest = sessionData.score > 0 && sessionData.score >= previousBestScore;
  const reachedModeBest = sessionData.score > 0 && sessionData.score >= previousModeBestScore;
  const duration = Math.max(0, Math.floor(Number(sessionData.duration) || 0));
  const victory = sessionData.result === 'won' || sessionData.result === 'victory';
  const xpGain = resolveGameXpGain({
    xpGained: sessionData.xpGained,
    mode: sessionData.mode,
    difficulty: sessionData.difficulty,
    duration,
    foodEaten: sessionData.foodEaten,
    score: sessionData.score,
    result: sessionData.result,
    victory
  });
  const nextXp = (Number(previousStats.xp) || 0) + xpGain;
  const nextLevel = getLevelFromXp(nextXp);
  const isCompetitiveMode =
    sessionData.mode === GAME_MODES.VS_AI || sessionData.mode === GAME_MODES.MULTIPLAYER;

  const statUpdates = {
    totalGames: 1,
    totalScore: sessionData.score,
    bestScore: sessionData.score,
    xp: xpGain,
    level: nextLevel,
    foodEaten: sessionData.foodEaten,
    maxSpeed: Math.max(1, Number(sessionData.speedReached) || 1),
    maxLength: Math.max(1, Number(sessionData.maxLength) || 1),
    wallHits: Number(sessionData.stats?.wallHits) || 0,
    selfHits: Number(sessionData.stats?.selfHits) || 0,
    moves: Number(sessionData.stats?.moves) || 0,
    closeCalls: Number(sessionData.stats?.closeCalls) || 0,
    fastEats: Number(sessionData.stats?.fastEats) || 0,
    bonusFoodsSpawned: Number(sessionData.stats?.bonusFoodsSpawned) || 0,
    bonusFoodsCollected: Number(sessionData.stats?.bonusFoodsCollected) || 0,
    bonusFoodPoints: Number(sessionData.stats?.bonusFoodPoints) || 0,
    totalPlayTime: duration,
    lastGameDuration: duration,
    maxSurvivalTime: duration,
    lastGameAt: now,
    [`${modeKey}Games`]: 1,
    [`${modeKey}BestScore`]: sessionData.score
  };

  if (reachedOverallBest) {
    statUpdates.bestScoreAt = now;
    statUpdates.bestScoreMode = sessionData.mode;
  }

  if (reachedModeBest) {
    statUpdates[`${modeKey}BestScoreAt`] = now;
  }

  if (sessionData.mode === GAME_MODES.CLASSIC_TRANSPARENT) {
    statUpdates.transparentScore = Math.max(previousStats.transparentScore || 0, sessionData.score);
  }

  if (isCompetitiveMode) {
    const qualifiedCompetitiveWin = isQualifiedCompetitiveWinSafe({
      mode: sessionData.mode,
      victory,
      playerScore: sessionData.score
    });

    statUpdates.competitiveGames = 1;
    if (victory) {
      statUpdates.totalWins = 1;
      statUpdates.competitiveWins = 1;
      statUpdates[`${modeKey}Wins`] = 1;
    }

    const currentStreak = Number(previousStats.currentWinStreak) || 0;
    if (qualifiedCompetitiveWin) {
      const nextStreak = currentStreak + 1;
      statUpdates.currentWinStreak = nextStreak;
      statUpdates.bestWinStreak = nextStreak;
    } else {
      statUpdates.currentWinStreak = 0;
    }

    if (sessionData.mode === GAME_MODES.VS_AI && sessionData.difficulty === AI_DIFFICULTIES.IMPOSSIBLE) {
      const currentAiImpossibleStreak = Number(previousStats.aiImpossibleStreak) || 0;
      statUpdates.aiImpossibleStreak = qualifiedCompetitiveWin ? currentAiImpossibleStreak + 1 : 0;
    }
  }

  if (sessionData.mode === GAME_MODES.MULTIPLAYER && Number(sessionData.playerCount) === 4) {
    statUpdates.multiplayerGames4Player = 1;
    if (victory) {
      statUpdates.multiplayerWins4Player = 1;
      const allPlayersAboveFifty = Array.isArray(sessionData.playerScores)
        && sessionData.playerScores.length >= 4
        && sessionData.playerScores.every((score) => Number(score) >= 50);

      if (allPlayersAboveFifty) {
        statUpdates.multiplayerWins4PlayerAllAbove50 = 1;
      }
    }
  }

  if (shouldRecordQuickDeath({ victory, duration })) {
    statUpdates.quickDeaths = 1;
  }

  if (sessionData.mode === GAME_MODES.VS_AI && victory && sessionData.difficulty) {
    const difficultyKey = sessionData.difficulty.charAt(0).toUpperCase() + sessionData.difficulty.slice(1);
    statUpdates[`ai${difficultyKey}Wins`] = 1;
  }

  const nextStats = applyStatUpdates(previousStats, statUpdates);

  return {
    statUpdates,
    nextStats,
    victory,
    xpGain
  };
};

module.exports = {
  applyStatUpdates,
  buildStatUpdatesFromSession,
  calculateGameXpGain,
  getLevelFromXp,
  getModeStatsKey,
  resolveGameXpGain
};
