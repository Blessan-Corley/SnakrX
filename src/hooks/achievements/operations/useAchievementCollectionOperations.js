import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { getAchievementById } from '@/data/achievements.js';
import { auth } from '@/services/firebase/index.js';
import logger from '@/utils/logger.js';
import { syncCollectedAchievementsWithTransaction } from './syncCollectedAchievements.js';

export const useAchievementCollectionOperations = ({
  refreshProfile,
  setPendingCollectedIds,
  setRecentUnlocks,
  setUncollectedAchievements,
  setUnlockedAchievements,
  unlockedAchievements,
  uncollectedAchievements
}) => {
  const applyAchievementState = useCallback((nextUnlockedAchievements) => {
    setUnlockedAchievements(nextUnlockedAchievements);
    setUncollectedAchievements(nextUnlockedAchievements.filter((achievement) => !achievement.collected));
  }, [setUncollectedAchievements, setUnlockedAchievements]);

  const syncCollectedAchievements = useCallback(
    (transformAchievements) => syncCollectedAchievementsWithTransaction({
      achievements: unlockedAchievements,
      transformAchievements
    }),
    [unlockedAchievements]
  );

  const refreshProfileInBackground = useCallback(() => {
    if (!refreshProfile) return;

    void Promise.resolve(refreshProfile()).catch((error) => {
      logger.warn('Profile refresh after achievement collection failed:', error);
    });
  }, [refreshProfile]);

  const queuePendingCollectedIds = useCallback((achievementIds = []) => {
    if (!achievementIds.length) return;

    setPendingCollectedIds((previous) => [...new Set([...(previous || []), ...achievementIds])]);
  }, [setPendingCollectedIds]);

  const clearPendingCollectedIds = useCallback((achievementIds = []) => {
    if (!achievementIds.length) return;

    const achievementIdSet = new Set(achievementIds);
    setPendingCollectedIds((previous) => previous.filter((achievementId) => !achievementIdSet.has(achievementId)));
  }, [setPendingCollectedIds]);

  const collectAchievement = useCallback(async (achievementId) => {
    if (!auth.currentUser) return false;

    try {
      const catalog = getAchievementById(achievementId);
      const previousUnlockedAchievements = unlockedAchievements;
      const optimisticUnlockedAchievements = unlockedAchievements.map((achievement) => (
        achievement.id === achievementId ? { ...achievement, collected: true } : achievement
      ));

      applyAchievementState(optimisticUnlockedAchievements);
      queuePendingCollectedIds([achievementId]);
      setRecentUnlocks((previous) => previous.filter((achievement) => achievement.id !== achievementId));

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
        if ((result.attemptedIds?.length || 0) > 0) {
          refreshProfileInBackground();
          logger.warn(`Achievement collection is waiting for backend confirmation: ${achievementId}`);
          return true;
        }

        clearPendingCollectedIds([achievementId]);
        applyAchievementState(previousUnlockedAchievements);
        toast.error('Could not collect this achievement right now.');
        return false;
      }

      const collectedIds = new Set(result.collectedIds || []);
      applyAchievementState(result.updated || optimisticUnlockedAchievements);
      clearPendingCollectedIds([...collectedIds]);
      setRecentUnlocks((previous) => previous.filter((achievement) => !collectedIds.has(achievement.id)));
      refreshProfileInBackground();

      toast.success(`Collected: ${catalog?.title || 'Achievement'}`);
      logger.log(`Achievement collected: ${achievementId}`);
      return true;
    } catch (error) {
      logger.error('Error collecting achievement:', error);
      return false;
    }
  }, [
    setRecentUnlocks,
    applyAchievementState,
    syncCollectedAchievements,
    queuePendingCollectedIds,
    clearPendingCollectedIds,
    refreshProfileInBackground,
    unlockedAchievements
  ]);

  const collectAllAchievements = useCallback(async () => {
    if (!auth.currentUser) return false;
    if (!uncollectedAchievements?.length) return false;

    try {
      const previousUnlockedAchievements = unlockedAchievements;
      const optimisticUnlockedAchievements = unlockedAchievements.map((achievement) => (
        achievement.collected ? achievement : { ...achievement, collected: true }
      ));

      applyAchievementState(optimisticUnlockedAchievements);
      const optimisticallyCollectedIds = uncollectedAchievements.map((achievement) => achievement.id);
      queuePendingCollectedIds(optimisticallyCollectedIds);
      setRecentUnlocks((previous) => previous.filter((achievement) => !optimisticallyCollectedIds.includes(achievement.id)));

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
        if ((result.attemptedIds?.length || 0) > 0) {
          refreshProfileInBackground();
          logger.warn('Achievement collection is waiting for backend confirmation for one or more rewards.');
          return true;
        }

        clearPendingCollectedIds(optimisticallyCollectedIds);
        applyAchievementState(previousUnlockedAchievements);
        toast.error('Could not collect achievements right now.');
        return false;
      }

      const collectedIds = new Set(result.collectedIds || []);
      const nextUnlockedAchievements = result.updated || optimisticUnlockedAchievements;

      if (!collectedIds.size) {
        clearPendingCollectedIds(optimisticallyCollectedIds);
        applyAchievementState(previousUnlockedAchievements);
        return true;
      }

      applyAchievementState(nextUnlockedAchievements);
      clearPendingCollectedIds([...collectedIds]);
      setRecentUnlocks((previous) => previous.filter((achievement) => !collectedIds.has(achievement.id)));

      toast.success(`Collected ${collectedIds.size} achievement${collectedIds.size > 1 ? 's' : ''}`);
      refreshProfileInBackground();
      return true;
    } catch (error) {
      logger.error('Error collecting all achievements:', error);
      return false;
    }
  }, [
    setRecentUnlocks,
    applyAchievementState,
    syncCollectedAchievements,
    queuePendingCollectedIds,
    clearPendingCollectedIds,
    refreshProfileInBackground,
    unlockedAchievements,
    uncollectedAchievements
  ]);

  return {
    collectAchievement,
    collectAllAchievements
  };
};
