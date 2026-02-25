import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useGameSessionGuardEffects } from './useGameSessionGuardEffects.js';

const useBeforeUnloadMock = vi.fn();

vi.mock('react-router-dom', () => ({
  useBeforeUnload: (...args) => useBeforeUnloadMock(...args)
}));

const baseProps = () => ({
  bypassNavigationGuardRef: { current: false },
  hasActiveSession: true,
  leaveConfirmState: { isOpen: false },
  location: { pathname: '/game', search: '?mode=classic' },
  pauseGame: vi.fn(),
  requestLeaveConfirmation: vi.fn(),
  showAchievementModal: false,
  visibilityPauseRef: { current: false }
});

describe('useGameSessionGuardEffects', () => {
  beforeEach(() => {
    useBeforeUnloadMock.mockReset();
  });

  it('pauses session for modal visibility and page visibility changes', () => {
    const props = baseProps();
    const { rerender } = renderHook((currentProps) => useGameSessionGuardEffects(currentProps), {
      initialProps: props
    });

    rerender({
      ...props,
      leaveConfirmState: { isOpen: true }
    });
    expect(props.pauseGame).toHaveBeenCalled();

    Object.defineProperty(document, 'hidden', {
      configurable: true,
      value: true
    });
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(props.visibilityPauseRef.current).toBe(true);

    Object.defineProperty(document, 'hidden', {
      configurable: true,
      value: false
    });
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
      window.dispatchEvent(new Event('focus'));
    });
    expect(props.visibilityPauseRef.current).toBe(false);
  });

  it('guards internal link clicks and browser back navigation', () => {
    const props = baseProps();
    renderHook(() => useGameSessionGuardEffects(props));

    const anchor = document.createElement('a');
    anchor.href = '/leaderboard?period=weekly';
    const child = document.createElement('span');
    anchor.appendChild(child);
    document.body.appendChild(anchor);

    act(() => {
      child.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }));
    });
    expect(props.requestLeaveConfirmation).toHaveBeenCalledWith('/leaderboard?period=weekly');

    const pushStateSpy = vi.spyOn(window.history, 'pushState');
    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(pushStateSpy).toHaveBeenCalled();
    expect(props.requestLeaveConfirmation).toHaveBeenCalledWith('__BACK__');
    pushStateSpy.mockRestore();
  });

  it('registers before-unload protection only for active sessions', () => {
    const activeProps = baseProps();
    renderHook(() => useGameSessionGuardEffects(activeProps));

    const unloadCb = useBeforeUnloadMock.mock.calls[0][0];
    const event = { preventDefault: vi.fn(), returnValue: undefined };
    unloadCb(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.returnValue).toBe('');

    useBeforeUnloadMock.mockReset();
    renderHook(() => useGameSessionGuardEffects({
      ...activeProps,
      hasActiveSession: false
    }));

    const inactiveUnloadCb = useBeforeUnloadMock.mock.calls[0][0];
    const inactiveEvent = { preventDefault: vi.fn(), returnValue: undefined };
    inactiveUnloadCb(inactiveEvent);
    expect(inactiveEvent.preventDefault).not.toHaveBeenCalled();
  });
});
