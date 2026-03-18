export const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 }
};

export const GAME_MODES = {
  CLASSIC: 'classic',
  CLASSIC_TRANSPARENT: 'classic_transparent',
  VS_AI: 'vsai',
  MULTIPLAYER: 'multiplayer'
};

export const MODE_DESCRIPTIONS = {
  [GAME_MODES.CLASSIC]: {
    title: 'Classic Mode',
    description: 'Traditional snake game - hitting walls or yourself ends the game.',
    rules: ['Hit wall = Game Over', 'Self collision = Game Over', 'Collect food to grow']
  },
  [GAME_MODES.CLASSIC_TRANSPARENT]: {
    title: 'Transparent Mode',
    description: 'Snake can pass through walls and appear on the opposite side.',
    rules: ['Pass through walls', 'Self collision = Game Over', 'Collect food to grow']
  },
  [GAME_MODES.VS_AI]: {
    title: 'VS AI Mode',
    description: 'Challenge computer-controlled opponents of varying difficulty.',
    rules: [
      'Bodies are ghosted - wall, self-hit, or head clash ends a round',
      'Higher score wins the match (tie counts as loss)',
      'Easy: beginner friendly',
      'Medium: balanced challenge',
      'Impossible: maximum pressure'
    ]
  },
  [GAME_MODES.MULTIPLAYER]: {
    title: 'Multiplayer Mode',
    description: 'Local battles with multiple players on one screen.',
    rules: [
      'Bodies are ghosted - head-to-head knocks both out',
      'Walls and self-collisions end your round',
      'Highest score wins'
    ]
  }
};

export const AI_DIFFICULTIES = {
  EASY: 'easy',
  MEDIUM: 'medium',
  IMPOSSIBLE: 'impossible'
};

export const GAME_STATES = {
  MENU: 'menu',
  READY: 'ready',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'game_over',
  VICTORY: 'victory'
};

export const BOARD_CONFIGS = {
  [GAME_MODES.CLASSIC]: {
    desktop: { width: 35, height: 30 },
    mobile: { width: 24, height: 20 }
  },
  [GAME_MODES.CLASSIC_TRANSPARENT]: {
    desktop: { width: 35, height: 30 },
    mobile: { width: 24, height: 20 }
  },
  [GAME_MODES.VS_AI]: {
    desktop: { width: 32, height: 26 },
    mobile: { width: 20, height: 18 }
  },
  [GAME_MODES.MULTIPLAYER]: {
    2: { width: 34, height: 28 },
    3: { width: 36, height: 30 },
    4: { width: 38, height: 32 }
  }
};

export const SPEED_CONFIGS = {
  INITIAL: 200,
  INCREMENT: 5,
  MIN_SPEED: 40,
  MAX_MULTIPLIER: 5,
  FOOD_THRESHOLD: 5
};

export const SPEED_PROFILE_CONFIGS = {
  solo: {
    ...SPEED_CONFIGS,
    FOOD_THRESHOLD: 3
  },
  competitive: {
    INITIAL: 200,
    INCREMENT: 6,
    MIN_SPEED: 60,
    MAX_MULTIPLIER: 3.4,
    FOOD_THRESHOLD: 4
  }
};

export const FOOD_TYPES = {
  NORMAL: 'normal',
  BONUS_LARGE: 'bonus_large'
};

export const BONUS_FOOD_CONFIG = {
  SPAWN_AFTER_NORMAL_FOOD: 5,
  LIFETIME_MS: 5000,
  SIZE: 2,
  MAX_POINTS: 35,
  MIN_POINTS: 15
};

export const POINTS = {
  [GAME_MODES.CLASSIC]: 5,
  [`${GAME_MODES.VS_AI}_${AI_DIFFICULTIES.EASY}`]: 5,
  [`${GAME_MODES.VS_AI}_${AI_DIFFICULTIES.MEDIUM}`]: 10,
  [`${GAME_MODES.VS_AI}_${AI_DIFFICULTIES.IMPOSSIBLE}`]: 20,
  [GAME_MODES.MULTIPLAYER]: 10
};

export const SNAKE_COLORS = {
  player: '#10b981',
  ai: '#6b7280',
  player2: '#3b82f6',
  player3: '#f59e0b',
  player4: '#ef4444',
  dead: '#4b5563'
};
