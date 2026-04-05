// @vitest-environment node
import { describe, expect, it } from 'vitest';
import timeUtilsModule from './timeUtils.js';

const timeUtils = timeUtilsModule.default ?? timeUtilsModule;

describe('timeUtils', () => {
  it('converts supported timestamp shapes into millis', () => {
    expect(timeUtils.toMillis()).toBe(0);
    expect(timeUtils.toMillis(1234)).toBe(1234);
    expect(timeUtils.toMillis({ toMillis: () => 4567 })).toBe(4567);
    expect(timeUtils.toMillis({ seconds: 9 })).toBe(9000);
    expect(timeUtils.toMillis('2026-03-17T00:00:00.000Z')).toBe(Date.parse('2026-03-17T00:00:00.000Z'));
    expect(timeUtils.toMillis('not-a-date')).toBe(0);
  });

  it('derives ISO week parts and keys across year boundaries', () => {
    expect(timeUtils.getIsoWeekParts(new Date(Date.UTC(2026, 0, 1)))).toEqual({
      year: 2026,
      week: 1
    });
    expect(timeUtils.getIsoWeekKey(new Date(Date.UTC(2025, 11, 29)))).toBe('2026-W01');
    expect(timeUtils.parseWeekKey('2026-W14')).toEqual({
      year: 2026,
      week: 14
    });
    expect(timeUtils.parseWeekKey('broken')).toBeNull();
  });

  it('builds the previous-week window and detects sequential week keys', () => {
    const result = timeUtils.getPreviousWeekWindow(new Date(Date.UTC(2026, 2, 18, 9, 30)));

    expect(result.weekKey).toBe('2026-W11');
    expect(result.startMs).toBe(Date.UTC(2026, 2, 9, 0, 0, 0, 0));
    expect(result.endMs).toBe(Date.UTC(2026, 2, 16, 0, 0, 0, 0));
    expect(result.startTimestamp.toMillis()).toBe(result.startMs);
    expect(result.endTimestamp.toMillis()).toBe(result.endMs);

    expect(timeUtils.isPreviousIsoWeekKey('2026-W11', '2026-W12')).toBe(true);
    expect(timeUtils.isPreviousIsoWeekKey('2020-W53', '2021-W01')).toBe(true);
    expect(timeUtils.isPreviousIsoWeekKey('2026-W10', '2026-W12')).toBe(false);
    expect(timeUtils.isPreviousIsoWeekKey('broken', '2026-W12')).toBe(false);
  });
});
