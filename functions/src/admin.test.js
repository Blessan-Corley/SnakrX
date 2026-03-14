// @vitest-environment node
import { beforeAll, describe, expect, it } from 'vitest';

let adminPrivate;

const createDocSnap = (id, data) => ({
  id,
  data: () => data
});

beforeAll(async () => {
  const adminModule = await import('./admin.js');
  adminPrivate = (adminModule.default ?? adminModule).__private__;
});

describe('admin helpers', () => {
  it('clamps limits into the supported range', () => {
    expect(adminPrivate.clampLimit(undefined, 50, 200)).toBe(50);
    expect(adminPrivate.clampLimit(0, 50, 200)).toBe(1);
    expect(adminPrivate.clampLimit(999, 50, 200)).toBe(200);
  });

  it('builds pagination metadata from page, limit, and next-page presence', () => {
    expect(adminPrivate.buildPagination(2, 25, true)).toEqual({
      page: 2,
      limit: 25,
      hasNext: true,
      hasPrev: true
    });
  });

  it('maps admin users into sanitized list items', () => {
    const user = adminPrivate.mapAdminUser(createDocSnap('user-1', {
      username: '  alpha ',
      displayName: ' Alpha ',
      email: 'alpha@example.com',
      role: 'admin',
      banned: true,
      banReason: ' testing ',
      createdAt: { toMillis: () => 1000 },
      lastActiveAt: { toMillis: () => 2000 },
      stats: {
        bestScore: 500,
        totalGames: 12,
        totalScore: 2000,
        achievementPoints: 90,
        achievements: [{ id: 'one' }, { id: 'two' }]
      }
    }));

    expect(user).toMatchObject({
      id: 'user-1',
      username: 'alpha',
      displayName: 'Alpha',
      banned: true,
      banReason: 'testing',
      stats: {
        bestScore: 500,
        totalGames: 12,
        achievementsCompleted: 2
      }
    });
  });

  it('maps admin games into normalized records', () => {
    const game = adminPrivate.mapAdminGame(createDocSnap('game-1', {
      userId: ' user-1 ',
      username: ' alpha ',
      mode: ' vsai ',
      difficulty: ' medium ',
      playerCount: 2.8,
      score: 900,
      duration: 45,
      foodEaten: 12,
      speedReached: 3,
      result: ' won ',
      xpGained: 88,
      endedAt: { toMillis: () => 5000 }
    }));

    expect(game).toMatchObject({
      id: 'game-1',
      userId: 'user-1',
      username: 'alpha',
      mode: 'vsai',
      difficulty: 'medium',
      playerCount: 2.8,
      xpGained: 88,
      result: 'won',
      endedAt: 5000
    });
  });

  it('derives admin game xp gain for legacy records without stored xp', () => {
    const game = adminPrivate.mapAdminGame(createDocSnap('game-2', {
      mode: 'classic',
      score: 200,
      duration: 60,
      foodEaten: 4,
      result: 'completed'
    }));

    expect(game).toMatchObject({
      id: 'game-2',
      xpGained: 25
    });
  });

  it('normalizes users filters into a stable backend contract', () => {
    expect(adminPrivate.normalizeUsersFilters({
      search: '  Alpha  ',
      role: 'ADMIN',
      bannedState: 'banned',
      activityWindow: '7d',
      sortBy: 'bestScore_desc'
    })).toEqual({
      search: 'alpha',
      role: 'admin',
      bannedState: 'banned',
      activityWindow: '7d',
      sortBy: 'bestScore_desc'
    });
  });

  it('matches users against text, role, ban, and activity filters', () => {
    const user = {
      id: 'user-2',
      username: 'alpha',
      displayName: 'Alpha',
      email: 'alpha@example.com',
      role: 'admin',
      banned: true,
      lastActiveAt: Date.UTC(2026, 2, 18)
    };

    expect(adminPrivate.matchesUserFilters(user, adminPrivate.normalizeUsersFilters({
      search: 'alp',
      role: 'admin',
      bannedState: 'banned',
      activityWindow: '7d'
    }), Date.UTC(2026, 2, 19))).toBe(true);

    expect(adminPrivate.matchesUserFilters(user, adminPrivate.normalizeUsersFilters({
      bannedState: 'active'
    }), Date.UTC(2026, 2, 19))).toBe(false);
  });

  it('normalizes and matches game filters including score ranges', () => {
    const filters = adminPrivate.normalizeGamesFilters({
      search: ' alpha ',
      mode: 'vsai',
      result: 'won',
      minScore: '500',
      maxScore: '900',
      period: '30d',
      sortBy: 'score_desc'
    });

    expect(filters).toEqual({
      search: 'alpha',
      mode: 'vsai',
      result: 'won',
      minScore: 500,
      maxScore: 900,
      period: '30d',
      sortBy: 'score_desc'
    });

    expect(adminPrivate.matchesGameFilters({
      id: 'game-4',
      userId: 'user-4',
      username: 'alpha',
      mode: 'vsai',
      result: 'won',
      score: 700,
      createdAt: Date.UTC(2026, 2, 10)
    }, filters, Date.UTC(2026, 2, 19))).toBe(true);

    expect(adminPrivate.matchesGameFilters({
      id: 'game-5',
      userId: 'user-5',
      username: 'beta',
      mode: 'classic',
      result: 'completed',
      score: 300,
      createdAt: Date.UTC(2026, 2, 10)
    }, filters, Date.UTC(2026, 2, 19))).toBe(false);
  });

  it('normalizes and matches support ticket filters', () => {
    const filters = adminPrivate.normalizeSupportTicketFilters({
      search: 'sync',
      status: 'open',
      priority: 'urgent',
      unreadOnly: true,
      period: '30d',
      sortBy: 'updatedAt_desc'
    });

    expect(filters).toEqual({
      search: 'sync',
      status: 'open',
      priority: 'urgent',
      unreadOnly: true,
      period: '30d',
      sortBy: 'updatedAt_desc'
    });

    expect(adminPrivate.matchesSupportTicketFilters({
      id: 'ticket-1',
      title: 'Score sync issue',
      email: 'player@example.com',
      displayName: 'Player One',
      username: 'player1',
      category: 'score_sync',
      status: 'open',
      priority: 'urgent',
      customerUnreadUpdate: true,
      updatedAt: Date.UTC(2026, 2, 15)
    }, filters, Date.UTC(2026, 2, 19))).toBe(true);

    expect(adminPrivate.matchesSupportTicketFilters({
      id: 'ticket-2',
      title: 'Password reset',
      status: 'resolved',
      priority: 'normal',
      customerUnreadUpdate: false,
      updatedAt: Date.UTC(2026, 2, 15)
    }, filters, Date.UTC(2026, 2, 19))).toBe(false);
  });
});
