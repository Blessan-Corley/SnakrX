import { describe, expect, it } from 'vitest';
import {
  formatEntryTimestamp,
  GAME_MODES_FILTERS,
  resolveLeaderboardMode
} from './leaderboardConfig.js';

describe('leaderboardConfig', () => {
  it('resolves selected mode or falls back to first mode', () => {
    const overall = resolveLeaderboardMode('overall_total');
    expect(overall.id).toBe('overall_total');

    const fallback = resolveLeaderboardMode('not-real-mode');
    expect(fallback).toEqual(GAME_MODES_FILTERS[0]);
  });

  it('formats timestamps from firestore timestamp-like objects', () => {
    const result = formatEntryTimestamp({
      toDate: () => new Date('2026-03-01T10:30:00Z')
    });

    expect(result).not.toBe('Recently');
  });

  it('returns Recently for invalid values', () => {
    expect(formatEntryTimestamp(null)).toBe('Recently');
    expect(formatEntryTimestamp('invalid-date')).toBe('Recently');
  });
});
