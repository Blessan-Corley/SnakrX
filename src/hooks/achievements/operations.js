/**
 * Achievement Operations
 * Handle achievement checking and unlocking
 */

import { useState } from 'react';
import {
  ACHIEVEMENTS,
  ACHIEVEMENT_TIERS
} from '@/data/achievements.js';
import { useAuth } from '@/hooks/auth/context.js';
import { useAchievements } from '@/hooks/achievements/context.js';
import { useUserStats } from '@/hooks/auth/userStats.js';
import { useAchievementCollectionOperations } from '@/hooks/achievements/operations/useAchievementCollectionOperations.js';
import { useAchievementMetricsOperations } from '@/hooks/achievements/operations/useAchievementMetricsOperations.js';
import { useAchievementUnlockOperations } from '@/hooks/achievements/operations/useAchievementUnlockOperations.js';

/**
 * Custom hook for achievement operations
 */
export const useAchievementOperations = () => {
  const [loading, setLoading] = useState(false);
  const { userProfile, refreshProfile } = useAuth();
  const { unlockAchievement } = useUserStats();
  const {
    unlockedAchievements,
    recentUnlocks,
    uncollectedAchievements,
    setUnlockedAchievements,
    setUncollectedAchievements,
    setRecentUnlocks,
    setPendingCollectedIds
  } = useAchievements();

  const { checkAndUnlockAchievements } = useAchievementUnlockOperations({
    setLoading,
    unlockAchievement,
    unlockedAchievements,
    userProfile
  });

  const { collectAchievement, collectAllAchievements } = useAchievementCollectionOperations({
    refreshProfile,
    setRecentUnlocks,
    setPendingCollectedIds,
    setUncollectedAchievements,
    setUnlockedAchievements,
    unlockedAchievements,
    uncollectedAchievements
  });

  const {
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
  } = useAchievementMetricsOperations({
    unlockedAchievements,
    userProfile
  });

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
    unlockedAchievements,
    achievements: ACHIEVEMENTS,
    achievementTiers: ACHIEVEMENT_TIERS,
    recentUnlocks,
    uncollectedAchievements,
    isAchievementUnlocked,
    calculateAchievementProgress,
    shareAchievement,
    collectAllAchievements
  };
};
