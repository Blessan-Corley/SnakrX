const ACHIEVEMENT_CATALOG = {
  first_game: { points: 5, requirements: { games: 1 } },
  first_win: { points: 10, requirements: { wins: 1 } },
  dedication: { points: 20, requirements: { games: 50 } },
  centurion: { points: 35, requirements: { games: 100 } },
  games_10: { points: 10, requirements: { games: 10 } },
  games_250: { points: 55, requirements: { games: 250 } },
  games_500: { points: 75, requirements: { games: 500 } },
  legendary_player: { points: 100, requirements: { games: 1000 } },
  level_5: { points: 15, requirements: { level: 5 } },
  level_10: { points: 25, requirements: { level: 10 } },
  level_15: { points: 35, requirements: { level: 15 } },
  level_20: { points: 55, requirements: { level: 20 } },
  level_25: { points: 70, requirements: { level: 25 } },
  level_30: { points: 90, requirements: { level: 30 } },
  level_35: { points: 150, requirements: { level: 35 } },
  first_hundred: { points: 10, requirements: { singleScore: 100 } },
  high_roller: { points: 25, requirements: { singleScore: 500 } },
  thousand_points: { points: 50, requirements: { singleScore: 1000 } },
  single_score_1500: { points: 90, requirements: { singleScore: 1500 } },
  score_master: { points: 75, requirements: { totalScore: 2000 } },
  point_millionaire: { points: 150, requirements: { totalScore: 10000 } },
  survivor: { points: 20, requirements: { survivalTime: 300 } },
  endurance: { points: 40, requirements: { survivalTime: 420 } },
  immortal: { points: 100, requirements: { survivalTime: 900 } },
  speed_demon: { points: 15, requirements: { maxSpeed: 2 } },
  lightning_fast: { points: 35, requirements: { maxSpeed: 3 } },
  sonic: { points: 75, requirements: { maxSpeed: 4 } },
  hyperspeed: { points: 150, requirements: { maxSpeed: 5 } },
  wall_breaker_bronze: { points: 10, requirements: { wallHits: 10 } },
  wall_breaker_silver: { points: 25, requirements: { wallHits: 50 } },
  wall_breaker_gold: { points: 50, requirements: { wallHits: 100 } },
  self_destruct: { points: 20, requirements: { selfHits: 50 } },
  oops_master: { points: 30, requirements: { quickDeaths: 20 } },
  ai_slayer: { points: 15, requirements: { aiWins: 1, difficulty: 'easy' } },
  ai_hunter: { points: 30, requirements: { aiWins: 1, difficulty: 'medium' } },
  terminator: { points: 75, requirements: { aiWins: 1, difficulty: 'impossible' } },
  am_i_god: { points: 100, requirements: { aiStreak: 3, difficulty: 'impossible' } },
  social_player: { points: 10, requirements: { multiplayerGames: 1 } },
  last_snake_standing: { points: 50, requirements: { multiplayerWins4Player: 1 } },
  four_player_clean_sweep: { points: 90, requirements: { multiplayerWins4PlayerAllAbove50: 1 } },
  multiplayer_dominator: { points: 75, requirements: { multiplayerWins: 10 } },
  ghost_master: { points: 30, requirements: { transparentScore: 200 } },
  perfectionist: { points: 40, requirements: { perfectGame: true } },
  early_bird: { points: 100, requirements: { earlyUser: true } },
  win_streak_3: { points: 25, requirements: { winStreak: 3 } },
  win_streak_5: { points: 50, requirements: { winStreak: 5 } },
  win_streak_7: { points: 75, requirements: { winStreak: 7 } },
  win_streak_11: { points: 120, requirements: { winStreak: 11 } },
  leaderboard_top_100: { points: 15, requirements: { leaderboardTop100Finishes: 1 } },
  leaderboard_top_10: { points: 35, requirements: { leaderboardTop10Finishes: 1 } },
  leaderboard_top_3: { points: 70, requirements: { leaderboardTop3Finishes: 1 } },
  leaderboard_rank_1: { points: 110, requirements: { leaderboardRank1Finishes: 1 } },
  achievement_board_top10: { points: 80, requirements: { achievementLeaderboardTop10Finishes: 1 } },
  overall_board_top10: { points: 100, requirements: { overallLeaderboardTop10Finishes: 1 } },
  weekly_podium_streak: { points: 140, requirements: { weeklyTop3BestWeekStreak: 3 } },
  weekly_top_100: { points: 20, requirements: { weeklyLeaderboardTop100Finishes: 1 } },
  weekly_top_10: { points: 40, requirements: { weeklyLeaderboardTop10Finishes: 1 } },
  weekly_top_3: { points: 75, requirements: { weeklyLeaderboardTop3Finishes: 1 } },
  weekly_rank_1: { points: 120, requirements: { weeklyLeaderboardRank1Finishes: 1 } },
  weekly_overall_top_10: { points: 90, requirements: { weeklyOverallTop10Finishes: 1 } },
  social_butterfly: { points: 15, requirements: { friendsCount: 5 } },
  squad_goals: { points: 40, requirements: { multiplayerGames4Player: 1 } },
  sniper: { points: 35, requirements: { fastEats: 1 } },
  close_call: { points: 60, requirements: { closeCalls: 15 } },
  danger_dancer: { points: 90, requirements: { closeCalls: 40 } },
  quick_hands: { points: 45, requirements: { fastEats: 10 } },
  trailblazer: { points: 50, requirements: { maxLength: 40 } },
  marathon_player: { points: 80, requirements: { totalPlayTime: 3600 } },
  move_master: { points: 70, requirements: { moves: 10000 } },
  community_builder: { points: 30, requirements: { friendsCount: 10 } },
  food_hunter_bronze: { points: 10, requirements: { foodEaten: 50 } },
  food_hunter_silver: { points: 25, requirements: { foodEaten: 250 } },
  food_hunter_gold: { points: 50, requirements: { foodEaten: 1000 } },
  food_hunter_platinum: { points: 150, requirements: { foodEaten: 5000 } }
};

