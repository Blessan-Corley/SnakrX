/**
 * Optimized SnakrX Game State Management Hook
 * Refactored into modular game engine helpers while preserving behavior.
 */

import { useContext, useMemo } from 'react';
import {
  GAME_STATES,
  getNextSpeedMilestone,
  getSpeedProgressUnits,
  getSpeedLevel,
  getSpeedMultiplier
} from '../utils/gameUtils.js';
import { useAuth } from './useAuth';
import { GameContext } from './game/context.js';
import { useGameActions } from './game/useGameActions.js';
import { useGameLoopLifecycleEffect } from './game/useGameLoopLifecycleEffect.js';
import { useGamePersistence } from './game/useGamePersistence.js';
import { useGameRuntimeState } from './game/useGameRuntimeState.js';
import { useGameTickController } from './game/useGameTickController.js';

export const GameProvider = ({ children }) => {
  const { user, userProfile, refreshProfile } = useAuth();

  const {
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
  } = useGameRuntimeState({
    refreshProfile,
    user,
    userProfile
  });

  const isGameActive = gameState.gameState === GAME_STATES.PLAYING;
  const isGameOver = gameState.gameState === GAME_STATES.GAME_OVER;
  const isVictory = gameState.gameState === GAME_STATES.VICTORY;
  const speedProgressUnits = getSpeedProgressUnits({
    bonusFoodPoints: gameState.bonusFoodPoints,
    difficulty: gameState.difficulty,
    foodEaten: gameState.foodEaten,
    mode: gameState.gameMode
  });
  const speedMultiplier = getSpeedMultiplier(gameState.speed);
  const speedLevel = getSpeedLevel(speedProgressUnits, { mode: gameState.gameMode });
  const nextSpeedMilestone = getNextSpeedMilestone(speedProgressUnits, { mode: gameState.gameMode });
  const { updateGameRef } = useGameTickController({
    commitGameState,
    gameLoopRef,
    gameStartTimeRef,
    gameStateRef,
    lastTimerSecondRef,
    lastUpdateTimeRef,
    pausedTimeRef,
    pendingDirectionQueuesRef
  });

  const {
    initializeGame,
    startGame,
    updateSnakeDirection,
    pauseGame,
    resumeGame,
    togglePause,
    restartGame,
    endGame,
    quitToMenu
  } = useGameActions({
    gameLoopRef,
    gameStartTimeRef,
    gameStateRef,
    lastTimerSecondRef,
    lastUpdateTimeRef,
    pauseStartRef,
    pausedTimeRef,
    pendingDirectionQueuesRef,
    setGameState: commitGameState
  });

  useGamePersistence({
    gameState,
    gameStateRef,
    persistenceDependenciesRef,
    savedGameIdsRef,
    user
  });

  useGameLoopLifecycleEffect({
    gameLoopRef,
    isGameActive,
    isPaused: gameState.isPaused,
    updateGameRef
  });

  const contextValue = useMemo(() => ({
    ...gameState,
    isGameActive,
    isGameOver,
    isVictory,
    speedMultiplier,
    speedLevel,
    nextSpeedMilestone,
    initializeGame,
    startGame,
    updateSnakeDirection,
    pauseGame,
    resumeGame,
    togglePause,
    restartGame,
    quitToMenu,
    endGame
  }), [
    gameState,
    isGameActive,
    isGameOver,
    isVictory,
    speedMultiplier,
    speedLevel,
    nextSpeedMilestone,
    initializeGame,
    startGame,
    updateSnakeDirection,
    pauseGame,
    resumeGame,
    togglePause,
    restartGame,
    quitToMenu,
    endGame
  ]);

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export const useGameOperations = () => {
  const context = useGame();
  return context;
};

export default useGame;
