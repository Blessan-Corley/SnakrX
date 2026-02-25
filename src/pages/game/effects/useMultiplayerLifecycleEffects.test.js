import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GAME_STATES } from '@/utils/gameUtils.js';
import { useMultiplayerLifecycleEffects } from './useMultiplayerLifecycleEffects.js';

describe('useMultiplayerLifecycleEffects', () => {
  let multiplayerReadyDirectionRef;
  let multiplayerStartTriggeredRef;
  let setMultiplayerReadyPlayers;
  let startGame;
  let updateSnakeDirection;

  beforeEach(() => {
    multiplayerReadyDirectionRef = { current: new Map([[0, { x: 1, y: 0 }]]) };
    multiplayerStartTriggeredRef = { current: false };
    setMultiplayerReadyPlayers = vi.fn();
    startGame = vi.fn();
    updateSnakeDirection = vi.fn();
  });

  it('resets multiplayer state when mode is disabled or fresh ready state starts', () => {
    const { rerender } = renderHook((props) => useMultiplayerLifecycleEffects(props), {
      initialProps: {
        allMultiplayerPlayersReady: false,
        gameStatus: GAME_STATES.PLAYING,
        isMultiplayerMode: false,
        multiplayerReadyDirectionRef,
        multiplayerStartTriggeredRef,
        setMultiplayerReadyPlayers,
        startGame,
        updateSnakeDirection
      }
    });

    expect(setMultiplayerReadyPlayers).toHaveBeenCalledWith({});
    expect(multiplayerReadyDirectionRef.current.size).toBe(0);
    expect(multiplayerStartTriggeredRef.current).toBe(false);

    multiplayerReadyDirectionRef.current = new Map([[1, { x: 0, y: 1 }]]);
    rerender({
      allMultiplayerPlayersReady: false,
      gameStatus: GAME_STATES.READY,
      isMultiplayerMode: true,
      multiplayerReadyDirectionRef,
      multiplayerStartTriggeredRef,
      setMultiplayerReadyPlayers,
      startGame,
      updateSnakeDirection
    });

    expect(setMultiplayerReadyPlayers).toHaveBeenCalledWith({});
    expect(multiplayerReadyDirectionRef.current.size).toBe(0);
  });

  it('starts multiplayer game once when all players are ready', () => {
    const { rerender } = renderHook((props) => useMultiplayerLifecycleEffects(props), {
      initialProps: {
        allMultiplayerPlayersReady: false,
        gameStatus: GAME_STATES.READY,
        isMultiplayerMode: true,
        multiplayerReadyDirectionRef,
        multiplayerStartTriggeredRef,
        setMultiplayerReadyPlayers,
        startGame,
        updateSnakeDirection
      }
    });

    multiplayerReadyDirectionRef.current = new Map([
      [0, { x: 1, y: 0 }],
      [1, { x: 0, y: -1 }]
    ]);
    rerender({
      allMultiplayerPlayersReady: true,
      gameStatus: GAME_STATES.READY,
      isMultiplayerMode: true,
      multiplayerReadyDirectionRef,
      multiplayerStartTriggeredRef,
      setMultiplayerReadyPlayers,
      startGame,
      updateSnakeDirection
    });

    expect(multiplayerStartTriggeredRef.current).toBe(true);
    expect(updateSnakeDirection).toHaveBeenCalledWith(0, { x: 1, y: 0 });
    expect(updateSnakeDirection).toHaveBeenCalledWith(1, { x: 0, y: -1 });
    expect(startGame).toHaveBeenCalledTimes(1);

    rerender({
      allMultiplayerPlayersReady: true,
      gameStatus: GAME_STATES.READY,
      isMultiplayerMode: true,
      multiplayerReadyDirectionRef,
      multiplayerStartTriggeredRef,
      setMultiplayerReadyPlayers,
      startGame,
      updateSnakeDirection
    });

    expect(startGame).toHaveBeenCalledTimes(1);
  });
});
