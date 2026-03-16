// @vitest-environment node
import { beforeAll, describe, expect, it } from 'vitest';

let achievementPrivate;

beforeAll(async () => {
  const achievementModule = await import('./achievements.js');
  achievementPrivate = (achievementModule.default ?? achievementModule).__private__;
});

describe('achievement helpers', () => {
  it('collects existing persisted achievements and eligible missing achievements in one pass', () => {
    const result = achievementPrivate.resolveCollectedAchievements({
      currentStats: {
        totalGames: 1,
        bestScore: 120,
        achievements: [
          {
            id: 'first_game',
            collected: false,
            unlockedAt: 1000,
            timestamp: 1000
          }
        ]
      },
      achievementIds: ['first_game', 'first_hundred']
    });

    expect(result.collectedIds).toEqual(['first_game', 'first_hundred']);
    expect(result.nextStats.achievementPoints).toBe(15);
    expect(result.nextStats.achievements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'first_game', collected: true }),
        expect.objectContaining({ id: 'first_hundred', collected: true })
      ])
    );
  });

  it('syncs missing eligible achievements without marking them collected', () => {
    const result = achievementPrivate.resolveUnlockedAchievements({
      currentStats: {
        totalGames: 1,
        bestScore: 120,
        achievements: []
      },
      achievementIds: ['first_game', 'first_hundred']
    });

    expect(result.syncedIds).toEqual(['first_game', 'first_hundred']);
    expect(result.nextStats.achievements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'first_game', collected: false }),
        expect.objectContaining({ id: 'first_hundred', collected: false })
      ])
    );
  });
});
