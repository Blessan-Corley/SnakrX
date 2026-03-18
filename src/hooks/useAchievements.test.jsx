import { describe, expect, it, vi } from 'vitest';

vi.mock('../services/firebase/achievements.js', () => ({
  achievementOperations: {
    unlockAchievement: vi.fn()
  }
}));

vi.mock('./achievements/operations.js', () => ({
  useAchievementOperations: vi.fn()
}));

import { __private__ } from './useAchievements.js';

const { buildAchievementStateFromProfile } = __private__;

describe('buildAchievementStateFromProfile', () => {
  it('derives eligible unlocked achievements when stats are ahead of stored records', () => {
    const result = buildAchievementStateFromProfile({
      createdAt: Date.now(),
      stats: {
        totalGames: 1,
        bestScore: 120,
        achievements: []
      }
    });

    expect(result.unlockedAchievements.map((achievement) => achievement.id)).toEqual(
      expect.arrayContaining(['first_game', 'first_hundred'])
    );
    expect(result.unlockedAchievements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'first_game', isPersisted: false }),
        expect.objectContaining({ id: 'first_hundred', isPersisted: false })
      ])
    );
    expect(result.uncollectedAchievements.map((achievement) => achievement.id)).toEqual(
      expect.arrayContaining(['first_game', 'first_hundred'])
    );
    expect(result.missingAchievementIds).toEqual(
      expect.arrayContaining(['first_game', 'first_hundred'])
    );
  });

  it('preserves stored collected achievements without re-deriving them', () => {
    const result = buildAchievementStateFromProfile({
      createdAt: Date.now(),
      stats: {
        totalGames: 3,
        achievements: [
          {
            id: 'first_game',
            collected: true,
            unlockedAt: 1234,
            timestamp: 1234
          }
        ]
      }
    });

    expect(result.unlockedAchievements).toEqual([
      expect.objectContaining({
        id: 'first_game',
        collected: true,
        isPersisted: true,
        timestamp: 1234,
        unlockedAt: 1234
      })
    ]);
    expect(result.uncollectedAchievements).toEqual([]);
    expect(result.missingAchievementIds).toEqual([]);
  });
});
