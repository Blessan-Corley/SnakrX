const toSafeNumber = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

const requirementLabels = {
  games: 'Games played',
  wins: 'Wins',
  totalScore: 'Total score',
  singleScore: 'Best single-game score',
  survivalTime: 'Longest survival (seconds)',
  maxSpeed: 'Top speed multiplier',
  maxLength: 'Longest snake length',
  moves: 'Total moves',
  foodEaten: 'Food eaten',
  fastEats: 'Fast food pickups',
  closeCalls: 'Close calls',
  wallHits: 'Wall hits',
  selfHits: 'Self collisions',
  quickDeaths: 'Quick deaths',
  winStreak: 'Win streak',
  aiWins: 'AI wins',
  aiStreak: 'Impossible win streak (>100 score)',
  multiplayerGames: 'Multiplayer games',
  multiplayerWins: 'Multiplayer wins',
  multiplayerGames4Player: '4-player games',
  multiplayerWins4Player: '4-player wins',
  multiplayerWins4PlayerAllAbove50: '4-player wins (all >= 50)',
  transparentScore: 'Transparent score',
  friendsCount: 'Friends',
  level: 'Player level',
  leaderboardTop100Finishes: 'Top 100 leaderboard finishes',
  leaderboardTop10Finishes: 'Top 10 leaderboard finishes',
  leaderboardTop3Finishes: 'Top 3 leaderboard finishes',
  leaderboardRank1Finishes: 'Rank #1 leaderboard finishes',
  achievementLeaderboardTop10Finishes: 'Top 10 in achievements leaderboard',
  overallLeaderboardTop10Finishes: 'Top 10 in overall leaderboard',
  leaderboardTop3BestWeekStreak: 'Best weekly top-3 streak',
  weeklyLeaderboardTop100Finishes: 'Weekly top 100 finishes',
  weeklyLeaderboardTop10Finishes: 'Weekly top 10 finishes',
  weeklyLeaderboardTop3Finishes: 'Weekly top 3 finishes',
  weeklyLeaderboardRank1Finishes: 'Weekly rank #1 finishes',
  weeklyOverallTop10Finishes: 'Weekly overall top 10 finishes',
  weeklyTop3BestWeekStreak: 'Weekly podium streak (best)'
};

const humanizeRequirementKey = (key) => key
  .replace(/([A-Z])/g, ' $1')
  .replace(/^./, (char) => char.toUpperCase());

export const getAchievementRequirementLabel = (key) => requirementLabels[key] || humanizeRequirementKey(key);

