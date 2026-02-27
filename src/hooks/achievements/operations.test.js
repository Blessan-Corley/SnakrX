import { describe, expect, it } from 'vitest';
import { getAchievementById } from '../../data/achievements.js';
import {
  calculateAchievementProgressValue,
  normalizeStatsForAchievementProgress,
  getAchievementProgressSnapshot,
  getAchievementRequirementDetails
} from './progress.js';

describe('Achievement progress normalization', () => {
  it('maps persisted stat fields to achievement fields', () => {
    const normalized = normalizeStatsForAchievementProgress({
      totalGames: 12,
      totalWins: 4,
      bestScore: 350,
      currentWinStreak: 2,
      bestWinStreak: 5
    });

    expect(normalized.games).toBe(12);
    expect(normalized.wins).toBe(4);
    expect(normalized.singleScore).toBe(350);
    expect(normalized.winStreak).toBe(5);
    expect(normalized.totalPlayTime).toBe(0);
  });

  it('normalizes advanced counters used by new achievements', () => {
    const normalized = normalizeStatsForAchievementProgress({
      maxLength: 42,
      moves: 10001,
      closeCalls: 3,
      fastEats: 7,
      totalPlayTime: 4010
    });

    expect(normalized.maxLength).toBe(42);
    expect(normalized.moves).toBe(10001);
    expect(normalized.closeCalls).toBe(3);
    expect(normalized.fastEats).toBe(7);
    expect(normalized.totalPlayTime).toBe(4010);
  });
});

describe('Achievement progress calculation', () => {
  it('computes progress for normal achievements using normalized stats', () => {
    const firstGame = getAchievementById('first_game');
    expect(calculateAchievementProgressValue(firstGame, { totalGames: 1 })).toBe(100);
    expect(calculateAchievementProgressValue(firstGame, { totalGames: 0 })).toBe(0);
  });

  it('computes progress for AI achievements without difficulty key blocking progress', () => {
    const aiSlayer = getAchievementById('ai_slayer');
    expect(calculateAchievementProgressValue(aiSlayer, { aiEasyWins: 0 })).toBe(0);
    expect(calculateAchievementProgressValue(aiSlayer, { aiEasyWins: 1 })).toBe(100);
  });

  it('computes progress for impossible AI streak using aiImpossibleStreak', () => {
    const godAchievement = getAchievementById('am_i_god');
    expect(calculateAchievementProgressValue(godAchievement, { aiImpossibleStreak: 0 })).toBe(0);
    expect(calculateAchievementProgressValue(godAchievement, { aiImpossibleStreak: 3 })).toBe(100);
  });

  it('uses four-player multiplayer wins for last snake standing', () => {
    const lastSnakeStanding = getAchievementById('last_snake_standing');
    expect(calculateAchievementProgressValue(lastSnakeStanding, { multiplayerWins4Player: 0 })).toBe(0);
    expect(calculateAchievementProgressValue(lastSnakeStanding, { multiplayerWins4Player: 1 })).toBe(100);
  });

  it('returns progress snapshot with current and target counts', () => {
    const foodHunter = getAchievementById('food_hunter_platinum');
    const snapshot = getAchievementProgressSnapshot(foodHunter, { foodEaten: 435 });

    expect(snapshot.current).toBe(435);
    expect(snapshot.target).toBe(5000);
    expect(snapshot.percentage).toBe(9);
  });

  it('builds requirement details for numeric and condition-based requirements', () => {
    const aiHunter = getAchievementById('ai_hunter');
    const details = getAchievementRequirementDetails(aiHunter, { aiMediumWins: 1 });

    expect(details).toEqual([
      expect.objectContaining({
        key: 'aiWins',
        label: 'AI wins',
        type: 'numeric',
        current: 1,
        target: 1,
        percentage: 100
      }),
      expect.objectContaining({
        key: 'difficulty',
        label: 'Difficulty',
        type: 'condition',
        displayValue: 'Medium'
      })
    ]);
  });

  it('keeps ladder-style achievements grouped and leaves mixed weekly achievements standalone', () => {
    expect(getAchievementById('score_master').chainId).toBe('total_score_climb');
    expect(getAchievementById('point_millionaire').chainId).toBe('total_score_climb');

    expect(getAchievementById('survivor').chainId).toBe('survival_marathon');
    expect(getAchievementById('immortal').chainId).toBe('survival_marathon');

    expect(getAchievementById('sniper').chainId).toBe('fast_hands');
    expect(getAchievementById('quick_hands').chainId).toBe('fast_hands');

    expect(getAchievementById('close_call').chainId).toBe('close_call_artist');
    expect(getAchievementById('danger_dancer').chainId).toBe('close_call_artist');

    expect(getAchievementById('weekly_top_100').chainId).toBe('weekly_rank_ladder');
    expect(getAchievementById('weekly_rank_1').chainId).toBe('weekly_rank_ladder');
    expect(getAchievementById('weekly_overall_top_10').chainId).toBeUndefined();
    expect(getAchievementById('weekly_podium_streak').chainId).toBeUndefined();
  });
});
