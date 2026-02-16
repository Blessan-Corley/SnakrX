import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockHttpsCallable = vi.fn();

vi.mock('./config.js', () => ({
  functions: {},
  httpsCallable: (...args) => mockHttpsCallable(...args)
}));

vi.mock('../../utils/logger.js', () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    log: vi.fn()
  }
}));

describe('adminOperations', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    const module = await import('./admin.js');
    module.__private__.resetCallables();
  });

  it('loads admin users through the callable backend', async () => {
    mockHttpsCallable.mockImplementationOnce((_functions, name) => {
      expect(name).toBe('listAdminUsers');
      return vi.fn().mockResolvedValue({
        data: {
          users: [{ id: 'u-1', username: 'tester' }]
        }
      });
    });

    const { adminOperations } = await import('./admin.js');
    const users = await adminOperations.getUsers(25);

    expect(users).toEqual([{ id: 'u-1', username: 'tester' }]);
  });

  it('loads recent admin games through the callable backend', async () => {
    mockHttpsCallable.mockImplementationOnce(() => vi.fn().mockResolvedValue({
      data: {
        games: [{ id: 'g-1', score: 120 }]
      }
    }));

    const { adminOperations } = await import('./admin.js');
    const games = await adminOperations.getRecentGames(10);

    expect(games).toEqual([{ id: 'g-1', score: 120 }]);
  });

  it('updates user moderation state through the callable backend', async () => {
    mockHttpsCallable.mockImplementationOnce(() => vi.fn().mockResolvedValue({
      data: {
        user: { id: 'u-9', banned: true, banReason: 'Administrative action' }
      }
    }));

    const { adminOperations } = await import('./admin.js');
    const user = await adminOperations.setUserBanState('u-9', true);

    expect(user).toEqual({
      id: 'u-9',
      banned: true,
      banReason: 'Administrative action'
    });
  });
});
