// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { buildPublicProfilePayload } from './publicProfilePayload.js';

describe('buildPublicProfilePayload', () => {
  it('builds a normalized public profile payload from user data', () => {
    const payload = buildPublicProfilePayload({
      userId: 'user-1',
      userData: {
        username: ' alpha ',
        displayName: ' Alpha ',
        avatar: 'https://example.com/avatar.png',
        avatarPath: 'avatars/user-1/avatar.png',
        preferences: {
          privateLeaderboard: true,
          hideMatchHistory: true
        }
      },
      publicProfileData: {
        username: 'fallback'
      },
      nextStats: {
        totalGames: 5,
        totalWins: 3,
        achievements: [{ id: 'one' }],
        xp: 120,
        level: 4
      }
    });

    expect(payload).toMatchObject({
      uid: 'user-1',
      username: 'alpha',
      displayName: 'Alpha',
      avatar: 'https://example.com/avatar.png',
      avatarPath: 'avatars/user-1/avatar.png',
      isPrivateLeaderboard: true,
      preferences: {
        hideMatchHistory: true
      },
      stats: {
        totalGames: 5,
        totalWins: 3,
        achievementsCompleted: 1,
        xp: 120,
        level: 4
      }
    });
    expect(payload.updatedAt).toBeTruthy();
    expect(payload.lastActiveAt).toBeTruthy();
  });
});
