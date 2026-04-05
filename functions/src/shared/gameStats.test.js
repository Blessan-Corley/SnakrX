// @vitest-environment node
import { beforeAll, describe, expect, it } from 'vitest';

class MockHttpsError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

let gameStats;

beforeAll(async () => {
  const gameStatsModule = await import('./gameStats.js');
  gameStats = gameStatsModule.default ?? gameStatsModule;
});

describe('gameStats helpers', () => {
  it('normalizes mode keys, ISO week keys, XP thresholds, and speed multipliers', () => {
    expect(gameStats.getModeStatsKey('classic_transparent')).toBe('transparent');
    expect(gameStats.getModeStatsKey('multi_player')).toBe('multiplayer');

    expect(gameStats.getIsoWeekKey(new Date(Date.UTC(2025, 11, 29)))).toBe('2026-W01');
    expect(gameStats.isPreviousIsoWeek('2020-W53', '2021-W01')).toBe(true);
    expect(gameStats.isPreviousIsoWeek('2026-W11', '2026-W13')).toBe(false);
    expect(gameStats.isPreviousIsoWeek('broken', '2026-W13')).toBe(false);

    expect(gameStats.getLevelFromXp(-10)).toBe(1);
    expect(gameStats.getLevelFromXp(119)).toBe(1);
    expect(gameStats.getLevelFromXp(120)).toBe(2);
    expect(gameStats.getLevelFromXp(999999)).toBe(35);

    expect(gameStats.calculateGameXpGain({
      mode: 'vsai',
      difficulty: 'impossible',
      duration: 999,
      foodEaten: 999,
      score: 99999,
      victory: true
    })).toBe(145);

    expect(gameStats.getSpeedMultiplier(0)).toBe(1);
    expect(gameStats.getSpeedMultiplier(75)).toBe(2.7);
  });

  it('applies count, max, timestamp, array, and direct override stat updates safely', () => {
    const nextStats = gameStats.applyStatUpdates(
      {
        totalGames: 2,
        bestScore: 120,
        maxSpeed: 3,
        bestScoreAt: 100,
        currentWinStreak: 5,
        customValue: 4,
        achievements: ['old']
      },
      {
        totalGames: 1,
        bestScore: 90,
        maxSpeed: 4,
        bestScoreAt: 500,
        currentWinStreak: 0,
        lastGameDuration: 45,
        leaderboardTop3LastWeekKey: '2026-W12',
        achievements: ['new'],
        customValue: 3,
        brokenNumber: Number.NaN,
        note: 'done'
      }
    );

    expect(nextStats).toEqual({
      totalGames: 3,
      bestScore: 120,
      maxSpeed: 4,
      bestScoreAt: 500,
      currentWinStreak: 0,
      customValue: 7,
      achievements: ['new'],
      lastGameDuration: 45,
      leaderboardTop3LastWeekKey: '2026-W12',
      note: 'done'
    });
  });

  it('builds competitive VS AI win updates with streaks, win counters, and predicted progression', () => {
    const result = gameStats.buildStatUpdates({
      session: {
        mode: 'vsai',
        difficulty: 'impossible',
        score: 150,
        duration: 65,
        foodEaten: 12,
        speedReached: 4.5,
        maxLength: 20,
        stats: {
          wallHits: 1,
          selfHits: 2,
          moves: 50,
          closeCalls: 5,
          fastEats: 3,
          bonusFoodsSpawned: 4,
          bonusFoodsCollected: 2,
          bonusFoodPoints: 80
        }
      },
      previousStats: {
        xp: 100,
        level: 1,
        bestScore: 90,
        vsaiBestScore: 100,
        currentWinStreak: 2,
        aiImpossibleStreak: 1
      },
      victory: true,
      now: 1700000000000
    });

    expect(result.predictedXp).toBe(166);
    expect(result.predictedLevel).toBe(2);
    expect(result.statUpdates).toMatchObject({
      totalGames: 1,
      totalWins: 1,
      competitiveGames: 1,
      competitiveWins: 1,
      vsaiGames: 1,
      vsaiWins: 1,
      aiImpossibleWins: 1,
      currentWinStreak: 3,
      bestWinStreak: 3,
      aiImpossibleStreak: 2,
      bestScore: 150,
      bestScoreAt: 1700000000000,
      bestScoreMode: 'vsai',
      vsaiBestScore: 150,
      vsaiBestScoreAt: 1700000000000,
      xp: 66,
      level: 2
    });
  });

  it('resets competitive streaks for low-score VS AI wins and keeps per-difficulty counts', () => {
    const result = gameStats.buildStatUpdates({
      session: {
        mode: 'vsai',
        difficulty: 'medium',
        score: 100,
        duration: 30,
        foodEaten: 6,
        speedReached: 2,
        maxLength: 9,
        stats: {}
      },
      previousStats: {
        currentWinStreak: 4,
        bestScore: 120,
        vsaiBestScore: 150
      },
      victory: true,
      now: 1700000000000
    });

    expect(result.statUpdates).toMatchObject({
      totalWins: 1,
      competitiveWins: 1,
      vsaiWins: 1,
      aiMediumWins: 1,
      currentWinStreak: 0
    });
    expect(result.statUpdates.bestWinStreak).toBeUndefined();
    expect(result.statUpdates.bestScoreAt).toBeUndefined();
  });

  it('builds multiplayer four-player win milestones and quick-death transparent losses', () => {
    const multiplayerWin = gameStats.buildStatUpdates({
      session: {
        mode: 'multiplayer',
        score: 320,
        duration: 80,
        foodEaten: 14,
        speedReached: 4,
        maxLength: 18,
        playerCount: 4,
        playerScores: [60, '70', 80, 90],
        stats: {}
      },
      previousStats: {
        currentWinStreak: 0,
        bestScore: 300,
        multiplayerBestScore: 250
      },
      victory: true,
      now: 1700000000000
    });

    expect(multiplayerWin.statUpdates).toMatchObject({
      competitiveGames: 1,
      competitiveWins: 1,
      totalWins: 1,
      multiplayerGames: 1,
      multiplayerWins: 1,
      multiplayerGames4Player: 1,
      multiplayerWins4Player: 1,
      multiplayerWins4PlayerAllAbove50: 1,
      currentWinStreak: 1,
      bestWinStreak: 1
    });

    const quickDeath = gameStats.buildStatUpdates({
      session: {
        mode: 'classic_transparent',
        score: 40,
        duration: 3,
        foodEaten: 2,
        speedReached: 1.5,
        maxLength: 5,
        stats: {}
      },
      previousStats: {
        bestScore: 50,
        transparentScore: 35,
        transparentBestScore: 20
      },
      victory: false,
      now: 1700000000000,
      quickDeathThresholdSeconds: 5
    });

    expect(quickDeath.statUpdates).toMatchObject({
      transparentGames: 1,
      transparentBestScore: 40,
      transparentBestScoreAt: 1700000000000,
      transparentScore: 40,
      quickDeaths: 1
    });
    expect(quickDeath.statUpdates.bestScoreAt).toBeUndefined();
  });

  it('builds leaderboard rank updates for consecutive podium weeks and resets broken streaks', () => {
    const currentDate = new Date(Date.UTC(2026, 2, 16));
    const previousWeekKey = gameStats.getIsoWeekKey(new Date(Date.UTC(2026, 2, 9)));
    const currentWeekKey = gameStats.getIsoWeekKey(currentDate);

    const consecutive = gameStats.buildLeaderboardRankUpdates({
      modeRank: 1,
      achievementRank: 8,
      overallRank: 10,
      predictedStatsForAchievements: {
        leaderboardTop3WeekStreak: 2,
        leaderboardTop3LastWeekKey: previousWeekKey
      },
      currentDate
    });

    expect(consecutive).toEqual({
      leaderboardTop100Finishes: 1,
      leaderboardTop10Finishes: 1,
      leaderboardTop3Finishes: 1,
      leaderboardRank1Finishes: 1,
      achievementLeaderboardTop10Finishes: 1,
      overallLeaderboardTop10Finishes: 1,
      leaderboardTop3WeekStreak: 3,
      leaderboardTop3BestWeekStreak: 3,
      leaderboardTop3LastWeekKey: currentWeekKey
    });

    const brokenStreak = gameStats.buildLeaderboardRankUpdates({
      modeRank: 20,
      achievementRank: null,
      overallRank: null,
      predictedStatsForAchievements: {
        leaderboardTop3WeekStreak: 4,
        leaderboardTop3LastWeekKey: previousWeekKey
      },
      currentDate
    });

    expect(brokenStreak).toEqual({
      leaderboardTop100Finishes: 1,
      leaderboardTop3WeekStreak: 0,
      leaderboardTop3LastWeekKey: currentWeekKey
    });
  });

  it('sanitizes finalized session payloads, clamps unsafe values, and rejects invalid payloads', () => {
    const sanitized = gameStats.sanitizeFinalizedSessionPayload({
      session: {
        gameId: ' game-1 ',
        mode: 'VSAI',
        difficulty: ' IMPOSSIBLE ',
        playerCount: 8,
        score: 1500000,
        duration: 999999,
        foodEaten: 200000,
        speedReached: 150,
        maxLength: 200000,
        result: ' Victory ',
        startedAt: 10,
        endedAt: 20,
        aiScore: 27,
        playerScores: [10, 2000000, -5, 'oops', 90],
        stats: {
          moves: -2,
          wallHits: 4,
          selfHits: 3,
          closeCalls: 2,
          fastEats: 1,
          bonusFoodsSpawned: 5,
          bonusFoodsCollected: 2,
          bonusFoodPoints: 50,
          averageSpeed: 200,
          efficiency: -5,
          timeToFirstFood: -2,
          timeToMaxLength: 9
        }
      },
      sanitizeText: (value = '', maxLength = 1000) =>
        typeof value === 'string' ? value.trim().slice(0, maxLength) : '',
      functions: {
        https: {
          HttpsError: MockHttpsError
        }
      },
      userId: 'user-1',
      username: 'Player One'
    });

    expect(sanitized).toEqual({
      gameId: 'game-1',
      userId: 'user-1',
      username: 'Player One',
      mode: 'vsai',
      difficulty: 'impossible',
      playerCount: 4,
      score: 1000000,
      aiScore: 27,
      duration: 86400,
      foodEaten: 100000,
      speedReached: 100,
      result: 'victory',
      maxLength: 100000,
      playerScores: [10, 1000000, 0, 0],
      stats: {
        moves: 0,
        wallHits: 4,
        selfHits: 3,
        closeCalls: 2,
        fastEats: 1,
        bonusFoodsSpawned: 5,
        bonusFoodsCollected: 2,
        bonusFoodPoints: 50,
        maxLength: 100000,
        averageSpeed: 100,
        efficiency: 0,
        timeToFirstFood: 0,
        timeToMaxLength: 9
      },
      startedAt: 10,
      endedAt: 20
    });

    const functions = {
      https: {
        HttpsError: MockHttpsError
      }
    };
    const sanitizeText = (value = '', maxLength = 1000) =>
      typeof value === 'string' ? value.trim().slice(0, maxLength) : '';

    expect(() => gameStats.sanitizeFinalizedSessionPayload({
      session: { mode: 'classic', startedAt: 1, endedAt: 2 },
      sanitizeText,
      functions,
      userId: 'user-1',
      username: 'Player'
    })).toThrow(/Game id is required/i);

    expect(() => gameStats.sanitizeFinalizedSessionPayload({
      session: { gameId: 'game-1', mode: 'broken', startedAt: 1, endedAt: 2 },
      sanitizeText,
      functions,
      userId: 'user-1',
      username: 'Player'
    })).toThrow(/Invalid game mode/i);

    expect(gameStats.sanitizeFinalizedSessionPayload({
      session: { gameId: 'game-1', mode: 'classic', difficulty: 'medium', result: 'won', startedAt: 1, endedAt: 2 },
      sanitizeText,
      functions,
      userId: 'user-1',
      username: 'Player'
    }).difficulty).toBeNull();

    expect(() => gameStats.sanitizeFinalizedSessionPayload({
      session: { gameId: 'game-1', mode: 'classic', result: 'paused', startedAt: 1, endedAt: 2 },
      sanitizeText,
      functions,
      userId: 'user-1',
      username: 'Player'
    })).toThrow(/Invalid game result/i);

    expect(() => gameStats.sanitizeFinalizedSessionPayload({
      session: { gameId: 'game-1', mode: 'classic', result: 'won', startedAt: 5, endedAt: 2 },
      sanitizeText,
      functions,
      userId: 'user-1',
      username: 'Player'
    })).toThrow(/Invalid game timestamps/i);
  });
});
