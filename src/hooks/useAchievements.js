/**
 * SnakrX Achievements Hook - V2 (Refactored & Modular)
 * Achievement provider and state management
 *
 * @version 2.0.0
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ACHIEVEMENTS,
  checkAchievementRequirements,
  getAchievementById
} from '../data/achievements.js';
import { useAuth } from './auth/context.js';
import { AchievementContext } from './achievements/context.js';
import { achievementOperations } from '../services/firebase/achievements.js';
import logger from '../utils/logger.js';

const resolveAchievementTimestamp = (value, fallback = Date.now()) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value?.seconds === 'number') {
    return value.seconds * 1000;
  }

  if (typeof value?.toMillis === 'function') {
    return value.toMillis();
  }

  return fallback;
};

const buildStoredAchievementRecords = (profileAchievements = [], fallbackTimestamp = Date.now()) => (
  profileAchievements
    .map((achievement) => {
      const achievementId = typeof achievement === 'string' ? achievement : achievement?.id;
      const catalogAchievement = achievementId ? getAchievementById(achievementId) : null;
      if (!catalogAchievement) return null;

      const unlockedAtMs = resolveAchievementTimestamp(
        achievement?.unlockedAt ?? achievement?.timestamp,
        fallbackTimestamp
      );

      return {
        ...catalogAchievement,
        unlockedAt: unlockedAtMs,
        timestamp: resolveAchievementTimestamp(achievement?.timestamp, unlockedAtMs),
        collected: typeof achievement === 'object' ? achievement.collected === true : false,
        isPersisted: true
      };
    })
    .filter(Boolean)
);

const buildAchievementStateFromProfile = (userProfile) => {
  const stats = userProfile?.stats || {};
  const fallbackTimestamp = resolveAchievementTimestamp(
    stats.lastGameAt ?? userProfile?.lastActiveAt ?? userProfile?.createdAt,
    Date.now()
  );
  const storedAchievements = buildStoredAchievementRecords(stats.achievements || [], fallbackTimestamp);
  const unlockedIds = new Set(storedAchievements.map((achievement) => achievement.id));

  const derivedAchievements = ACHIEVEMENTS
    .filter((achievement) => !unlockedIds.has(achievement.id))
    .filter((achievement) => checkAchievementRequirements(achievement, stats))
    .map((achievement) => ({
      ...achievement,
      unlockedAt: fallbackTimestamp,
      timestamp: fallbackTimestamp,
      collected: false,
      isPersisted: false
    }));

  const resolvedAchievements = [...storedAchievements, ...derivedAchievements]
    .sort((left, right) => (right.timestamp || 0) - (left.timestamp || 0));
  const uncollectedAchievements = resolvedAchievements.filter((achievement) => !achievement.collected);

  return {
    missingAchievementIds: derivedAchievements.map((achievement) => achievement.id),
    recentUnlocks: resolvedAchievements.slice(0, 5),
    unlockedAchievements: resolvedAchievements,
    uncollectedAchievements
  };
};

/**
 * Achievement Provider Component
 */
export const AchievementProvider = ({ children }) => {
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [uncollectedAchievements, setUncollectedAchievements] = useState([]);
  const [achievementProgress, setAchievementProgress] = useState({});
  const [recentUnlocks, setRecentUnlocks] = useState([]);
  const [loading, setLoading] = useState(false);

  const { refreshProfile, userProfile } = useAuth();
  const lastSyncedMissingIdsRef = useRef('');

  const achievementState = useMemo(
    () => buildAchievementStateFromProfile(userProfile),
    [userProfile]
  );

  // Update unlocked achievements when user profile changes
  useEffect(() => {
    if (userProfile) {
      setUnlockedAchievements(achievementState.unlockedAchievements);
      setUncollectedAchievements(achievementState.uncollectedAchievements);
      setRecentUnlocks(achievementState.recentUnlocks);
      return;
    }

    setUnlockedAchievements([]);
    setUncollectedAchievements([]);
    setAchievementProgress({});
    setRecentUnlocks([]);
  }, [achievementState, userProfile]);

  useEffect(() => {
    const missingIds = achievementState.missingAchievementIds;
    const syncKey = missingIds.join('|');

    if (!userProfile?.uid || !missingIds.length) {
      lastSyncedMissingIdsRef.current = '';
      return;
    }

    if (lastSyncedMissingIdsRef.current === syncKey) {
      return;
    }

    lastSyncedMissingIdsRef.current = syncKey;
    let cancelled = false;

    const syncMissingAchievements = async () => {
      try {
        const result = await achievementOperations.syncAchievements(missingIds);

        if (cancelled) return;

        if ((result?.syncedIds?.length || 0) > 0 && refreshProfile) {
          await refreshProfile();
        }
      } catch (error) {
        logger.warn('Skipping achievement backfill for the current session because the unlock callable failed:', error);
      }
    };

    syncMissingAchievements();

    return () => {
      cancelled = true;
    };
  }, [achievementState.missingAchievementIds, refreshProfile, userProfile?.uid]);

  const value = {
    unlockedAchievements,
    uncollectedAchievements,
    achievementProgress,
    recentUnlocks,
    loading,
    setUnlockedAchievements,
    setUncollectedAchievements,
    setAchievementProgress,
    setRecentUnlocks,
    setLoading
  };

  return (
    <AchievementContext.Provider value={value}>
      {children}
    </AchievementContext.Provider>
  );
};

// Re-export from modular components
export { useAchievements } from './achievements/context.js';
export { useAchievementOperations } from './achievements/operations.js';

export const __private__ = {
  buildAchievementStateFromProfile,
  buildStoredAchievementRecords,
  resolveAchievementTimestamp
};
