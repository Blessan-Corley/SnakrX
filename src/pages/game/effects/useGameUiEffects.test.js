import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import { GAME_STATES } from '@/utils/gameUtils.js';
import { useGameUiEffects } from './useGameUiEffects.js';

const buildAchievementStorageKeyMock = vi.fn();
const getLatestPendingAchievementMock = vi.fn();
const recordShownAchievementMock = vi.fn();

vi.mock('../gameSessionUtils.js', () => ({
  buildAchievementStorageKey: (...args) => buildAchievementStorageKeyMock(...args),
  getLatestPendingAchievement: (...args) => getLatestPendingAchievementMock(...args),
  recordShownAchievement: (...args) => recordShownAchievementMock(...args)
}));

const createProps = () => ({
  gameStatus: GAME_STATES.PLAYING,
  getSuccessRate: vi.fn(() => 1),
  isHighLatency: vi.fn(() => false),
  lastShownAchievementRef: { current: '' },
  quitToMenu: vi.fn(),
  recentUnlocks: [],
  setInputWarning: vi.fn(),
  setNewAchievement: vi.fn(),
  setShowAchievementModal: vi.fn(),
  setShowCollisionHighlight: vi.fn(),
  setShowGameOverModal: vi.fn(),
  setShowPerformanceMonitor: vi.fn(),
  showPerformanceMonitor: false
});

describe('useGameUiEffects', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    buildAchievementStorageKeyMock.mockReset();
    getLatestPendingAchievementMock.mockReset();
    recordShownAchievementMock.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows collision and game-over modal sequence for end states', () => {
    const props = createProps();
    props.gameStatus = GAME_STATES.GAME_OVER;

    renderHook(() => useGameUiEffects(props));
    expect(props.setShowCollisionHighlight).toHaveBeenCalledWith(true);

    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(props.setShowGameOverModal).toHaveBeenCalledWith(true);
    expect(props.setShowCollisionHighlight).toHaveBeenCalledWith(false);
  });

  it('manages body touch lock and calls quitToMenu on cleanup', () => {
    const props = createProps();
    const previousOverflow = document.body.style.overflow;
    const previousTouchAction = document.body.style.touchAction;
    const { unmount } = renderHook(() => useGameUiEffects(props));

    expect(document.body.style.overflow).toBe('hidden');
    expect(document.body.style.touchAction).toBe('none');

    const touchEvent = new Event('touchmove', { cancelable: true });
    const preventDefault = vi.spyOn(touchEvent, 'preventDefault');
    act(() => {
      document.dispatchEvent(touchEvent);
    });
    expect(preventDefault).toHaveBeenCalled();

    unmount();
    expect(props.quitToMenu).toHaveBeenCalled();
    expect(document.body.style.overflow).toBe(previousOverflow);
    expect(document.body.style.touchAction).toBe(previousTouchAction);
  });

  it('shows latest pending achievement once when storage allows', () => {
    const props = createProps();
    const achievement = { id: 'a1', collected: false };
    props.recentUnlocks = [achievement];
    buildAchievementStorageKeyMock.mockReturnValue('a1-key');
    getLatestPendingAchievementMock.mockReturnValue(achievement);
    recordShownAchievementMock.mockReturnValue(true);

    const { rerender } = renderHook((currentProps) => useGameUiEffects(currentProps), {
      initialProps: props
    });

    expect(props.setNewAchievement).toHaveBeenCalledWith(achievement);
    expect(props.setShowAchievementModal).toHaveBeenCalledWith(true);

    rerender(props);
    expect(props.setNewAchievement).toHaveBeenCalledTimes(1);
  });

  it('updates input warning and performance monitor toggle in development', () => {
    const props = createProps();
    props.showPerformanceMonitor = true;
    props.isHighLatency = vi.fn(() => true);

    renderHook(() => useGameUiEffects(props));
    if (import.meta.env.DEV) {
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      expect(props.setInputWarning).toHaveBeenCalledWith('High input latency detected');

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyP', shiftKey: true }));
      });
      expect(props.setShowPerformanceMonitor).toHaveBeenCalled();
    }
  });

  it('handles dropped-input warnings and clears warning when monitor is disabled', () => {
    const props = createProps();
    props.showPerformanceMonitor = true;
    props.isHighLatency = vi.fn(() => false);
    props.getSuccessRate = vi.fn(() => 0.3);

    const { rerender } = renderHook((currentProps) => useGameUiEffects(currentProps), {
      initialProps: props
    });

    if (import.meta.env.DEV) {
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      expect(props.setInputWarning).toHaveBeenCalledWith('Input drops detected');
    }

    rerender({
      ...props,
      showPerformanceMonitor: false
    });
    expect(props.setInputWarning).toHaveBeenCalledWith(null);
  });
});