const formatConditionValue = (key, value) => {
  if (typeof value === 'boolean') {
    return value ? 'Required' : 'Not required';
  }

  if (key === 'difficulty' && typeof value === 'string') {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  if (key === 'playerCount') {
    return `${value} players`;
  }

  return String(value);
};

const buildProgressSnapshot = (key, current, target) => {
  const safeTarget = Math.max(1, toSafeNumber(target));
  const safeCurrent = Math.max(0, toSafeNumber(current));
  const percentage = Math.round(clampProgress(safeCurrent / safeTarget) * 100);

  return {
    key,
    label: requirementLabels[key] || key,
    current: Math.min(safeCurrent, safeTarget),
    target: safeTarget,
    percentage
  };
};

const getRequirementCurrentValue = (achievement, key, stats) => {
  if (achievement?.id === 'ai_slayer' && key === 'aiWins') {
    return stats.aiEasyWins;
  }

  if (achievement?.id === 'ai_hunter' && key === 'aiWins') {
    return stats.aiMediumWins;
  }

  if (achievement?.id === 'terminator' && key === 'aiWins') {
    return stats.aiImpossibleWins;
  }

  if (achievement?.id === 'am_i_god' && key === 'aiStreak') {
    return stats.aiImpossibleStreak;
  }

  if (achievement?.id === 'last_snake_standing' && key === 'multiplayerWins4Player') {
    return stats.multiplayerWins4Player;
  }

  return stats[key];
};

export const normalizeStatsForAchievementProgress = (stats = {}) => {
  const aiEasyWins = toSafeNumber(stats.aiEasyWins);
  const aiMediumWins = toSafeNumber(stats.aiMediumWins);
  const aiImpossibleWins = toSafeNumber(stats.aiImpossibleWins);

  return {
    ...stats,
    games: toSafeNumber(stats.games ?? stats.totalGames),
    wins: toSafeNumber(stats.wins ?? stats.totalWins),
    totalScore: toSafeNumber(stats.totalScore),
    singleScore: toSafeNumber(stats.singleScore ?? stats.bestScore),
    survivalTime: toSafeNumber(stats.survivalTime ?? stats.maxSurvivalTime),
    totalPlayTime: toSafeNumber(stats.totalPlayTime),
    maxSpeed: toSafeNumber(stats.maxSpeed),
    maxLength: toSafeNumber(stats.maxLength),
    moves: toSafeNumber(stats.moves),
    foodEaten: toSafeNumber(stats.foodEaten),
    fastEats: toSafeNumber(stats.fastEats),
    closeCalls: toSafeNumber(stats.closeCalls),
    wallHits: toSafeNumber(stats.wallHits),
    selfHits: toSafeNumber(stats.selfHits),
    quickDeaths: toSafeNumber(stats.quickDeaths),
    winStreak: toSafeNumber(stats.winStreak ?? Math.max(
      toSafeNumber(stats.currentWinStreak),
      toSafeNumber(stats.bestWinStreak)
    )),
    aiEasyWins,
    aiMediumWins,
    aiImpossibleWins,
    aiImpossibleStreak: toSafeNumber(stats.aiImpossibleStreak),
    aiWins: toSafeNumber(stats.aiWins ?? (aiEasyWins + aiMediumWins + aiImpossibleWins)),
    multiplayerGames: toSafeNumber(stats.multiplayerGames),
    multiplayerWins: toSafeNumber(stats.multiplayerWins),
    multiplayerGames4Player: toSafeNumber(stats.multiplayerGames4Player),
    multiplayerWins4Player: toSafeNumber(stats.multiplayerWins4Player),
    multiplayerWins4PlayerAllAbove50: toSafeNumber(stats.multiplayerWins4PlayerAllAbove50),
    transparentScore: toSafeNumber(stats.transparentScore),
    friendsCount: toSafeNumber(stats.friendsCount),
    level: toSafeNumber(stats.level),
    leaderboardTop100Finishes: toSafeNumber(stats.leaderboardTop100Finishes),
    leaderboardTop10Finishes: toSafeNumber(stats.leaderboardTop10Finishes),
    leaderboardTop3Finishes: toSafeNumber(stats.leaderboardTop3Finishes),
    leaderboardRank1Finishes: toSafeNumber(stats.leaderboardRank1Finishes),
    achievementLeaderboardTop10Finishes: toSafeNumber(stats.achievementLeaderboardTop10Finishes),
    overallLeaderboardTop10Finishes: toSafeNumber(stats.overallLeaderboardTop10Finishes),
    leaderboardTop3BestWeekStreak: toSafeNumber(stats.leaderboardTop3BestWeekStreak),
    weeklyLeaderboardTop100Finishes: toSafeNumber(stats.weeklyLeaderboardTop100Finishes),
    weeklyLeaderboardTop10Finishes: toSafeNumber(stats.weeklyLeaderboardTop10Finishes),
    weeklyLeaderboardTop3Finishes: toSafeNumber(stats.weeklyLeaderboardTop3Finishes),
    weeklyLeaderboardRank1Finishes: toSafeNumber(stats.weeklyLeaderboardRank1Finishes),
    weeklyOverallTop10Finishes: toSafeNumber(stats.weeklyOverallTop10Finishes),
    weeklyTop3BestWeekStreak: toSafeNumber(stats.weeklyTop3BestWeekStreak)
  };
};

const clampProgress = (value) => Math.max(0, Math.min(1, value));

export const getAchievementProgressSnapshot = (achievement, sourceStats = {}) => {
  if (!achievement?.requirements) {
    return { key: null, label: 'Progress', current: 0, target: 1, percentage: 0 };
  }
  const numericSnapshots = getAchievementRequirementDetails(achievement, sourceStats)
    .filter((detail) => detail.type === 'numeric');

  if (!numericSnapshots.length) {
    return { key: null, label: 'Progress', current: 0, target: 1, percentage: 0 };
  }

  // If multiple requirements exist, use the least-complete requirement as gating progress.
  numericSnapshots.sort((a, b) => a.percentage - b.percentage);
  return numericSnapshots[0];
};

export const getAchievementRequirementDetails = (achievement, sourceStats = {}) => {
  if (!achievement?.requirements) return [];

  const stats = normalizeStatsForAchievementProgress(sourceStats);

  return Object.entries(achievement.requirements).map(([key, value]) => {
    if (typeof value === 'number') {
      const snapshot = buildProgressSnapshot(
        key,
        getRequirementCurrentValue(achievement, key, stats),
        value
      );

      return {
        ...snapshot,
        type: 'numeric',
        actualCurrent: Math.max(0, toSafeNumber(getRequirementCurrentValue(achievement, key, stats)))
      };
    }

    return {
      key,
      label: getAchievementRequirementLabel(key),
      type: 'condition',
      value,
      displayValue: formatConditionValue(key, value)
    };
  });
};

export const calculateAchievementProgressValue = (achievement, sourceStats = {}) => {
  const snapshot = getAchievementProgressSnapshot(achievement, sourceStats);
  return snapshot.percentage;
};
