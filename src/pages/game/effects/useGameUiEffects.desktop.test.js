import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/utils/gameUtils.js', () => ({
  GAME_STATES: {
    PLAYING: 'playing',
    GAME_OVER: 'game_over',
    VICTORY: 'victory'
  },
  isMobile: () => false
}));

vi.mock('../gameSessionUtils.js', () => ({
  buildAchievementStorageKey: vi.fn(),
  getLatestPendingAchievement: vi.fn(() => null),
  recordShownAchievement: vi.fn(() => true)
}));

import { useGameUiEffects } from './useGameUiEffects.js';

const createProps = () => ({
  gameStatus: 'playing',
  getSuccessRate: vi.fn(() => 1),
  isHighLatency: vi.fn(() => false),
  lastShownAchievementRef: { current: '' },
  recentUnlocks: [],
  setInputWarning: vi.fn(),
  setNewAchievement: vi.fn(),
  setShowAchievementModal: vi.fn(),
  setShowCollisionHighlight: vi.fn(),
  setShowGameOverModal: vi.fn(),
  setShowPerformanceMonitor: vi.fn(),
  showPerformanceMonitor: false
});

describe('useGameUiEffects desktop scroll behavior', () => {
  beforeEach(() => {
    document.body.style.overflow = 'auto';
    document.body.style.touchAction = 'auto';
  });

  it('does not lock document scrolling on desktop', () => {
    renderHook(() => useGameUiEffects(createProps()));

    expect(document.body.style.overflow).toBe('auto');
    expect(document.body.style.touchAction).toBe('auto');
  });
});
