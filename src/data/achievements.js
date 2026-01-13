/**
 * SnakrX Achievements Configuration
 * Easily configurable achievement system with categories, tiers, and requirements
 */

import { FOOD_ACHIEVEMENTS } from './achievements/foodAchievements.js';
import { FUNNY_ACHIEVEMENTS } from './achievements/funnyAchievements.js';
import { GAMEPLAY_ACHIEVEMENTS } from './achievements/gameplayAchievements.js';
import { LEADERBOARD_ACHIEVEMENTS } from './achievements/leaderboardAchievements.js';
import { MULTIPLAYER_ACHIEVEMENTS } from './achievements/multiplayerAchievements.js';
import { SCORE_ACHIEVEMENTS } from './achievements/scoreAchievements.js';
import { SOCIAL_ACHIEVEMENTS } from './achievements/socialAchievements.js';
import { SPECIAL_ACHIEVEMENTS } from './achievements/specialAchievements.js';
import { SPEED_ACHIEVEMENTS } from './achievements/speedAchievements.js';
import { STREAK_ACHIEVEMENTS } from './achievements/streakAchievements.js';
import { SURVIVAL_ACHIEVEMENTS } from './achievements/survivalAchievements.js';
import { VS_AI_ACHIEVEMENTS } from './achievements/vsAiAchievements.js';
import { SKILL_ACHIEVEMENTS } from './achievements/skillAchievements.js';

export const ACHIEVEMENT_TIERS = {
  common: {
    color: '#9ca3af',
    bgGradient: 'from-gray-400 to-gray-600',
    glow: 'shadow-gray-500/20'
  },
  uncommon: {
    color: '#10b981',
    bgGradient: 'from-emerald-400 to-emerald-600',
    glow: 'shadow-emerald-500/30'
  },
  rare: {
    color: '#3b82f6',
    bgGradient: 'from-blue-400 to-blue-600',
    glow: 'shadow-blue-500/40'
  },
  epic: {
    color: '#a855f7',
    bgGradient: 'from-purple-400 to-purple-600',
    glow: 'shadow-purple-500/50'
  },
  legendary: {
    color: '#f59e0b',
    bgGradient: 'from-amber-400 to-amber-600',
    glow: 'shadow-amber-500/60'
  }
};

export const ACHIEVEMENT_CATEGORIES = {
  gameplay: { name: 'Gameplay', icon: 'gamepad', color: '#f97316' },
  score: { name: 'High Scores', icon: 'trophy', color: '#eab308' },
  survival: { name: 'Survival', icon: 'clock', color: '#10b981' },
  speed: { name: 'Speed Demon', icon: 'zap', color: '#3b82f6' },
  funny: { name: 'Oops Moments', icon: 'alert', color: '#ef4444' },
  vsai: { name: 'AI Destroyer', icon: 'cpu', color: '#8b5cf6' },
  multiplayer: { name: 'Social Player', icon: 'users', color: '#06b6d4' },
  special: { name: 'Special', icon: 'sparkles', color: '#d946ef' },
  streak: { name: 'Win Streaks', icon: 'flame', color: '#f97316' },
  food: { name: 'Food Hunter', icon: 'apple', color: '#22c55e' },
  leaderboard: { name: 'Leaderboard', icon: 'crown', color: '#f59e0b' }
};

export const ACHIEVEMENTS = [
  ...GAMEPLAY_ACHIEVEMENTS,
  ...SCORE_ACHIEVEMENTS,
  ...SURVIVAL_ACHIEVEMENTS,
  ...SPEED_ACHIEVEMENTS,
  ...FUNNY_ACHIEVEMENTS,
  ...VS_AI_ACHIEVEMENTS,
  ...MULTIPLAYER_ACHIEVEMENTS,
  ...SPECIAL_ACHIEVEMENTS,
  ...STREAK_ACHIEVEMENTS,
  ...LEADERBOARD_ACHIEVEMENTS,
  ...SOCIAL_ACHIEVEMENTS,
  ...SKILL_ACHIEVEMENTS,
  ...FOOD_ACHIEVEMENTS
];

export const getAchievementsByCategory = (category) => {
  return ACHIEVEMENTS.filter((achievement) => achievement.category === category);
};

export const getAchievementsByTier = (tier) => {
  return ACHIEVEMENTS.filter((achievement) => achievement.tier === tier);
};

export const getTotalAchievementPoints = () => {
  return ACHIEVEMENTS.reduce((total, achievement) => total + achievement.points, 0);
};

export const getAchievementById = (id) => {
  return ACHIEVEMENTS.find((achievement) => achievement.id === id);
};

export const checkAchievementRequirements = (achievement, userStats) => {
  if (!achievement || !achievement.requirements || !userStats) {
    return false;
  }

  const { requirements } = achievement;

  if (achievement.id === 'ai_slayer') {
    const aiWins = userStats.aiEasyWins || 0;
    return aiWins >= (requirements.aiWins || 1);
  }

  if (achievement.id === 'ai_hunter') {
    const aiWins = userStats.aiMediumWins || 0;
    return aiWins >= (requirements.aiWins || 1);
  }

  if (achievement.id === 'terminator') {
    const aiWins = userStats.aiImpossibleWins || 0;
    return aiWins >= (requirements.aiWins || 1);
  }

  if (achievement.id === 'am_i_god') {
    const aiImpossibleStreak = userStats.aiImpossibleStreak || 0;
    return aiImpossibleStreak >= (requirements.aiStreak || 3);
  }

  if (achievement.id === 'perfectionist') {
    return userStats.perfectGame === true;
  }

  for (const [key, value] of Object.entries(requirements)) {
    let userValue = userStats[key];

    if (key === 'earlyUser') {
      userValue = userStats.earlyUser || false;
    } else if (key === 'perfectGame') {
      userValue = userStats.perfectGame || false;
    } else if (typeof userValue === 'undefined') {
      userValue = 0;
    }

    if (typeof value === 'boolean') {
      if (userValue !== value) {
        return false;
      }
    } else if (typeof value === 'number') {
      if (Number(userValue) < value) {
        return false;
      }
    } else if (userValue !== value) {
      return false;
    }
  }

  return true;
};

export default ACHIEVEMENTS;
