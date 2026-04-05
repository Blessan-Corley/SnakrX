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

const {
  buildAchievementStateFromProfile,
  mergePendingCollectedAchievements
} = __private__;

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

describe('mergePendingCollectedAchievements', () => {
  it('keeps pending collected achievements marked as collected while profile data is stale', () => {
    const achievementState = {
      recentUnlocks: [
        { id: 'weekly_rank_1', collected: false, timestamp: 2000 }
      ],
      unlockedAchievements: [
        { id: 'weekly_rank_1', collected: false, timestamp: 2000 }
      ],
      uncollectedAchievements: [
        { id: 'weekly_rank_1', collected: false, timestamp: 2000 }
      ]
    };

    const result = mergePendingCollectedAchievements({
      achievementState,
      pendingCollectedIds: ['weekly_rank_1'],
      pendingCollectedSnapshots: new Map([
        ['weekly_rank_1', { id: 'weekly_rank_1', collected: true, timestamp: 2000, points: 120 }]
      ])
    });

    expect(result.unlockedAchievements).toEqual([
      expect.objectContaining({
        id: 'weekly_rank_1',
        collected: true,
        points: 120
      })
    ]);
    expect(result.uncollectedAchievements).toEqual([]);
    expect(result.recentUnlocks).toEqual([]);
  });

  it('preserves pending achievement records even if the refreshed profile temporarily omits them', () => {
    const achievementState = {
      recentUnlocks: [],
      unlockedAchievements: [],
      uncollectedAchievements: []
    };

    const result = mergePendingCollectedAchievements({
      achievementState,
      pendingCollectedIds: ['weekly_top_3'],
      pendingCollectedSnapshots: new Map([
        ['weekly_top_3', { id: 'weekly_top_3', collected: true, timestamp: 1500, title: 'Weekend Podium' }]
      ])
    });

    expect(result.unlockedAchievements).toEqual([
      expect.objectContaining({
        id: 'weekly_top_3',
        collected: true,
        title: 'Weekend Podium'
      })
    ]);
    expect(result.uncollectedAchievements).toEqual([]);
  });
});
