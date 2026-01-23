/**
 * Game Operations Module
 * Handles game session storage and retrieval
 */

import { db, doc, collection, getDocs, query, where, orderBy, limit, serverTimestamp, COLLECTIONS } from './config.js';
import { firestoreOperations } from './firestore.js';
import { validateInput, rateLimiters } from '../../utils/validation.js';
import logger from '../../utils/logger.js';

/**
 * Create standardized game document
 */
const createGameDocument = (data) => ({
  userId: data.userId,
  gameId: data.gameId,
  username: data.username,
  mode: data.mode,
  difficulty: data.difficulty || null,
  playerCount: data.playerCount || 1,
  score: data.score || 0,
  duration: data.duration || 0,
  foodEaten: data.foodEaten || 0,
  speedReached: data.speedReached || 1,
  result: data.result || 'lost',
  maxLength: data.maxLength || 1,
  stats: data.stats || {},
  performance: data.performance || {},
  startedAt: data.startedAt || serverTimestamp(),
  endedAt: data.endedAt || serverTimestamp(),
  createdAt: serverTimestamp()
});

/**
 * Game-specific Firebase operations
 */
export const gameOperations = {
  /**
    * Save game session data with enhanced error handling, validation, and rate limiting
    */
  async saveGameSession(userId, gameData, maxRetries = 3) {
    // Validate input data
    const validation = validateInput.gameSession(gameData);
    if (!validation.valid) {
      logger.error('Game session validation failed:', validation.errors);
      throw new Error(`Invalid game data: ${validation.errors.join(', ')}`);
    }

    // Check rate limiting
    if (!rateLimiters.checkApiLimit(userId)) {
      logger.warn(`Rate limit exceeded for user: ${userId}`);
      throw new Error('Too many requests. Please wait before saving again.');
    }

    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.log(`Starting game session save for user: ${userId} (attempt ${attempt}/${maxRetries})`);
        logger.log('Validated game data:', validation.data);

        const gameRef = doc(collection(db, COLLECTIONS.GAMES));
        logger.log('Created game reference:', gameRef.id);

        const gameSession = createGameDocument({
          userId,
          gameId: gameData.gameId,
          username: gameData.username || 'Anonymous',
          mode: validation.data.mode,
          difficulty: validation.data.difficulty || null,
          playerCount: gameData.playerCount || 1,
          score: validation.data.score,
          duration: gameData.duration,
          foodEaten: gameData.foodEaten,
          speedReached: gameData.speedReached,
          result: gameData.result, // 'won', 'lost', 'quit'
          stats: {
            moves: gameData.stats?.moves || 0,
            wallHits: gameData.stats?.wallHits || 0,
            selfHits: gameData.stats?.selfHits || 0,
            maxLength: gameData.stats?.maxLength || 1,
            averageSpeed: gameData.stats?.averageSpeed || 1,
            efficiency: gameData.stats?.efficiency || 0,
            timeToFirstFood: gameData.stats?.timeToFirstFood || 0,
            timeToMaxLength: gameData.stats?.timeToMaxLength || 0
          },
          performance: gameData.performance || {},
          startedAt: gameData.startedAt || serverTimestamp(),
          endedAt: gameData.endedAt || serverTimestamp()
        });

        logger.log('Created game session document:', gameSession);

        const success = await firestoreOperations.setDocument(gameRef, gameSession);
        if (success) {
          logger.log('Game session saved successfully to Firestore with ID:', gameRef.id);
          return gameRef.id;
        } else {
          logger.error('setDocument returned false - save failed');
          return null;
        }
      } catch (error) {
        lastError = error;
        logger.error(`Error saving game session to Firebase (attempt ${attempt}/${maxRetries}):`, error);
        logger.error('Full error object:', error);

        // Don't retry on certain errors
        if (error.code === 'permission-denied' || error.code === 'unauthenticated') {
          logger.error('Authentication/permission error - not retrying');
          break;
        }

        // Wait before retrying (exponential backoff)
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          logger.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // If all retries failed, log the final error and return null
    logger.error('All attempts to save game session failed. Final error:', lastError);
    return null;
  },

  /**
   * Get user's recent games
   */
  async getUserGames(userId, limitCount = 10) {
    try {
      const gamesQuery = query(
        collection(db, COLLECTIONS.GAMES),
        where('userId', '==', userId),
        orderBy('endedAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(gamesQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      logger.error('Error fetching user games:', error);
      return [];
    }
  }
};
