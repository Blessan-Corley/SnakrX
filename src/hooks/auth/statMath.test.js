import { describe, expect, it } from 'vitest';
import { applyStatUpdates } from './statMath.js';

describe('applyStatUpdates', () => {
  it('increments counters and preserves max-based stats correctly', () => {
    const current = {
      totalGames: 10,
      totalWins: 4,
      bestScore: 200,
      maxSpeed: 2,
      maxLength: 20
    };

    const next = applyStatUpdates(current, {
      totalGames: 1,
      totalWins: 1,
      bestScore: 180,
      maxSpeed: 3,
      maxLength: 15
    });

    expect(next.totalGames).toBe(11);
    expect(next.totalWins).toBe(5);
    expect(next.bestScore).toBe(200);
    expect(next.maxSpeed).toBe(3);
    expect(next.maxLength).toBe(20);
  });

  it('sets currentWinStreak directly', () => {
    const next = applyStatUpdates({ currentWinStreak: 4 }, { currentWinStreak: 0 });
    expect(next.currentWinStreak).toBe(0);
  });

  it('sets aiImpossibleStreak directly', () => {
    const next = applyStatUpdates({ aiImpossibleStreak: 3 }, { aiImpossibleStreak: 0 });
    expect(next.aiImpossibleStreak).toBe(0);
  });

  it('treats timestamp-like fields as replacements, not accumulators', () => {
    const next = applyStatUpdates(
      { bestScoreAt: 1700000000000, lastGameAt: 1700000000100 },
      { bestScoreAt: 1700000000500, lastGameAt: 1700000000800 }
    );

    expect(next.bestScoreAt).toBe(1700000000500);
    expect(next.lastGameAt).toBe(1700000000800);
  });

  it('keeps level as max and lastGameDuration as latest value', () => {
    const next = applyStatUpdates(
      { level: 8, lastGameDuration: 120 },
      { level: 7, lastGameDuration: 45 }
    );

    expect(next.level).toBe(8);
    expect(next.lastGameDuration).toBe(45);
  });
});
