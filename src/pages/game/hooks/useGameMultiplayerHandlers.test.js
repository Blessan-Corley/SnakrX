import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { GAME_STATES } from '@/utils/gameUtils.js';
import { useGameMultiplayerHandlers } from './useGameMultiplayerHandlers.js';

describe('useGameMultiplayerHandlers', () => {
  it('tracks ready players and directions in multiplayer ready state', () => {
    const updateSnakeDirection = vi.fn();
    const { result } = renderHook(() => useGameMultiplayerHandlers({
      gameStatus: GAME_STATES.READY,
      isMultiplayerMode: true,
      numPlayers: 2,
      updateSnakeDirection
    }));

    act(() => {
      result.current.handleMultiplayerReadyInput(0, { x: 1, y: 0 });
    });

    expect(result.current.multiplayerReadyPlayers).toEqual({ 0: true });
    expect(result.current.multiplayerReadyDirectionRef.current.get(0)).toEqual({ x: 1, y: 0 });

    act(() => {
      result.current.handleMultiplayerReadyInput(0, { x: 0, y: 1 });
      result.current.handleMultiplayerReadyInput(9, { x: 0, y: 1 });
    });

    expect(result.current.multiplayerReadyPlayers).toEqual({ 0: true });
    expect(result.current.multiplayerReadyDirectionRef.current.get(0)).toEqual({ x: 0, y: 1 });
  });

  it('ignores ready input outside multiplayer-ready mode and forwards normal direction changes', () => {
    const updateSnakeDirection = vi.fn();
    const { result, rerender } = renderHook((props) => useGameMultiplayerHandlers(props), {
      initialProps: {
        gameStatus: GAME_STATES.PLAYING,
        isMultiplayerMode: false,
        numPlayers: 2,
        updateSnakeDirection
      }
    });

    act(() => {
      result.current.handleMultiplayerReadyInput(1, { x: 0, y: 1 });
    });
    expect(result.current.multiplayerReadyPlayers).toEqual({});

    act(() => {
      result.current.handleDirectionChange(1, { x: -1, y: 0 });
    });
    expect(updateSnakeDirection).toHaveBeenCalledWith(1, { x: -1, y: 0 });

    rerender({
      gameStatus: GAME_STATES.READY,
      isMultiplayerMode: true,
      numPlayers: 2,
      updateSnakeDirection
    });

    act(() => {
      result.current.handleDirectionChange(1, { x: 0, y: -1 });
    });
    expect(updateSnakeDirection).toHaveBeenCalledTimes(1);
  });
});
