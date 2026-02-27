import logger from '@/utils/logger.js';
import { auth } from '@/services/firebase/index.js';
import { achievementOperations } from '@/services/firebase/achievements.js';
import { getCollectedAchievementPoints, normalizeAchievementRecords } from '@/hooks/achievements/operationUtils.js';

export const syncCollectedAchievementsWithTransaction = async ({
  achievements,
  transformAchievements
}) => {
  if (!auth.currentUser) {
    return { success: false, updated: null, pendingIds: [] };
  }

  try {
    const currentAchievements = normalizeAchievementRecords(achievements || []);
    const result = transformAchievements(currentAchievements);
    if (!result?.success || !Array.isArray(result.updated)) {
      return { success: false, updated: currentAchievements, pendingIds: [] };
    }

    const previousCollectedIds = new Set(
      currentAchievements
        .filter((achievement) => achievement?.id && achievement.collected)
        .map((achievement) => achievement.id)
    );
    const pendingIds = result.updated
      .filter((achievement) => achievement?.id && achievement.collected && !previousCollectedIds.has(achievement.id))
      .map((achievement) => achievement.id);
    const response = await achievementOperations.collectAchievements(pendingIds);

    return {
      success: true,
      updated: result.updated,
      pendingIds: response?.collectedIds || [],
      achievementPoints: getCollectedAchievementPoints(result.updated)
    };
  } catch (error) {
    logger.error('Error syncing collected achievements:', error);
    return { success: false, updated: null, pendingIds: [] };
  }
};
