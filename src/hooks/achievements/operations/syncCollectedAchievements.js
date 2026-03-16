import logger from '@/utils/logger.js';
import { auth } from '@/services/firebase/index.js';
import { achievementOperations } from '@/services/firebase/achievements.js';
import { getCollectedAchievementPoints, normalizeAchievementRecords } from '@/hooks/achievements/operationUtils.js';

export const syncCollectedAchievementsWithTransaction = async ({
  achievements,
  transformAchievements
}) => {
  if (!auth.currentUser) {
    return { success: false, updated: null, collectedIds: [], attemptedIds: [] };
  }

  try {
    const currentAchievements = normalizeAchievementRecords(achievements || []);
    const result = transformAchievements(currentAchievements);
    if (!result?.success || !Array.isArray(result.updated)) {
      return { success: false, updated: currentAchievements, collectedIds: [], attemptedIds: [] };
    }

    const previousCollectedIds = new Set(
      currentAchievements
        .filter((achievement) => achievement?.id && achievement.collected)
        .map((achievement) => achievement.id)
    );
    const attemptedAchievements = result.updated
      .filter((achievement) => achievement?.id && achievement.collected && !previousCollectedIds.has(achievement.id))
    const attemptedIds = attemptedAchievements.map((achievement) => achievement.id);

    if (!attemptedIds.length) {
      return {
        success: true,
        updated: currentAchievements,
        collectedIds: [],
        attemptedIds: [],
        achievementPoints: getCollectedAchievementPoints(currentAchievements)
      };
    }

    const response = await achievementOperations.collectAchievements(attemptedIds);
    const collectedIds = Array.isArray(response?.collectedIds)
      ? response.collectedIds.filter((achievementId) => attemptedIds.includes(achievementId))
      : [];
    const collectedIdSet = new Set([...previousCollectedIds, ...collectedIds]);
    const confirmedUpdated = currentAchievements.map((achievement) => ({
      ...achievement,
      collected: collectedIdSet.has(achievement.id),
      isPersisted: achievement.isPersisted || collectedIds.includes(achievement.id)
    }));

    return {
      success: collectedIds.length > 0,
      updated: confirmedUpdated,
      collectedIds,
      attemptedIds,
      achievementPoints: getCollectedAchievementPoints(confirmedUpdated)
    };
  } catch (error) {
    logger.error('Error syncing collected achievements:', error);
    return { success: false, updated: null, collectedIds: [], attemptedIds: [] };
  }
};
