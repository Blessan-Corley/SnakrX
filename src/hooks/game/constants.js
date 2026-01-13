/**
 * Game Constants
 * Configuration constants for game mechanics
 */

import {
  AI_DIFFICULTIES,
  DIRECTIONS,
  GAME_MODES,
  GAME_STATES,
  SPEED_CONFIGS,
  getBoardSize,
  isMobile,
} from '../../utils/gameUtils.js';

// Game configuration constants
export const GAME_CONFIG = {
  QUICK_DEATH_THRESHOLD: 5, // seconds - defines a "quick death" for achievements
  PROFILE_REFRESH_DELAY: 1000, // ms - delay before refreshing profile after stat update
  ACHIEVEMENT_CHECK_DELAY: 500, // ms - delay for Firestore consistency
  AUTO_START_DELAY: 3000 // ms - auto-start delay in ready state
};

// Enhanced initial state with tracking fields
export const createInitialGameState = () => ({
  gameState: GAME_STATES.MENU,
  gameMode: GAME_MODES.CLASSIC,
  difficulty: AI_DIFFICULTIES.MEDIUM,
  playerCount: 1,
  boardSize: getBoardSize(GAME_MODES.CLASSIC, 1, isMobile()),
  snakes: [],
  food: [],
  score: 0,
  gameTime: 0,
  speed: SPEED_CONFIGS.INITIAL,
  foodEaten: 0,
  isPaused: false,
  aiController: null,
  deadPlayers: new Set(),
  startTime: null,
  gameId: null,
  winnerId: null,

  moves: 0,
  wallHits: 0,
  selfHits: 0,
  timeToFirstFood: null,
  timeToMaxLength: null,
  maxLengthReached: 1,
  closeCalls: 0,
  fastEats: 0,
  highlightCollision: null,
  bonusFoodEnabled: true,
  normalFoodsSinceBonus: 0,
  pendingBonusSpawns: 0,
  bonusFoodsSpawned: 0,
  bonusFoodsCollected: 0,
  bonusFoodPoints: 0
});

export { GAME_STATES, GAME_MODES, DIRECTIONS };
