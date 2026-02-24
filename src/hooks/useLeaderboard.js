/**
 * Leaderboard Data Management Hook
 * Handles fetching and caching leaderboard data from Firebase
 */

import { useState, useEffect, useCallback } from 'react';
import { leaderboardOperations } from '../services/firebase/index.js';
import { useAuth } from './useAuth';
import {
  CACHE_TTL_MS,
  DEFAULT_LEADERBOARD_RESPONSE,
  DEFAULT_SUMMARY,
  USER_RANK_MODES,
  getLeaderboardErrorMessage
} from './leaderboard/constants.js';
import { useTrackedLeaderboardRequests } from './leaderboard/useTrackedLeaderboardRequests.js';
import logger from '../utils/logger.js';

export const useLeaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState({});
  const [topPlayers, setTopPlayers] = useState([]);
  const [userRanks, setUserRanks] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { user } = useAuth();
  const {
    applyIfMounted,
    cacheRef,
    clearCache,
    isCacheValid,
    lastFetchRef,
    runTrackedRequest
  } = useTrackedLeaderboardRequests({ setLoading });

  /**
   * Get leaderboard data for a specific mode
   */
  const getLeaderboard = useCallback(async (mode = 'classic', difficulty = null, limit = 10, useCache = true) => {
    const cacheKey = `${mode}_${difficulty || 'default'}_${limit}`;

    // Check cache first
    if (useCache && isCacheValid(cacheKey) && cacheRef.current[cacheKey]) {
      return cacheRef.current[cacheKey];
    }

    return runTrackedRequest(`leaderboard:${cacheKey}`, async () => {
      applyIfMounted(() => setError(null));

      try {
        const data = await leaderboardOperations.getLeaderboard(mode, difficulty, { page: 1, limit });

        cacheRef.current[cacheKey] = data;
        lastFetchRef.current[cacheKey] = Date.now();

        applyIfMounted(() => {
          setLeaderboardData((prev) => ({
            ...prev,
            [cacheKey]: data
          }));
        });

        return data;
      } catch (err) {
        logger.error('Error fetching leaderboard:', err);
        applyIfMounted(() => setError(getLeaderboardErrorMessage(err)));
        return cacheRef.current[cacheKey] || DEFAULT_LEADERBOARD_RESPONSE;
      }
    });
  }, [applyIfMounted, cacheRef, isCacheValid, lastFetchRef, runTrackedRequest]);

  /**
   * Get top players across all modes
   */
  const getTopPlayersOverall = useCallback(async (limit = 10, useCache = true) => {
    const cacheKey = `top_players_${limit}`;

    // Check cache first
    if (useCache && isCacheValid(cacheKey) && cacheRef.current[cacheKey]) {
      return cacheRef.current[cacheKey];
    }

    return runTrackedRequest(`topPlayers:${cacheKey}`, async () => {
      applyIfMounted(() => setError(null));

      try {
        const players = await leaderboardOperations.getTopPlayersOverall(limit);

        cacheRef.current[cacheKey] = players;
        lastFetchRef.current[cacheKey] = Date.now();

        applyIfMounted(() => {
          setTopPlayers(players);
        });
        return players;
      } catch (err) {
        logger.error('Error fetching top players:', err);
        applyIfMounted(() => setError(getLeaderboardErrorMessage(err)));
        return cacheRef.current[cacheKey] || [];
      }
    });
  }, [applyIfMounted, cacheRef, isCacheValid, lastFetchRef, runTrackedRequest]);

  /**
   * Get user's rank in specific mode
   */
  const getUserRank = useCallback(async (userId, mode = 'classic', difficulty = null, useCache = true) => {
    if (!userId) return null;

    const cacheKey = `user_rank_${userId}_${mode}_${difficulty || 'default'}`;
    
    // Check cache first
    if (useCache && isCacheValid(cacheKey) && cacheRef.current[cacheKey]) {
      return cacheRef.current[cacheKey];
    }

    return runTrackedRequest(`userRank:${cacheKey}`, async () => {
      try {
        const rankData = await leaderboardOperations.getUserRank(userId, mode, difficulty);

        cacheRef.current[cacheKey] = rankData;
        lastFetchRef.current[cacheKey] = Date.now();

        applyIfMounted(() => {
          setUserRanks((prev) => ({
            ...prev,
            [cacheKey]: rankData
          }));
        });

        return rankData;
      } catch (err) {
        logger.error('Error fetching user rank:', err);
        return cacheRef.current[cacheKey] || null;
      }
    });
  }, [applyIfMounted, cacheRef, isCacheValid, lastFetchRef, runTrackedRequest]);

  /**
   * Get user's ranks across all modes
   */
  const getUserRanksAll = useCallback(async (userId, useCache = true) => {
    if (!userId) return {};

    const rankEntries = await Promise.all(USER_RANK_MODES.map(async (modeConfig) => {
      const rankData = await getUserRank(userId, modeConfig.mode, modeConfig.difficulty, useCache);
      if (!rankData) return null;

      return [
        `${modeConfig.mode}_${modeConfig.difficulty || 'default'}`,
        rankData
      ];
    }));

    return Object.fromEntries(rankEntries.filter(Boolean));
  }, [getUserRank]);

  /**
   * Refresh all cached data
   */
  const refreshAll = useCallback(async () => {
    // Clear cache
    cacheRef.current = {};
    lastFetchRef.current = {};

    // Fetch fresh data
    const refreshTasks = [
      getTopPlayersOverall(10, false),
      getLeaderboard('classic', null, 10, false),
      getLeaderboard('classic_transparent', null, 10, false),
      getLeaderboard('vsai', 'medium', 10, false)
    ];

    // Fetch user ranks if logged in
    if (user?.uid) {
      refreshTasks.push(getUserRanksAll(user.uid, false));
    }

    await Promise.all(refreshTasks);
  }, [cacheRef, getTopPlayersOverall, getLeaderboard, getUserRanksAll, lastFetchRef, user]);

  /**
   * Get leaderboard summary for home page
   */
  const getLeaderboardSummary = useCallback(async () => {
    try {
      // Get top 3 players overall
      const topThree = await getTopPlayersOverall(3);

      // Get current user's best rank if logged in
      let userBestRank = null;
      if (user?.uid) {
        const userRankMap = await getUserRanksAll(user.uid);
        const ranks = Object.values(userRankMap).filter(Boolean);
        if (ranks.length > 0) {
          userBestRank = ranks.reduce((best, current) =>
            !best || current.rank < best.rank ? current : best
          );
        }
      }

      return {
        topThree,
        userBestRank,
        hasData: topThree.length > 0
      };
    } catch (err) {
      logger.error('Error fetching leaderboard summary:', err);
      return DEFAULT_SUMMARY;
    }
  }, [getTopPlayersOverall, getUserRanksAll, user]);

  /**
   * Auto-refresh data every 5 minutes
   */
  useEffect(() => {
    const interval = setInterval(() => {
      // Only refresh if user is active (tab is visible)
      if (typeof document === 'undefined' || !document.hidden) {
        void refreshAll();
      }
    }, CACHE_TTL_MS);

    return () => {
      clearInterval(interval);
    };
  }, [refreshAll]);

  /**
   * Initial data load
   */
  useEffect(() => {
    void getTopPlayersOverall(3);
    if (user?.uid) {
      void getUserRanksAll(user.uid);
    }
  }, [getTopPlayersOverall, getUserRanksAll, user]);

  return {
    // Data
    leaderboardData,
    topPlayers,
    userRanks,
    loading,
    error,
    
    // Operations
    getLeaderboard,
    getTopPlayersOverall,
    getUserRank,
    getUserRanksAll,
    getLeaderboardSummary,
    refreshAll,
    clearCache,
    
    // Computed values
    hasTopPlayers: topPlayers.length > 0,
    hasCachedData: Object.keys(cacheRef.current).length > 0
  };
};

export default useLeaderboard;
