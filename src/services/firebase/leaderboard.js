/**
 * Leaderboard Operations Module
 * Handles leaderboard data and rankings
 */

import { db, doc, getDocs, query, collection, where, orderBy, limit as queryLimit, serverTimestamp, COLLECTIONS } from './config.js';
import { firestoreOperations } from './firestore.js';
import logger from '../../utils/logger.js';

/**
 * Create standardized leaderboard entry
 */
const createLeaderboardEntry = (data) => ({
  userId: data.userId,
  username: data.username,
  score: data.score,
  duration: data.duration,
  foodEaten: data.foodEaten,
  mode: data.mode,
  difficulty: data.difficulty,
  speedReached: data.speedReached || 1,
  timestamp: serverTimestamp(),
  rank: 0 // Will be calculated
});

/**
 * Leaderboard-specific Firebase operations
 */
export const leaderboardOperations = {
  /**
   * Update leaderboard
   */
  async updateLeaderboard(userId, gameData) {
    try {
      logger.log('Starting leaderboard update for user:', userId);
      logger.log('Game data for leaderboard:', gameData);

      const leaderboardId = `${gameData.mode}_${gameData.difficulty || 'default'}`;
      logger.log('Leaderboard ID:', leaderboardId);

      const leaderboardRef = doc(db, COLLECTIONS.LEADERBOARDS, leaderboardId);

      // Get current leaderboard
      logger.log('Fetching current leaderboard...');
      const leaderboardDoc = await firestoreOperations.getDocument(leaderboardRef);
      let currentEntries = [];

      if (leaderboardDoc.exists()) {
        currentEntries = leaderboardDoc.data()?.entries || [];
        logger.log('Found existing leaderboard with', currentEntries.length, 'entries');
      } else {
        logger.log('Creating new leaderboard');
      }

      // Create new entry
      const newEntry = createLeaderboardEntry({
        userId,
        username: gameData.username,
        score: gameData.score,
        duration: gameData.duration,
        foodEaten: gameData.foodEaten,
        mode: gameData.mode,
        difficulty: gameData.difficulty || null,
        speedReached: gameData.speedReached
      });

      logger.log('Created leaderboard entry:', newEntry);

      // Add new entry and sort
      currentEntries.push(newEntry);
      currentEntries.sort((a, b) => b.score - a.score);

      // Keep only top 100 entries
      const topEntries = currentEntries.slice(0, 100);
      logger.log('Updated entries count:', topEntries.length);

      // Update ranks
      topEntries.forEach((entry, index) => {
        entry.rank = index + 1;
      });

      // Create leaderboard data
      const leaderboardData = {
        mode: gameData.mode,
        difficulty: gameData.difficulty || null,
        entries: topEntries,
        lastUpdated: serverTimestamp(),
        totalEntries: topEntries.length,
        stats: {
          highestScore: topEntries[0]?.score || 0,
          averageScore: topEntries.reduce((sum, e) => sum + e.score, 0) / topEntries.length || 0,
          totalGames: topEntries.length
        }
      };

      logger.log('Saving leaderboard data to Firestore...');
      const success = await firestoreOperations.setDocument(leaderboardRef, leaderboardData);

      if (success) {
        logger.log('Leaderboard updated successfully in Firestore');
        return true;
      } else {
        logger.error('Leaderboard update failed - setDocument returned false');
        return false;
      }
    } catch (error) {
      logger.error('Error updating leaderboard:', error);
      logger.error('Full leaderboard error:', error);
      return false;
    }
  },

  /**
   * Get leaderboard data
   */
  async getLeaderboard(mode = 'classic', difficulty = null, limit = 100) {
    try {
      const leaderboardId = `${mode}_${difficulty || 'default'}`;
      const leaderboardRef = doc(db, COLLECTIONS.LEADERBOARDS, leaderboardId);

      const leaderboardDoc = await firestoreOperations.getDocument(leaderboardRef);

      if (leaderboardDoc.exists()) {
        const data = leaderboardDoc.data();
        return {
          entries: data.entries || [],
          stats: data.stats || {},
          lastUpdated: data.lastUpdated,
          totalEntries: data.totalEntries || 0
        };
      }

      return {
        entries: [],
        stats: {},
        lastUpdated: null,
        totalEntries: 0
      };
    } catch (error) {
      logger.error('Error fetching leaderboard:', error);
      return {
        entries: [],
        stats: {},
        lastUpdated: null,
        totalEntries: 0
      };
    }
  },

  /**
   * Get top players across all modes
   */
  async getTopPlayersOverall(limit = 10) {
    try {
      // Get leaderboards for all modes
      const modes = [
        { mode: 'classic', difficulty: null },
        { mode: 'vsai', difficulty: 'easy' },
        { mode: 'vsai', difficulty: 'medium' },
        { mode: 'vsai', difficulty: 'impossible' },
        { mode: 'multiplayer', difficulty: null }
      ];

      const allEntries = [];

      for (const modeConfig of modes) {
        const leaderboard = await this.getLeaderboard(modeConfig.mode, modeConfig.difficulty, 50);
        allEntries.push(...leaderboard.entries);
      }

      // Group by user and get their best scores
      const userBestScores = {};
      allEntries.forEach(entry => {
        if (!userBestScores[entry.userId] || userBestScores[entry.userId].score < entry.score) {
          userBestScores[entry.userId] = entry;
        }
      });

      // Convert to array and sort
      const topPlayers = Object.values(userBestScores)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((entry, index) => ({
          ...entry,
          rank: index + 1
        }));

      return topPlayers;
    } catch (error) {
      logger.error('Error fetching top players:', error);
      return [];
    }
  },

  /**
   * Get user's rank in a specific leaderboard
   */
  async getUserRank(userId, mode = 'classic', difficulty = null) {
    try {
      const leaderboard = await this.getLeaderboard(mode, difficulty, 1000);
      const userEntry = leaderboard.entries.find(entry => entry.userId === userId);

      if (userEntry) {
        return {
          rank: userEntry.rank,
          score: userEntry.score,
          totalPlayers: leaderboard.totalEntries
        };
      }

      return null;
    } catch (error) {
      logger.error('Error fetching user rank:', error);
      return null;
    }
  }
};
