import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GAME_STATES } from './constants.js';
import { useGameAutoSaveEffect } from './useGameAutoSaveEffect.js';

const { playVictoryMock } = vi.hoisted(() => ({
  playVictoryMock: vi.fn()
}));

vi.mock('../../utils/sound.js', () => ({
  playVictory: playVictoryMock
}));

vi.mock('../../utils/logger.js', () => ({
  default: {
    log: vi.fn(),
    error: vi.fn()
  }
}));

describe('useGameAutoSaveEffect', () => {
  const user = { uid: 'user-1' };

  beforeEach(() => {
    playVictoryMock.mockReset();
  });

  it('saves once per completed game outcome key', async () => {
    const saveGameData = vi.fn().mockResolvedValue(undefined);
    const props = {
      gameId: 'game-1',
      gameScore: 32,
      gameStatus: GAME_STATES.GAME_OVER,
      saveGameData,
      user
    };

    const { rerender } = renderHook((currentProps) => useGameAutoSaveEffect(currentProps), {
      initialProps: props
    });

    await waitFor(() => expect(saveGameData).toHaveBeenCalledTimes(1));

    rerender({ ...props });
    await waitFor(() => expect(saveGameData).toHaveBeenCalledTimes(1));

    rerender({ ...props, gameId: 'game-2' });
    await waitFor(() => expect(saveGameData).toHaveBeenCalledTimes(2));
  });

  it('plays victory sound for victory outcome', async () => {
    const saveGameData = vi.fn().mockResolvedValue(undefined);

    renderHook((currentProps) => useGameAutoSaveEffect(currentProps), {
      initialProps: {
        gameId: 'game-1',
        gameScore: 12,
        gameStatus: GAME_STATES.VICTORY,
        saveGameData,
        user
      }
    });

    await waitFor(() => expect(saveGameData).toHaveBeenCalledTimes(1));
    expect(playVictoryMock).toHaveBeenCalledTimes(1);
  });

  it('retries save after a failed auto-save attempt', async () => {
    const saveGameData = vi.fn()
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValue(undefined);
    const props = {
      gameId: 'game-3',
      gameScore: 25,
      gameStatus: GAME_STATES.GAME_OVER,
      saveGameData,
      user
    };

    const { rerender } = renderHook((currentProps) => useGameAutoSaveEffect(currentProps), {
      initialProps: props
    });

    await waitFor(() => expect(saveGameData).toHaveBeenCalledTimes(1));

    rerender({ ...props, gameScore: 26 });
    await waitFor(() => expect(saveGameData).toHaveBeenCalledTimes(2));
  });
});
