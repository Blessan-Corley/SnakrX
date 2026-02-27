import { getAchievementById } from '../../data/achievements.js';

export const normalizeAchievementRecords = (achievements = []) =>
  achievements
    .map((achievement) => {
      if (typeof achievement === 'string') {
        const catalog = getAchievementById(achievement);
        const now = Date.now();
        return {
          id: achievement,
          unlockedAt: now,
          timestamp: now,
          collected: false,
          points: catalog?.points || 0
        };
      }

      if (!achievement?.id) return null;

      const catalog = getAchievementById(achievement.id);
      return {
        ...achievement,
        collected: !!achievement.collected,
        points: achievement.points ?? catalog?.points ?? 0
      };
    })
    .filter(Boolean);

export const getCollectedAchievementPoints = (achievements = []) =>
  achievements.reduce((total, achievement) => {
    if (!achievement?.collected) return total;
    const catalog = getAchievementById(achievement.id);
    return total + (catalog?.points || achievement.points || 0);
  }, 0);

export const getAchievementsByCategoryFromCatalog = (achievements, category) =>
  achievements.filter((achievement) => achievement.category === category);

export const getAchievementsByTierFromCatalog = (achievements, tier) =>
  achievements.filter((achievement) => achievement.tier === tier);

export const getCompletionPercentageFromAchievements = (achievements, unlockedAchievements) => {
  const unlockedCount = unlockedAchievements?.length || 0;
  const total = achievements.length;
  return total > 0 ? Math.floor((unlockedCount / total) * 100) : 0;
};

export const getTotalPointsEarnedFromAchievements = (unlockedAchievements) => {
  if (!unlockedAchievements?.length) return 0;

  return unlockedAchievements.reduce((total, achievement) => {
    if (!achievement.collected) return total;
    const catalog = getAchievementById(achievement.id);
    return total + (catalog?.points || 0);
  }, 0);
};

export const getAchievementStatsSnapshot = ({
  achievementCategories,
  achievementTiers,
  achievements,
  unlockedAchievements
}) => {
  const unlockedCount = unlockedAchievements?.length || 0;
  const unlockedIds = unlockedAchievements?.map((achievement) => achievement.id) || [];
  const completionPercentage = getCompletionPercentageFromAchievements(achievements, unlockedAchievements);
  const totalPoints = getTotalPointsEarnedFromAchievements(unlockedAchievements);

  const stats = {
    total: achievements.length,
    unlocked: unlockedCount,
    locked: achievements.length - unlockedCount,
    completionPercentage,
    totalPoints,
    byTier: {},
    byCategory: {}
  };

  Object.keys(achievementTiers).forEach((tier) => {
    const tierAchievements = getAchievementsByTierFromCatalog(achievements, tier);
    const unlockedTier = tierAchievements.filter((achievement) => unlockedIds.includes(achievement.id));

    stats.byTier[tier] = {
      total: tierAchievements.length,
      unlocked: unlockedTier.length,
      percentage: tierAchievements.length > 0
        ? Math.floor((unlockedTier.length / tierAchievements.length) * 100)
        : 0
    };
  });

  Object.keys(achievementCategories).forEach((category) => {
    const categoryAchievements = getAchievementsByCategoryFromCatalog(achievements, category);
    const unlockedCategory = categoryAchievements.filter((achievement) => unlockedIds.includes(achievement.id));

    stats.byCategory[category] = {
      total: categoryAchievements.length,
      unlocked: unlockedCategory.length,
      percentage: categoryAchievements.length > 0
        ? Math.floor((unlockedCategory.length / categoryAchievements.length) * 100)
        : 0
    };
  });

  return stats;
};

export const getNextAchievementsFromCatalog = ({
  achievements,
  limit = 5,
  unlockedAchievements
}) => {
  const unlockedIds = unlockedAchievements?.map((achievement) => achievement.id) || [];
  const lockedAchievements = achievements.filter((achievement) => !unlockedIds.includes(achievement.id));

  return lockedAchievements
    .sort((a, b) => {
      const tierOrder = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5 };
      return (tierOrder[a.tier] || 0) - (tierOrder[b.tier] || 0);
    })
    .slice(0, limit);
};

export const isAchievementUnlockedInList = (achievementId, unlockedAchievements = []) =>
  unlockedAchievements.some((achievement) => achievement.id === achievementId);
