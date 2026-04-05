import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useGameTickController } from './useGameTickController.js';

const updateSnakesPositionMock = vi.fn();
const playBonusFoodSpawnMock = vi.fn();
const applyQueuedDirectionsMock = vi.fn();
const buildUpdatedStateFromTickMock = vi.fn();
const getTotalNormalFoodConsumedMock = vi.fn();
const prepareFoodForTickMock = vi.fn();
const resolveGameOutcomeMock = vi.fn();
const resolvePostMoveFoodMock = vi.fn();
const stopGameLoopMock = vi.fn();

vi.mock('./gameLogic.js', () => ({
  updateSnakesPosition: (...args) => updateSnakesPositionMock(...args)
}));

vi.mock('../../utils/sound.js', () => ({
  playBonusFoodSpawn: (...args) => playBonusFoodSpawnMock(...args)
}));

vi.mock('../../utils/gameUtils.js', () => ({
  GAME_STATES: {
    PLAYING: 'playing',
    READY: 'ready',
    GAME_OVER: 'game_over'
  }
}));

vi.mock('./gameTickEngine.js', () => ({
  applyQueuedDirections: (...args) => applyQueuedDirectionsMock(...args),
  buildUpdatedStateFromTick: (...args) => buildUpdatedStateFromTickMock(...args),
  getTotalNormalFoodConsumed: (...args) => getTotalNormalFoodConsumedMock(...args),
  prepareFoodForTick: (...args) => prepareFoodForTickMock(...args),
  resolveGameOutcome: (...args) => resolveGameOutcomeMock(...args),
  resolvePostMoveFood: (...args) => resolvePostMoveFoodMock(...args)
}));

vi.mock('./runtimeRefs.js', () => ({
  stopGameLoop: (...args) => stopGameLoopMock(...args)
}));

const createBaseArgs = () => ({
  commitGameState: vi.fn(),
  gameLoopRef: { current: 11 },
  gameStartTimeRef: { current: 1000 },
  gameStateRef: {
    current: {
      gameState: 'playing',
      isPaused: false,
      speed: 100,
      snakes: [{ id: 0, body: [{ x: 1, y: 1 }], isAlive: true }],
      food: [{ x: 2, y: 2 }],
      boardSize: { width: 20, height: 20 },
      gameMode: 'classic',
      aiController: { difficulty: 'medium' },
      normalFoodsSinceBonus: 3,
      pendingBonusSpawns: 1,
      bonusFoodEnabled: true
    }
  },
  lastTimerSecondRef: { current: -1 },
  lastUpdateTimeRef: { current: 100 },
  pausedTimeRef: { current: 500 },
  pendingDirectionQueuesRef: { current: new Map([[0, ['ArrowRight']]]) }
});

