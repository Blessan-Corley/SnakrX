import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useGameLifecycleEffects } from './useGameLifecycleEffects.js';

const multiplayerEffectsMock = vi.fn();
const initializationEffectMock = vi.fn();
const sessionGuardEffectMock = vi.fn();
const uiEffectsMock = vi.fn();

vi.mock('./effects/useMultiplayerLifecycleEffects.js', () => ({
  useMultiplayerLifecycleEffects: (args) => multiplayerEffectsMock(args)
}));

vi.mock('./effects/useGameInitializationEffect.js', () => ({
  useGameInitializationEffect: (args) => initializationEffectMock(args)
}));

vi.mock('./effects/useGameSessionGuardEffects.js', () => ({
  useGameSessionGuardEffects: (args) => sessionGuardEffectMock(args)
}));

vi.mock('./effects/useGameUiEffects.js', () => ({
  useGameUiEffects: (args) => uiEffectsMock(args)
}));

describe('useGameLifecycleEffects', () => {
  beforeEach(() => {
    multiplayerEffectsMock.mockReset();
    initializationEffectMock.mockReset();
    sessionGuardEffectMock.mockReset();
    uiEffectsMock.mockReset();
  });

  it('delegates to sub-effect hooks with expected argument slices', () => {
    const props = {
      allMultiplayerPlayersReady: true,
      bypassNavigationGuardRef: { current: false },
      gameStatus: 'ready',
      getSuccessRate: vi.fn(),
      hasActiveSession: true,
      initializeGame: vi.fn(),
      isHighLatency: vi.fn(),
      isMultiplayerMode: true,
      lastShownAchievementRef: { current: '' },
      leaveConfirmState: { isOpen: false },
      location: { pathname: '/game', search: '' },
      multiplayerReadyDirectionRef: { current: new Map() },
      multiplayerStartTriggeredRef: { current: false },
      pauseGame: vi.fn(),
      quitToMenu: vi.fn(),
      recentUnlocks: [],
      requestLeaveConfirmation: vi.fn(),
      resolvedBonusFoodEnabled: true,
      resolvedDifficulty: 'hard',
      resolvedMode: 'multiplayer',
      resolvedPlayerCount: 2,
      setInputWarning: vi.fn(),
      setLoading: vi.fn(),
      setMultiplayerReadyPlayers: vi.fn(),
      setNewAchievement: vi.fn(),
      setShowAchievementModal: vi.fn(),
      setShowCollisionHighlight: vi.fn(),
      setShowGameOverModal: vi.fn(),
      setShowPerformanceMonitor: vi.fn(),
      showAchievementModal: false,
      showPerformanceMonitor: true,
      startGame: vi.fn(),
      updateSnakeDirection: vi.fn(),
      visibilityPauseRef: { current: false }
    };

    renderHook(() => useGameLifecycleEffects(props));

    expect(multiplayerEffectsMock).toHaveBeenCalledWith(expect.objectContaining({
      allMultiplayerPlayersReady: true,
      gameStatus: 'ready'
    }));
    expect(initializationEffectMock).toHaveBeenCalledWith(expect.objectContaining({
      resolvedMode: 'multiplayer',
      resolvedPlayerCount: 2
    }));
    expect(sessionGuardEffectMock).toHaveBeenCalledWith(expect.objectContaining({
      hasActiveSession: true,
      leaveConfirmState: { isOpen: false }
    }));
    expect(uiEffectsMock).toHaveBeenCalledWith(expect.objectContaining({
      gameStatus: 'ready',
      showPerformanceMonitor: true
    }));
  });
});
