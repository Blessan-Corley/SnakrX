// @vitest-environment node
import { beforeAll, describe, expect, it } from 'vitest';

let gamesPrivate;

beforeAll(async () => {
  const gamesModule = await import('./games.js');
  gamesPrivate = (gamesModule.default ?? gamesModule).__private__;
});

describe('games helpers', () => {
  it('clamps requested limits', () => {
    expect(gamesPrivate.clampLimit(undefined)).toBe(8);
    expect(gamesPrivate.clampLimit(0)).toBe(1);
    expect(gamesPrivate.clampLimit(99)).toBe(12);
  });

  it('builds deterministic game document ids', () => {
    const one = gamesPrivate.getGameDocumentId('user-1', 'game-abc');
    const two = gamesPrivate.getGameDocumentId('user-1', 'game-abc');
    const three = gamesPrivate.getGameDocumentId('user-1', 'game-other');

    expect(one).toBe(two);
    expect(one).toMatch(/^game_[a-f0-9]{40}$/);
    expect(three).not.toBe(one);
  });

  it('normalizes valid session payloads', () => {
    const session = gamesPrivate.normalizeSessionPayload({
      gameId: 'game-1',
      mode: 'vsai',
      difficulty: 'medium',
      result: 'won',
      duration: 45,
      score: 900,
      foodEaten: 12,
      speedReached: 3,
      playerCount: 1,
      maxLength: 15,
      startedAt: 1000,
      endedAt: 5000,
      stats: {
        moves: 100,
        maxLength: 15,
        averageSpeed: 2.5,
        efficiency: 75
      }
    }, 'user-1');

    expect(session).toMatchObject({
      gameId: 'game-1',
      userId: 'user-1',
      mode: 'vsai',
      difficulty: 'medium',
      score: 900,
      foodEaten: 12,
      speedReached: 3,
      result: 'won',
      stats: {
        moves: 100,
        maxLength: 15,
        averageSpeed: 2.5,
        efficiency: 75
      }
    });
    expect(session.startedAt.toMillis()).toBe(1000);
    expect(session.endedAt.toMillis()).toBe(5000);
  });

  it('rejects invalid modes and timestamps', () => {
    expect(() => gamesPrivate.normalizeSessionPayload({
      gameId: 'game-1',
      mode: 'broken',
      result: 'won',
      startedAt: 1000,
      endedAt: 2000
    }, 'user-1')).toThrow(/Invalid game mode/);

    expect(() => gamesPrivate.normalizeSessionPayload({
      gameId: 'game-1',
      mode: 'classic',
      result: 'won',
      startedAt: 5000,
      endedAt: 2000
    }, 'user-1')).toThrow(/timestamps are invalid/i);
  });
});
