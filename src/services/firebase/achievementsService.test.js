import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockCollectCallable = vi.fn();
const mockUnlockCallable = vi.fn();

vi.mock('./config.js', () => ({
  functions: {},
  httpsCallable: vi.fn((_, name) => {
    if (name === 'collectUserAchievements') return mockCollectCallable;
    if (name === 'unlockUserAchievement') return mockUnlockCallable;
    return vi.fn();
  })
}));

describe('achievementOperations service', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { __private__ } = await import('./achievements.js');
    __private__.resetCallables();
  });

  it('collects achievements through the backend callable', async () => {
    mockCollectCallable.mockResolvedValueOnce({
      data: {
        collectedIds: ['streak_5'],
        achievementPoints: 25
      }
    });

    const { achievementOperations } = await import('./achievements.js');
    const result = await achievementOperations.collectAchievements(['streak_5']);

    expect(mockCollectCallable).toHaveBeenCalledWith({ achievementIds: ['streak_5'] });
    expect(result).toEqual({
      collectedIds: ['streak_5'],
      achievementPoints: 25
    });
  });

  it('unlocks an achievement through the backend callable', async () => {
    mockUnlockCallable.mockResolvedValueOnce({
      data: {
        success: true,
        unlocked: true,
        achievementId: 'first_game'
      }
    });

    const { achievementOperations } = await import('./achievements.js');
    const result = await achievementOperations.unlockAchievement('first_game');

    expect(mockUnlockCallable).toHaveBeenCalledWith({ achievementId: 'first_game' });
    expect(result).toEqual({
      success: true,
      unlocked: true,
      achievementId: 'first_game'
    });
  });
});
