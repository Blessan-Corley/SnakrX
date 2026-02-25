import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GAME_MODES, GAME_STATES } from './constants.js';
import { useGameActions } from './useGameActions.js';

const mockBuildInitialGameSessionState = vi.fn();
const mockStopGameLoop = vi.fn();
const mockCreateInitialGameState = vi.fn(() => ({ gameState: GAME_STATES.MENU }));

vi.mock('./gameInitialization.js', () => ({
  buildInitialGameSessionState: (...args) => mockBuildInitialGameSessionState(...args)
}));

vi.mock('./runtimeRefs.js', () => ({
  resetRuntimeRefs: vi.fn(),
  stopGameLoop: (...args) => mockStopGameLoop(...args)
}));

vi.mock('./constants.js', async () => {
  const actual = await vi.importActual('./constants.js');
  return {
    ...actual,
    createInitialGameState: (...args) => mockCreateInitialGameState(...args)
  };
});

vi.mock('../../utils/logger.js', () => ({
  default: {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}));

vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn()
  }
}));

const createProps = (overrides = {}) => ({
  gameStateRef: {
    current: {
      gameState: GAME_STATES.READY,
      gameMode: GAME_MODES.CLASSIC,
      difficulty: 'medium',
      playerCount: 1,
      bonusFoodEnabled: true,
      snakes: []
    }
  },
  setGameState: vi.fn(),
  gameLoopRef: { current: 42 },
  gameStartTimeRef: { current: 0 },
  lastUpdateTimeRef: { current: 0 },
  lastTimerSecondRef: { current: -1 },
  pausedTimeRef: { current: 0 },
  pauseStartRef: { current: 0 },
  pendingDirectionQueuesRef: { current: new Map() },
  ...overrides
});

describe('useGameActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not start the game outside the ready state', () => {
    const props = createProps({
      gameStateRef: {
        current: {
          gameState: GAME_STATES.MENU,
          gameMode: GAME_MODES.CLASSIC,
          snakes: []
        }
      }
    });

    const { result } = renderHook(() => useGameActions(props));

    act(() => {
      result.current.startGame();
    });

    expect(props.setGameState).not.toHaveBeenCalled();
    expect(props.gameStartTimeRef.current).toBe(0);
  });

  it('restarts using the latest session configuration from the ref', async () => {
    const nextState = { gameState: GAME_STATES.READY, gameMode: GAME_MODES.MULTIPLAYER };
    mockBuildInitialGameSessionState.mockReturnValue(nextState);

    const props = createProps({
      gameStateRef: {
        current: {
          gameState: GAME_STATES.GAME_OVER,
          gameMode: GAME_MODES.MULTIPLAYER,
          difficulty: 'hard',
          playerCount: 3,
          bonusFoodEnabled: false,
          snakes: []
        }
      }
    });

    const { result } = renderHook(() => useGameActions(props));

    await act(async () => {
      await result.current.restartGame();
    });

    expect(mockBuildInitialGameSessionState).toHaveBeenCalledWith({
      bonusFoodEnabled: false,
      difficulty: 'hard',
      mode: GAME_MODES.MULTIPLAYER,
      playerCount: 3
    });
    expect(props.setGameState).toHaveBeenCalledWith(nextState);
  });

  it('normalizes invalid player counts during initialization', async () => {
    const nextState = { gameState: GAME_STATES.READY };
    mockBuildInitialGameSessionState.mockReturnValue(nextState);
    const props = createProps();

    const { result } = renderHook(() => useGameActions(props));

    await act(async () => {
      await result.current.initializeGame(GAME_MODES.CLASSIC, 'medium', 0, true);
    });

    expect(mockBuildInitialGameSessionState).toHaveBeenCalledWith({
      bonusFoodEnabled: true,
      difficulty: 'medium',
      mode: GAME_MODES.CLASSIC,
      playerCount: 1
    });
    expect(props.setGameState).toHaveBeenCalledWith(nextState);
  });
});
