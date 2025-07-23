/**
 * SnakrX Game Utilities
 * Core game logic and helper functions
 */

// Game constants
export const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 }
};

export const GAME_MODES = {
  CLASSIC: 'classic',
  VS_AI: 'vsai',
  MULTIPLAYER: 'multiplayer'
};

export const AI_DIFFICULTIES = {
  EASY: 'easy',
  MEDIUM: 'medium',
  IMPOSSIBLE: 'impossible'
};

export const GAME_STATES = {
  MENU: 'menu',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'game_over',
  VICTORY: 'victory'
};

// Board size configurations
export const BOARD_CONFIGS = {
  [GAME_MODES.CLASSIC]: {
    desktop: { width: 20, height: 20 },
    mobile: { width: 16, height: 16 }
  },
  [GAME_MODES.VS_AI]: {
    desktop: { width: 22, height: 22 },
    mobile: { width: 16, height: 16 }
  },
  [GAME_MODES.MULTIPLAYER]: {
    2: { width: 24, height: 24 },
    3: { width: 26, height: 26 },
    4: { width: 28, height: 28 }
  }
};

// Speed configurations
export const SPEED_CONFIGS = {
  INITIAL: 150, // milliseconds
  INCREMENT: 10, // speed increase per food
  MIN_SPEED: 50, // fastest possible speed
  MAX_MULTIPLIER: 15 // maximum speed multiplier
};

// Points system
export const POINTS = {
  [GAME_MODES.CLASSIC]: 5,
  [`${GAME_MODES.VS_AI}_${AI_DIFFICULTIES.EASY}`]: 5,
  [`${GAME_MODES.VS_AI}_${AI_DIFFICULTIES.MEDIUM}`]: 10,
  [`${GAME_MODES.VS_AI}_${AI_DIFFICULTIES.IMPOSSIBLE}`]: 20,
  [GAME_MODES.MULTIPLAYER]: 10
};

// Snake colors for multiplayer
export const SNAKE_COLORS = {
  player: '#10b981',
  ai: '#6b7280',
  player2: '#3b82f6',
  player3: '#f59e0b',
  player4: '#ef4444',
  dead: '#4b5563' // Gray for dead snakes
};

// Utility Functions

/**
 * Get board dimensions based on game mode and device
 */
export const getBoardSize = (mode, playerCount = 1, isMobile = false) => {
  if (mode === GAME_MODES.MULTIPLAYER) {
    return BOARD_CONFIGS[GAME_MODES.MULTIPLAYER][playerCount] || BOARD_CONFIGS[GAME_MODES.MULTIPLAYER][4];
  }
  
  const config = BOARD_CONFIGS[mode];
  return isMobile ? config.mobile : config.desktop;
};

/**
 * Calculate points based on game mode and difficulty
 */
export const calculatePoints = (mode, difficulty = null, foodCount = 1) => {
  let basePoints;
  
  if (mode === GAME_MODES.VS_AI && difficulty) {
    basePoints = POINTS[`${mode}_${difficulty}`];
  } else {
    basePoints = POINTS[mode];
  }
  
  return basePoints * foodCount;
};

/**
 * Calculate current game speed based on food eaten
 */
export const calculateSpeed = (foodEaten) => {
  const speedDecrease = Math.min(foodEaten * SPEED_CONFIGS.INCREMENT, SPEED_CONFIGS.INITIAL - SPEED_CONFIGS.MIN_SPEED);
  return Math.max(SPEED_CONFIGS.INITIAL - speedDecrease, SPEED_CONFIGS.MIN_SPEED);
};

/**
 * Get speed multiplier for display
 */
export const getSpeedMultiplier = (currentSpeed) => {
  return Math.round((SPEED_CONFIGS.INITIAL / currentSpeed) * 10) / 10;
};

/**
 * Check if two positions are equal
 */
export const positionsEqual = (pos1, pos2) => {
  return pos1.x === pos2.x && pos1.y === pos2.y;
};

/**
 * Check if position is within bounds
 */
export const isWithinBounds = (position, boardWidth, boardHeight) => {
  return position.x >= 0 && position.x < boardWidth && 
         position.y >= 0 && position.y < boardHeight;
};

/**
 * Check if position collides with snake body
 */
export const checkSelfCollision = (head, body) => {
  return body.some(segment => positionsEqual(head, segment));
};

/**
 * Check collision between two snake heads
 */
export const checkHeadCollision = (snake1Head, snake2Head) => {
  return positionsEqual(snake1Head, snake2Head);
};

/**
 * Check if snake head collides with another snake's body
 */
export const checkSnakeCollision = (head, otherSnake) => {
  return otherSnake.some(segment => positionsEqual(head, segment));
};

/**
 * Generate random food position that doesn't collide with snakes
 */
export const generateFoodPosition = (boardWidth, boardHeight, snakes = []) => {
  const occupiedPositions = new Set();
  
  // Add all snake segments to occupied positions
  snakes.forEach(snake => {
    snake.forEach(segment => {
      occupiedPositions.add(`${segment.x},${segment.y}`);
    });
  });
  
  let attempts = 0;
  const maxAttempts = boardWidth * boardHeight;
  
  while (attempts < maxAttempts) {
    const x = Math.floor(Math.random() * boardWidth);
    const y = Math.floor(Math.random() * boardHeight);
    const posKey = `${x},${y}`;
    
    if (!occupiedPositions.has(posKey)) {
      return { x, y };
    }
    
    attempts++;
  }
  
  // Fallback: return any available position
  for (let x = 0; x < boardWidth; x++) {
    for (let y = 0; y < boardHeight; y++) {
      const posKey = `${x},${y}`;
      if (!occupiedPositions.has(posKey)) {
        return { x, y };
      }
    }
  }
  
  // This should never happen unless the board is completely filled
  return { x: 0, y: 0 };
};

