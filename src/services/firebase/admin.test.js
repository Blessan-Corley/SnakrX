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
      return vi.fn().mockImplementation(async (payload) => {
        expect(payload).toEqual({
          page: 2,
          limit: 25,
          filters: {
            search: 'alpha',
            role: 'admin'
          }
        });
        return {
          data: {
            users: [{ id: 'u-1', username: 'tester' }],
            pagination: {
              page: 2,
              limit: 25,
              hasNext: true,
              hasPrev: true
            }
          }
        };
      });
    });

    const { adminOperations } = await import('./admin.js');
    const users = await adminOperations.getUsers({
      page: 2,
      limit: 25,
      filters: {
        search: 'alpha',
        role: 'admin'
      }
    });

    expect(users).toEqual({
      users: [{ id: 'u-1', username: 'tester' }],
      pagination: {
        page: 2,
        limit: 25,
        hasNext: true,
        hasPrev: true
      }
    });
  });

  it('loads recent admin games through the callable backend', async () => {
    mockHttpsCallable.mockImplementationOnce((_functions, name) => {
      expect(name).toBe('listAdminGames');
      return vi.fn().mockImplementation(async (payload) => {
        expect(payload).toEqual({
          page: 1,
          limit: 10,
          filters: {
            mode: 'vsai',
            minScore: 500
          }
        });
        return {
          data: {
            games: [{ id: 'g-1', score: 120 }],
            pagination: {
              page: 1,
              limit: 10,
              hasNext: false,
              hasPrev: false
            }
          }
        };
      });
    });

    const { adminOperations } = await import('./admin.js');
    const games = await adminOperations.getRecentGames({
      page: 1,
      limit: 10,
      filters: {
        mode: 'vsai',
        minScore: 500
      }
    });

    expect(games).toEqual({
      games: [{ id: 'g-1', score: 120 }],
      pagination: {
        page: 1,
        limit: 10,
        hasNext: false,
        hasPrev: false
      }
    });
  });

  it('loads the admin overview through the callable backend', async () => {
    mockHttpsCallable.mockImplementationOnce((_functions, name) => {
      expect(name).toBe('getAdminOverview');
      return vi.fn().mockResolvedValue({
        data: {
          overview: {
            totalUsers: 15,
            activeUsers: 8
          }
        }
      });
    });

    const { adminOperations } = await import('./admin.js');
    const overview = await adminOperations.getOverview();

    expect(overview).toEqual({
      totalUsers: 15,
      activeUsers: 8
    });
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

  it('loads filtered support tickets through the callable backend', async () => {
    mockHttpsCallable.mockImplementationOnce((_functions, name) => {
      expect(name).toBe('listAdminSupportTickets');
      return vi.fn().mockImplementation(async (payload) => {
        expect(payload).toEqual({
          page: 3,
          limit: 15,
          filters: {
            status: 'open',
            priority: 'urgent',
            unreadOnly: true
          }
        });
        return {
          data: {
            tickets: [{ id: 'ticket-7', status: 'open' }],
            pagination: {
              page: 3,
              limit: 15,
              hasNext: true,
              hasPrev: true
            },
            summary: {
              open: 9,
              needsReply: 4,
              resolved: 2
            }
          }
        };
      });
    });

    const { adminOperations } = await import('./admin.js');
    const response = await adminOperations.getSupportTickets({
      page: 3,
      limit: 15,
      filters: {
        status: 'open',
        priority: 'urgent',
        unreadOnly: true
      }
    });

    expect(response).toEqual({
      tickets: [{ id: 'ticket-7', status: 'open' }],
      pagination: {
        page: 3,
        limit: 15,
        hasNext: true,
        hasPrev: true
      },
      summary: {
        open: 9,
        needsReply: 4,
        resolved: 2
      }
    });
  });
});
