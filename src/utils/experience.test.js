import { describe, expect, it } from 'vitest';
import {
  MAX_PLAYER_LEVEL,
  calculateGameXpGain,
  getLevelFromXp,
  getXpProgress,
  getXpRequiredForLevel
} from './experience.js';

describe('experience utils', () => {
  it('computes progressive level thresholds', () => {
    expect(getXpRequiredForLevel(1)).toBe(0);
    expect(getXpRequiredForLevel(2)).toBeGreaterThan(0);
    expect(getXpRequiredForLevel(10)).toBeGreaterThan(getXpRequiredForLevel(9));
  });

  it('caps level at max level', () => {
    const hugeXp = 99999999;
    expect(getLevelFromXp(hugeXp)).toBe(MAX_PLAYER_LEVEL);
  });

  it('returns progress data for mid-level player', () => {
    const xp = getXpRequiredForLevel(6) + 30;
    const progress = getXpProgress(xp);

    expect(progress.level).toBe(6);
    expect(progress.xpIntoLevel).toBe(30);
    expect(progress.progressPercent).toBeGreaterThanOrEqual(0);
    expect(progress.progressPercent).toBeLessThanOrEqual(100);
    expect(progress.isMaxLevel).toBe(false);
  });

  it('awards higher XP for impossible VS AI wins than normal classic losses', () => {
    const classicLossXp = calculateGameXpGain({
      mode: 'classic',
      duration: 30,
      foodEaten: 3,
      score: 80,
      victory: false
    });

    const impossibleWinXp = calculateGameXpGain({
      mode: 'vsai',
      difficulty: 'impossible',
      duration: 120,
      foodEaten: 14,
      score: 760,
      victory: true
    });

    expect(impossibleWinXp).toBeGreaterThan(classicLossXp);
  });
});
