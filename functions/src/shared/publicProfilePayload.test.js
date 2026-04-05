// @vitest-environment node
import { beforeAll, describe, expect, it } from 'vitest';

let buildPublicProfilePayload;

beforeAll(async () => {
  const payloadModule = await import('./publicProfilePayload.js');
  ({ buildPublicProfilePayload } = payloadModule.default ?? payloadModule);
});

describe('buildPublicProfilePayload', () => {
  it('prefers current user profile values and projects public stats safely', () => {
    const payload = buildPublicProfilePayload({
      userId: 'user-1',
      userData: {
        username: ' Alpha ',
        displayName: ' Alpha One ',
        avatar: 'avatar-user.png',
        avatarPath: 'avatars/user-1/avatar-user.png',
        preferences: {
          privateLeaderboard: true,
          hideMatchHistory: true
        }
      },
      publicProfileData: {
        username: 'Legacy',
        displayName: 'Legacy Name',
        avatar: 'legacy.png',
        avatarPath: 'avatars/user-1/legacy.png',
        isPrivateLeaderboard: false,
        preferences: {
          hideMatchHistory: false
        }
      },
      nextStats: {
        totalGames: 12,
        totalWins: 5,
        achievements: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
        level: 0
      }
    });

    expect(payload).toMatchObject({
      uid: 'user-1',
      username: 'Alpha',
      displayName: 'Alpha One',
      searchableUsername: 'alpha',
      searchableDisplayName: 'alpha one',
      avatar: 'avatar-user.png',
      avatarPath: 'avatars/user-1/avatar-user.png',
      isPrivateLeaderboard: true,
      preferences: {
        hideMatchHistory: true
      },
      stats: {
        totalGames: 12,
        totalWins: 5,
        achievementsCompleted: 3,
        level: 1
      }
    });
    expect(payload.searchPrefixes).toEqual(expect.arrayContaining(['al', 'alp', 'alpha', 'on', 'one']));
    expect(payload.updatedAt).toBeTruthy();
    expect(payload.lastActiveAt).toBeTruthy();
  });

  it('falls back to existing public profile values when the user document is sparse', () => {
    const payload = buildPublicProfilePayload({
      userId: 'user-2',
      userData: {},
      publicProfileData: {
        username: 'LegacyTwo',
        displayName: 'Legacy Two',
        avatar: 'legacy-two.png',
        avatarPath: 'avatars/user-2/legacy-two.png',
        isPrivateLeaderboard: true,
        preferences: {
          hideMatchHistory: true
        }
      },
      nextStats: {}
    });

    expect(payload).toMatchObject({
      uid: 'user-2',
      username: 'LegacyTwo',
      displayName: 'Legacy Two',
      avatar: 'legacy-two.png',
      avatarPath: 'avatars/user-2/legacy-two.png',
      isPrivateLeaderboard: true,
      preferences: {
        hideMatchHistory: true
      },
      stats: {
        totalGames: 0,
        totalWins: 0,
        achievementsCompleted: 0,
        level: 1
      }
    });
  });
});
