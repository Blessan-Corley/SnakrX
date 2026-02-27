import { describe, expect, it } from 'vitest';
import {
  getAchievementStatsSnapshot,
  getCompletionPercentageFromAchievements,
  getNextAchievementsFromCatalog,
  getTotalPointsEarnedFromAchievements
} from './operationUtils.js';

const catalog = [
  { id: 'first_game', tier: 'common', category: 'gameplay', points: 5 },
  { id: 'score_250', tier: 'rare', category: 'score', points: 20 },
  { id: 'score_5000', tier: 'legendary', category: 'score', points: 100 }
];

const tiers = {
  common: { name: 'Common' },
  rare: { name: 'Rare' },
  legendary: { name: 'Legendary' }
};

const categories = {
  gameplay: { name: 'Gameplay' },
  score: { name: 'Score' }
};

describe('operationUtils', () => {
  it('computes completion and collected points', () => {
    const unlocked = [
      { id: 'first_game', collected: true },
      { id: 'score_250', collected: false }
    ];

    expect(getCompletionPercentageFromAchievements(catalog, unlocked)).toBe(66);
    expect(getTotalPointsEarnedFromAchievements(unlocked)).toBe(5);
  });

  it('builds tier and category stats snapshot', () => {
    const unlocked = [{ id: 'score_250', collected: true }];
    const stats = getAchievementStatsSnapshot({
      achievementCategories: categories,
      achievementTiers: tiers,
      achievements: catalog,
      unlockedAchievements: unlocked
    });

    expect(stats.unlocked).toBe(1);
    expect(stats.byTier.rare.unlocked).toBe(1);
    expect(stats.byCategory.score.unlocked).toBe(1);
  });

  it('returns next achievements ordered by tier rank', () => {
    const unlocked = [{ id: 'score_5000', collected: true }];
    const next = getNextAchievementsFromCatalog({
      achievements: catalog,
      unlockedAchievements: unlocked,
      limit: 2
    });

    expect(next.map((item) => item.id)).toEqual(['first_game', 'score_250']);
  });
});
