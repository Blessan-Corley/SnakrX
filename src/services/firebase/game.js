/**
 * Game Operations Module
 * Handles game session storage and retrieval
 */

import { db, doc, collection, getDocs, query, where, orderBy, limit, serverTimestamp, COLLECTIONS } from './config.js';
import { firestoreOperations } from './firestore.js';
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
   * Save game session data
   */
  async saveGameSession(userId, gameData) {
    try {
      logger.log('Starting game session save for user:', userId);
      logger.log('Game data received:', gameData);

      const gameRef = doc(collection(db, COLLECTIONS.GAMES));
      logger.log('Created game reference:', gameRef.id);

      const gameSession = createGameDocument({
        userId,
        gameId: gameData.gameId,
        username: gameData.username || 'Anonymous',
        mode: gameData.mode,
        difficulty: gameData.difficulty || null,
        playerCount: gameData.playerCount || 1,
        score: gameData.score,
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
      logger.error('Error saving game session to Firebase:', error);
      logger.error('Full error object:', error);
      return null;
    }
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
