import { useCallback } from 'react';
import { auth } from '../../services/firebase/index.js';
import { achievementOperations } from '../../services/firebase/achievements.js';
import logger from '../../utils/logger.js';

/**
 * Hook for user stats operations
 */
export const useUserStats = () => {
  /**
   * Trusted stats now belong to backend-owned flows only.
   */
  const updateUserStats = useCallback(async (statUpdates) => {
    logger.warn('updateUserStats is deprecated. Trusted stats must be mutated by backend-owned flows.', statUpdates);
    return false;
  }, []);

  /**
   * Unlock achievement
   */
  const unlockAchievement = useCallback(async (achievementId) => {
    if (!auth.currentUser) return false;

    try {
      const result = await achievementOperations.unlockAchievement(achievementId);
      return result?.unlocked === true;
    } catch (err) {
      logger.error('Achievement unlock error:', err);
      return false;
    }
  }, []);

  return {
    updateUserStats,
    unlockAchievement
  };
};