/**
 * Get opposite direction
 */
export const getOppositeDirection = (direction) => {
  const opposites = {
    [DIRECTIONS.UP]: DIRECTIONS.DOWN,
    [DIRECTIONS.DOWN]: DIRECTIONS.UP,
    [DIRECTIONS.LEFT]: DIRECTIONS.RIGHT,
    [DIRECTIONS.RIGHT]: DIRECTIONS.LEFT
  };
  
  return opposites[direction] || direction;
};

/**
 * Check if direction change is valid (prevent 180-degree turns)
 */
export const isValidDirectionChange = (currentDirection, newDirection) => {
  if (!currentDirection) return true;
  
  const opposite = getOppositeDirection(currentDirection);
  return !positionsEqual(newDirection, opposite);
};

/**
 * Calculate manhattan distance between two points
 */
export const manhattanDistance = (pos1, pos2) => {
  return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
};

/**
 * Format time in MM:SS format
 */
export const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Format score with commas
 */
export const formatScore = (score) => {
  return score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Get snake starting positions for multiplayer
 */
export const getStartingPositions = (playerCount, boardWidth, boardHeight) => {
  const positions = [];
  const margin = 3;
  
  switch (playerCount) {
    case 2:
      positions.push(
        { x: margin, y: Math.floor(boardHeight / 2) },
        { x: boardWidth - margin - 1, y: Math.floor(boardHeight / 2) }
      );
      break;
    case 3:
      positions.push(
        { x: margin, y: margin },
        { x: boardWidth - margin - 1, y: margin },
        { x: Math.floor(boardWidth / 2), y: boardHeight - margin - 1 }
      );
      break;
    case 4:
      positions.push(
        { x: margin, y: margin },
        { x: boardWidth - margin - 1, y: margin },
        { x: margin, y: boardHeight - margin - 1 },
        { x: boardWidth - margin - 1, y: boardHeight - margin - 1 }
      );
      break;
    default:
      positions.push({ x: Math.floor(boardWidth / 2), y: Math.floor(boardHeight / 2) });
  }
  
  return positions;
};

/**
 * Get starting directions for multiplayer
 */
export const getStartingDirections = (playerCount) => {
  switch (playerCount) {
    case 2:
      return [DIRECTIONS.RIGHT, DIRECTIONS.LEFT];
    case 3:
      return [DIRECTIONS.RIGHT, DIRECTIONS.LEFT, DIRECTIONS.UP];
    case 4:
      return [DIRECTIONS.RIGHT, DIRECTIONS.LEFT, DIRECTIONS.RIGHT, DIRECTIONS.LEFT];
    default:
      return [DIRECTIONS.RIGHT];
  }
};

/**
 * Check if device is mobile
 */
export const isMobile = () => {
  if (typeof window === 'undefined') return false;
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform));
};

/**
 * Get available keyboard keys based on game mode
 */
export const getControlKeys = (mode, playerIndex = 0) => {
  const singlePlayerKeys = {
    up: ['ArrowUp', 'KeyW'],
    down: ['ArrowDown', 'KeyS'],
    left: ['ArrowLeft', 'KeyA'],
    right: ['ArrowRight', 'KeyD'],
    pause: ['Space', 'KeyP'],
    restart: ['KeyR']
  };
  
  if (mode !== GAME_MODES.MULTIPLAYER) {
    return singlePlayerKeys;
  }
  
  const multiPlayerKeys = [
    {
      up: ['KeyW'],
      down: ['KeyS'],
      left: ['KeyA'],
      right: ['KeyD']
    },
    {
      up: ['ArrowUp'],
      down: ['ArrowDown'],
      left: ['ArrowLeft'],
      right: ['ArrowRight']
    },
    {
      up: ['KeyI'],
      down: ['KeyK'],
      left: ['KeyJ'],
      right: ['KeyL']
    },
    {
      up: ['Digit8'],
      down: ['Digit5'],
      left: ['Digit4'],
      right: ['Digit6']
    }
  ];
  
  return multiPlayerKeys[playerIndex] || multiPlayerKeys[0];
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const allowedDomains = ['gmail.com', 'outlook.com', 'yahoo.com', 'mail.com'];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) return false;
  
  const domain = email.split('@')[1];
  return allowedDomains.includes(domain);
};

/**
 * Validate username format
 */
export const isValidUsername = (username) => {
  return username && username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username);
};

/**
 * Validate password format
 */
export const isValidPassword = (password) => {
  return password && password.length >= 6;
};

/**
 * Generate unique game ID
 */
export const generateGameId = () => {
  return `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Deep clone object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
};

export default {
  DIRECTIONS,
  GAME_MODES,
  AI_DIFFICULTIES,
  GAME_STATES,
  BOARD_CONFIGS,
  SPEED_CONFIGS,
  POINTS,
  SNAKE_COLORS,
  getBoardSize,
  calculatePoints,
  calculateSpeed,
  getSpeedMultiplier,
  positionsEqual,
  isWithinBounds,
  checkSelfCollision,
  checkHeadCollision,
  checkSnakeCollision,
  generateFoodPosition,
  getOppositeDirection,
  isValidDirectionChange,
  manhattanDistance,
  formatTime,
  formatScore,
  getStartingPositions,
  getStartingDirections,
  isMobile,
  getControlKeys,
  isValidEmail,
  isValidUsername,
  isValidPassword,
  generateGameId,
  deepClone,
  debounce,
  throttle
};