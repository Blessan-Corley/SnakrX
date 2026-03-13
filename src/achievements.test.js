import { describe, it, expect } from 'vitest';
import { checkAchievementRequirements } from './data/achievements.js';

describe('Achievements - Requirements Checking', () => {
  const achievement = {
    id: 'test_achievement',
    requirements: {
      games: 50,
      totalScore: 1000
    }
  };

  it('should verify game count', () => {
    expect(checkAchievementRequirements(achievement, { games: 49, totalScore: 1000 })).toBe(false);
    expect(checkAchievementRequirements(achievement, { games: 50, totalScore: 1000 })).toBe(true);
    expect(checkAchievementRequirements(achievement, { games: 100, totalScore: 1000 })).toBe(true);
  });

  it('should verify total score', () => {
    expect(checkAchievementRequirements(achievement, { games: 50, totalScore: 999 })).toBe(false);
    expect(checkAchievementRequirements(achievement, { games: 50, totalScore: 1000 })).toBe(true);
  });

  it('should verify AI specific achievements', () => {
    const aiAchievement = { id: 'ai_slayer', requirements: { aiWins: 1, difficulty: 'easy' } };
    expect(checkAchievementRequirements(aiAchievement, { aiEasyWins: 0 })).toBe(false);
    expect(checkAchievementRequirements(aiAchievement, { aiEasyWins: 1 })).toBe(true);
  });

  it('should verify impossible AI streak requirement using aiImpossibleStreak', () => {
    const godAchievement = { id: 'am_i_god', requirements: { aiStreak: 3, difficulty: 'impossible' } };
    expect(checkAchievementRequirements(godAchievement, { aiImpossibleStreak: 2 })).toBe(false);
    expect(checkAchievementRequirements(godAchievement, { aiImpossibleStreak: 3 })).toBe(true);
  });
  
  it('should verify Perfect Game achievement', () => {
    const perfectAchievement = { id: 'perfectionist', requirements: { perfectGame: true } };
    expect(checkAchievementRequirements(perfectAchievement, { perfectGame: false })).toBe(false);
    expect(checkAchievementRequirements(perfectAchievement, { perfectGame: true })).toBe(true);
  });

  it('should verify advanced numeric requirement keys', () => {
    const advancedAchievement = {
      id: 'move_master',
      requirements: { moves: 10000, closeCalls: 10 }
    };
    expect(checkAchievementRequirements(advancedAchievement, { moves: 9999, closeCalls: 10 })).toBe(false);
    expect(checkAchievementRequirements(advancedAchievement, { moves: 10000, closeCalls: 9 })).toBe(false);
    expect(checkAchievementRequirements(advancedAchievement, { moves: 10000, closeCalls: 10 })).toBe(true);
  });

  it('should require 4-player multiplayer wins for last snake standing', () => {
    const multiplayerAchievement = {
      id: 'last_snake_standing',
      requirements: { multiplayerWins4Player: 1 }
    };
    expect(checkAchievementRequirements(multiplayerAchievement, { multiplayerWins: 10, multiplayerWins4Player: 0 })).toBe(false);
    expect(checkAchievementRequirements(multiplayerAchievement, { multiplayerWins4Player: 1 })).toBe(true);
  });

  it('should require full-table 4-player win with all scores above 50', () => {
    const fullTableAchievement = {
      id: 'four_player_clean_sweep',
      requirements: { multiplayerWins4PlayerAllAbove50: 1 }
    };
    expect(checkAchievementRequirements(fullTableAchievement, { multiplayerWins4PlayerAllAbove50: 0 })).toBe(false);
    expect(checkAchievementRequirements(fullTableAchievement, { multiplayerWins4PlayerAllAbove50: 1 })).toBe(true);
  });

  it('should require tougher close call threshold for clutch driver', () => {
    const clutchDriverAchievement = {
      id: 'close_call',
      requirements: { closeCalls: 15 }
    };
    expect(checkAchievementRequirements(clutchDriverAchievement, { closeCalls: 14 })).toBe(false);
    expect(checkAchievementRequirements(clutchDriverAchievement, { closeCalls: 15 })).toBe(true);
  });

  it('should validate weekly leaderboard placement achievements', () => {
    const weeklyTopTenAchievement = {
      id: 'weekly_top_10',
      requirements: { weeklyLeaderboardTop10Finishes: 1 }
    };
    expect(checkAchievementRequirements(weeklyTopTenAchievement, { weeklyLeaderboardTop10Finishes: 0 })).toBe(false);
    expect(checkAchievementRequirements(weeklyTopTenAchievement, { weeklyLeaderboardTop10Finishes: 1 })).toBe(true);
  });

  it('should validate weekly podium streak achievement', () => {
    const weeklyStreakAchievement = {
      id: 'weekly_podium_streak',
      requirements: { weeklyTop3BestWeekStreak: 3 }
    };
    expect(checkAchievementRequirements(weeklyStreakAchievement, { weeklyTop3BestWeekStreak: 2 })).toBe(false);
    expect(checkAchievementRequirements(weeklyStreakAchievement, { weeklyTop3BestWeekStreak: 3 })).toBe(true);
  });
});
