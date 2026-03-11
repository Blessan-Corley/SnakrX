import { useCallback, useEffect, useRef, useState } from 'react';
import { createInitialGameState } from './constants.js';

export const useGameRuntimeState = ({
  refreshProfile,
  user,
  userProfile
}) => {
  const [gameState, setGameState] = useState(createInitialGameState);
  const gameStateRef = useRef(gameState);
  const persistenceDependenciesRef = useRef({
    refreshProfile,
    user,
    userProfile
  });

  const gameLoopRef = useRef(null);
  const savedGameIdsRef = useRef(new Set());
  const lastUpdateTimeRef = useRef(0);
  const gameStartTimeRef = useRef(0);
  const lastTimerSecondRef = useRef(-1);
  const pausedTimeRef = useRef(0);
  const pauseStartRef = useRef(0);
  const pendingDirectionQueuesRef = useRef(new Map());

  const commitGameState = useCallback((nextStateOrUpdater) => {
    setGameState((previousState) => {
      const nextState =
        typeof nextStateOrUpdater === 'function'
          ? nextStateOrUpdater(previousState)
          : nextStateOrUpdater;
      gameStateRef.current = nextState;
      return nextState;
    });
  }, []);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    persistenceDependenciesRef.current = {
      refreshProfile,
      user,
      userProfile
    };
  }, [
    refreshProfile,
    user,
    userProfile
  ]);

  return {
    commitGameState,
    gameLoopRef,
    gameStartTimeRef,
    gameState,
    gameStateRef,
    lastTimerSecondRef,
    lastUpdateTimeRef,
    pauseStartRef,
    pausedTimeRef,
    pendingDirectionQueuesRef,
    persistenceDependenciesRef,
    savedGameIdsRef
  };
};

export default useGameRuntimeState;
