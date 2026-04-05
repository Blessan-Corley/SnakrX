// @vitest-environment node
import { beforeAll, describe, expect, it } from 'vitest';

let leaderboardsPrivate;

beforeAll(async () => {
  const leaderboardsModule = await import('./leaderboards.js');
  leaderboardsPrivate = (leaderboardsModule.default ?? leaderboardsModule).__private__;
});

describe('leaderboards helpers', () => {
  it('aggregates weekly leaderboards from valid game sessions and keeps each user best per board', () => {
    const result = leaderboardsPrivate.aggregateWeeklyLeaderboards([
      {
        userId: ' user-1 ',
        username: ' Alpha ',
        mode: 'vsai',
        difficulty: 'medium',
        score: 320,
        duration: 40,
        foodEaten: 10,
        speedReached: 3,
        endedAt: 1000
      },
      {
        userId: 'user-1',
        username: 'Alpha',
        mode: 'vsai',
        difficulty: 'medium',
        score: 540,
        duration: 38,
        foodEaten: 12,
        speedReached: 4,
        endedAt: 1100
      },
      {
        userId: 'user-1',
        username: 'Alpha',
        mode: 'classic',
        score: 150,
        duration: 20,
        foodEaten: 5,
        speedReached: 2,
        endedAt: 1200
      },
      {
        userId: 'user-2',
        username: 'Beta',
        mode: 'classic',
        score: 220,
        duration: 30,
        foodEaten: 7,
        speedReached: 2,
        endedAt: 900
      },
      {
        userId: 'user-3',
        username: 'Gamma',
        mode: 'broken-mode',
        score: 900,
        endedAt: 800
      },
      {
        userId: 'user-4',
        username: 'Delta',
        mode: 'classic',
        score: 0,
        endedAt: 700
      }
    ]);

    expect(result.boards).toHaveLength(2);

    const classicBoard = result.boards.find((board) => board.mode === 'classic');
    const vsAiBoard = result.boards.find((board) => board.mode === 'vsai');

    expect(classicBoard).toMatchObject({
      mode: 'classic',
      stats: {
        uniquePlayers: 2,
        totalGames: 2,
        highestScore: 220
      }
    });
    expect(classicBoard.entries).toEqual([
      expect.objectContaining({ userId: 'user-2', score: 220, rank: 1 }),
      expect.objectContaining({ userId: 'user-1', score: 150, rank: 2 })
    ]);

    expect(vsAiBoard).toMatchObject({
      mode: 'vsai',
      difficulty: 'medium',
      stats: {
        uniquePlayers: 1,
        totalGames: 2,
        highestScore: 540
      }
    });
    expect(vsAiBoard.entries).toEqual([
      expect.objectContaining({
        userId: 'user-1',
        username: 'alpha',
        score: 540,
        rank: 1
      })
    ]);

    expect(result.overallEntries).toEqual([
      expect.objectContaining({
        userId: 'user-1',
        score: 1010,
        gamesPlayed: 3,
        rank: 1
      }),
      expect.objectContaining({
        userId: 'user-2',
        score: 220,
        gamesPlayed: 1,
        rank: 2
      })
    ]);
  });

  it('builds weekly user update buckets from board and overall rankings', () => {
    const { updates, overallPodiumUsers } = leaderboardsPrivate.buildWeeklyUserUpdateMap(
      [
        {
          entries: [
            { userId: 'user-1', rank: 1 },
            { userId: 'user-2', rank: 5 }
          ]
        },
        {
          entries: [
            { userId: 'user-1', rank: 12 },
            { userId: 'user-3', rank: 3 }
          ]
        }
      ],
      [
        { userId: 'user-3', rank: 1 },
        { userId: 'user-1', rank: 4 }
      ]
    );

    expect(updates.get('user-1')).toEqual({
      weeklyLeaderboardTop100Finishes: 2,
      weeklyLeaderboardTop10Finishes: 1,
      weeklyLeaderboardTop3Finishes: 1,
      weeklyLeaderboardRank1Finishes: 1,
      weeklyOverallTop10Finishes: 1
    });
    expect(updates.get('user-2')).toEqual({
      weeklyLeaderboardTop100Finishes: 1,
      weeklyLeaderboardTop10Finishes: 1,
      weeklyLeaderboardTop3Finishes: 0,
      weeklyLeaderboardRank1Finishes: 0,
      weeklyOverallTop10Finishes: 0
    });
    expect(updates.get('user-3')).toEqual({
      weeklyLeaderboardTop100Finishes: 1,
      weeklyLeaderboardTop10Finishes: 1,
      weeklyLeaderboardTop3Finishes: 1,
      weeklyLeaderboardRank1Finishes: 0,
      weeklyOverallTop10Finishes: 1
    });
    expect([...overallPodiumUsers]).toEqual(['user-3']);
  });

  it('validates leaderboard upsert preconditions before any firestore write path continues', async () => {
    const functionsModule = await import('firebase-functions/v1');

    expect(() => leaderboardsPrivate.assertLeaderboardUpsertPreconditions(
      functionsModule,
      { exists: false },
      'user-1'
    )).toThrow(/Game session was not found/i);

    expect(() => leaderboardsPrivate.assertLeaderboardUpsertPreconditions(
      functionsModule,
      {
        exists: true,
        data: () => ({ userId: 'user-2' })
      },
      'user-1'
    )).toThrow(/Cannot rank another user session/i);

    expect(
      leaderboardsPrivate.assertLeaderboardUpsertPreconditions(
        functionsModule,
        {
          exists: true,
          data: () => ({ userId: 'user-1', score: 900, mode: 'classic' })
        },
        'user-1'
      )
    ).toEqual({
      userId: 'user-1',
      score: 900,
      mode: 'classic'
    });
  });
});
