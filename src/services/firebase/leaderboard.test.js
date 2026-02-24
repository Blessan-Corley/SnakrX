import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetDocument = vi.fn();
const mockGetDocs = vi.fn();
const mockCallableFactory = vi.fn();
const mockCallable = vi.fn();

const createSnapshot = (docs = []) => ({
  docs,
  forEach: (callback) => {
    docs.forEach((doc) => callback(doc));
  }
});

vi.mock('./config.js', () => ({
  db: {},
  functions: {},
  httpsCallable: (...args) => mockCallableFactory(...args),
  doc: vi.fn((_, collectionName, id) => ({ path: `${collectionName}/${id}` })),
  collection: vi.fn((_, collectionName) => ({ path: collectionName })),
  getDocs: (...args) => mockGetDocs(...args),
  query: vi.fn((...args) => ({ args })),
  where: vi.fn((...args) => ({ type: 'where', args })),
  orderBy: vi.fn((field, direction) => ({ type: 'orderBy', field, direction })),
  limit: vi.fn((value) => ({ type: 'limit', value })),
  COLLECTIONS: {
    LEADERBOARDS: 'leaderboards',
    USERS: 'users',
    PUBLIC_PROFILES: 'publicProfiles',
    WEEKLY_LEADERBOARDS: 'weeklyLeaderboards'
  }
}));

vi.mock('firebase/firestore', () => ({
  documentId: vi.fn(() => '__name__')
}));

vi.mock('./firestore.js', () => ({
  firestoreOperations: {
    getDocument: (...args) => mockGetDocument(...args)
  }
}));

