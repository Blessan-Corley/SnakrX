import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useGamePageController } from './useGamePageController.js';

const navigateMock = vi.fn();
const playClickMock = vi.fn();
const startGameMock = vi.fn();
const lifecycleEffectsMock = vi.fn();
const gameInputFactoryMock = vi.fn();
const setShowGameOverModalMock = vi.fn();

let mockRouteState = {
  resolvedMode: 'multiplayer',
  resolvedDifficulty: 'hard',
  resolvedPlayerCount: 2,
  resolvedBonusFoodEnabled: true
};

const useGameExitHandlersResult = {
  bypassNavigationGuardRef: { current: false },
  handleLeaveCancel: vi.fn(),
  handleLeaveConfirm: vi.fn(),
  handleQuit: vi.fn(),
  leaveConfirmState: { isOpen: false, targetPath: null },
  requestLeaveConfirmation: vi.fn(),
  visibilityPauseRef: { current: false }
};

const useGameUiStateResult = {
  clearExitUi: vi.fn(),
  handleRestart: vi.fn(),
  handleShareScore: vi.fn(),
  inputWarning: null,
  lastShownAchievementRef: { current: '' },
  loading: false,
  newAchievement: { icon: 'trophy' },
  setInputWarning: vi.fn(),
  setLoading: vi.fn(),
  setNewAchievement: vi.fn(),
  setShowAchievementModal: vi.fn(),
  setShowCollisionHighlight: vi.fn(),
  setShowGameOverModal: setShowGameOverModalMock,
  setShowPerformanceMonitor: vi.fn(),
  showAchievementModal: false,
  showCollisionHighlight: false,
  showGameOverModal: false,
  showPerformanceMonitor: false
};

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock,
  useLocation: () => ({ search: '?bonusFood=on' }),
  useParams: () => ({ mode: 'multiplayer', difficulty: 'hard', playerCount: '2' })
}));

vi.mock('../../hooks/useGame.js', () => ({
  useGame: () => ({
    gameState: 'ready',
    boardSize: { width: 20, height: 18 },
    snakes: [{ body: [{ x: 0, y: 0 }] }],
    food: [{ x: 1, y: 1 }],
    score: 42,
    gameTime: 15,
    foodEaten: 3,
    isPaused: false,
    deadPlayers: new Set(),
    highlightCollision: null,
    playerCount: 2,
    isGameActive: true,
    isGameOver: false,
    isVictory: false,
    speedMultiplier: 1,
    initializeGame: vi.fn(),
    startGame: startGameMock,
    updateSnakeDirection: vi.fn(),
    pauseGame: vi.fn(),
    resumeGame: vi.fn(),
    togglePause: vi.fn(),
    restartGame: vi.fn(),
    quitToMenu: vi.fn()
  })
}));

vi.mock('../../hooks/useAchievements.js', () => ({
  useAchievementOperations: () => ({
    recentUnlocks: []
  })
}));

vi.mock('../../hooks/useGameInput.js', () => ({
  default: (...args) => gameInputFactoryMock(...args)
}));

vi.mock('../../utils/sound.js', () => ({
  playClick: (...args) => playClickMock(...args)
}));

vi.mock('../../utils/gameUtils.js', () => ({
  GAME_STATES: {
    READY: 'ready',
    PLAYING: 'playing'
  },
  isMobile: () => false
}));

vi.mock('../../utils/iconMap.js', () => ({
  getIconComponent: () => () => null
}));

vi.mock('./gameSessionUtils.js', () => ({
  resolveGameRouteState: () => mockRouteState,
  getGameResultDetails: () => ({
    aiFinalScore: 21,
    isVsAiMode: false,
    modalTitle: 'Game Over',
    multiplayerScoreRows: [{ player: 'P1', score: 42 }],
    multiplayerWinner: 'P1',
    userFinalScore: 42,
    vsAiResultLabel: ''
  }),
  getReadyPlayersCount: (readyPlayers) => Object.values(readyPlayers).filter(Boolean).length,
  hasActiveSessionState: () => true
}));

vi.mock('./hooks/useGameExitHandlers.js', () => ({
  useGameExitHandlers: () => useGameExitHandlersResult
}));

vi.mock('./hooks/useGameMultiplayerHandlers.js', () => ({
  useGameMultiplayerHandlers: () => ({
    handleDirectionChange: vi.fn(),
    handleMultiplayerReadyInput: vi.fn(),
    multiplayerReadyDirectionRef: { current: new Map() },
    multiplayerReadyPlayers: { 0: true, 1: true },
    multiplayerStartTriggeredRef: { current: false },
    setMultiplayerReadyPlayers: vi.fn()
  })
}));

vi.mock('./hooks/useGameUiState.js', () => ({
  useGameUiState: () => useGameUiStateResult
}));

vi.mock('./useGameLifecycleEffects.js', () => ({
  useGameLifecycleEffects: (...args) => lifecycleEffectsMock(...args)
}));

describe('useGamePageController', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    navigateMock.mockReset();
    playClickMock.mockReset();
    startGameMock.mockReset();
    lifecycleEffectsMock.mockReset();
    gameInputFactoryMock.mockReset();
    setShowGameOverModalMock.mockReset();
    useGameExitHandlersResult.bypassNavigationGuardRef.current = false;
    mockRouteState = {
      resolvedMode: 'multiplayer',
      resolvedDifficulty: 'hard',
      resolvedPlayerCount: 2,
      resolvedBonusFoodEnabled: true
    };

    gameInputFactoryMock.mockImplementation(() => ({
      onTouchStart: vi.fn(),
      onTouchMove: vi.fn(),
      onTouchEnd: vi.fn(),
      handleTouchControl: vi.fn(),
      getCurrentKeyMappings: () => [],
      getInputPerformance: () => ({}),
      isHighLatency: false,
      getSuccessRate: () => 1
    }));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns composed game state and wires lifecycle flags for multiplayer ready flow', () => {
    const { result } = renderHook(() => useGamePageController());

    expect(result.current.resolvedMode).toBe('multiplayer');
    expect(result.current.numPlayers).toBe(2);
    expect(result.current.readyPlayersCount).toBe(2);
    expect(result.current.AchievementIcon).toBeTypeOf('function');
    expect(result.current.multiplayerWinner).toBe('P1');

    const lifecycleArgs = lifecycleEffectsMock.mock.calls[0][0];
    expect(lifecycleArgs.allMultiplayerPlayersReady).toBe(true);
    expect(lifecycleArgs.hasActiveSession).toBe(true);
  });

  it('handles continue navigation and starts game on non-multiplayer any-key input', () => {
    mockRouteState = {
      resolvedMode: 'classic',
      resolvedDifficulty: 'medium',
      resolvedPlayerCount: 1,
      resolvedBonusFoodEnabled: false
    };

    const { result } = renderHook(() => useGamePageController());

    act(() => {
      result.current.handleContinue();
    });
    expect(playClickMock).toHaveBeenCalledOnce();
    expect(setShowGameOverModalMock).toHaveBeenCalledWith(false);
    expect(navigateMock).toHaveBeenCalledWith('/game');
    expect(useGameExitHandlersResult.bypassNavigationGuardRef.current).toBe(true);

    act(() => {
      vi.runAllTimers();
    });
    expect(useGameExitHandlersResult.bypassNavigationGuardRef.current).toBe(false);

    const inputOptions = gameInputFactoryMock.mock.calls[0][0];
    act(() => {
      inputOptions.onAnyKey();
    });
    expect(startGameMock).toHaveBeenCalledOnce();
  });
});
