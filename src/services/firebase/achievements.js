import { functions, httpsCallable } from './config.js';

let collectUserAchievementsCallable;
let syncUserAchievementsCallable;
let unlockUserAchievementCallable;

const getCollectUserAchievementsCallable = () => {
  if (!collectUserAchievementsCallable) {
    collectUserAchievementsCallable = httpsCallable(functions, 'collectUserAchievements');
  }

  return collectUserAchievementsCallable;
};

const getUnlockUserAchievementCallable = () => {
  if (!unlockUserAchievementCallable) {
    unlockUserAchievementCallable = httpsCallable(functions, 'unlockUserAchievement');
  }

  return unlockUserAchievementCallable;
};

const getSyncUserAchievementsCallable = () => {
  if (!syncUserAchievementsCallable) {
    syncUserAchievementsCallable = httpsCallable(functions, 'syncUserAchievements');
  }

  return syncUserAchievementsCallable;
};

export const achievementOperations = {
  async collectAchievements(achievementIds = []) {
    const callable = getCollectUserAchievementsCallable();
    const response = await callable({ achievementIds });
    return response?.data || { collectedIds: [], achievementPoints: 0 };
  },

  async syncAchievements(achievementIds = []) {
    const callable = getSyncUserAchievementsCallable();
    const response = await callable({ achievementIds });
    return response?.data || { syncedIds: [] };
  },

  async unlockAchievement(achievementId) {
    const callable = getUnlockUserAchievementCallable();
    const response = await callable({ achievementId });
    return response?.data || { success: false, unlocked: false };
  }
};

export const __private__ = {
  resetCallables() {
    collectUserAchievementsCallable = undefined;
    syncUserAchievementsCallable = undefined;
    unlockUserAchievementCallable = undefined;
  }
};
