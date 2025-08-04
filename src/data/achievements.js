/**
 * SnakrX Achievements Configuration
 * Easily configurable achievement system with categories, tiers, and requirements
 */

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
  gameplay: { name: 'Gameplay', icon: '🎮', color: '#f97316' },
  score: { name: 'High Scores', icon: '🏆', color: '#eab308' },
  survival: { name: 'Survival', icon: '⏰', color: '#10b981' },
  speed: { name: 'Speed Demon', icon: '⚡', color: '#3b82f6' },
  funny: { name: 'Oops Moments', icon: '😅', color: '#ef4444' },
  vsai: { name: 'AI Destroyer', icon: '🤖', color: '#8b5cf6' },
  multiplayer: { name: 'Social Player', icon: '👥', color: '#06b6d4' },
  special: { name: 'Special', icon: '✨', color: '#d946ef' },
  streak: { name: 'Win Streaks', icon: '🔥', color: '#f97316' },
  food: { name: 'Food Hunter', icon: '🍎', color: '#22c55e' }
};

export const ACHIEVEMENTS = [
  // Gameplay Achievements
  {
    id: 'first_game',
    title: 'Getting Started',
    description: 'Play your first game of SnakrX',
    icon: '🎮',
    category: 'gameplay',
    tier: 'common',
    points: 5,
    requirements: { games: 1 }
  },
  {
    id: 'first_win',
    title: 'Not a Noob Anymore',
    description: 'Win your first game',
    icon: '🥇',
    category: 'gameplay',
    tier: 'common',
    points: 10,
    requirements: { wins: 1 }
  },
  {
    id: 'dedication',
    title: 'Dedicated Player',
    description: 'Play 50 games',
    icon: '🎯',
    category: 'gameplay',
    tier: 'uncommon',
    points: 25,
    requirements: { games: 50 }
  },
  {
    id: 'centurion',
    title: 'Centurion',
    description: 'Play 100 games',
    icon: '💯',
    category: 'gameplay',
    tier: 'rare',
    points: 50,
    requirements: { games: 100 }
  },
  {
    id: 'legendary_player',
    title: 'Legendary Player',
    description: 'Play 1000 games',
    icon: '👑',
    category: 'gameplay',
    tier: 'legendary',
    points: 100,
    requirements: { games: 1000 }
  },
  
  // Score Achievements
  {
    id: 'first_hundred',
    title: 'Century Club',
    description: 'Score 100 points in a single game',
    icon: '💯',
    category: 'score',
    tier: 'common',
    points: 10,
    requirements: { singleScore: 100 }
  },
  {
    id: 'high_roller',
    title: 'High Roller',
    description: 'Score 500 points in a single game',
    icon: '🎰',
    category: 'score',
    tier: 'uncommon',
    points: 25,
    requirements: { singleScore: 500 }
  },
  {
    id: 'thousand_points',
    title: 'Thousand Club',
    description: 'Score 1000 points in a single game',
    icon: '🏆',
    category: 'score',
    tier: 'rare',
    points: 50,
    requirements: { singleScore: 1000 }
  },
  {
    id: 'score_master',
    title: 'Born to be a Snake Forced to be Human',
    description: 'Accumulate 2000 total points',
    icon: '💎',
    category: 'score',
    tier: 'epic',
    points: 75,
    requirements: { totalScore: 2000 }
  },
  {
    id: 'point_millionaire',
    title: 'Point Millionaire',
    description: 'Accumulate 10,000 total points',
    icon: '💰',
    category: 'score',
    tier: 'legendary',
    points: 150,
    requirements: { totalScore: 10000 }
  },
  
  // Survival Achievements
  {
    id: 'survivor',
    title: 'Survivor',
    description: 'Survive for 5 minutes in classic mode',
    icon: '⏰',
    category: 'survival',
    tier: 'uncommon',
    points: 20,
    requirements: { survivalTime: 300 }
  },
  {
    id: 'endurance',
    title: 'Thala for a Reason',
    description: 'Survive for 7 minutes in classic mode',
    icon: '🏃',
    category: 'survival',
    tier: 'rare',
    points: 40,
    requirements: { survivalTime: 420 }
  },
  {
    id: 'immortal',
    title: 'I can do this all day',
    description: 'Survive for 15 minutes in classic mode',
    icon: '♾️',
    category: 'survival',
    tier: 'legendary',
    points: 100,
    requirements: { survivalTime: 900 }
  },
  
  // Speed Achievements
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Reach 2x speed in classic mode',
    icon: '⚡',
    category: 'speed',
    tier: 'uncommon',
    points: 15,
    requirements: { maxSpeed: 2 }
  },
  {
    id: 'lightning_fast',
    title: 'Lightning Fast',
    description: 'Reach 3x speed in classic mode',
    icon: '🌩️',
    category: 'speed',
    tier: 'rare',
    points: 35,
    requirements: { maxSpeed: 3 }
  },
  {
    id: 'sonic',
    title: 'Sonic Speed',
    description: 'Reach 4x speed in classic mode',
    icon: '💨',
    category: 'speed',
    tier: 'epic',
    points: 75,
    requirements: { maxSpeed: 4 }
  },
  {
    id: 'hyperspeed',
    title: 'Hyperspeed',
    description: 'Reach 5x speed in classic mode',
    icon: '🚀',
    category: 'speed',
    tier: 'legendary',
    points: 150,
    requirements: { maxSpeed: 5 }
  },
  
  // Funny/Failure Achievements
  {
    id: 'wall_breaker_bronze',
    title: 'Wall Breaker',
    description: 'Hit the wall 10 times',
    icon: '🥉',
    category: 'funny',
    tier: 'common',
    points: 10,
    requirements: { wallHits: 10 }
  },
  {
    id: 'wall_breaker_silver',
    title: 'Persistent Crasher',
    description: 'Hit the wall 100 times',
    icon: '🥈',
    category: 'funny',
    tier: 'uncommon',
    points: 25,
    requirements: { wallHits: 100 }
  },
  {
    id: 'wall_breaker_gold',
    title: 'Demolition Expert',
    description: 'Hit the wall 500 times',
    icon: '🥇',
    category: 'funny',
    tier: 'rare',
    points: 50,
    requirements: { wallHits: 500 }
  },
  {
    id: 'self_destruct',
    title: 'Self-Destructive',
    description: 'Hit yourself 50 times',
    icon: '💥',
    category: 'funny',
    tier: 'uncommon',
    points: 20,
    requirements: { selfHits: 50 }
  },
  {
    id: 'oops_master',
    title: 'Oops Master',
    description: 'Die within 5 seconds 20 times',
    icon: '🤦‍♂️',
    category: 'funny',
    tier: 'rare',
    points: 30,
    requirements: { quickDeaths: 20 }
  },
  
  // VS AI Achievements
  {
    id: 'ai_slayer',
    title: 'AI Slayer',
    description: 'Defeat AI on easy mode',
    icon: '🤖',
    category: 'vsai',
    tier: 'common',
    points: 15,
    requirements: { aiWins: 1, difficulty: 'easy' }
  },
  {
    id: 'ai_hunter',
    title: 'AI Hunter',
    description: 'Defeat AI on medium mode',
    icon: '🎯',
    category: 'vsai',
    tier: 'uncommon',
    points: 30,
    requirements: { aiWins: 1, difficulty: 'medium' }
  },
  {
    id: 'terminator',
    title: 'Terminator',
    description: 'Defeat AI on impossible mode',
    icon: '🔥',
    category: 'vsai',
    tier: 'epic',
    points: 75,
    requirements: { aiWins: 1, difficulty: 'impossible' }
  },
  {
    id: 'am_i_god',
    title: 'Am I God?',
    description: 'Win 3 consecutive games against AI - Impossible',
    icon: '😇',
    category: 'vsai',
    tier: 'legendary',
    points: 100,
    requirements: { aiStreak: 3, difficulty: 'impossible' }
  },
  
  // Multiplayer Achievements
  {
    id: 'social_player',
    title: 'Social Player',
    description: 'Play your first multiplayer game',
    icon: '👥',
    category: 'multiplayer',
    tier: 'common',
    points: 10,
    requirements: { multiplayerGames: 1 }
  },
  {
    id: 'last_snake_standing',
    title: 'Last Snake Standing',
    description: 'Win a 4-player game',
    icon: '👑',
    category: 'multiplayer',
    tier: 'rare',
    points: 50,
    requirements: { multiplayerWins: 1, playerCount: 4 }
  },
  {
    id: 'multiplayer_dominator',
    title: 'Multiplayer Dominator',
    description: 'Win 10 multiplayer games',
    icon: '🏆',
    category: 'multiplayer',
    tier: 'epic',
    points: 75,
    requirements: { multiplayerWins: 10 }
  },
  
  // Special Achievements
  {
    id: 'ghost_master',
    title: 'Ghost Master',
    description: 'Score 200+ points in transparent mode',
    icon: '👻',
    category: 'special',
    tier: 'uncommon',
    points: 30,
    requirements: { transparentScore: 200 }
  },
  {
    id: 'perfectionist',
    title: 'Perfectionist',
    description: 'Complete a game without hitting walls (transparent mode)',
    icon: '✨',
    category: 'special',
    tier: 'rare',
    points: 40,
    requirements: { perfectGame: true }
  },
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Play during the first week of launch',
    icon: '🐦',
    category: 'special',
    tier: 'legendary',
    points: 100,
    requirements: { earlyUser: true }
  },
  
  // Streak Achievements
  {
    id: 'win_streak_3',
    title: 'Hat Trick',
    description: 'Win 3 games in a row',
    icon: '🎩',
    category: 'streak',
    tier: 'uncommon',
    points: 25,
    requirements: { winStreak: 3 }
  },
  {
    id: 'win_streak_5',
    title: 'Unstoppable',
    description: 'Win 5 games in a row',
    icon: '🔥',
    category: 'streak',
    tier: 'rare',
    points: 50,
    requirements: { winStreak: 5 }
  },
  {
    id: 'win_streak_10',
    title: 'Legendary Streak',
    description: 'Win 10 games in a row',
    icon: '🌟',
    category: 'streak',
    tier: 'legendary',
    points: 100,
    requirements: { winStreak: 10 }
  },
  
  // Food Achievements
  {
    id: 'food_hunter',
    title: 'Food Hunter',
    description: 'Eat 100 food items',
    icon: '🍎',
    category: 'food',
    tier: 'common',
    points: 15,
    requirements: { foodEaten: 100 }
  },
  {
    id: 'glutton',
    title: 'Glutton',
    description: 'Eat 1000 food items',
    icon: '🍽️',
    category: 'food',
    tier: 'uncommon',
    points: 35,
    requirements: { foodEaten: 1000 }
  },
  {
    id: 'food_vacuum',
    title: 'Food Vacuum',
    description: 'Eat 50 food items in a single game',
    icon: '🌪️',
    category: 'food',
    tier: 'rare',
    points: 40,
    requirements: { singleGameFood: 50 }
  }
];

// Helper functions for achievement system
export const getAchievementsByCategory = (category) => {
  return ACHIEVEMENTS.filter(achievement => achievement.category === category);
};

export const getAchievementsByTier = (tier) => {
  return ACHIEVEMENTS.filter(achievement => achievement.tier === tier);
};

export const getTotalAchievementPoints = () => {
  return ACHIEVEMENTS.reduce((total, achievement) => total + achievement.points, 0);
};

export const getAchievementById = (id) => {
  return ACHIEVEMENTS.find(achievement => achievement.id === id);
};

// Achievement requirements validation
export const checkAchievementRequirements = (achievement, userStats) => {
  const { requirements } = achievement;
  
  for (const [key, value] of Object.entries(requirements)) {
    if (userStats[key] === undefined || userStats[key] < value) {
      return false;
    }
  }
  
  return true;
};

export default ACHIEVEMENTS;