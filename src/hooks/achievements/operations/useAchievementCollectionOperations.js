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
          return { success: false, updated: normalizedAchievements, attemptedIds: [] };
        }

        if (achievementRecord.collected) {
          return { success: true, updated: normalizedAchievements, attemptedIds: [] };
        }

        return {
          success: true,
          updated: normalizedAchievements.map((achievement) => (
            achievement.id === achievementId ? { ...achievement, collected: true } : achievement
          )),
          attemptedIds: [achievementId]
        };
      });

      if (!result.success) {
        toast.error('Could not collect this achievement right now.');
        return false;
      }

      const collectedIds = new Set(result.collectedIds || []);
      setUnlockedAchievements(result.updated || unlockedAchievements);
      setUncollectedAchievements((result.updated || unlockedAchievements).filter((achievement) => !achievement.collected));
      setRecentUnlocks((previous) => previous.filter((achievement) => !collectedIds.has(achievement.id)));

      if (refreshProfile) {
        await refreshProfile();
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
    syncCollectedAchievements,
    unlockedAchievements
  ]);

  const collectAllAchievements = useCallback(async () => {
    if (!auth.currentUser) return false;
    if (!uncollectedAchievements?.length) return false;

    try {
      const result = await syncCollectedAchievements((normalizedAchievements) => {
        const attemptedIds = normalizedAchievements
          .filter((achievement) => !achievement.collected)
          .map((achievement) => achievement.id);

        if (!attemptedIds.length) {
          return { success: true, updated: normalizedAchievements, attemptedIds: [] };
        }

        return {
          success: true,
          updated: normalizedAchievements.map((achievement) => (
            attemptedIds.includes(achievement.id)
              ? { ...achievement, collected: true }
              : achievement
          )),
          attemptedIds
        };
      });

      if (!result.success) {
        toast.error('Could not collect achievements right now.');
        return false;
      }

      const collectedIds = new Set(result.collectedIds || []);
      const nextUnlockedAchievements = result.updated || unlockedAchievements;

      if (!collectedIds.size) {
        return true;
      }

      setUnlockedAchievements(nextUnlockedAchievements);
      setUncollectedAchievements(nextUnlockedAchievements.filter((achievement) => !achievement.collected));
      setRecentUnlocks((previous) => previous.filter((achievement) => !collectedIds.has(achievement.id)));

      toast.success(`Collected ${collectedIds.size} achievement${collectedIds.size > 1 ? 's' : ''}`);
      if (refreshProfile) {
        await refreshProfile();
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
    unlockedAchievements,
    uncollectedAchievements
  ]);

  return {
    collectAchievement,
    collectAllAchievements
  };
};
