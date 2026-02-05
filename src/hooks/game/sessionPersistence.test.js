import { describe, expect, it, vi } from 'vitest';
import {
  buildAchievementGameStats,
  buildGameSessionData,
  buildLeaderboardRankUpdates,
  buildStatUpdates,
  getIsoWeekKey,
  isQualifiedCompetitiveWinSafe,
  isPreviousIsoWeek,
} from './sessionPersistence.js';
import { AI_DIFFICULTIES, GAME_MODES } from '../../utils/gameUtils.js';

describe('sessionPersistence helpers', () => {
  it('builds a complete game session payload with derived fields', () => {
    const gameState = {
      gameId: 'game-1',
      gameMode: GAME_MODES.VS_AI,
      difficulty: AI_DIFFICULTIES.MEDIUM,
      playerCount: 1,
      score: 120,
      snakes: [{ score: 120 }, { score: 80 }],
      gameTime: 32.9,
      foodEaten: 12,
      speed: 100,
      moves: 48,
      wallHits: 1,
      selfHits: 0,
      closeCalls: 2,
      fastEats: 3,
      bonusFoodsSpawned: 2,
      bonusFoodsCollected: 1,
      bonusFoodPoints: 25,
      timeToFirstFood: 4,
      timeToMaxLength: 18,
      startTime: 1000
    };

    const result = buildGameSessionData({
      gameState,
      trackedMaxLength: 15,
      user: { uid: 'user-1', email: 'player@example.com' },
      userProfile: { username: 'player1' },
      victory: true,
      endedAt: 5000
    });

    expect(result).toMatchObject({
      gameId: 'game-1',
      userId: 'user-1',
      username: 'player1',
      result: 'won',
      aiScore: 80,
      playerScores: [120, 80],
      maxLength: 15,
      startedAt: 1000,
      endedAt: 5000
    });
    expect(result.stats.efficiency).toBeCloseTo(2.5);
    expect(result.stats.averageSpeed).toBe(2);
  });

  it('handles fallback identity and non-competitive session fields', () => {
    const result = buildGameSessionData({
      gameState: {
        gameId: 'classic-1',
        gameMode: GAME_MODES.CLASSIC,
        difficulty: null,
        playerCount: 1,
        score: 0,
        snakes: [{ score: 0 }],
        gameTime: 0,
        foodEaten: 0,
        speed: 200,
        moves: 0,
        wallHits: 0,
        selfHits: 0,
        closeCalls: 0,
        fastEats: 0,
        bonusFoodsSpawned: 0,
        bonusFoodsCollected: 0,
        bonusFoodPoints: 0,
        timeToFirstFood: null,
        timeToMaxLength: null,
        startTime: null
      },
      trackedMaxLength: 1,
      user: { uid: 'user-2', email: 'fallback@example.com' },
      userProfile: {},
      victory: false,
      endedAt: 6000
    });

    expect(result).toMatchObject({
      username: 'fallback',
      result: 'completed',
      aiScore: null,
      startedAt: 6000,
      endedAt: 6000
    });
    expect(result.stats.efficiency).toBe(0);
  });

  it('builds competitive stat updates with streaks and special multiplayer tracking', () => {
    const shouldRecordQuickDeath = vi.fn().mockReturnValue(false);
    const gameState = {
      gameMode: GAME_MODES.MULTIPLAYER,
      difficulty: null,
      playerCount: 4,
      score: 180,
      gameTime: 40,
      foodEaten: 14,
      speed: 80,
      wallHits: 0,
      selfHits: 0,
      moves: 60,
      closeCalls: 4,
      fastEats: 3,
      bonusFoodsSpawned: 2,
      bonusFoodsCollected: 2,
      bonusFoodPoints: 30,
      snakes: [{ score: 80 }, { score: 70 }, { score: 60 }, { score: 50 }]
    };

    const { statUpdates } = buildStatUpdates({
      gameState,
      previousStats: { currentWinStreak: 2, xp: 100, bestScore: 150 },
      trackedMaxLength: 20,
      victory: true,
      now: 12345,
      quickDeathThresholdSeconds: 5,
      shouldRecordQuickDeath
    });

    expect(statUpdates).toMatchObject({
      totalGames: 1,
      totalWins: 1,
      competitiveGames: 1,
      competitiveWins: 1,
      multiplayerGames: 1,
      multiplayerWins: 1,
      multiplayerGames4Player: 1,
      multiplayerWins4Player: 1,
      multiplayerWins4PlayerAllAbove50: 1,
      currentWinStreak: 3,
      bestWinStreak: 3,
      bestScoreAt: 12345,
      bestScoreMode: GAME_MODES.MULTIPLAYER,
      lastGameAt: 12345
    });
    expect(shouldRecordQuickDeath).toHaveBeenCalledOnce();
  });

  it('marks quick deaths and impossible-ai wins correctly', () => {
    const gameState = {
      gameMode: GAME_MODES.VS_AI,
      difficulty: AI_DIFFICULTIES.IMPOSSIBLE,
      playerCount: 1,
      score: 220,
      gameTime: 3,
      foodEaten: 8,
      speed: 120,
      wallHits: 1,
      selfHits: 0,
      moves: 25,
      closeCalls: 0,
      fastEats: 1,
      bonusFoodsSpawned: 0,
      bonusFoodsCollected: 0,
      bonusFoodPoints: 0,
      snakes: [{ score: 220 }, { score: 180 }]
    };

    const { statUpdates } = buildStatUpdates({
      gameState,
      previousStats: { aiImpossibleStreak: 4, xp: 0 },
      trackedMaxLength: 12,
      victory: true,
      now: 999,
      quickDeathThresholdSeconds: 5,
      shouldRecordQuickDeath: () => true
    });

    expect(statUpdates).toMatchObject({
      quickDeaths: 1,
      aiImpossibleWins: 1,
      aiImpossibleStreak: 5,
      vsaiWins: 1,
      totalWins: 1
    });
  });

  it('handles transparent-mode stats without competitive streak fields', () => {
    const { statUpdates } = buildStatUpdates({
      gameState: {
        gameMode: GAME_MODES.CLASSIC_TRANSPARENT,
        difficulty: null,
        playerCount: 1,
        score: 90,
        gameTime: 20,
        foodEaten: 6,
        speed: 140,
        wallHits: 2,
        selfHits: 1,
        moves: 22,
        closeCalls: 1,
        fastEats: 0,
        bonusFoodsSpawned: 1,
        bonusFoodsCollected: 0,
        bonusFoodPoints: 0,
        snakes: [{ score: 90 }]
      },
      previousStats: { transparentScore: 120, xp: 25, bestScore: 200 },
      trackedMaxLength: 8,
      victory: false,
      now: 456,
      quickDeathThresholdSeconds: 5,
      shouldRecordQuickDeath: () => false
    });

    expect(statUpdates.transparentScore).toBe(120);
    expect(statUpdates.currentWinStreak).toBeUndefined();
    expect(statUpdates.competitiveGames).toBeUndefined();
    expect(statUpdates.transparentGames).toBe(1);
  });

  it('builds achievement stats with single-game and perfect-game fields', () => {
    const result = buildAchievementGameStats({
      statsSnapshot: {
        totalGames: 4,
        totalWins: 2,
        totalScore: 500,
        bestScore: 200,
        maxSpeed: 3,
        foodEaten: 40,
        maxLength: 10,
        aiEasyWins: 1,
        aiMediumWins: 2,
        aiImpossibleWins: 3,
        leaderboardTop10Finishes: 1
      },
      gameState: {
        score: 250,
        foodEaten: 18,
        gameTime: 55,
        wallHits: 0,
        selfHits: 0,
        playerCount: 2,
        difficulty: AI_DIFFICULTIES.MEDIUM
      },
      trackedMaxLength: 14
    });

    expect(result).toMatchObject({
      games: 4,
      wins: 2,
      singleScore: 250,
      singleGameFood: 18,
      aiWins: 6,
      leaderboardTop10Finishes: 1,
      maxLength: 14,
      perfectGame: true
    });
  });

  it('tracks weekly leaderboard streaks across week boundaries', () => {
    expect(getIsoWeekKey(new Date('2025-01-01T12:00:00Z'))).toBe('2025-W01');
    expect(isPreviousIsoWeek('2024-W52', '2025-W01')).toBe(true);

    const continuing = buildLeaderboardRankUpdates({
      modeRank: 2,
      achievementRank: 9,
      overallRank: 11,
      predictedStatsForAchievements: {
        leaderboardTop3WeekStreak: 2,
        leaderboardTop3LastWeekKey: '2024-W52'
      },
      currentDate: new Date('2025-01-01T12:00:00Z')
    });

    expect(continuing).toMatchObject({
      leaderboardTop100Finishes: 1,
      leaderboardTop10Finishes: 1,
      leaderboardTop3Finishes: 1,
      achievementLeaderboardTop10Finishes: 1,
      leaderboardTop3WeekStreak: 3,
      leaderboardTop3BestWeekStreak: 3,
      leaderboardTop3LastWeekKey: '2025-W01'
    });

    const reset = buildLeaderboardRankUpdates({
      modeRank: 20,
      achievementRank: null,
      overallRank: null,
      predictedStatsForAchievements: {
        leaderboardTop3WeekStreak: 3,
        leaderboardTop3LastWeekKey: '2024-W52'
      },
      currentDate: new Date('2025-01-01T12:00:00Z')
    });

    expect(reset).toMatchObject({
      leaderboardTop100Finishes: 1,
      leaderboardTop3WeekStreak: 0,
      leaderboardTop3LastWeekKey: '2025-W01'
    });
  });

  it('returns false for invalid week transitions and non-qualifying wins', () => {
    expect(isPreviousIsoWeek('', '2025-W01')).toBe(false);
    expect(isPreviousIsoWeek('bad-key', '2025-W01')).toBe(false);
    expect(isPreviousIsoWeek('2025-W01', '2025-W03')).toBe(false);

    expect(isQualifiedCompetitiveWinSafe({
      mode: GAME_MODES.VS_AI,
      victory: true,
      playerScore: 90
    })).toBe(false);
    expect(isQualifiedCompetitiveWinSafe({
      mode: GAME_MODES.MULTIPLAYER,
      victory: false,
      playerScore: 200
    })).toBe(false);
    expect(isQualifiedCompetitiveWinSafe({
      mode: GAME_MODES.MULTIPLAYER,
      victory: true,
      playerScore: 10
    })).toBe(true);

    expect(buildLeaderboardRankUpdates({
      modeRank: null,
      achievementRank: 11,
      overallRank: 50,
      predictedStatsForAchievements: {
        leaderboardTop3WeekStreak: 0,
        leaderboardTop3LastWeekKey: 'bad-key'
      },
      currentDate: new Date('2025-01-01T12:00:00Z')
    })).toEqual({});
  });
});
