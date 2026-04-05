/**
 * Game Operations Module
 * Handles game session finalization and retrieval
 */

import {
  db,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  functions,
  httpsCallable,
  COLLECTIONS
} from './config.js';
import { validateInput, rateLimiters } from '../../utils/validation.js';
import logger from '../../utils/logger.js';

let finalizeGameSessionCallable;
let getPublicRecentGamesCallable;

const getFinalizeGameSessionCallable = () => {
  if (!finalizeGameSessionCallable) {
    finalizeGameSessionCallable = httpsCallable(functions, 'finalizeGameSession');
  }
  return finalizeGameSessionCallable;
};

const getGetPublicRecentGamesCallable = () => {
  if (!getPublicRecentGamesCallable) {
    getPublicRecentGamesCallable = httpsCallable(functions, 'getPublicRecentGames');
  }
  return getPublicRecentGamesCallable;
};

const normalizeFinalizationDifficulty = (mode, difficulty) => (
  mode === 'vsai' ? (difficulty ?? null) : null
);

const buildFinalizationPayload = (gameData, validationData) => ({
  ...gameData,
  mode: validationData.mode,
  difficulty: normalizeFinalizationDifficulty(validationData.mode, validationData.difficulty),
  score: validationData.score
});

const finalizeGameSessionWithRetry = async (userId, gameData, maxRetries = 3) => {
  const validation = validateInput.gameSession(gameData);
  if (!validation.valid) {
    logger.error('Game session validation failed:', validation.errors);
    throw new Error(`Invalid game data: ${validation.errors.join(', ')}`);
  }

  if (!rateLimiters.checkApiLimit(userId)) {
    logger.warn(`Rate limit exceeded for user: ${userId}`);
    throw new Error('Too many requests. Please wait before saving again.');
  }

  const payload = buildFinalizationPayload(gameData, validation.data);
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      logger.log(`Starting authoritative game finalization for user: ${userId} (attempt ${attempt}/${maxRetries})`);
      const callable = getFinalizeGameSessionCallable();
      const response = await callable({ session: payload });
      return response?.data || null;
    } catch (error) {
      lastError = error;
      logger.error(`Error finalizing game session (attempt ${attempt}/${maxRetries}):`, error);

      if (
        error?.code === 'permission-denied' ||
        error?.code === 'unauthenticated' ||
        error?.code === 'invalid-argument' ||
        error?.code === 'failed-precondition'
      ) {
        break;
      }

      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        logger.log(`Retrying finalization in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  logger.error('All attempts to finalize game session failed. Final error:', lastError);
  return null;
};

export const gameOperations = {
  async finalizeGameSession(userId, gameData, maxRetries = 3) {
    return finalizeGameSessionWithRetry(userId, gameData, maxRetries);
  },

  async saveGameSession(userId, gameData, maxRetries = 3) {
    const result = await finalizeGameSessionWithRetry(userId, gameData, maxRetries);
    return result?.gameId || null;
  },

  async getUserGames(userId, limitCount = 10) {
    try {
      const gamesQuery = query(
        collection(db, COLLECTIONS.GAMES),
        where('userId', '==', userId),
        orderBy('endedAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(gamesQuery);
      return snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
    } catch (error) {
      if (error.code === 'failed-precondition' && error.message?.includes('index')) {
        logger.warn('Missing Firestore index for games query. Deploy firestore.indexes.json to fix this.');
        try {
          const fallbackQuery = query(
            collection(db, COLLECTIONS.GAMES),
            where('userId', '==', userId),
            limit(Math.max(limitCount * 5, 25))
          );
          const fallbackSnapshot = await getDocs(fallbackQuery);
          const fallbackGames = fallbackSnapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data()
          }));

          fallbackGames.sort((left, right) => {
            const getMillis = (value) => {
              if (!value) return 0;
              if (typeof value === 'number') return value;
              if (typeof value?.toMillis === 'function') return value.toMillis();
              if (typeof value?.seconds === 'number') return value.seconds * 1000;
              return 0;
            };

            return getMillis(right.endedAt) - getMillis(left.endedAt);
          });

          return fallbackGames.slice(0, limitCount);
        } catch (fallbackError) {
          logger.error('Fallback games query failed:', fallbackError);
        }
      }

      logger.error('Error fetching user games:', error);
      return [];
    }
  },

  async getPublicRecentGames(userId, limitCount = 8) {
    try {
      if (!userId) return [];

      const callable = getGetPublicRecentGamesCallable();
      const response = await callable({
        userId,
        limit: limitCount
      });

      return Array.isArray(response?.data?.games) ? response.data.games : [];
    } catch (error) {
      logger.error('Error fetching public recent games:', error);
      return [];
    }
  }
};

export const __private__ = {
  resetCallables() {
    finalizeGameSessionCallable = undefined;
    getPublicRecentGamesCallable = undefined;
  },
  buildFinalizationPayload,
  normalizeFinalizationDifficulty
};
