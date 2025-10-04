/**
 * User Stats Module
 * Handle user statistics and achievements
 */

import { useCallback } from 'react';
import {
  auth,
  db,
  doc,
  getDoc,
  serverTimestamp,
  arrayUnion,
  COLLECTIONS,
  firestoreOperations
} from '../../services/firebase/index.js';
import logger from '../../utils/logger.js';

/**
 * Hook for user stats operations
 */
export const useUserStats = () => {
  /**
   * Update user game statistics
   */
  const updateUserStats = useCallback(async (statUpdates) => {
    if (!auth.currentUser) {
      logger.warn('No authenticated user - cannot update stats');
      return false;
    }

    try {
      const userDocRef = doc(db, COLLECTIONS.USERS, auth.currentUser.uid);

      // Get current stats
      const userDoc = await firestoreOperations.getDocument(userDocRef);
      const currentStats = userDoc.exists() ? userDoc.data()?.stats || {} : {};

      const validatedUpdates = {};

      for (const [key, value] of Object.entries(statUpdates)) {
        // Validate numeric values
        if (typeof value === 'number') {
          // Prevent suspiciously large numbers
          if (value > 1000000) {
            logger.warn(`Skipping suspiciously large stat update: ${key} = ${value}`);
            continue;
          }

          // Handle different types of stats
          if (key.includes('Games') || key === 'totalGames' || key === 'totalWins' ||
              key.includes('Wins') || key.includes('wins')) {
            // Game counts and wins - increment
            validatedUpdates[`stats.${key}`] = (currentStats[key] || 0) + value;
          } else if (key.includes('BestScore') || key.includes('bestScore') || key === 'bestScore' ||
                     key === 'maxSpeed' || key === 'bestWinStreak' || key === 'maxSurvivalTime') {
            // Best stats - use maximum
            validatedUpdates[`stats.${key}`] = Math.max(currentStats[key] || 0, value);
          } else if (key === 'currentWinStreak') {
            // Current win streak - direct assignment
            validatedUpdates[`stats.${key}`] = value;
          } else {
            // Accumulative stats - add to current
            validatedUpdates[`stats.${key}`] = (currentStats[key] || 0) + value;
          }
        } else if (Array.isArray(value)) {
          // Handle arrays (achievements)
          validatedUpdates[`stats.${key}`] = arrayUnion(...value);
        } else {
          // Direct assignment for other types
          validatedUpdates[`stats.${key}`] = value;
        }
      }

      if (Object.keys(validatedUpdates).length > 0) {
        // Add timestamps
        validatedUpdates['stats.updatedAt'] = serverTimestamp();
        validatedUpdates['updatedAt'] = serverTimestamp();
        validatedUpdates['lastActiveAt'] = serverTimestamp();

        await firestoreOperations.updateDocument(userDocRef, validatedUpdates);
        logger.log('✅ Stats updated successfully:', validatedUpdates);

        return true;
      }

      return false;
    } catch (err) {
      logger.error('Stats update error:', err);
      return false;
    }
  }, []);

  /**
   * Unlock achievement
   */
  const unlockAchievement = useCallback(async (achievementId) => {
    if (!auth.currentUser) return false;

    try {
      const userDocRef = doc(db, COLLECTIONS.USERS, auth.currentUser.uid);

      // Check if already unlocked
      const userDoc = await firestoreOperations.getDocument(userDocRef);
      const currentAchievements = userDoc.data()?.stats?.achievements || [];

      if (currentAchievements.some(ach => ach.id === achievementId)) {
        logger.log(`Achievement ${achievementId} already unlocked`);
        return false;
      }

      // Unlock achievement
      const achievementData = {
        id: achievementId,
        unlockedAt: serverTimestamp(),
        timestamp: Date.now()
      };

      await firestoreOperations.updateDocument(userDocRef, {
        'stats.achievements': arrayUnion(achievementData),
        'stats.updatedAt': serverTimestamp()
      });

      logger.log(`Achievement unlocked: ${achievementId}`);
      return true;
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