describe('useGameTickController', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    updateSnakesPositionMock.mockReset();
    playBonusFoodSpawnMock.mockReset();
    applyQueuedDirectionsMock.mockReset();
    buildUpdatedStateFromTickMock.mockReset();
    getTotalNormalFoodConsumedMock.mockReset();
    prepareFoodForTickMock.mockReset();
    resolveGameOutcomeMock.mockReset();
    resolvePostMoveFoodMock.mockReset();
    stopGameLoopMock.mockReset();

    globalThis.requestAnimationFrame = vi.fn(() => 77);
    globalThis.cancelAnimationFrame = vi.fn();
  });

  it('updates the timer only when the elapsed second changes during active play', () => {
    const args = createBaseArgs();
    vi.spyOn(Date, 'now').mockReturnValue(4500);

    const { result } = renderHook(() => useGameTickController(args));

    act(() => {
      result.current.updateTimer();
      result.current.updateTimer();
    });

    expect(args.lastTimerSecondRef.current).toBe(3);
    expect(args.commitGameState).toHaveBeenCalledTimes(1);

    const updater = args.commitGameState.mock.calls[0][0];
    expect(updater({ score: 10 })).toEqual({
      score: 10,
      gameTime: 3
    });
  });

  it('stops the loop immediately when the game is not in a playable state', () => {
    const args = createBaseArgs();
    args.gameStateRef.current.gameState = 'ready';

    const { result } = renderHook(() => useGameTickController(args));

    act(() => {
      result.current.updateGameRef.current();
    });

    expect(stopGameLoopMock).toHaveBeenCalledWith(args.gameLoopRef);
    expect(args.commitGameState).not.toHaveBeenCalled();
  });

  it('schedules the next animation frame without ticking when the speed threshold is not met', () => {
    const args = createBaseArgs();
    args.gameStartTimeRef.current = 0;
    vi.spyOn(globalThis.performance, 'now').mockReturnValue(150);

    const { result } = renderHook(() => useGameTickController(args));

    act(() => {
      result.current.updateGameRef.current();
    });

    expect(globalThis.requestAnimationFrame).toHaveBeenCalledTimes(1);
    expect(globalThis.requestAnimationFrame).toHaveBeenCalledWith(result.current.updateGameRef.current);
    expect(args.gameLoopRef.current).toBe(77);
    expect(updateSnakesPositionMock).not.toHaveBeenCalled();
    expect(args.commitGameState).not.toHaveBeenCalled();
  });

  it('processes a tick, records bonus spawns, and schedules another frame while the game continues', () => {
    const args = createBaseArgs();
    vi.spyOn(globalThis.performance, 'now').mockReturnValue(350);
    vi.spyOn(Date, 'now').mockReturnValue(5000);

    prepareFoodForTickMock.mockReturnValue([{ x: 2, y: 2 }]);
    applyQueuedDirectionsMock.mockReturnValue([{ id: 0, body: [{ x: 2, y: 1 }], isAlive: true }]);
    updateSnakesPositionMock.mockReturnValue({
      snakes: [{ id: 0, body: [{ x: 2, y: 1 }], isAlive: true }],
      food: [{ x: 5, y: 5 }],
      events: [{ type: 'EAT', snakeId: 0 }]
    });
    getTotalNormalFoodConsumedMock.mockReturnValue(2);
    resolvePostMoveFoodMock.mockReturnValue({
      bonusFoodSpawnedThisTick: 2,
      normalFoodsSinceBonus: 1,
      pendingBonusSpawns: 0,
      resolvedFood: [{ x: 9, y: 9 }]
    });
    resolveGameOutcomeMock.mockReturnValue({
      gameEnded: false,
      victory: false
    });
    buildUpdatedStateFromTickMock.mockImplementation(({ prev }) => ({
      ...prev,
      snakes: [{ id: 0, score: 5 }],
      food: [{ x: 9, y: 9 }],
      bonusFoodsSpawned: prev.bonusFoodsSpawned || 0
    }));

    const { result } = renderHook(() => useGameTickController(args));

    act(() => {
      result.current.updateGameRef.current();
    });

    expect(prepareFoodForTickMock).toHaveBeenCalledWith(args.gameStateRef.current, 5000);
    expect(applyQueuedDirectionsMock).toHaveBeenCalledWith(
      args.gameStateRef.current.snakes,
      args.pendingDirectionQueuesRef
    );
    expect(updateSnakesPositionMock).toHaveBeenCalledWith(
      [{ id: 0, body: [{ x: 2, y: 1 }], isAlive: true }],
      [{ x: 2, y: 2 }],
      args.gameStateRef.current.boardSize,
      args.gameStateRef.current.gameMode,
      { 1: args.gameStateRef.current.aiController }
    );
    expect(playBonusFoodSpawnMock).toHaveBeenCalledTimes(1);
    expect(globalThis.requestAnimationFrame).toHaveBeenCalledTimes(1);
    expect(args.lastUpdateTimeRef.current).toBe(300);

    const updater = args.commitGameState.mock.calls[1][0];
    expect(updater({ bonusFoodsSpawned: 1, score: 10 })).toEqual({
      bonusFoodsSpawned: 3,
      score: 10,
      snakes: [{ id: 0, score: 5 }],
      food: [{ x: 9, y: 9 }]
    });
    expect(buildUpdatedStateFromTickMock).toHaveBeenCalledTimes(1);
  });

  it('does not schedule another frame after a tick that ends the game', () => {
    const args = createBaseArgs();
    vi.spyOn(globalThis.performance, 'now').mockReturnValue(350);
    vi.spyOn(Date, 'now').mockReturnValue(5000);

    prepareFoodForTickMock.mockReturnValue([{ x: 2, y: 2 }]);
    applyQueuedDirectionsMock.mockReturnValue(args.gameStateRef.current.snakes);
    updateSnakesPositionMock.mockReturnValue({
      snakes: [{ id: 0, body: [{ x: 2, y: 1 }], isAlive: false }],
      food: [],
      events: []
    });
    getTotalNormalFoodConsumedMock.mockReturnValue(0);
    resolvePostMoveFoodMock.mockReturnValue({
      bonusFoodSpawnedThisTick: 0,
      normalFoodsSinceBonus: 0,
      pendingBonusSpawns: 0,
      resolvedFood: []
    });
    resolveGameOutcomeMock.mockReturnValue({
      gameEnded: true,
      victory: false
    });
    buildUpdatedStateFromTickMock.mockImplementation(({ prev }) => ({
      ...prev,
      gameState: 'game_over'
    }));

    const { result } = renderHook(() => useGameTickController(args));

    act(() => {
      result.current.updateGameRef.current();
    });

    expect(args.commitGameState).toHaveBeenCalledTimes(2);
    expect(globalThis.requestAnimationFrame).not.toHaveBeenCalled();
    expect(playBonusFoodSpawnMock).not.toHaveBeenCalled();
  });
});
