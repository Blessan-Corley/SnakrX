/**
 * Game Hooks - Main Export
 * Central export point for all game-related hooks
 */

export { GameContext, useGameContext } from './context.js';
export { GAME_CONFIG, GAME_STATES, GAME_MODES, DIRECTIONS, createInitialGameState } from './constants.js';
export { updateSnakesPosition, isValidDirectionChange } from './gameLogic.js';
export { saveGameDataToFirebase } from './gameSave.js';

// Re-export the main hooks from the refactored useGame
export { GameProvider, useGame, useGameOperations } from '../useGame.js';
