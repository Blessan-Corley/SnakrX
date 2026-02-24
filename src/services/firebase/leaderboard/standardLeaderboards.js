import {
  COLLECTIONS,
  db,
  doc
} from '../config.js';
import { firestoreOperations } from '../firestore.js';
import logger from '../../../utils/logger.js';
import {
  attachPublicProfileMetadata,
  getPreviousWeekKey,
  getWeeklyLeaderboardId
} from '../leaderboardHelpers.js';
import {
  buildEmptyLeaderboardResult,
  buildPaginatedResult
} from './shared.js';

export const getLeaderboard = async (mode = 'classic', difficulty = null, options = {}) => {
  try {
    const { page = 1, limit: pageLimit = 50, includeStats = true } = options;
    const leaderboardId = `${mode}_${difficulty || 'default'}`;
    const leaderboardRef = doc(db, COLLECTIONS.LEADERBOARDS, leaderboardId);
    const leaderboardDoc = await firestoreOperations.getDocument(leaderboardRef);

    if (!leaderboardDoc.exists()) {
      return buildEmptyLeaderboardResult({
        page,
        limit: pageLimit,
        includeStats
      });
    }

    const data = leaderboardDoc.data() || {};
    const allEntries = data.entries || [];
    const enrichedEntries = await attachPublicProfileMetadata(allEntries);

    return buildPaginatedResult({
      allEntries: enrichedEntries,
      page,
      limit: pageLimit,
      lastUpdated: data.lastUpdated,
      totalEntries: data.totalEntries || 0,
      includeStats,
      stats: data.stats || {}
    });
  } catch (error) {
    logger.error('Error fetching leaderboard:', error);
    return buildEmptyLeaderboardResult({
      limit: options.limit || 50,
      includeStats: options.includeStats !== false
    });
  }
};

export const getWeeklyLeaderboard = async (mode = 'overall', difficulty = null, options = {}) => {
  try {
    const {
      page = 1,
      limit: pageLimit = 50,
      includeStats = true,
      weekKey = 'previous'
    } = options;

    const resolvedWeekKey = weekKey === 'previous'
      ? getPreviousWeekKey(new Date())
      : weekKey;

    const leaderboardId = getWeeklyLeaderboardId(mode, difficulty, resolvedWeekKey);
    const leaderboardRef = doc(db, COLLECTIONS.WEEKLY_LEADERBOARDS, leaderboardId);
    const leaderboardDoc = await firestoreOperations.getDocument(leaderboardRef);

    if (!leaderboardDoc.exists()) {
      return buildEmptyLeaderboardResult({
        page,
        limit: pageLimit,
        includeStats,
        extra: {
          weekKey: resolvedWeekKey,
          weekStart: null,
          weekEnd: null
        }
      });
    }

    const data = leaderboardDoc.data() || {};
    const allEntries = data.entries || [];
    const enrichedEntries = await attachPublicProfileMetadata(allEntries);

    return buildPaginatedResult({
      allEntries: enrichedEntries,
      page,
      limit: pageLimit,
      lastUpdated: data.generatedAt || data.updatedAt || null,
      totalEntries: data.totalEntries || enrichedEntries.length,
      includeStats,
      stats: data.stats || {},
      extra: {
        weekKey: data.weekKey || resolvedWeekKey,
        weekStart: data.weekStart || null,
        weekEnd: data.weekEnd || null
      }
    });
  } catch (error) {
    logger.error('Error fetching weekly leaderboard:', error);
    const fallbackWeekKey = options.weekKey === 'previous'
      ? getPreviousWeekKey(new Date())
      : options.weekKey || null;

    return buildEmptyLeaderboardResult({
      limit: options.limit || 50,
      includeStats: options.includeStats !== false,
      extra: {
        weekKey: fallbackWeekKey,
        weekStart: null,
        weekEnd: null
      }
    });
  }
};
