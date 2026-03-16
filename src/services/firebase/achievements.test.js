import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockHttpsCallable = vi.fn();

vi.mock('./config.js', () => ({
  functions: {},
  httpsCallable: (...args) => mockHttpsCallable(...args)
}));

describe('achievementOperations', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    const module = await import('./achievements.js');
    module.__private__.resetCallables();
  });

  it('syncs multiple achievements through the batch callable backend', async () => {
    mockHttpsCallable.mockImplementationOnce((_functions, name) => {
      expect(name).toBe('syncUserAchievements');
      return vi.fn().mockImplementation(async (payload) => {
        expect(payload).toEqual({
          achievementIds: ['first_game', 'first_hundred']
        });
        return {
          data: {
            syncedIds: ['first_game', 'first_hundred']
          }
        };
      });
    });

    const { achievementOperations } = await import('./achievements.js');
    const response = await achievementOperations.syncAchievements(['first_game', 'first_hundred']);

    expect(response).toEqual({
      syncedIds: ['first_game', 'first_hundred']
    });
  });
});
