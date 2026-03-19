import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { GAME_STATES } from '@/utils/gameUtils.js';
import { useGameExitHandlers } from './useGameExitHandlers.js';

const playClickMock = vi.fn();

vi.mock('@/utils/sound.js', () => ({
  playClick: (...args) => playClickMock(...args)
}));

const createProps = (overrides = {}) => ({
  gameStatus: GAME_STATES.PLAYING,
  isGameOver: false,
  isPaused: false,
  isVictory: false,
  navigate: vi.fn(),
  onExitCleanup: vi.fn(),
  pauseGame: vi.fn(),
  quitToMenu: vi.fn(),
  resumeGame: vi.fn(),
  ...overrides
});

describe('useGameExitHandlers', () => {
  beforeEach(() => {
    playClickMock.mockClear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('requests confirmation and resumes game on cancel when needed', () => {
    const props = createProps();
    const { result } = renderHook(() => useGameExitHandlers(props));

    act(() => {
      result.current.requestLeaveConfirmation('/leaderboard');
    });
    expect(props.pauseGame).toHaveBeenCalledOnce();
    expect(result.current.leaveConfirmState).toEqual({
      isOpen: true,
      targetPath: '/leaderboard'
    });

    act(() => {
      result.current.handleLeaveCancel();
    });
    expect(props.resumeGame).toHaveBeenCalledOnce();
    expect(result.current.leaveConfirmState.isOpen).toBe(false);
  });

  it('quits directly when game is over and confirms back navigation target', () => {
    const props = createProps({ isGameOver: true });
    const { result } = renderHook(() => useGameExitHandlers(props));

    act(() => {
      result.current.handleQuit();
    });
    expect(playClickMock).toHaveBeenCalledOnce();
    expect(props.quitToMenu).toHaveBeenCalledOnce();
    expect(props.navigate).toHaveBeenCalledWith('/');
    props.navigate.mockClear();

    act(() => {
      result.current.requestLeaveConfirmation('__BACK__');
    });
    act(() => {
      result.current.handleLeaveConfirm();
    });
    expect(props.navigate).toHaveBeenCalledWith(-1);
  });

  it('keeps game paused on cancel when page is hidden and routes fallback confirm', () => {
    const props = createProps();
    const { result } = renderHook(() => useGameExitHandlers(props));

    act(() => {
      result.current.requestLeaveConfirmation(null);
      result.current.visibilityPauseRef.current = true;
      result.current.handleLeaveCancel();
    });
    expect(props.resumeGame).not.toHaveBeenCalled();

    act(() => {
      result.current.requestLeaveConfirmation(null);
      result.current.handleLeaveConfirm();
      vi.runAllTimers();
    });
    expect(props.navigate).toHaveBeenCalledWith('/');
  });

  it('opens leave confirmation instead of quitting immediately during active play', () => {
    const props = createProps({
      gameStatus: GAME_STATES.PLAYING,
      isPaused: false
    });
    const { result } = renderHook(() => useGameExitHandlers(props));

    act(() => {
      result.current.handleQuit();
    });

    expect(props.pauseGame).toHaveBeenCalledOnce();
    expect(props.quitToMenu).not.toHaveBeenCalled();
    expect(props.navigate).not.toHaveBeenCalled();
    expect(result.current.leaveConfirmState).toEqual({
      isOpen: true,
      targetPath: '/'
    });
  });

  it('quits directly from the ready state without opening a leave confirmation', () => {
    const props = createProps({
      gameStatus: GAME_STATES.READY
    });
    const { result } = renderHook(() => useGameExitHandlers(props));

    act(() => {
      result.current.handleQuit();
      vi.runAllTimers();
    });

    expect(props.pauseGame).not.toHaveBeenCalled();
    expect(props.onExitCleanup).toHaveBeenCalledOnce();
    expect(props.quitToMenu).toHaveBeenCalledOnce();
    expect(props.navigate).toHaveBeenCalledWith('/');
    expect(result.current.leaveConfirmState).toEqual({
      isOpen: false,
      targetPath: null
    });
  });
});
