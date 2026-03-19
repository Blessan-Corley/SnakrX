import { describe, expect, it } from 'vitest';
import {
  buildMembershipSummary,
  formatDateTime,
  formatGameModeLabel,
  mapGamesToHistory,
  toDate
} from './publicProfileUtils.js';

describe('publicProfileUtils', () => {
  it('converts supported timestamp inputs to Date', () => {
    const fromFirestoreLike = toDate({ seconds: 1700000000 });
    const fromMillis = toDate(1700000000000);

    expect(fromFirestoreLike).toBeInstanceOf(Date);
    expect(fromMillis).toBeInstanceOf(Date);
  });

  it('returns null for unsupported timestamp values', () => {
    expect(toDate(undefined)).toBeNull();
    expect(toDate({})).toBeNull();
  });

  it('builds a compact membership summary', () => {
    const createdAt = new Date(Date.now() - (1000 * 60 * 60 * 24 * 430));
    const summary = buildMembershipSummary(createdAt);
    expect(summary).toMatch(/[0-9]+[ymd]/);
  });

  it('maps modes and recent game history safely', () => {
    expect(formatGameModeLabel('vsai', 'impossible')).toContain('VS AI');
    expect(formatGameModeLabel('classic_transparent')).toBe('Classic Transparent');

    const history = mapGamesToHistory([
      {
        id: 'g1',
        mode: 'multiplayer',
        score: 100,
        duration: 45,
        result: 'won',
        xpGained: 66,
        endedAt: 1700000000000
      },
      {
        id: 'g2',
        mode: 'classic',
        score: 200,
        duration: 60,
        foodEaten: 4,
        result: 'completed',
        endedAt: 1700001000000
      }
    ]);

    expect(history[0]).toMatchObject({
      id: 'g1',
      mode: 'Multiplayer',
      score: 100,
      time: 45,
      xpGained: 66,
      result: 'victory'
    });
    expect(history[1]).toMatchObject({
      id: 'g2',
      xpGained: 25,
      result: 'completed'
    });
  });

  it('formats datetime output with fallback', () => {
    expect(formatDateTime(null)).toBe('Unknown');
    expect(formatDateTime(new Date('2026-03-05T10:00:00Z'))).toContain('/');
  });
});
