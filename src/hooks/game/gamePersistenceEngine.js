import { GAME_CONFIG } from './constants.js';
import { buildGameSessionData } from './sessionPersistence.js';
import { getTrackedMaxLength } from './progress.js';
import logger from '../../utils/logger.js';

const hasMeaningfulProgress = (gameState) =>
  Boolean(gameState.startTime) &&
  (
    (gameState.foodEaten || 0) > 0 ||
    (gameState.moves || 0) > 0 ||
    (gameState.gameTime || 0) > 0
  );

const shouldSkipPersistence = ({ gameState, sessionId, savedGameIdsRef, user }) => {
  if (!user) {
    logger.log('No authenticated user - skipping save');
    return true;
  }

  if (!sessionId) {
    logger.warn('Missing game session id - skipping save');
    return true;
  }

  if (savedGameIdsRef.current.has(sessionId)) {
    logger.log('Game session already persisted - skipping duplicate save');
    return true;
  }

  if (!hasMeaningfulProgress(gameState)) {
    logger.warn('Skipping incomplete game session from persistence pipeline', {
      gameId: sessionId,
      foodEaten: gameState.foodEaten || 0,
      moves: gameState.moves || 0,
      gameTime: gameState.gameTime || 0
    });
    return true;
  }

  return false;
};

export const persistGameData = async ({
  gameOperations,
  gameState,
  refreshProfile,
  savedGameIdsRef,
  user,
  userProfile,
  victory
}) => {
  const sessionId = gameState.gameId;
  if (shouldSkipPersistence({ gameState, sessionId, savedGameIdsRef, user })) {
    return null;
  }

  savedGameIdsRef.current.add(sessionId);
  let shouldKeepSavedMarker = false;

  try {
    logger.log('Finalizing game data through backend...');
    const trackedMaxLength = getTrackedMaxLength(gameState);
    const now = Date.now();
    const gameSessionData = buildGameSessionData({
      gameState,
      trackedMaxLength,
      user,
      userProfile,
      victory,
      endedAt: now
    });

    const finalizationResult = await gameOperations.finalizeGameSession(user.uid, gameSessionData);
    if (!finalizationResult?.success || !finalizationResult?.gameId) {
      logger.error('Authoritative game finalization failed or returned an invalid response', finalizationResult);
      return null;
    }

    shouldKeepSavedMarker = true;

    if (refreshProfile) {
      setTimeout(() => {
        logger.log('Refreshing profile after backend game finalization...');
        refreshProfile();
      }, GAME_CONFIG.PROFILE_REFRESH_DELAY);
    }
    return finalizationResult?.statsSnapshot || userProfile?.stats || {};
  } catch (error) {
    logger.error('Error finalizing game data:', error);
    return null;
  } finally {
    if (!shouldKeepSavedMarker) {
      savedGameIdsRef.current.delete(sessionId);
    }
  }
};

export const __private__ = {
  hasMeaningfulProgress
};
