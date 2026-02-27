import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { getAchievementById } from '@/data/achievements.js';
import { auth } from '@/services/firebase/index.js';
import logger from '@/utils/logger.js';
import { syncCollectedAchievementsWithTransaction } from './syncCollectedAchievements.js';

export const useAchievementCollectionOperations = ({
  refreshProfile,
  setRecentUnlocks,
  setUncollectedAchievements,
  setUnlockedAchievements,
  unlockedAchievements,
  uncollectedAchievements
}) => {
  const syncCollectedAchievements = useCallback(
    (transformAchievements) => syncCollectedAchievementsWithTransaction({
      achievements: unlockedAchievements,
      transformAchievements
    }),
    [unlockedAchievements]
  );

  const collectAchievement = useCallback(async (achievementId) => {
    if (!auth.currentUser) return false;

    try {
      const catalog = getAchievementById(achievementId);
      const result = await syncCollectedAchievements((normalizedAchievements) => {
        const achievementRecord = normalizedAchievements.find((achievement) => achievement.id === achievementId);
        if (!achievementRecord) {
          return { success: false, updated: normalizedAchievements, pendingIds: [] };
        }

        if (achievementRecord.collected) {
          return { success: true, updated: normalizedAchievements, pendingIds: [] };
        }

        return {
          success: true,
          updated: normalizedAchievements.map((achievement) => (
            achievement.id === achievementId ? { ...achievement, collected: true } : achievement
          )),
          pendingIds: [achievementId]
        };
      });

      if (!result.success) return false;

      setUnlockedAchievements((previous) =>
        previous.map((achievement) => (
          achievement.id === achievementId ? { ...achievement, collected: true } : achievement
        ))
      );
      setUncollectedAchievements((previous) => previous.filter((achievement) => achievement.id !== achievementId));
      setRecentUnlocks((previous) => previous.filter((achievement) => achievement.id !== achievementId));

      if (refreshProfile) {
        refreshProfile();
      }

      toast.success(`Collected: ${catalog?.title || 'Achievement'}`);
      logger.log(`Achievement collected: ${achievementId}`);
      return true;
    } catch (error) {
      logger.error('Error collecting achievement:', error);
      return false;
    }
  }, [
    refreshProfile,
    setRecentUnlocks,
    setUncollectedAchievements,
    setUnlockedAchievements,
    syncCollectedAchievements
  ]);

  const collectAllAchievements = useCallback(async () => {
    if (!auth.currentUser) return false;
    if (!uncollectedAchievements?.length) return false;

    try {
      const result = await syncCollectedAchievements((normalizedAchievements) => {
        const pendingIds = normalizedAchievements
          .filter((achievement) => !achievement.collected)
          .map((achievement) => achievement.id);

        if (!pendingIds.length) {
          return { success: true, updated: normalizedAchievements, pendingIds: [] };
        }

        return {
          success: true,
          updated: normalizedAchievements.map((achievement) => (
            pendingIds.includes(achievement.id)
              ? { ...achievement, collected: true }
              : achievement
          )),
          pendingIds
        };
      });

      if (!result.success) {
        return false;
      }

      const pendingIds = new Set(result.pendingIds || []);
      if (!pendingIds.size) {
        setUncollectedAchievements([]);
        return true;
      }

      setUnlockedAchievements((previous) => previous.map((achievement) => (
        pendingIds.has(achievement.id)
          ? { ...achievement, collected: true }
          : achievement
      )));
      setUncollectedAchievements([]);
      setRecentUnlocks((previous) => previous.filter((achievement) => !pendingIds.has(achievement.id)));

      toast.success(`Collected ${pendingIds.size} achievement${pendingIds.size > 1 ? 's' : ''}`);
      if (refreshProfile) {
        refreshProfile();
      }
      return true;
    } catch (error) {
      logger.error('Error collecting all achievements:', error);
      return false;
    }
  }, [
    refreshProfile,
    setRecentUnlocks,
    setUncollectedAchievements,
    setUnlockedAchievements,
    syncCollectedAchievements,
    uncollectedAchievements
  ]);

  return {
    collectAchievement,
    collectAllAchievements
  };
};
