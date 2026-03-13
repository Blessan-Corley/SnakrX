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
      endedAt: { toMillis: () => 5000 }
    }));

    expect(game).toMatchObject({
      id: 'game-1',
      userId: 'user-1',
      username: 'alpha',
      mode: 'vsai',
      difficulty: 'medium',
      playerCount: 2.8,
      result: 'won',
      endedAt: 5000
    });
  });
});
