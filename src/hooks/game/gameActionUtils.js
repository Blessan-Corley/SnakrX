import { AI_DIFFICULTIES, GAME_MODES, GAME_STATES } from '../../utils/gameUtils.js';

export const normalizePlayerCount = (playerCount) => (
  Number.isFinite(playerCount) && playerCount > 0 ? playerCount : 1
);

const capitalize = (value) => (
  typeof value === 'string' && value.length > 0
    ? `${value.charAt(0).toUpperCase()}${value.slice(1)}`
    : value
);

export const getSessionStartLabel = ({
  difficulty,
  mode,
  playerCount
}) => {
  if (mode === GAME_MODES.MULTIPLAYER) {
    const normalizedPlayerCount = normalizePlayerCount(playerCount);
    const playerLabel = normalizedPlayerCount === 1 ? 'Player' : 'Players';
    return `Starting Multiplayer Mode - ${normalizedPlayerCount} ${playerLabel}`;
  }

  if (mode === GAME_MODES.VS_AI) {
    return `Starting VS AI Mode - ${capitalize(difficulty || AI_DIFFICULTIES.MEDIUM)}`;
  }

  if (mode === 'classic_transparent') {
    return 'Starting Transparent Mode';
  }

  return 'Starting Classic Mode';
};

export const getSessionStartToastId = ({
  difficulty,
  mode,
  playerCount
}) => {
  if (mode === GAME_MODES.MULTIPLAYER) {
    return `session-start:${mode}:${difficulty || AI_DIFFICULTIES.MEDIUM}:${normalizePlayerCount(playerCount)}`;
  }

  if (mode === GAME_MODES.VS_AI) {
    return `session-start:${mode}:${difficulty || AI_DIFFICULTIES.MEDIUM}`;
  }

  return `session-start:${mode || GAME_MODES.CLASSIC}`;
};

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
