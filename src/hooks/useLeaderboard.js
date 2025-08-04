/**
 * Leaderboard Data Management Hook
 * Handles fetching and caching leaderboard data from Firebase
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { gameOperations } from '../services/firebase.js';
import { useAuth } from './useAuth';

export const useLeaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState({});
  const [topPlayers, setTopPlayers] = useState([]);
  const [userRanks, setUserRanks] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { user, userProfile } = useAuth();
  const cacheRef = useRef({});
  const lastFetchRef = useRef({});

  /**
   * Check if cache is valid (5 minutes)
   */
  const isCacheValid = useCallback((key) => {
    const lastFetch = lastFetchRef.current[key];
    if (!lastFetch) return false;
    
    const fiveMinutes = 5 * 60 * 1000;
    return Date.now() - lastFetch < fiveMinutes;
  }, []);

  /**
   * Get leaderboard data for a specific mode
   */
  const getLeaderboard = useCallback(async (mode = 'classic', difficulty = null, limit = 10, useCache = true) => {
    const cacheKey = `${mode}_${difficulty || 'default'}_${limit}`;
    
    // Check cache first
    if (useCache && isCacheValid(cacheKey) && cacheRef.current[cacheKey]) {
      return cacheRef.current[cacheKey];
    }

    setLoading(true);
    setError(null);

    try {
      const data = await gameOperations.getLeaderboard(mode, difficulty, limit);
      
      // Cache the result
      cacheRef.current[cacheKey] = data;
      lastFetchRef.current[cacheKey] = Date.now();
      
      // Update state
      setLeaderboardData(prev => ({
        ...prev,
        [cacheKey]: data
      }));

      return data;
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError(err.message);
      return {
        entries: [],
        stats: {},
        lastUpdated: null,
        totalEntries: 0
      };
    } finally {
      setLoading(false);
    }
  }, [isCacheValid]);

  /**
   * Get top players across all modes
   */
  const getTopPlayersOverall = useCallback(async (limit = 10, useCache = true) => {
    const cacheKey = `top_players_${limit}`;
    
    // Check cache first
    if (useCache && isCacheValid(cacheKey) && cacheRef.current[cacheKey]) {
      return cacheRef.current[cacheKey];
    }

    setLoading(true);
    setError(null);

    try {
      const players = await gameOperations.getTopPlayersOverall(limit);
      
      // Cache the result
      cacheRef.current[cacheKey] = players;
      lastFetchRef.current[cacheKey] = Date.now();
      
      setTopPlayers(players);
      return players;
    } catch (err) {
      console.error('Error fetching top players:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [isCacheValid]);

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

    try {
      const rankData = await gameOperations.getUserRank(userId, mode, difficulty);
      
      // Cache the result
      cacheRef.current[cacheKey] = rankData;
      lastFetchRef.current[cacheKey] = Date.now();
      
      // Update state
      setUserRanks(prev => ({
        ...prev,
        [cacheKey]: rankData
      }));

      return rankData;
    } catch (err) {
      console.error('Error fetching user rank:', err);
      return null;
    }
  }, [isCacheValid]);

  /**
   * Get user's ranks across all modes
   */
  const getUserRanksAll = useCallback(async (userId, useCache = true) => {
    if (!userId) return {};

    const modes = [
      { mode: 'classic', difficulty: null },
      { mode: 'vsai', difficulty: 'easy' },
      { mode: 'vsai', difficulty: 'medium' },
      { mode: 'vsai', difficulty: 'impossible' },
      { mode: 'multiplayer', difficulty: null }
    ];

    const ranks = {};
    
    for (const modeConfig of modes) {
      const rankData = await getUserRank(userId, modeConfig.mode, modeConfig.difficulty, useCache);
      if (rankData) {
        const key = `${modeConfig.mode}_${modeConfig.difficulty || 'default'}`;
        ranks[key] = rankData;
      }
    }

    return ranks;
  }, [getUserRank]);

  /**
   * Refresh all cached data
   */
  const refreshAll = useCallback(async () => {
    // Clear cache
    cacheRef.current = {};
    lastFetchRef.current = {};
    
    // Fetch fresh data
    await Promise.all([
      getTopPlayersOverall(10, false),
      getLeaderboard('classic', null, 10, false),
      getLeaderboard('vsai', 'medium', 10, false)
    ]);

    // Fetch user ranks if logged in
    if (user?.uid) {
      await getUserRanksAll(user.uid, false);
    }
  }, [getTopPlayersOverall, getLeaderboard, getUserRanksAll, user]);

  /**
   * Get leaderboard summary for home page
   */
  const getLeaderboardSummary = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get top 3 players overall
      const topThree = await getTopPlayersOverall(3);
      
      // Get current user's best rank if logged in
      let userBestRank = null;
      if (user?.uid) {
        const userRanks = await getUserRanksAll(user.uid);
        const ranks = Object.values(userRanks).filter(Boolean);
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
      console.error('Error fetching leaderboard summary:', err);
      return {
        topThree: [],
        userBestRank: null,
        hasData: false
      };
    } finally {
      setLoading(false);
    }
  }, [getTopPlayersOverall, getUserRanksAll, user]);

  /**
   * Clear cache for specific key
   */
  const clearCache = useCallback((key = null) => {
    if (key) {
      delete cacheRef.current[key];
      delete lastFetchRef.current[key];
    } else {
      cacheRef.current = {};
      lastFetchRef.current = {};
    }
  }, []);

  /**
   * Auto-refresh data every 5 minutes
   */
  useEffect(() => {
    const interval = setInterval(() => {
      // Only refresh if user is active (tab is visible)
      if (!document.hidden) {
        refreshAll();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [refreshAll]);

  /**
   * Initial data load
   */
  useEffect(() => {
    getTopPlayersOverall(3);
    if (user?.uid) {
      getUserRanksAll(user.uid);
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