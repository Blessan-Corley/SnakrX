import { AI_DIFFICULTIES, GAME_MODES, GAME_STATES } from '../../utils/gameUtils.js';

export const normalizePlayerCount = (playerCount) => (
  Number.isFinite(playerCount) && playerCount > 0 ? playerCount : 1
);

export const getRestartConfiguration = (gameStateRef) => {
  const current = gameStateRef.current || {};

  return {
    mode: current.gameMode || GAME_MODES.CLASSIC,
    difficulty: current.difficulty || AI_DIFFICULTIES.MEDIUM,
    playerCount: normalizePlayerCount(current.playerCount),
    bonusFoodEnabled: current.bonusFoodEnabled !== false
  };
};

export const canStartGame = (gameState) => gameState === GAME_STATES.READY;

export const canPauseGame = (current) => (
  current.gameState === GAME_STATES.PLAYING && !current.isPaused
);

export const canResumeGame = (current) => (
  current.gameState === GAME_STATES.PLAYING && current.isPaused
);

export const canTogglePause = (gameState) => gameState === GAME_STATES.PLAYING;

export const isTerminalGameState = (gameState) => (
  gameState === GAME_STATES.GAME_OVER || gameState === GAME_STATES.VICTORY
);

export const shouldStartOnDirectionChange = (currentState) => (
  currentState.gameState === GAME_STATES.READY &&
  currentState.gameMode !== GAME_MODES.MULTIPLAYER
);

export const isDirectOppositeDirection = (referenceDirection, newDirection) => (
  referenceDirection &&
  referenceDirection.x === -newDirection.x &&
  referenceDirection.y === -newDirection.y
);

export const isDuplicateDirection = (referenceDirection, newDirection) => (
  referenceDirection &&
  referenceDirection.x === newDirection.x &&
  referenceDirection.y === newDirection.y
);
