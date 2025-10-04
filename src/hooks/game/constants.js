/**
 * Game Constants
 * Configuration constants for game mechanics
 */

import { GAME_STATES, GAME_MODES, DIRECTIONS } from '../../utils/gameUtils.js';

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
  difficulty: null,
  playerCount: 1,
  snakes: [],
  food: null,
  score: 0,
  gameTime: 0,
  speed: 180,
  foodEaten: 0,
  isPaused: false,
  boardSize: { width: 30, height: 25 },
  startTime: null,
  gameId: null,
  deadPlayers: [],

  // Enhanced tracking
  moves: 0,
  wallHits: 0,
  selfHits: 0,
  timeToFirstFood: null,
  timeToMaxLength: null,
  maxLengthReached: 1
});

export { GAME_STATES, GAME_MODES, DIRECTIONS };
