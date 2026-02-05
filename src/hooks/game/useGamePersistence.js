import { useCallback } from 'react';
import { gameOperations } from '../../services/firebase/index.js';
import { persistGameData } from './gamePersistenceEngine.js';
import { useGameAutoSaveEffect } from './useGameAutoSaveEffect.js';

export const useGamePersistence = ({
  gameState,
  gameStateRef,
  persistenceDependenciesRef,
  savedGameIdsRef,
  user
}) => {
  const saveGameData = useCallback(async (victory) => {
    const {
      refreshProfile,
      user: currentUser,
      userProfile
    } = persistenceDependenciesRef.current;

    await persistGameData({
      gameOperations,
      gameState: gameStateRef.current,
      refreshProfile,
      savedGameIdsRef,
      user: currentUser,
      userProfile,
      victory
    });
  }, [gameStateRef, persistenceDependenciesRef, savedGameIdsRef]);

  useGameAutoSaveEffect({
    gameId: gameState.gameId,
    gameScore: gameState.score,
    gameStatus: gameState.gameState,
    saveGameData,
    user
  });
};

export default useGamePersistence;
