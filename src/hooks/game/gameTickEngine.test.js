import { describe, expect, it } from 'vitest';
import { GAME_MODES, GAME_STATES } from '../../utils/gameUtils.js';
import { buildUpdatedStateFromTick, resolveGameOutcome } from './gameTickEngine.js';

describe('gameTickEngine', () => {
  it('marks classic game over when player snake is dead', () => {
    const result = resolveGameOutcome({
      gameMode: GAME_MODES.CLASSIC,
      newSnakes: [{ id: 0, isAlive: false, body: [{ x: 1, y: 1 }] }]
    });

    expect(result).toEqual({ gameEnded: true, victory: false });
  });

  it('marks multiplayer victory when only one snake is alive', () => {
    const result = resolveGameOutcome({
      gameMode: GAME_MODES.MULTIPLAYER,
      newSnakes: [
        { id: 0, isAlive: true, body: [{ x: 1, y: 1 }], score: 20 },
        { id: 1, isAlive: false, body: [{ x: 2, y: 1 }], score: 10 }
      ]
    });

    expect(result).toEqual({ gameEnded: true, victory: true });
  });

  it('updates state to vs-ai game over with ai winner when ai has higher score', () => {
    const next = buildUpdatedStateFromTick({
      currentTimestamp: 10000,
      events: [],
      gameEnded: true,
      gameStartTime: 0,
      newSnakes: [
        { id: 0, isAlive: false, body: [{ x: 1, y: 1 }], score: 40 },
        { id: 1, isAlive: true, body: [{ x: 2, y: 1 }], score: 70 }
      ],
      normalFoodsSinceBonus: 0,
      pendingBonusSpawns: 0,
      prev: {
        gameMode: GAME_MODES.VS_AI,
        difficulty: 'medium',
        gameState: GAME_STATES.PLAYING,
        isPaused: false,
        score: 0,
        foodEaten: 0,
        speed: 180,
        wallHits: 0,
        selfHits: 0,
        closeCalls: 0,
        fastEats: 0,
        bonusFoodsCollected: 0,
        bonusFoodPoints: 0,
        snakes: [],
        food: []
      },
      resolvedFood: [],
      victory: false
    });

    expect(next.gameState).toBe(GAME_STATES.GAME_OVER);
    expect(next.winnerId).toBe(1);
    expect(next.score).toBe(40);
  });
});