const toSafeNumber = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

const normalizeStatsForAchievementChecks = (stats = {}) => {
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
    weeklyTop3BestWeekStreak: toSafeNumber(stats.weeklyTop3BestWeekStreak),
    perfectGame: stats.perfectGame === true,
    earlyUser: stats.earlyUser === true,
    difficulty: typeof stats.difficulty === 'string' ? stats.difficulty : null
  };
};

const getAchievementMeta = (achievementId) => ACHIEVEMENT_CATALOG[achievementId] || null;

const normalizeAchievementRecord = (achievement, now = Date.now()) => {
  if (typeof achievement === 'string') {
    const meta = getAchievementMeta(achievement);
    if (!meta) return null;

    return {
      id: achievement,
      unlockedAt: now,
      timestamp: now,
      collected: false,
      points: meta.points
    };
  }

  if (!achievement?.id) return null;

  const meta = getAchievementMeta(achievement.id);
  if (!meta) return null;

  const unlockedAt = typeof achievement.unlockedAt === 'number'
    ? achievement.unlockedAt
    : now;
  const timestamp = typeof achievement.timestamp === 'number'
    ? achievement.timestamp
    : unlockedAt;

  return {
    ...achievement,
    unlockedAt,
    timestamp,
    collected: achievement.collected === true,
    points: typeof achievement.points === 'number' ? achievement.points : meta.points
  };
};

const normalizeAchievementRecords = (achievements = [], now = Date.now()) => (
  Array.isArray(achievements)
    ? achievements.map((achievement) => normalizeAchievementRecord(achievement, now)).filter(Boolean)
    : []
);

const calculateCollectedAchievementPoints = (achievements = []) => achievements.reduce((total, achievement) => {
  if (!achievement?.collected) return total;
  const meta = getAchievementMeta(achievement.id);
  return total + (meta?.points || achievement.points || 0);
}, 0);

const checkAchievementRequirements = (achievementId, sourceStats = {}) => {
  const achievement = getAchievementMeta(achievementId);
  if (!achievement?.requirements) {
    return false;
  }

  const userStats = normalizeStatsForAchievementChecks(sourceStats);
  const { requirements } = achievement;

  if (achievementId === 'ai_slayer') {
    return userStats.aiEasyWins >= (requirements.aiWins || 1);
  }

  if (achievementId === 'ai_hunter') {
    return userStats.aiMediumWins >= (requirements.aiWins || 1);
  }

  if (achievementId === 'terminator') {
    return userStats.aiImpossibleWins >= (requirements.aiWins || 1);
  }

  if (achievementId === 'am_i_god') {
    return userStats.aiImpossibleStreak >= (requirements.aiStreak || 3);
  }

  for (const [key, value] of Object.entries(requirements)) {
    let userValue = userStats[key];

    if (key === 'earlyUser') {
      userValue = userStats.earlyUser;
    } else if (key === 'perfectGame') {
      userValue = userStats.perfectGame;
    } else if (typeof userValue === 'undefined') {
      userValue = 0;
    }

    if (typeof value === 'boolean') {
      if (userValue !== value) {
        return false;
      }
      continue;
    }

    if (typeof value === 'number') {
      if (Number(userValue) < value) {
        return false;
      }
      continue;
    }

    if (userValue !== value) {
      return false;
    }
  }

  return true;
};

const unlockEligibleAchievements = ({
  achievements = [],
  sourceStats = {},
  now = Date.now()
}) => {
  const normalizedAchievements = normalizeAchievementRecords(achievements, now);
  const unlockedIds = new Set(normalizedAchievements.map((achievement) => achievement.id));
  const nextAchievements = [...normalizedAchievements];
  const newlyUnlockedIds = [];

  Object.keys(ACHIEVEMENT_CATALOG).forEach((achievementId) => {
    if (unlockedIds.has(achievementId)) {
      return;
    }

    if (!checkAchievementRequirements(achievementId, sourceStats)) {
      return;
    }

    const meta = getAchievementMeta(achievementId);
    nextAchievements.push({
      id: achievementId,
      unlockedAt: now,
      timestamp: now,
      collected: false,
      points: meta.points
    });
    unlockedIds.add(achievementId);
    newlyUnlockedIds.push(achievementId);
  });

  return {
    achievements: nextAchievements,
    newlyUnlockedIds
  };
};

module.exports = {
  ACHIEVEMENT_CATALOG,
  getAchievementMeta,
  normalizeAchievementRecord,
  normalizeAchievementRecords,
  calculateCollectedAchievementPoints,
  checkAchievementRequirements,
  unlockEligibleAchievements
};
