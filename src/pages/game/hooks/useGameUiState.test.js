import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import toast from 'react-hot-toast';
import { useGameUiState } from './useGameUiState.js';

const playClickMock = vi.fn();

vi.mock('@/utils/sound.js', () => ({
  playClick: (...args) => playClickMock(...args)
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

describe('useGameUiState', () => {
  beforeEach(() => {
    playClickMock.mockClear();
    toast.success.mockClear();
    toast.error.mockClear();
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      writable: true,
      value: undefined
    });
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      writable: true,
      value: undefined
    });
  });

  it('resets game-over and collision ui on restart', () => {
    const restartGame = vi.fn();
    const { result } = renderHook(() => useGameUiState({
      restartGame,
      resolvedMode: 'classic',
      score: 123
    }));

    act(() => {
      result.current.setShowGameOverModal(true);
      result.current.setShowCollisionHighlight(true);
      result.current.handleRestart();
    });

    expect(playClickMock).toHaveBeenCalledOnce();
    expect(restartGame).toHaveBeenCalledOnce();
    expect(result.current.showGameOverModal).toBe(false);
    expect(result.current.showCollisionHighlight).toBe(false);
  });

  it('shares with native share api when available', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      writable: true,
      value: share
    });

    const { result } = renderHook(() => useGameUiState({
      restartGame: vi.fn(),
      resolvedMode: 'vsai',
      score: 456
    }));

    await act(async () => {
      await result.current.handleShareScore();
    });

    expect(share).toHaveBeenCalledOnce();
    expect(toast.success).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('falls back to clipboard and handles unsupported/error branches', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      writable: true,
      value: { writeText }
    });

    const { result } = renderHook(() => useGameUiState({
      restartGame: vi.fn(),
      resolvedMode: 'classic',
      score: 789
    }));

    await act(async () => {
      await result.current.handleShareScore();
    });
    expect(writeText).toHaveBeenCalledOnce();
    expect(toast.success).toHaveBeenCalledWith('Score copied to clipboard');

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      writable: true,
      value: undefined
    });
    await act(async () => {
      await result.current.handleShareScore();
    });
    expect(toast.error).toHaveBeenCalledWith('Sharing not supported on this device');

    Object.defineProperty(navigator, 'share', {
      configurable: true,
      writable: true,
      value: vi.fn().mockRejectedValue(new Error('share failed'))
    });
    await act(async () => {
      await result.current.handleShareScore();
    });
    expect(toast.error).toHaveBeenCalledWith('Unable to share score');
  });
});
