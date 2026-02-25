import { useCallback, useEffect, useRef } from 'react';
import { updateSnakesPosition } from './gameLogic.js';
import { playBonusFoodSpawn } from '../../utils/sound.js';
import { GAME_STATES } from '../../utils/gameUtils.js';
import {
  applyQueuedDirections,
  buildUpdatedStateFromTick,
  getTotalNormalFoodConsumed,
  prepareFoodForTick,
  resolveGameOutcome,
  resolvePostMoveFood
} from './gameTickEngine.js';
import { stopGameLoop } from './runtimeRefs.js';

export const useGameTickController = ({
  commitGameState,
  gameLoopRef,
  gameStartTimeRef,
  gameStateRef,
  lastTimerSecondRef,
  lastUpdateTimeRef,
  pausedTimeRef,
  pendingDirectionQueuesRef
}) => {
  const updateGameRef = useRef(null);

  const updateTimer = useCallback(() => {
    const currentGameState = gameStateRef.current;
    if (
      currentGameState.gameState !== GAME_STATES.PLAYING ||
      currentGameState.isPaused ||
      !gameStartTimeRef.current
    ) {
      return;
    }

    const now = Date.now();
    const elapsedSeconds = Math.max(
      0,
      Math.floor((now - gameStartTimeRef.current - pausedTimeRef.current) / 1000)
    );

    if (elapsedSeconds === lastTimerSecondRef.current) {
      return;
    }
    lastTimerSecondRef.current = elapsedSeconds;

    commitGameState((previousState) => ({
      ...previousState,
      gameTime: elapsedSeconds
    }));
  }, [commitGameState, gameStartTimeRef, gameStateRef, lastTimerSecondRef, pausedTimeRef]);

  const updateGame = useCallback(() => {
    const currentGameState = gameStateRef.current;
    if (
      currentGameState.gameState !== GAME_STATES.PLAYING ||
      currentGameState.isPaused
    ) {
      stopGameLoop(gameLoopRef);
      return;
    }

    const now = performance.now();
    updateTimer();

    const deltaTime = now - lastUpdateTimeRef.current;
    if (deltaTime < currentGameState.speed) {
      gameLoopRef.current = requestAnimationFrame(updateGame);
      return;
    }
    lastUpdateTimeRef.current = now - (deltaTime % currentGameState.speed);

    const currentTimestamp = Date.now();
    const currentFood = prepareFoodForTick(currentGameState, currentTimestamp);
    const snakesForTick = applyQueuedDirections(
      currentGameState.snakes,
      pendingDirectionQueuesRef
    );

    const {
      snakes: newSnakes,
      food: nextFood,
      events
    } = updateSnakesPosition(
      snakesForTick,
      currentFood,
      currentGameState.boardSize,
      currentGameState.gameMode,
      { 1: currentGameState.aiController }
    );

    const postMove = resolvePostMoveFood({
      boardSize: currentGameState.boardSize,
      bonusFoodEnabled: currentGameState.bonusFoodEnabled !== false,
      currentTimestamp,
      newSnakes,
      nextFood,
      normalFoodsSinceBonus: currentGameState.normalFoodsSinceBonus,
      pendingBonusSpawns: currentGameState.pendingBonusSpawns,
      totalNormalFoodConsumed: getTotalNormalFoodConsumed(events)
    });
    const outcome = resolveGameOutcome({
      gameMode: currentGameState.gameMode,
      newSnakes
    });

    if (postMove.bonusFoodSpawnedThisTick > 0) {
      playBonusFoodSpawn();
    }

    commitGameState((previousState) => {
      const nextState = buildUpdatedStateFromTick({
        currentTimestamp,
        events,
        gameEnded: outcome.gameEnded,
        gameStartTime: gameStartTimeRef.current,
        newSnakes,
        normalFoodsSinceBonus: postMove.normalFoodsSinceBonus,
        pendingBonusSpawns: postMove.pendingBonusSpawns,
        prev: previousState,
        resolvedFood: postMove.resolvedFood,
        victory: outcome.victory
      });

      if (postMove.bonusFoodSpawnedThisTick > 0) {
        nextState.bonusFoodsSpawned = (nextState.bonusFoodsSpawned || 0) + postMove.bonusFoodSpawnedThisTick;
      }

      return nextState;
    });

    if (!outcome.gameEnded) {
      gameLoopRef.current = requestAnimationFrame(updateGame);
    }
  }, [
    commitGameState,
    gameLoopRef,
    gameStartTimeRef,
    gameStateRef,
    lastUpdateTimeRef,
    pendingDirectionQueuesRef,
    updateTimer
  ]);

  useEffect(() => {
    updateGameRef.current = updateGame;
  }, [updateGame]);

  return {
    updateGameRef,
    updateTimer
  };
};

export default useGameTickController;