vi.mock('../../utils/logger.js', () => ({
  default: {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}));

describe('leaderboardOperations.updateLeaderboard', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    mockCallableFactory.mockReturnValue(mockCallable);
    mockCallable.mockResolvedValue({ data: { success: true } });
    mockGetDocs.mockResolvedValue(createSnapshot());

    const module = await import('./leaderboard/updateLeaderboard.js');
    module.__private__.resetCallables();
  });

  it('delegates leaderboard writes to the callable backend endpoint', async () => {
    const { leaderboardOperations } = await import('./leaderboard.js');

    const ok = await leaderboardOperations.updateLeaderboard('u1', {
      gameId: 'game-doc-1'
    });

    expect(ok).toBe(true);
    expect(mockCallableFactory).toHaveBeenCalledWith({}, 'upsertLeaderboardEntry');
    expect(mockCallable).toHaveBeenCalledWith({
      gameId: 'game-doc-1'
    });
  });

  it('returns false when the backend leaderboard update fails', async () => {
    mockCallable.mockRejectedValueOnce(new Error('backend failed'));
    const { leaderboardOperations } = await import('./leaderboard.js');

    const ok = await leaderboardOperations.updateLeaderboard('u9', {
      gameId: 'game-doc-9'
    });

    expect(ok).toBe(false);
  });

  it('builds achievement leaderboard ranked by points with tie-breakers', async () => {
    mockGetDocs.mockResolvedValueOnce(createSnapshot([
      {
        id: 'u2',
        data: () => ({
          username: 'beta',
          stats: {
            achievementPoints: 120,
            achievementsCompleted: 7
          },
          updatedAt: 1710000000000
        })
      },
      {
        id: 'u1',
        data: () => ({
          displayName: 'alpha',
          stats: {
            achievementPoints: 120,
            achievementsCompleted: 10
          },
          updatedAt: 1710000001000
        })
      },
      {
        id: 'u3',
        data: () => ({
          username: 'gamma',
          stats: {
            achievementPoints: 90,
            achievementsCompleted: 5
          },
          updatedAt: 1710000002000
        })
      }
    ]));

    const { leaderboardOperations } = await import('./leaderboard.js');

    const result = await leaderboardOperations.getAchievementLeaderboard({ page: 1, limit: 10 });

    expect(result.entries).toHaveLength(3);
    expect(result.entries[0]).toMatchObject({
      userId: 'u1',
      score: 120,
      achievementsCompleted: 10,
      rank: 1
    });
    expect(result.entries[1]).toMatchObject({
      userId: 'u2',
      score: 120,
      achievementsCompleted: 7,
      rank: 2
    });
    expect(result.entries[2]).toMatchObject({
      userId: 'u3',
      score: 90,
      rank: 3
    });
    expect(result.stats.highestScore).toBe(120);
  });

  it('returns user rank beyond default page size when querying user rank', async () => {
    const entries = Array.from({ length: 60 }, (_, index) => ({
      userId: `u-${index + 1}`,
      username: `player-${index + 1}`,
      score: 1000 - index,
      duration: 100 + index,
      foodEaten: 10,
      mode: 'classic',
      difficulty: null,
      speedReached: 1.5,
      timestamp: 1700000000000 + index,
      rank: index + 1
    }));
    entries[59] = {
      ...entries[59],
      userId: 'u-target',
      username: 'target',
      rank: 60
    };

    mockGetDocument.mockResolvedValue({
      exists: () => true,
      data: () => ({
        entries,
        totalEntries: entries.length
      })
    });

    mockGetDocs.mockResolvedValue(createSnapshot());

    const { leaderboardOperations } = await import('./leaderboard.js');
    const rankInfo = await leaderboardOperations.getUserRank('u-target', 'classic', null);

    expect(rankInfo).toEqual({
      rank: 60,
      score: entries[59].score,
      totalPlayers: entries.length
    });
  });

  it('loads weekly leaderboard for previous week with profile metadata', async () => {
    mockGetDocument.mockResolvedValue({
      exists: () => true,
      data: () => ({
        weekKey: '2026-W08',
        entries: [
          {
            userId: 'u1',
            username: 'alpha',
            score: 1000,
            rank: 1,
            timestamp: 1700000000000
          }
        ],
        totalEntries: 1,
        stats: { highestScore: 1000 }
      })
    });

    mockGetDocs.mockResolvedValue(createSnapshot([
      {
        id: 'u1',
        data: () => ({
          displayName: 'Alpha',
          username: 'alpha',
          isPrivateLeaderboard: false
        })
      }
    ]));

    const { leaderboardOperations } = await import('./leaderboard.js');
    const result = await leaderboardOperations.getWeeklyLeaderboard('overall', null, { weekKey: 'previous' });

    expect(result.weekKey).toBe('2026-W08');
    expect(result.entries).toHaveLength(1);
    expect(result.entries[0]).toMatchObject({
      userId: 'u1',
      displayName: 'Alpha',
      score: 1000
    });
  });

  it('builds overall leaderboard from public profiles instead of private user docs', async () => {
    mockGetDocs.mockResolvedValueOnce(createSnapshot([
      {
        id: 'u2',
        data: () => ({
          username: 'beta',
          stats: {
            totalScore: 1400,
            achievementsCompleted: 4
          },
          updatedAt: 1710000000000,
          isPrivateLeaderboard: true
        })
      },
      {
        id: 'u1',
        data: () => ({
          displayName: 'alpha',
          stats: {
            totalScore: 2400,
            achievementsCompleted: 6
          },
          updatedAt: 1710000001000
        })
      }
    ]));

    const { leaderboardOperations } = await import('./leaderboard.js');
    const result = await leaderboardOperations.getOverallScoreLeaderboard({ page: 1, limit: 10 });

    expect(result.entries).toHaveLength(2);
    expect(result.entries[0]).toMatchObject({ userId: 'u1', score: 2400, rank: 1 });
    expect(result.entries[1]).toMatchObject({ userId: 'u2', score: 1400, rank: 2, isPrivateLeaderboard: true });
  });

  it('aggregates top players across modes using leaderboard options object', async () => {
    const { leaderboardOperations } = await import('./leaderboard.js');
    const spy = vi.spyOn(leaderboardOperations, 'getLeaderboard');

    spy
      .mockResolvedValueOnce({ entries: [{ userId: 'u1', username: 'alpha', score: 120 }] })
      .mockResolvedValueOnce({ entries: [{ userId: 'u2', username: 'beta', score: 200 }] })
      .mockResolvedValueOnce({ entries: [{ userId: 'u1', username: 'alpha', score: 260 }] })
      .mockResolvedValueOnce({ entries: [{ userId: 'u3', username: 'gamma', score: 180 }] })
      .mockResolvedValueOnce({ entries: [{ userId: 'u4', username: 'delta', score: 140 }] })
      .mockResolvedValueOnce({ entries: [{ userId: 'u5', username: 'epsilon', score: 90 }] });

    const result = await leaderboardOperations.getTopPlayersOverall(3);

    expect(spy).toHaveBeenCalledTimes(6);
    spy.mock.calls.forEach(([, , options]) => {
      expect(options).toEqual({
        page: 1,
        limit: 50,
        includeStats: false
      });
    });

    expect(result).toHaveLength(3);
    expect(result[0]).toMatchObject({ userId: 'u1', score: 260, rank: 1 });
    expect(result[1]).toMatchObject({ userId: 'u2', score: 200, rank: 2 });
    expect(result[2]).toMatchObject({ userId: 'u3', score: 180, rank: 3 });

    spy.mockRestore();
  });
});
