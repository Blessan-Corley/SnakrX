import { useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  ACHIEVEMENTS,
  checkAchievementRequirements
} from '@/data/achievements.js';
import { playAchievement } from '@/utils/sound.js';
import logger from '@/utils/logger.js';
import { getIconComponent } from '@/utils/iconMap.js';

export const useAchievementUnlockOperations = ({
  setLoading,
  unlockAchievement,
  unlockedAchievements,
  userProfile
}) => {
  const checkAndUnlockAchievements = useCallback(async (gameStats) => {
    if (!userProfile) {
      logger.warn('No user profile - cannot check achievements');
      return [];
    }

    setLoading(true);
    const newlyUnlocked = [];

    try {
      const unlockedIdSet = new Set([
        ...(userProfile.stats?.achievements || []).map((achievement) =>
          typeof achievement === 'string' ? achievement : achievement?.id
        ).filter(Boolean),
        ...(unlockedAchievements || []).map((achievement) => achievement?.id).filter(Boolean)
      ]);

      for (const achievement of ACHIEVEMENTS) {
        if (unlockedIdSet.has(achievement.id)) {
          continue;
        }

        const meetsRequirements = checkAchievementRequirements(achievement, gameStats);
        if (!meetsRequirements) {
          continue;
        }

        logger.log(`Achievement unlocked: ${achievement.id}`);
        const Icon = getIconComponent(achievement.icon);
        const success = await unlockAchievement(achievement.id);

        if (!success) {
          continue;
        }

        unlockedIdSet.add(achievement.id);
        newlyUnlocked.push(achievement);
        playAchievement();
        toast.success(`Achievement Unlocked: ${achievement.title}!`, {
          icon: <Icon size={16} />,
          duration: 4000
        });
      }

      return newlyUnlocked;
    } catch (error) {
      logger.error('Error checking achievements:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [setLoading, unlockAchievement, unlockedAchievements, userProfile]);

  return {
    checkAndUnlockAchievements
  };
};
