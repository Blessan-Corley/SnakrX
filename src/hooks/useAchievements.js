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

const mergePendingCollectedAchievements = ({
  achievementState,
  pendingCollectedSnapshots = new Map(),
  pendingCollectedIds = []
}) => {
  if (!pendingCollectedIds.length) {
    return achievementState;
  }

  const pendingCollectedIdSet = new Set(pendingCollectedIds);
  const unlockedMap = new Map(
    (achievementState.unlockedAchievements || []).map((achievement) => [achievement.id, achievement])
  );

  pendingCollectedIdSet.forEach((achievementId) => {
    const existing = unlockedMap.get(achievementId);
    const snapshot = pendingCollectedSnapshots.get(achievementId);
    if (!existing && !snapshot) {
      return;
    }

    unlockedMap.set(achievementId, {
      ...(existing || {}),
      ...(snapshot || {}),
      collected: true
    });
  });

  const unlockedAchievements = Array.from(unlockedMap.values())
    .sort((left, right) => (right.timestamp || 0) - (left.timestamp || 0));
  const uncollectedAchievements = unlockedAchievements
    .filter((achievement) => !pendingCollectedIdSet.has(achievement.id))
    .filter((achievement) => !achievement.collected);
  const recentUnlocks = (achievementState.recentUnlocks || [])
    .filter((achievement) => !pendingCollectedIdSet.has(achievement.id));

  return {
    ...achievementState,
    recentUnlocks,
    unlockedAchievements,
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
  const [pendingCollectedIds, setPendingCollectedIds] = useState([]);
  const [loading, setLoading] = useState(false);

  const { refreshProfile, userProfile } = useAuth();
  const lastSyncedMissingIdsRef = useRef('');
  const pendingCollectedSnapshotsRef = useRef(new Map());

  const achievementState = useMemo(
    () => buildAchievementStateFromProfile(userProfile),
    [userProfile]
  );
  const mergedAchievementState = useMemo(
    () => mergePendingCollectedAchievements({
      achievementState,
      pendingCollectedSnapshots: pendingCollectedSnapshotsRef.current,
      pendingCollectedIds
    }),
    [achievementState, pendingCollectedIds]
  );

  // Update unlocked achievements when user profile changes
  useEffect(() => {
    if (userProfile) {
      setUnlockedAchievements(mergedAchievementState.unlockedAchievements);
      setUncollectedAchievements(mergedAchievementState.uncollectedAchievements);
      setRecentUnlocks(mergedAchievementState.recentUnlocks);
      return;
    }

    setUnlockedAchievements([]);
    setUncollectedAchievements([]);
    setAchievementProgress({});
    setRecentUnlocks([]);
    setPendingCollectedIds([]);
  }, [mergedAchievementState, userProfile]);

  useEffect(() => {
    const nextSnapshots = new Map();

    pendingCollectedIds.forEach((achievementId) => {
      const snapshot = unlockedAchievements.find((achievement) => achievement?.id === achievementId);
      if (snapshot) {
        nextSnapshots.set(achievementId, snapshot);
        return;
      }

      const previousSnapshot = pendingCollectedSnapshotsRef.current.get(achievementId);
      if (previousSnapshot) {
        nextSnapshots.set(achievementId, previousSnapshot);
      }
    });

    pendingCollectedSnapshotsRef.current = nextSnapshots;
  }, [pendingCollectedIds, unlockedAchievements]);

  useEffect(() => {
    if (!pendingCollectedIds.length) {
      return;
    }

    const persistedCollectedIds = new Set(
      (achievementState.unlockedAchievements || [])
        .filter((achievement) => achievement?.id && achievement.collected)
        .map((achievement) => achievement.id)
    );

    if (!persistedCollectedIds.size) {
      return;
    }

    setPendingCollectedIds((current) => current.filter((achievementId) => !persistedCollectedIds.has(achievementId)));
  }, [achievementState.unlockedAchievements, pendingCollectedIds.length]);

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

  useEffect(() => {
    if (!userProfile?.uid || !pendingCollectedIds.length) {
      return undefined;
    }

    let cancelled = false;

    const timeoutId = window.setTimeout(async () => {
      try {
        const result = await achievementOperations.collectAchievements(pendingCollectedIds);

        if (cancelled) return;

        const collectedIds = Array.isArray(result?.collectedIds) ? result.collectedIds : [];
        if (collectedIds.length > 0) {
          const collectedIdSet = new Set(collectedIds);
          setUnlockedAchievements((previous) => previous.map((achievement) => (
            collectedIdSet.has(achievement.id) ? { ...achievement, collected: true } : achievement
          )));
          setUncollectedAchievements((previous) => previous.filter((achievement) => !collectedIdSet.has(achievement.id)));
          setRecentUnlocks((previous) => previous.filter((achievement) => !collectedIdSet.has(achievement.id)));
          setPendingCollectedIds((previous) => previous.filter((achievementId) => !collectedIdSet.has(achievementId)));
        }

        if (refreshProfile) {
          await refreshProfile();
        }
      } catch (error) {
        if (!cancelled) {
          logger.warn('Retrying achievement collection in the background failed:', error);
        }
      }
    }, 1500);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [pendingCollectedIds, refreshProfile, userProfile?.uid]);

  const value = {
    unlockedAchievements,
    uncollectedAchievements,
    achievementProgress,
    recentUnlocks,
    pendingCollectedIds,
    loading,
    setUnlockedAchievements,
    setUncollectedAchievements,
    setAchievementProgress,
    setRecentUnlocks,
    setPendingCollectedIds,
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
  mergePendingCollectedAchievements,
  resolveAchievementTimestamp
};
