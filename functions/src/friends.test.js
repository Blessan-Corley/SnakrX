// @vitest-environment node
import { beforeAll, describe, expect, it, vi } from 'vitest';

class MockHttpsError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

const sanitizeText = (value = '', maxLength = 1000) =>
  typeof value === 'string' ? value.trim().slice(0, maxLength) : '';

let syncFriendStatsCore;

const createServices = ({
  acceptedCounts = {},
  userDocs = {},
  publicProfileDocs = {}
} = {}) => {
  const serverTimestamp = { __serverTimestamp: true };
  const buildPublicProfilePayload = vi.fn(({ userId, nextStats }) => ({
    uid: userId,
    stats: nextStats,
    projected: true
  }));
  const unlockEligibleAchievements = vi.fn(({ achievements = [], sourceStats = {} }) => ({
    achievements: [
      ...achievements,
      {
        id: `friends_${sourceStats.friendsCount || 0}`
      }
    ],
    newlyUnlockedIds: sourceStats.friendsCount ? [`friends_${sourceStats.friendsCount}`] : []
  }));

  const setCalls = [];
  const whereCalls = [];

  const userDocFactory = (id) => ({
    path: `users/${id}`,
    collection: (childName) => ({
      where: (field, op, value) => {
        whereCalls.push({ id, childName, field, op, value });
        return {
          get: vi.fn().mockResolvedValue({
            size: acceptedCounts[id] ?? 0
          })
        };
      }
    })
  });

  const publicProfileDocFactory = (id) => ({
    path: `publicProfiles/${id}`
  });

  const transaction = {
    get: vi.fn(async (ref) => {
      if (ref.path.startsWith('users/')) {
        const userId = ref.path.split('/')[1];
        const data = userDocs[userId];
        return {
          exists: Boolean(data),
          data: () => data || {}
        };
      }

      if (ref.path.startsWith('publicProfiles/')) {
        const userId = ref.path.split('/')[1];
        const data = publicProfileDocs[userId];
        return {
          exists: Boolean(data),
          data: () => data || {}
        };
      }

      throw new Error(`Unexpected ref lookup: ${ref.path}`);
    }),
    set: vi.fn((ref, data, options) => {
      setCalls.push({ ref, data, options });
    })
  };

  const db = {
    collection: (name) => {
      if (name === 'users') {
        return {
          doc: (id) => userDocFactory(id)
        };
      }

      if (name === 'publicProfiles') {
        return {
          doc: (id) => publicProfileDocFactory(id)
        };
      }

      throw new Error(`Unexpected collection: ${name}`);
    },
    runTransaction: vi.fn((callback) => callback(transaction))
  };

  return {
    services: {
      functions: {
        https: {
          HttpsError: MockHttpsError
        }
      },
      admin: {
        firestore: {
          FieldValue: {
            serverTimestamp: vi.fn(() => serverTimestamp)
          }
        }
      },
      db,
      sanitizeText,
      buildPublicProfilePayload,
      unlockEligibleAchievements
    },
    mocks: {
      buildPublicProfilePayload,
      unlockEligibleAchievements,
      db,
      setCalls,
      whereCalls,
      serverTimestamp
    }
  };
};

beforeAll(async () => {
  const friendsModule = await import('./friends.js');
  syncFriendStatsCore = (friendsModule.default ?? friendsModule).__private__.syncFriendStatsCore;
});

describe('syncFriendStatsCore', () => {
  it('rejects unauthenticated callers', async () => {
    await expect(syncFriendStatsCore({}, {}, createServices().services)).rejects.toMatchObject({
      code: 'unauthenticated'
    });
  });

  it('returns an empty sync result when no valid user ids are provided', async () => {
    const { services, mocks } = createServices();

    await expect(syncFriendStatsCore(
      {
        userIds: [' ', null, undefined]
      },
      {
        auth: {
          uid: 'caller-1'
        }
      },
      services
    )).resolves.toEqual({
      synced: []
    });

    expect(mocks.db.runTransaction).not.toHaveBeenCalled();
  });

  it('deduplicates ids, syncs accepted counts, preserves existing public profile timestamps, and skips missing users', async () => {
    const { services, mocks } = createServices({
      acceptedCounts: {
        'user-1': 3,
        'user-2': 7,
        'user-3': 2
      },
      userDocs: {
        'user-1': {
          username: 'Alpha',
          stats: {
            achievements: [{ id: 'existing' }],
            totalGames: 9
          }
        },
        'user-2': {
          username: 'Beta',
          stats: {
            achievements: []
          }
        }
      },
      publicProfileDocs: {
        'user-1': {
          createdAt: 'kept-created-at',
          displayName: 'Alpha Public'
        }
      }
    });

    const result = await syncFriendStatsCore(
      {
        userIds: [' user-1 ', 'user-1', 'user-2', '', 'user-3']
      },
      {
        auth: {
          uid: 'caller-1'
        }
      },
      services
    );

    expect(result).toEqual({
      synced: [
        {
          userId: 'user-1',
          friendsCount: 3,
          unlockedAchievementIds: ['friends_3']
        },
        {
          userId: 'user-2',
          friendsCount: 7,
          unlockedAchievementIds: ['friends_7']
        }
      ]
    });

    expect(mocks.whereCalls).toEqual([
      { id: 'user-1', childName: 'friends', field: 'status', op: '==', value: 'accepted' },
      { id: 'user-2', childName: 'friends', field: 'status', op: '==', value: 'accepted' },
      { id: 'user-3', childName: 'friends', field: 'status', op: '==', value: 'accepted' }
    ]);

    expect(mocks.unlockEligibleAchievements).toHaveBeenNthCalledWith(1, expect.objectContaining({
      sourceStats: expect.objectContaining({
        friendsCount: 3
      })
    }));
    expect(mocks.unlockEligibleAchievements).toHaveBeenNthCalledWith(2, expect.objectContaining({
      sourceStats: expect.objectContaining({
        friendsCount: 7
      })
    }));

    expect(mocks.buildPublicProfilePayload).toHaveBeenCalledTimes(2);
    expect(mocks.setCalls).toHaveLength(4);

    const [userOneUserWrite, userOnePublicWrite, , userTwoPublicWrite] = mocks.setCalls;

    expect(userOneUserWrite).toMatchObject({
      ref: expect.objectContaining({ path: 'users/user-1' }),
      options: { merge: true }
    });
    expect(userOneUserWrite.data.stats).toMatchObject({
      friendsCount: 3,
      achievements: [
        { id: 'existing' },
        { id: 'friends_3' }
      ]
    });
    expect(userOneUserWrite.data.updatedAt).toBe(mocks.serverTimestamp);
    expect(userOneUserWrite.data.lastActiveAt).toBe(mocks.serverTimestamp);

    expect(userOnePublicWrite).toMatchObject({
      ref: expect.objectContaining({ path: 'publicProfiles/user-1' }),
      options: { merge: true }
    });
    expect(userOnePublicWrite.data).toMatchObject({
      uid: 'user-1',
      projected: true,
      createdAt: 'kept-created-at'
    });

    expect(userTwoPublicWrite).toMatchObject({
      ref: expect.objectContaining({ path: 'publicProfiles/user-2' }),
      options: { merge: true }
    });
    expect(userTwoPublicWrite.data.createdAt).toBe(mocks.serverTimestamp);
  });
});
