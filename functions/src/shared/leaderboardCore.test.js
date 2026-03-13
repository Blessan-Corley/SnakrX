// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';

import {
  createLeaderboardEntryCore,
  sanitizePersistedGameForLeaderboard
} from './leaderboardCore.js';

class MockHttpsError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

const createDocSnap = (id, data, exists = true) => ({
  id,
  exists,
  data: () => data,
  ref: { path: id }
});

describe('leaderboardCore', () => {
  it('sanitizes persisted game sessions before ranking', () => {
    const result = sanitizePersistedGameForLeaderboard({
      https: {
        HttpsError: MockHttpsError
      }
    }, {
      mode: 'vsai',
      difficulty: 'medium',
      score: 420,
      duration: 45,
      foodEaten: 12,
      speedReached: 3,
      startedAt: { toMillis: () => 1000 },
      endedAt: { toMillis: () => 5000 }
    });

    expect(result).toMatchObject({
      mode: 'vsai',
      difficulty: 'medium',
      score: 420,
      duration: 45,
      foodEaten: 12,
      speedReached: 3,
      startedAt: 1000,
      endedAt: 5000
    });
  });

  it('upserts leaderboard entries and returns the user rank', async () => {
    const transactionSet = vi.fn();
    const gameRef = { path: 'games/game-doc-1' };
    const userRef = { path: 'users/user-1' };
    const publicProfileRef = { path: 'publicProfiles/user-1' };
    const leaderboardRef = { path: 'leaderboards/classic_default' };

    const db = {
      collection: (name) => ({
        doc: (id) => {
          if (name === 'games') return gameRef;
          if (name === 'users') return userRef;
          if (name === 'publicProfiles') return publicProfileRef;
          if (name === 'leaderboards') return leaderboardRef;
          return { path: `${name}/${id}` };
        }
      }),
      runTransaction: async (callback) => callback({
        get: async (ref) => {
          if (ref === gameRef) {
            return createDocSnap('game-doc-1', {
              userId: 'user-1',
              username: 'alpha',
              mode: 'classic',
              difficulty: null,
              score: 900,
              duration: 40,
              foodEaten: 18,
              speedReached: 3,
              startedAt: { toMillis: () => 1000 },
              endedAt: { toMillis: () => 6000 }
            });
          }

          if (ref === userRef) {
            return createDocSnap('user-1', { banned: false });
          }

          if (ref === publicProfileRef) {
            return createDocSnap('user-1', {
              username: 'alpha',
              displayName: 'Alpha'
            });
          }

          if (ref === leaderboardRef) {
            return createDocSnap('classic_default', {
              entries: [
                {
                  userId: 'user-2',
                  username: 'beta',
                  score: 850,
                  duration: 42,
                  foodEaten: 17,
                  mode: 'classic',
                  difficulty: null,
                  speedReached: 2,
                  timestamp: 7000,
                  rank: 1
                }
              ],
              stats: {
                totalGames: 7
              }
            });
          }

          return createDocSnap('missing', {}, false);
        },
        set: transactionSet
      })
    };

    const createCore = createLeaderboardEntryCore({
      functions: {
        https: {
          HttpsError: MockHttpsError
        }
      },
      admin: {
        firestore: {
          FieldValue: {
            serverTimestamp: () => ({ __serverTimestamp: true })
          }
        }
      },
      db
    });

    const result = await createCore({
      userId: 'user-1',
      gameDocId: 'game-doc-1'
    });

    expect(result).toEqual({
      success: true,
      leaderboardId: 'classic_default',
      modeRank: 1
    });
    expect(transactionSet).toHaveBeenCalledWith(
      leaderboardRef,
      expect.objectContaining({
        mode: 'classic',
        difficulty: null,
        entries: expect.arrayContaining([
          expect.objectContaining({
            userId: 'user-1',
            rank: 1
          })
        ])
      }),
      { merge: true }
    );
    expect(transactionSet).toHaveBeenCalledWith(
      gameRef,
      expect.objectContaining({
        leaderboardProcessedBoardId: 'classic_default'
      }),
      { merge: true }
    );
  });
});
