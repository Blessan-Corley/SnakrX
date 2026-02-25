import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { AI_DIFFICULTIES, GAME_STATES } from '../../utils/gameUtils.js';
import logger from '../../utils/logger.js';
import { createInitialGameState } from './constants.js';
import {
  canPauseGame,
  canResumeGame,
  canStartGame,
  canTogglePause,
  getRestartConfiguration,
  isDirectOppositeDirection,
  isDuplicateDirection,
  isTerminalGameState,
  normalizePlayerCount,
  shouldStartOnDirectionChange
} from './gameActionUtils.js';
import { buildInitialGameSessionState } from './gameInitialization.js';
import { resetRuntimeRefs, stopGameLoop } from './runtimeRefs.js';

export const useGameActions = ({
  gameStateRef,
  setGameState,
  gameLoopRef,
  gameStartTimeRef,
  lastUpdateTimeRef,
  lastTimerSecondRef,
  pausedTimeRef,
  pauseStartRef,
  pendingDirectionQueuesRef
}) => {
  const resetSessionRefs = useCallback(() => {
    resetRuntimeRefs({
      gameStartTimeRef,
      lastTimerSecondRef,
      lastUpdateTimeRef,
      pauseStartRef,
      pausedTimeRef,
      pendingDirectionQueuesRef
    });
  }, [
    gameStartTimeRef,
    lastTimerSecondRef,
    lastUpdateTimeRef,
    pauseStartRef,
    pausedTimeRef,
    pendingDirectionQueuesRef
  ]);

  const initializeGame = useCallback(async (
    mode,
    difficulty = AI_DIFFICULTIES.MEDIUM,
    playerCount = 1,
    bonusFoodEnabled = true
  ) => {
    try {
      stopGameLoop(gameLoopRef);
      resetSessionRefs();

      const initialState = buildInitialGameSessionState({
        bonusFoodEnabled,
        difficulty,
        mode,
        playerCount: normalizePlayerCount(playerCount)
      });
      setGameState(initialState);
    } catch (error) {
      logger.error('Error initializing game:', error);
      toast.error(`Failed to initialize game: ${error.message}`);
      throw error;
    }
  }, [gameLoopRef, resetSessionRefs, setGameState]);

  const startGame = useCallback(() => {
    const current = gameStateRef.current;
    if (!canStartGame(current.gameState)) {
      return;
    }

    logger.log('Starting game!');
    const startedAt = Date.now();
    gameStartTimeRef.current = startedAt;
    lastTimerSecondRef.current = 0;
    pausedTimeRef.current = 0;
    pauseStartRef.current = 0;
    lastUpdateTimeRef.current = 0;

    setGameState((prev) => ({
      ...prev,
      gameState: GAME_STATES.PLAYING,
      isPaused: false,
      startTime: startedAt
    }));
  }, [
    gameStateRef,
    gameStartTimeRef,
    lastTimerSecondRef,
    pausedTimeRef,
    pauseStartRef,
    lastUpdateTimeRef,
    setGameState
  ]);

  const updateSnakeDirection = useCallback((playerId, newDirection) => {
    if (
      typeof playerId !== 'number'
      || !newDirection
      || typeof newDirection.x !== 'number'
      || typeof newDirection.y !== 'number'
    ) {
      logger.warn('Invalid direction change parameters:', { playerId, newDirection });
      return;
    }

    const currentState = gameStateRef.current;
    const targetSnake = currentState.snakes[playerId];
    if (!targetSnake || targetSnake.isAI || !targetSnake.isAlive) return;

    if (shouldStartOnDirectionChange(currentState)) {
      startGame();
    }

    if (isTerminalGameState(currentState.gameState)) {
      return;
    }

    const queue = pendingDirectionQueuesRef.current.get(playerId) || [];
    const referenceDirection = queue.length ? queue[queue.length - 1] : targetSnake.direction;

    if (isDirectOppositeDirection(referenceDirection, newDirection)) return;
    if (isDuplicateDirection(referenceDirection, newDirection)) return;

    if (queue.length >= 3) {
      queue.shift();
    }

    queue.push(newDirection);
    pendingDirectionQueuesRef.current.set(playerId, queue);
  }, [gameStateRef, pendingDirectionQueuesRef, startGame]);

  const pauseGame = useCallback(() => {
    const current = gameStateRef.current;
    if (!canPauseGame(current)) return;

    pauseStartRef.current = Date.now();
    stopGameLoop(gameLoopRef);

    setGameState((prev) => ({
      ...prev,
      isPaused: true
    }));
  }, [gameStateRef, pauseStartRef, gameLoopRef, setGameState]);

  const resumeGame = useCallback(() => {
    const current = gameStateRef.current;
    if (!canResumeGame(current)) return;

    const now = Date.now();
    if (pauseStartRef.current > 0) {
      pausedTimeRef.current += now - pauseStartRef.current;
      pauseStartRef.current = 0;
    }
    lastUpdateTimeRef.current = performance.now();

    setGameState((prev) => ({
      ...prev,
      isPaused: false
    }));
  }, [gameStateRef, pauseStartRef, pausedTimeRef, lastUpdateTimeRef, setGameState]);

  const togglePause = useCallback(() => {
    const current = gameStateRef.current;
    if (!canTogglePause(current.gameState)) return;
    if (current.isPaused) {
      resumeGame();
      return;
    }
    pauseGame();
  }, [gameStateRef, pauseGame, resumeGame]);

  const restartGame = useCallback(() => {
    const current = gameStateRef.current;
    if (!current || current.gameState === GAME_STATES.MENU) {
      return;
    }

    stopGameLoop(gameLoopRef);
    resetSessionRefs();
    const nextConfiguration = getRestartConfiguration(gameStateRef);

    void initializeGame(
      nextConfiguration.mode,
      nextConfiguration.difficulty,
      nextConfiguration.playerCount,
      nextConfiguration.bonusFoodEnabled
    );
  }, [gameLoopRef, gameStateRef, resetSessionRefs, initializeGame]);

  const endGame = useCallback((victory = false) => {
    stopGameLoop(gameLoopRef);
    pendingDirectionQueuesRef.current = new Map();

    setGameState((prev) => ({
      ...prev,
      gameState: victory ? GAME_STATES.VICTORY : GAME_STATES.GAME_OVER,
      isPaused: true
    }));
  }, [gameLoopRef, pendingDirectionQueuesRef, setGameState]);

  const quitToMenu = useCallback(() => {
    stopGameLoop(gameLoopRef);
    resetSessionRefs();
    setGameState(createInitialGameState());
  }, [gameLoopRef, resetSessionRefs, setGameState]);

  return {
    initializeGame,
    startGame,
    updateSnakeDirection,
    pauseGame,
    resumeGame,
    togglePause,
    restartGame,
    endGame,
    quitToMenu
  };
};

export const __private__ = {
  getRestartConfiguration
};
