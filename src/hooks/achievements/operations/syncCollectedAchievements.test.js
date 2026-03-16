import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockCollectAchievements = vi.fn();
const mockUnlockAchievement = vi.fn();

vi.mock('@/services/firebase/index.js', () => ({
  auth: {
    currentUser: { uid: 'user-1' }
  }
}));

vi.mock('@/services/firebase/achievements.js', () => ({
  achievementOperations: {
    collectAchievements: (...args) => mockCollectAchievements(...args),
    unlockAchievement: (...args) => mockUnlockAchievement(...args)
  }
}));

vi.mock('@/utils/logger.js', () => ({
  default: {
    error: vi.fn(),
    log: vi.fn(),
    warn: vi.fn()
  }
}));

import { syncCollectedAchievementsWithTransaction } from './syncCollectedAchievements.js';

describe('syncCollectedAchievementsWithTransaction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ensures missing achievement records exist before collecting them', async () => {
    mockCollectAchievements.mockResolvedValueOnce({
      collectedIds: ['first_game'],
      achievementPoints: 5
    });

    const result = await syncCollectedAchievementsWithTransaction({
      achievements: [
        {
          id: 'first_game',
          collected: false,
          isPersisted: false,
          unlockedAt: 1000,
          timestamp: 1000
        }
      ],
      transformAchievements: (currentAchievements) => ({
        success: true,
        updated: currentAchievements.map((achievement) => ({ ...achievement, collected: true }))
      })
    });

    expect(mockCollectAchievements).toHaveBeenCalledWith(['first_game']);
    expect(result.success).toBe(true);
    expect(result.collectedIds).toEqual(['first_game']);
    expect(result.updated).toEqual([
      expect.objectContaining({
        id: 'first_game',
        collected: true
      })
    ]);
  });

  it('keeps achievements uncollected when the backend cannot confirm them', async () => {
    mockCollectAchievements.mockResolvedValueOnce({
      collectedIds: [],
      achievementPoints: 0
    });

    const result = await syncCollectedAchievementsWithTransaction({
      achievements: [
        {
          id: 'first_game',
          collected: false,
          isPersisted: false,
          unlockedAt: 1000,
          timestamp: 1000
        }
      ],
      transformAchievements: (currentAchievements) => ({
        success: true,
        updated: currentAchievements.map((achievement) => ({ ...achievement, collected: true }))
      })
    });

    expect(mockCollectAchievements).toHaveBeenCalledWith(['first_game']);
    expect(result.success).toBe(false);
    expect(result.collectedIds).toEqual([]);
    expect(result.updated).toEqual([
      expect.objectContaining({
        id: 'first_game',
        collected: false
      })
    ]);
  });

  it('collects persisted achievements without re-calling unlockAchievement', async () => {
    mockCollectAchievements.mockResolvedValueOnce({
      collectedIds: ['first_game'],
      achievementPoints: 5
    });

    const result = await syncCollectedAchievementsWithTransaction({
      achievements: [
        {
          id: 'first_game',
          collected: false,
          isPersisted: true,
          unlockedAt: 1000,
          timestamp: 1000
        }
      ],
      transformAchievements: (currentAchievements) => ({
        success: true,
        updated: currentAchievements.map((achievement) => ({ ...achievement, collected: true }))
      })
    });

    expect(mockUnlockAchievement).not.toHaveBeenCalled();
    expect(mockCollectAchievements).toHaveBeenCalledWith(['first_game']);
    expect(result.success).toBe(true);
    expect(result.updated).toEqual([
      expect.objectContaining({
        id: 'first_game',
        collected: true,
        isPersisted: true
      })
    ]);
  });

  it('never calls unlockAchievement during collection sync', async () => {
    mockCollectAchievements.mockResolvedValueOnce({
      collectedIds: ['first_game'],
      achievementPoints: 5
    });

    await syncCollectedAchievementsWithTransaction({
      achievements: [
        {
          id: 'first_game',
          collected: false,
          isPersisted: false,
          unlockedAt: 1000,
          timestamp: 1000
        }
      ],
      transformAchievements: (currentAchievements) => ({
        success: true,
        updated: currentAchievements.map((achievement) => ({ ...achievement, collected: true }))
      })
    });

    expect(mockUnlockAchievement).not.toHaveBeenCalled();
  });
});
