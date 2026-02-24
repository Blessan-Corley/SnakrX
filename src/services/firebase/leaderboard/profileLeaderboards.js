import {
  COLLECTIONS,
  collection,
  db,
  getDocs,
  limit as firestoreLimit,
  orderBy,
  query
} from '../config.js';
import logger from '../../../utils/logger.js';
import {
  normalizeTimestampValue,
  sortAchievementEntries
} from '../leaderboardHelpers.js';
import {
  buildEmptyLeaderboardResult,
  buildPaginatedResult,
  buildScoreStats
} from './shared.js';

const getFetchCount = (page, pageLimit) => {
  const requested = Math.max(page * pageLimit, pageLimit);
  return Math.min(Math.max(requested, 100), 500);
};

const mapPublicProfileToEntry = ({
  profileDoc,
  score,
  achievementsCompleted,
  mode
}) => {
  const data = profileDoc.data() || {};
  return {
    id: profileDoc.id,
    userId: profileDoc.id,
    username: data.username || data.displayName || 'Unknown Player',
    displayName: data.displayName || data.username || 'Unknown Player',
    score,
    achievementsCompleted,
    mode,
    difficulty: null,
    timestamp: normalizeTimestampValue(data.updatedAt || data.lastActiveAt || data.createdAt),
    rank: 0,
    isPrivateLeaderboard: data.isPrivateLeaderboard === true,
    avatar: data.avatar || null
  };
};

const createProfileLeaderboardFetcher = ({
  errorLabel,
  orderField,
  mode,
  shouldInclude
}) => {
  return async (options = {}) => {
    try {
      const { page = 1, limit: pageLimit = 50, includeStats = true } = options;
      const fetchCount = getFetchCount(page, pageLimit);

      const publicProfilesRef = collection(db, COLLECTIONS.PUBLIC_PROFILES);
      const leaderboardQuery = query(
        publicProfilesRef,
        orderBy(orderField, 'desc'),
        firestoreLimit(fetchCount)
      );

      const snapshot = await getDocs(leaderboardQuery);
      const entries = snapshot.docs
        .map((profileDoc) => {
          const data = profileDoc.data() || {};
          const stats = data.stats || {};
          const score = mode === 'achievements'
            ? (Number(stats.achievementPoints) || 0)
            : (Number(stats.totalScore) || 0);
          const achievementsCompleted = Number(stats.achievementsCompleted) || 0;

          if (!shouldInclude({ score, achievementsCompleted })) {
            return null;
          }

          return mapPublicProfileToEntry({
            profileDoc,
            score,
            achievementsCompleted,
            mode
          });
        })
        .filter(Boolean);

      sortAchievementEntries(entries);
      entries.forEach((entry, index) => {
        entry.rank = index + 1;
      });

      return buildPaginatedResult({
        allEntries: entries,
        page,
        limit: pageLimit,
        lastUpdated: Date.now(),
        totalEntries: entries.length,
        includeStats,
        stats: buildScoreStats(entries)
      });
    } catch (error) {
      logger.error(errorLabel, error);
      return buildEmptyLeaderboardResult({
        limit: options.limit || 50,
        includeStats: options.includeStats !== false
      });
    }
  };
};

export const getAchievementLeaderboard = createProfileLeaderboardFetcher({
  errorLabel: 'Error fetching achievement leaderboard:',
  orderField: 'stats.achievementPoints',
  mode: 'achievements',
  shouldInclude: ({ score, achievementsCompleted }) => score > 0 || achievementsCompleted > 0
});

export const getOverallScoreLeaderboard = createProfileLeaderboardFetcher({
  errorLabel: 'Error fetching overall score leaderboard:',
  orderField: 'stats.totalScore',
  mode: 'overall',
  shouldInclude: ({ score }) => score > 0
});
