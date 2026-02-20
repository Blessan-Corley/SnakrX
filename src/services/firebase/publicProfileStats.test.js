import { describe, expect, it } from 'vitest';
import { buildPublicProfileIdentity, projectPublicProfileStats } from './publicProfileStats.js';

describe('projectPublicProfileStats', () => {
  it('maps persisted user stats to the public leaderboard projection', () => {
    const projected = projectPublicProfileStats({
      totalGames: 12,
      totalWins: 7,
      competitiveGames: 5,
      competitiveWins: 3,
      totalScore: 980,
      bestScore: 240,
      bestScoreAt: 1700000000000,
      bestScoreMode: 'vsai',
      achievementPoints: 40,
      achievements: [{ id: 'first_game' }, { id: 'first_win' }],
      foodEaten: 155,
      totalPlayTime: 420,
      classicGames: 4,
      transparentGames: 2,
      vsaiGames: 5,
      multiplayerGames: 1,
      xp: 75,
      level: 4
    });

    expect(projected).toEqual({
      totalGames: 12,
      totalWins: 7,
      competitiveGames: 5,
      competitiveWins: 3,
      totalScore: 980,
      bestScore: 240,
      bestScoreAt: 1700000000000,
      bestScoreMode: 'vsai',
      achievementPoints: 40,
      achievementsCompleted: 2,
      foodEaten: 155,
      totalPlayTime: 420,
      classicGames: 4,
      transparentGames: 2,
      vsaiGames: 5,
      multiplayerGames: 1,
      xp: 75,
      level: 4
    });
  });

  it('builds public identity from user profile data with firebase fallbacks', () => {
    const identity = buildPublicProfileIdentity(
      {
        uid: 'user-1',
        email: 'player@example.com',
        displayName: 'Firebase Name',
        photoURL: 'firebase-avatar.png'
      },
      {
        username: 'player-one',
        displayName: 'Profile Name',
        avatar: 'profile-avatar.png',
        avatarPath: '/avatars/user-1.png',
        preferences: { privateLeaderboard: true }
      }
    );

    expect(identity).toEqual({
      uid: 'user-1',
      username: 'player-one',
      displayName: 'Profile Name',
      avatar: 'profile-avatar.png',
      avatarPath: '/avatars/user-1.png',
      isPrivateLeaderboard: true
    });
  });
});
