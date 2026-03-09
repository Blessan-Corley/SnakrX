import { describe, expect, it } from 'vitest';
import {
  countNormalFoodEvents,
  countSnakeBonusFoodEvents,
  countSnakeBonusFoodPoints,
  countSnakeFoodEvents,
  getTrackedMaxLength,
  shouldRecordQuickDeath
} from './progress.js';

describe('game progress helpers', () => {
  it('counts food events only for the requested snake', () => {
    const events = [
      { type: 'MOVE', snakeId: 0 },
      { type: 'EAT', snakeId: 1 },
      { type: 'EAT', snakeId: 0 },
      { type: 'EAT', snakeId: 2 },
      { type: 'EAT', snakeId: 0 }
    ];

    expect(countSnakeFoodEvents(events, 0)).toBe(2);
    expect(countSnakeFoodEvents(events, 1)).toBe(1);
    expect(countSnakeFoodEvents(events, 3)).toBe(0);
  });

  it('tracks normal and bonus food events separately', () => {
    const events = [
      { type: 'EAT', snakeId: 0 },
      { type: 'BONUS_EAT', snakeId: 0, points: 35 },
      { type: 'BONUS_EAT', snakeId: 1, points: 21 },
      { type: 'EAT', snakeId: 2 }
    ];

    expect(countNormalFoodEvents(events)).toBe(2);
    expect(countSnakeBonusFoodEvents(events, 0)).toBe(1);
    expect(countSnakeBonusFoodEvents(events, 1)).toBe(1);
    expect(countSnakeBonusFoodPoints(events, 0)).toBe(35);
    expect(countSnakeBonusFoodPoints(events, 2)).toBe(0);
  });

  it('prefers tracked max length over the current snake body length', () => {
    expect(getTrackedMaxLength({
      maxLengthReached: 9,
      snakes: [{ body: [{}, {}, {}] }]
    })).toBe(9);

    expect(getTrackedMaxLength({
      maxLengthReached: 0,
      snakes: [{ body: [{}, {}, {}, {}] }]
    })).toBe(4);
  });

  it('records quick deaths only for short non-victory sessions', () => {
    expect(shouldRecordQuickDeath({
      victory: false,
      gameTime: 3,
      thresholdSeconds: 5
    })).toBe(true);

    expect(shouldRecordQuickDeath({
      victory: true,
      gameTime: 3,
      thresholdSeconds: 5
    })).toBe(false);

    expect(shouldRecordQuickDeath({
      victory: false,
      gameTime: 8,
      thresholdSeconds: 5
    })).toBe(false);
  });
});
