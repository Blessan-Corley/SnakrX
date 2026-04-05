import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useGameInput } from './useGameInput.js';
import { DIRECTIONS } from '../utils/gameUtils.js';

const mockPlayClick = vi.fn();

vi.mock('../utils/sound.js', () => ({
  playClick: (...args) => mockPlayClick(...args)
}));

const dispatchKeyboard = (target, type, { code, key }) => {
  const event = new KeyboardEvent(type, {
    bubbles: true,
    cancelable: true,
    code,
    key
  });
  target.dispatchEvent(event);
  return event;
};

describe('useGameInput', () => {
  let now;
  let nowSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    now = 100;
    nowSpy = vi.spyOn(performance, 'now').mockImplementation(() => now);
    Object.defineProperty(navigator, 'vibrate', {
      configurable: true,
      value: vi.fn()
    });
  });

  afterEach(() => {
    nowSpy.mockRestore();
  });

  it('handles keyboard direction and control keys with duplicate keydown protection', () => {
    const onDirectionChange = vi.fn();
    const onPauseToggle = vi.fn();
    const onRestart = vi.fn();
    const onQuit = vi.fn();
    const onAnyKey = vi.fn();
    const onPlayerInput = vi.fn();

    const { result } = renderHook(() => useGameInput({
      onDirectionChange,
      onPauseToggle,
      onRestart,
      onQuit,
      onAnyKey,
      onPlayerInput
    }));

    dispatchKeyboard(window, 'keydown', { code: 'ArrowUp', key: 'ArrowUp' });
    dispatchKeyboard(window, 'keydown', { code: 'ArrowUp', key: 'ArrowUp' });
    dispatchKeyboard(window, 'keyup', { code: 'ArrowUp', key: 'ArrowUp' });

    dispatchKeyboard(window, 'keydown', { code: 'Space', key: ' ' });
    dispatchKeyboard(window, 'keyup', { code: 'Space', key: ' ' });
    dispatchKeyboard(window, 'keydown', { code: 'KeyR', key: 'r' });
    dispatchKeyboard(window, 'keyup', { code: 'KeyR', key: 'r' });
    dispatchKeyboard(window, 'keydown', { code: 'Escape', key: 'Escape' });

    expect(onAnyKey).toHaveBeenCalledTimes(5);
    expect(onPlayerInput).toHaveBeenCalledTimes(1);
    expect(onPlayerInput).toHaveBeenCalledWith(0, expect.objectContaining({
      code: 'ArrowUp',
      direction: DIRECTIONS.UP
    }));
    expect(onDirectionChange).toHaveBeenCalledTimes(1);
    expect(onDirectionChange).toHaveBeenCalledWith(0, DIRECTIONS.UP);
    expect(onPauseToggle).toHaveBeenCalledTimes(1);
    expect(onRestart).toHaveBeenCalledTimes(1);
    expect(onQuit).toHaveBeenCalledTimes(1);
    expect(mockPlayClick).toHaveBeenCalledTimes(3);

    const perf = result.current.getInputPerformance();
    expect(perf.totalInputs).toBe(4);
    expect(perf.processedInputs).toBe(4);
    expect(perf.keysDown).toBe(1);
    expect(result.current.getSuccessRate()).toBe(1);
  });

  it('ignores key input from typing targets', () => {
    const onDirectionChange = vi.fn();
    const onAnyKey = vi.fn();

    renderHook(() => useGameInput({ onDirectionChange, onAnyKey }));

    const input = document.createElement('input');
    document.body.appendChild(input);

    dispatchKeyboard(input, 'keydown', { code: 'ArrowUp', key: 'ArrowUp' });

    expect(onAnyKey).not.toHaveBeenCalled();
    expect(onDirectionChange).not.toHaveBeenCalled();

    input.remove();
  });

  it('clears active key state on blur and removes listeners on unmount', () => {
    const onDirectionChange = vi.fn();
    const { result, unmount } = renderHook(() => useGameInput({ onDirectionChange }));

    dispatchKeyboard(window, 'keydown', { code: 'ArrowLeft', key: 'ArrowLeft' });
    expect(result.current.getInputPerformance().keysDown).toBe(1);

    window.dispatchEvent(new Event('blur'));
    expect(result.current.getInputPerformance().keysDown).toBe(0);
    expect(result.current.getInputPerformance().keyStates).toBe(0);

    unmount();
    dispatchKeyboard(window, 'keydown', { code: 'ArrowRight', key: 'ArrowRight' });
    expect(onDirectionChange).toHaveBeenCalledTimes(1);
  });

  it('maps players based on multiplayer keysets', () => {
    const { result } = renderHook(() => useGameInput({ playerCount: 3 }));

    expect(result.current.getPlayerForKey('KeyW', 'w')).toBe(0);
    expect(result.current.getPlayerForKey('ArrowUp', 'ArrowUp')).toBe(1);
    expect(result.current.getPlayerForKey('KeyI', 'i')).toBe(2);
    expect(result.current.getPlayerForKey('Numpad8', 'Numpad8')).toBe(-1);

    const mappings = result.current.getCurrentKeyMappings();
    expect(mappings).toEqual([
      expect.objectContaining({ playerId: 0, keys: 'WASD' }),
      expect.objectContaining({ playerId: 1, keys: 'Arrow Keys' }),
      expect.objectContaining({ playerId: 2, keys: 'IJKL' })
    ]);
  });

  it('maps arrow keys to the single human player when shared single-player keys are enabled', () => {
    const { result } = renderHook(() => useGameInput({
      playerCount: 2,
      sharedSinglePlayerKeys: true
    }));

    expect(result.current.getPlayerForKey('KeyW', 'w')).toBe(0);
    expect(result.current.getPlayerForKey('ArrowUp', 'ArrowUp')).toBe(0);

    const mappings = result.current.getCurrentKeyMappings();
    expect(mappings).toEqual([
      expect.objectContaining({ playerId: 0, keys: 'WASD or Arrow Keys' }),
      expect.objectContaining({ playerId: 1, keys: 'AI Controlled' })
    ]);
  });

  it('handles touch controls and swipe gestures with throttling', () => {
    const onDirectionChange = vi.fn();
    const { result } = renderHook(() => useGameInput({ onDirectionChange }));

    act(() => {
      now = 100;
      result.current.handleTouchControl(DIRECTIONS.LEFT);
      now = 110;
      result.current.handleTouchControl(DIRECTIONS.RIGHT);
    });

    expect(onDirectionChange).toHaveBeenCalledTimes(1);
    expect(onDirectionChange).toHaveBeenLastCalledWith(0, DIRECTIONS.LEFT);

    act(() => {
      now = 200;
      result.current.onTouchStart({
        preventDefault: vi.fn(),
        touches: [{ clientX: 140, clientY: 100 }]
      });
      now = 280;
      result.current.onTouchEnd({
        preventDefault: vi.fn(),
        changedTouches: [{ clientX: 90, clientY: 100 }]
      });
    });

    expect(onDirectionChange).toHaveBeenCalledTimes(2);
    expect(onDirectionChange).toHaveBeenLastCalledWith(0, DIRECTIONS.LEFT);
    expect(mockPlayClick).toHaveBeenCalledTimes(2);
    expect(result.current.getInputPerformance().processedInputs).toBe(2);
  });
});
