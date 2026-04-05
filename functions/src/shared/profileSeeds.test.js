// @vitest-environment node
import { beforeAll, describe, expect, it } from 'vitest';

let profileSeeds;

beforeAll(async () => {
  const profileSeedsModule = await import('./profileSeeds.js');
  profileSeeds = profileSeedsModule.default ?? profileSeedsModule;
});

describe('profile seed helpers', () => {
  it('creates default user stats with stable gameplay and leaderboard defaults', () => {
    const stats = profileSeeds.createDefaultUserStats();

    expect(stats).toMatchObject({
      totalGames: 0,
      totalWins: 0,
      level: 1,
      maxSpeed: 1,
      maxLength: 1,
      friendsCount: 0,
      leaderboardTop100Finishes: 0,
      weeklyTop3BestWeekStreak: 0,
      transparentScore: 0,
      lastGameAt: null
    });
    expect(stats.achievements).toEqual([]);
    expect(stats.uncollectedAchievements).toEqual([]);
  });

  it('projects public profile stats from arrays and numeric fallbacks', () => {
    expect(profileSeeds.projectPublicProfileStats({
      totalGames: '12',
      totalWins: '5',
      competitiveGames: '4',
      competitiveWins: '2',
      totalScore: '900',
      bestScore: '300',
      bestScoreAt: 1700000000000,
      bestScoreMode: 'vsai',
      achievementPoints: '40',
      achievements: [{ id: 'a' }, { id: 'b' }],
      foodEaten: '18',
      totalPlayTime: '120',
      classicGames: '3',
      transparentGames: '1',
      vsaiGames: '4',
      multiplayerGames: '4',
      xp: '250',
      level: 0
    })).toEqual({
      totalGames: 12,
      totalWins: 5,
      competitiveGames: 4,
      competitiveWins: 2,
      totalScore: 900,
      bestScore: 300,
      bestScoreAt: 1700000000000,
      bestScoreMode: 'vsai',
      achievementPoints: 40,
      achievementsCompleted: 2,
      foodEaten: 18,
      totalPlayTime: 120,
      classicGames: 3,
      transparentGames: 1,
      vsaiGames: 4,
      multiplayerGames: 4,
      xp: 250,
      level: 1
    });

    expect(profileSeeds.projectPublicProfileStats({
      achievementsCompleted: '7'
    }).achievementsCompleted).toBe(7);
  });

  it('creates default user and public profile payloads with timestamps, search fields, and projected stats', () => {
    const userProfile = profileSeeds.createDefaultUserProfileData({
      email: 'player@example.com',
      username: 'player_one',
      displayName: 'Player One',
      avatar: 'avatar.png'
    });

    expect(userProfile).toMatchObject({
      username: 'player_one',
      displayName: 'Player One',
      email: 'player@example.com',
      avatar: 'avatar.png',
      avatarPath: null,
      role: 'player',
      banned: false,
      settings: {
        soundEnabled: true,
        soundVolume: 0.7,
        showGrid: true
      },
      preferences: {
        favoriteGameMode: 'classic',
        snakeColor: '#10b981',
        privateLeaderboard: false,
        hideMatchHistory: false
      },
      stats: expect.objectContaining({
        totalGames: 0,
        level: 1
      })
    });
    expect(userProfile.createdAt).toBeTruthy();
    expect(userProfile.lastLoginAt).toBeTruthy();
    expect(userProfile.updatedAt).toBeTruthy();
    expect(userProfile.lastActiveAt).toBeTruthy();

    const publicProfile = profileSeeds.createDefaultPublicProfileData({
      uid: 'user-1',
      username: 'player_one',
      displayName: 'Player One',
      stats: {
        totalGames: 9,
        totalWins: 4,
        achievements: [{ id: 'a' }]
      }
    });

    expect(publicProfile).toMatchObject({
      uid: 'user-1',
      username: 'player_one',
      displayName: 'Player One',
      searchableUsername: 'player_one',
      searchableDisplayName: 'player one',
      avatar: null,
      avatarPath: null,
      isPrivateLeaderboard: false,
      preferences: {
        hideMatchHistory: false
      },
      stats: {
        totalGames: 9,
        totalWins: 4,
        achievementsCompleted: 1,
        level: 1
      }
    });
    expect(publicProfile.searchPrefixes).toEqual(expect.arrayContaining(['pl', 'play', 'on', 'one']));
    expect(publicProfile.createdAt).toBeTruthy();
    expect(publicProfile.updatedAt).toBeTruthy();
    expect(publicProfile.lastActiveAt).toBeTruthy();
  });
});
