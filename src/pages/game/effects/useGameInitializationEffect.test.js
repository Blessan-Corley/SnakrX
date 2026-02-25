import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useGameInitializationEffect } from './useGameInitializationEffect.js';

const saveLastPlayedModeMock = vi.fn();

vi.mock('../../../utils/gamePreferences.js', () => ({
  saveLastPlayedMode: (...args) => saveLastPlayedModeMock(...args)
}));

const createDeferred = () => {
  let resolve;
  const promise = new Promise((res) => {
    resolve = res;
  });
  return { promise, resolve };
};

describe('useGameInitializationEffect', () => {
  beforeEach(() => {
    saveLastPlayedModeMock.mockReset();
  });

  it('stores mode preferences, initializes game, and clears loading when resolved', async () => {
    const setLoading = vi.fn();
    const initializeGame = vi.fn().mockResolvedValue(undefined);

    renderHook(() => useGameInitializationEffect({
      initializeGame,
      resolvedBonusFoodEnabled: true,
      resolvedDifficulty: 'hard',
      resolvedMode: 'vsai',
      resolvedPlayerCount: 2,
      setLoading
    }));

    expect(setLoading).toHaveBeenCalledWith(true);
    expect(saveLastPlayedModeMock).toHaveBeenCalledWith({
      mode: 'vsai',
      difficulty: 'hard',
      playerCount: 2,
      bonusFoodEnabled: true
    });
    expect(initializeGame).toHaveBeenCalledWith('vsai', 'hard', 2, true);

    await act(async () => {
      await Promise.resolve();
    });
    expect(setLoading).toHaveBeenCalledWith(false);
  });

  it('does not clear loading state after unmount', async () => {
    const deferred = createDeferred();
    const setLoading = vi.fn();
    const initializeGame = vi.fn(() => deferred.promise);

    const { unmount } = renderHook(() => useGameInitializationEffect({
      initializeGame,
      resolvedBonusFoodEnabled: false,
      resolvedDifficulty: null,
      resolvedMode: 'classic',
      resolvedPlayerCount: 1,
      setLoading
    }));

    unmount();
    await act(async () => {
      deferred.resolve();
      await deferred.promise;
    });

    expect(setLoading).toHaveBeenCalledTimes(1);
    expect(setLoading).toHaveBeenCalledWith(true);
  });
});
