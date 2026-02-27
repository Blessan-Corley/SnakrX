import { useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  ACHIEVEMENTS,
  ACHIEVEMENT_CATEGORIES,
  ACHIEVEMENT_TIERS,
  getAchievementById
} from '@/data/achievements.js';
import logger from '@/utils/logger.js';
import { calculateAchievementProgressValue } from '@/hooks/achievements/progress.js';
import {
  getAchievementStatsSnapshot,
  getAchievementsByCategoryFromCatalog,
  getAchievementsByTierFromCatalog,
  getCompletionPercentageFromAchievements,
  getNextAchievementsFromCatalog,
  getTotalPointsEarnedFromAchievements,
  isAchievementUnlockedInList
} from '@/hooks/achievements/operationUtils.js';

export const useAchievementMetricsOperations = ({
  unlockedAchievements,
  userProfile
}) => {
  const getAchievementsByCategory = useCallback((category) => {
    return getAchievementsByCategoryFromCatalog(ACHIEVEMENTS, category);
  }, []);

  const getAchievementsByTier = useCallback((tier) => {
    return getAchievementsByTierFromCatalog(ACHIEVEMENTS, tier);
  }, []);

  const getCompletionPercentage = useCallback(() => {
    return getCompletionPercentageFromAchievements(ACHIEVEMENTS, unlockedAchievements);
  }, [unlockedAchievements]);

  const getTotalPointsEarned = useCallback(() => {
    return getTotalPointsEarnedFromAchievements(unlockedAchievements);
  }, [unlockedAchievements]);

  const getAchievementStats = useCallback(() => {
    return getAchievementStatsSnapshot({
      achievementCategories: ACHIEVEMENT_CATEGORIES,
      achievementTiers: ACHIEVEMENT_TIERS,
      achievements: ACHIEVEMENTS,
      unlockedAchievements
    });
  }, [unlockedAchievements]);

  const getNextAchievements = useCallback((limit = 5) => {
    if (!userProfile?.stats) return [];

    return getNextAchievementsFromCatalog({
      achievements: ACHIEVEMENTS,
      limit,
      unlockedAchievements
    });
  }, [unlockedAchievements, userProfile]);

  const getAchievementProgress = useCallback((achievementId) => {
    if (!userProfile?.stats) return 0;

    const achievement = getAchievementById(achievementId);
    if (!achievement) return 0;

    const unlockedIds = userProfile.stats.achievements?.map((achievementEntry) =>
      typeof achievementEntry === 'string' ? achievementEntry : achievementEntry.id
    ) || [];
    if (unlockedIds.includes(achievementId)) return 100;

    return calculateAchievementProgressValue(achievement, userProfile.stats);
  }, [userProfile]);

  const isAchievementUnlocked = useCallback((achievementId) => {
    return isAchievementUnlockedInList(achievementId, unlockedAchievements);
  }, [unlockedAchievements]);

  const calculateAchievementProgress = useCallback((achievement, stats) => {
    if (!achievement || !stats) return 0;
    return calculateAchievementProgressValue(achievement, stats);
  }, []);

  const shareAchievement = useCallback(async (achievementId) => {
    const achievement = getAchievementById(achievementId);
    if (!achievement) return false;

    const text = `I unlocked "${achievement.title}" in SnakrX!`;
    try {
      if (navigator.share) {
        await navigator.share({ text });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        toast.success('Achievement copied to clipboard!');
      }
      return true;
    } catch (error) {
      logger.warn('Share failed:', error);
      return false;
    }
  }, []);

  return {
    calculateAchievementProgress,
    getAchievementProgress,
    getAchievementStats,
    getAchievementsByCategory,
    getAchievementsByTier,
    getCompletionPercentage,
    getNextAchievements,
    getTotalPointsEarned,
    isAchievementUnlocked,
    shareAchievement
  };
};
