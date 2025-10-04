/**
 * Achievement Operations
 * Handle achievement checking and unlocking
 */

import { useState, useCallback } from 'react';
import {
  ACHIEVEMENTS,
  ACHIEVEMENT_TIERS,
  ACHIEVEMENT_CATEGORIES,
  checkAchievementRequirements,
  getAchievementById
} from '../../data/achievements.js';
import { useAuth } from '../auth/context.js';
import { useUserStats } from '../auth/userStats.js';
import { playAchievement } from '../../utils/sound.js';
import toast from 'react-hot-toast';
import logger from '../../utils/logger.js';

/**
 * Custom hook for achievement operations
 */
export const useAchievementOperations = () => {
  const [loading, setLoading] = useState(false);
  const { userProfile } = useAuth();
  const { unlockAchievement } = useUserStats();

  /**
   * Check and unlock achievements based on game stats
   */
  const checkAndUnlockAchievements = useCallback(async (gameStats) => {
    if (!userProfile) {
      logger.warn('No user profile - cannot check achievements');
      return [];
    }

    setLoading(true);
    const newlyUnlocked = [];

    try {
      const unlockedIds = (userProfile.stats?.achievements || []).map(a => a.id);

      for (const achievement of ACHIEVEMENTS) {
        // Skip if already unlocked
        if (unlockedIds.includes(achievement.id)) {
          continue;
        }

        // Check requirements
        const meetsRequirements = checkAchievementRequirements(achievement, gameStats);

        if (meetsRequirements) {
          logger.log(`Achievement unlocked: ${achievement.id}`);

          // Unlock achievement
          const success = await unlockAchievement(achievement.id);

          if (success) {
            newlyUnlocked.push(achievement);
            playAchievement();
            toast.success(`Achievement Unlocked: ${achievement.title}!`, {
              icon: achievement.icon,
              duration: 4000
            });
          }
        }
      }

      return newlyUnlocked;
    } catch (error) {
      logger.error('Error checking achievements:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [userProfile, unlockAchievement]);

  /**
   * Collect (acknowledge) an achievement
   */
  const collectAchievement = useCallback(async (achievementId) => {
    // Implementation for marking achievement as collected
    logger.log(`Achievement collected: ${achievementId}`);
    return true;
  }, []);

  /**
   * Get achievements by category
   */
  const getAchievementsByCategory = useCallback((category) => {
    return ACHIEVEMENTS.filter(ach => ach.category === category);
  }, []);

  /**
   * Get achievements by tier
   */
  const getAchievementsByTier = useCallback((tier) => {
    return ACHIEVEMENTS.filter(ach => ach.tier === tier);
  }, []);

  /**
   * Get completion percentage
   */
  const getCompletionPercentage = useCallback(() => {
    const unlockedCount = userProfile?.stats?.achievements?.length || 0;
    const total = ACHIEVEMENTS.length;
    return total > 0 ? Math.floor((unlockedCount / total) * 100) : 0;
  }, [userProfile]);

  /**
   * Get total points earned
   */
  const getTotalPointsEarned = useCallback(() => {
    if (!userProfile?.stats?.achievements) return 0;

    return userProfile.stats.achievements.reduce((total, ach) => {
      const achievement = getAchievementById(ach.id);
      return total + (achievement?.points || 0);
    }, 0);
  }, [userProfile]);

  /**
   * Get achievement statistics
   */
  const getAchievementStats = useCallback(() => {
    const unlockedCount = userProfile?.stats?.achievements?.length || 0;
    const unlockedIds = userProfile?.stats?.achievements?.map(ach => ach.id) || [];

    const stats = {
      total: ACHIEVEMENTS.length,
      unlocked: unlockedCount,
      locked: ACHIEVEMENTS.length - unlockedCount,
      completionPercentage: getCompletionPercentage(),
      totalPoints: getTotalPointsEarned(),
      byTier: {},
      byCategory: {}
    };

    // Count by tier
    Object.keys(ACHIEVEMENT_TIERS).forEach(tier => {
      const tierAchievements = getAchievementsByTier(tier);
      const unlockedTier = tierAchievements.filter(ach =>
        unlockedIds.includes(ach.id)
      );

      stats.byTier[tier] = {
        total: tierAchievements.length,
        unlocked: unlockedTier.length,
        percentage: tierAchievements.length > 0
          ? Math.floor((unlockedTier.length / tierAchievements.length) * 100)
          : 0
      };
    });

    // Count by category
    Object.keys(ACHIEVEMENT_CATEGORIES).forEach(category => {
      const categoryAchievements = getAchievementsByCategory(category);
      const unlockedCategory = categoryAchievements.filter(ach =>
        unlockedIds.includes(ach.id)
      );

      stats.byCategory[category] = {
        total: categoryAchievements.length,
        unlocked: unlockedCategory.length,
        percentage: categoryAchievements.length > 0
          ? Math.floor((unlockedCategory.length / categoryAchievements.length) * 100)
          : 0
      };
    });

    return stats;
  }, [userProfile, getCompletionPercentage, getTotalPointsEarned, getAchievementsByTier, getAchievementsByCategory]);

  /**
   * Get next achievements to unlock (closest to completion)
   */
  const getNextAchievements = useCallback((limit = 5) => {
    if (!userProfile?.stats) return [];

    const unlockedIds = userProfile.stats.achievements?.map(ach => ach.id) || [];
    const lockedAchievements = ACHIEVEMENTS.filter(ach =>
      !unlockedIds.includes(ach.id)
    );

    // Sort by tier (common first) and return limited results
    return lockedAchievements
      .sort((a, b) => {
        const tierOrder = { common: 1, rare: 2, epic: 3, legendary: 4 };
        return (tierOrder[a.tier] || 0) - (tierOrder[b.tier] || 0);
      })
      .slice(0, limit);
  }, [userProfile]);

  /**
   * Get achievement progress
   */
  const getAchievementProgress = useCallback((achievementId) => {
    if (!userProfile?.stats) return 0;

    const achievement = getAchievementById(achievementId);
    if (!achievement) return 0;

    // Check if already unlocked
    const unlockedIds = userProfile.stats.achievements?.map(ach => ach.id) || [];
    if (unlockedIds.includes(achievementId)) return 100;

    // Calculate progress percentage
    // This would need to be implemented based on achievement requirements
    return 0;
  }, [userProfile]);

  return {
    checkAndUnlockAchievements,
    collectAchievement,
    getAchievementProgress,
    getAchievementStats,
    getNextAchievements,
    getTotalPointsEarned,
    getCompletionPercentage,
    getAchievementsByCategory,
    getAchievementsByTier,
    loading,
    achievements: ACHIEVEMENTS
  };
};
