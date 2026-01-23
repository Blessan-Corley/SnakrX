/**
 * SnakrX Game Utilities
 * Core game logic and helper functions - ENHANCED
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
    rules: ['Easy: 65% optimal moves', 'Medium: 80% optimal moves', 'Impossible: 100% optimal moves']
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

// ENHANCED: Better board size configurations for improved gameplay
export const BOARD_CONFIGS = {
  [GAME_MODES.CLASSIC]: {
    desktop: { width: 35, height: 30 }, // Increased size for better gameplay
    mobile: { width: 24, height: 20 }   // Larger mobile size for better control
  },
  [GAME_MODES.VS_AI]: {
    desktop: { width: 32, height: 26 }, // Much larger for VS AI
    mobile: { width: 20, height: 18 }   // Larger mobile size
  },
  [GAME_MODES.MULTIPLAYER]: {
    2: { width: 34, height: 28 },       // Much larger for multiplayer
    3: { width: 36, height: 30 },       // Even larger
    4: { width: 38, height: 32 }        // Largest for 4 players
  }
};

// Speed configurations - OPTIMIZED for smooth, responsive gameplay
export const SPEED_CONFIGS = {
  INITIAL: 180, // Faster start for more engaging gameplay
  INCREMENT: 8, // Smoother progression curve
  MIN_SPEED: 60, // Reasonable maximum speed for playability
  MAX_MULTIPLIER: 6, // Balanced max speed multiplier
  FOOD_THRESHOLD: 2 // Increase speed every 2 food eaten for balanced progression
};

// Points system
export const POINTS = {
  [GAME_MODES.CLASSIC]: 5,
  [`${GAME_MODES.VS_AI}_${AI_DIFFICULTIES.EASY}`]: 5,
  [`${GAME_MODES.VS_AI}_${AI_DIFFICULTIES.MEDIUM}`]: 10,
  [`${GAME_MODES.VS_AI}_${AI_DIFFICULTIES.IMPOSSIBLE}`]: 20,
  [GAME_MODES.MULTIPLAYER]: 10
};

// Snake colors for multiplayer - ENHANCED
export const SNAKE_COLORS = {
  player: '#10b981',    // Emerald
  ai: '#6b7280',        // Gray
  player2: '#3b82f6',   // Blue
  player3: '#f59e0b',   // Amber
  player4: '#ef4444',   // Red
  dead: '#4b5563'       // Dark gray for dead snakes
};

// Utility Functions

/**
 * Get board dimensions based on game mode and device - ENHANCED
 */
export const getBoardSize = (mode, playerCount = 1, isMobile = false) => {
  try {
    if (mode === GAME_MODES.MULTIPLAYER) {
      const config = BOARD_CONFIGS[GAME_MODES.MULTIPLAYER][playerCount];
      if (!config) {
        console.warn(`No config for ${playerCount} players, using 4-player config`);
        return BOARD_CONFIGS[GAME_MODES.MULTIPLAYER][4];
      }
      return config;
    }
    
    const config = BOARD_CONFIGS[mode];
    if (!config) {
      console.warn(`No config for mode ${mode}, using classic`);
      return BOARD_CONFIGS[GAME_MODES.CLASSIC].desktop;
    }
    
    return isMobile ? config.mobile : config.desktop;
  } catch (error) {
    console.error('Error getting board size:', error);
    return { width: 20, height: 18 }; // Safe fallback
  }
};

/**
 * Calculate points based on game mode and difficulty
 */
export const calculatePoints = (mode, difficulty = null, foodCount = 1) => {
  try {
    let basePoints;
    
    if (mode === GAME_MODES.VS_AI && difficulty) {
      basePoints = POINTS[`${mode}_${difficulty}`];
    } else {
      basePoints = POINTS[mode];
    }
    
    return (basePoints || 5) * foodCount; // Fallback to 5 points
  } catch (error) {
    console.error('Error calculating points:', error);
    return 5; // Safe fallback
  }
};

/**
 * Calculate current game speed based on food eaten - ENHANCED with threshold system
 */
export const calculateSpeed = (foodEaten) => {
  try {
    // Only increase speed every FOOD_THRESHOLD food eaten
    const speedIncreases = Math.floor(foodEaten / SPEED_CONFIGS.FOOD_THRESHOLD);
    const speedDecrease = Math.min(
      speedIncreases * SPEED_CONFIGS.INCREMENT, 
      SPEED_CONFIGS.INITIAL - SPEED_CONFIGS.MIN_SPEED
    );
    return Math.max(SPEED_CONFIGS.INITIAL - speedDecrease, SPEED_CONFIGS.MIN_SPEED);
  } catch (error) {
    console.error('Error calculating speed:', error);
    return SPEED_CONFIGS.INITIAL; // Safe fallback
  }
};

/**
 * Get speed multiplier for display - Enhanced with better precision
 */
export const getSpeedMultiplier = (currentSpeed) => {
  try {
    if (!currentSpeed || currentSpeed <= 0) return 1.0;
    const multiplier = SPEED_CONFIGS.INITIAL / currentSpeed;
    // Round to 1 decimal place for clean display
    return Math.round(multiplier * 10) / 10;
  } catch (error) {
    console.error('Error getting speed multiplier:', error);
    return 1.0;
  }
};

/**
 * Get speed level based on food eaten (for achievements and display)
 */
export const getSpeedLevel = (foodEaten) => {
  try {
    return Math.floor(foodEaten / SPEED_CONFIGS.FOOD_THRESHOLD) + 1;
  } catch (error) {
    console.error('Error getting speed level:', error);
    return 1;
  }
};

/**
 * Get next speed milestone (how much food needed for next speed increase)
 */
export const getNextSpeedMilestone = (foodEaten) => {
  try {
    const currentLevel = Math.floor(foodEaten / SPEED_CONFIGS.FOOD_THRESHOLD);
    const nextLevelFood = (currentLevel + 1) * SPEED_CONFIGS.FOOD_THRESHOLD;
    return nextLevelFood - foodEaten;
  } catch (error) {
    console.error('Error getting next speed milestone:', error);
    return 1;
  }
};

/**
 * Check if two positions are equal - ENHANCED with null safety
 */
export const positionsEqual = (pos1, pos2) => {
  try {
    if (!pos1 || !pos2) return false;
    if (typeof pos1.x !== 'number' || typeof pos1.y !== 'number') return false;
    if (typeof pos2.x !== 'number' || typeof pos2.y !== 'number') return false;
    return pos1.x === pos2.x && pos1.y === pos2.y;
  } catch (error) {
    console.error('Error comparing positions:', error);
    return false;
  }
};

/**
 * Check if position is within bounds - ENHANCED
 */
export const isWithinBounds = (position, boardWidth, boardHeight, isTransparent = false) => {
  try {
    if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
      return false;
    }
    
    if (isTransparent) {
      // In transparent mode, always return true as we'll wrap the position
      return true;
    }
    
    return position.x >= 0 && position.x < boardWidth && 
           position.y >= 0 && position.y < boardHeight;
  } catch (error) {
    console.error('Error checking bounds:', error);
    return false;
  }
};

/**
 * Check if position collides with snake body - ENHANCED
 */
export const checkSelfCollision = (head, body) => {
  try {
    if (!head || !Array.isArray(body)) return false;
    return body.some(segment => {
      if (!segment) return false;
      return positionsEqual(head, segment);
    });
  } catch (error) {
    console.error('Error checking self collision:', error);
    return false;
  }
};

/**
 * Check collision between two snake heads
 */
export const checkHeadCollision = (snake1Head, snake2Head) => {
  try {
    return positionsEqual(snake1Head, snake2Head);
  } catch (error) {
    console.error('Error checking head collision:', error);
    return false;
  }
};

/**
 * Check if snake head collides with another snake's body - ENHANCED
 */
export const checkSnakeCollision = (head, otherSnake) => {
  try {
    if (!head || !Array.isArray(otherSnake)) return false;
    return otherSnake.some(segment => {
      if (!segment) return false;
      return positionsEqual(head, segment);
    });
  } catch (error) {
    console.error('Error checking snake collision:', error);
    return false;
  }
};

/**
 * Generate random food position that doesn't collide with snakes - ENHANCED
 */
export const generateFoodPosition = (boardWidth, boardHeight, snakes = []) => {
  try {
    const occupiedPositions = new Set();
    
    // Add all snake segments to occupied positions
    if (Array.isArray(snakes)) {
      snakes.forEach(snake => {
        // Check if snake is an object with body property (Standard Snake Object)
        if (snake && snake.body && Array.isArray(snake.body)) {
           snake.body.forEach(segment => {
             if (segment && typeof segment.x === 'number' && typeof segment.y === 'number') {
               occupiedPositions.add(`${segment.x},${segment.y}`);
             }
           });
        } 
        // Check if snake is an array of segments (Legacy/Simple Body Array)
        else if (Array.isArray(snake)) {
          snake.forEach(segment => {
            if (segment && typeof segment.x === 'number' && typeof segment.y === 'number') {
              occupiedPositions.add(`${segment.x},${segment.y}`);
            }
          });
        }
        // Check if snake is a single segment (Legacy/Flat Position)
        else if (snake && typeof snake.x === 'number' && typeof snake.y === 'number') {
           occupiedPositions.add(`${snake.x},${snake.y}`);
        }
      });
    }
    
    let attempts = 0;
    const maxAttempts = Math.min(boardWidth * boardHeight, 1000); // Safety limit
    
    while (attempts < maxAttempts) {
      const x = Math.floor(Math.random() * boardWidth);
      const y = Math.floor(Math.random() * boardHeight);
      const posKey = `${x},${y}`;
      
      if (!occupiedPositions.has(posKey)) {
        return { x, y };
      }
      
      attempts++;
    }
    
    // Fallback: find any available position
    for (let x = 0; x < boardWidth; x++) {
      for (let y = 0; y < boardHeight; y++) {
        const posKey = `${x},${y}`;
        if (!occupiedPositions.has(posKey)) {
          return { x, y };
        }
      }
    }
    
    // Last resort fallback - Random position (better than fixed center)
    return { 
      x: Math.floor(Math.random() * boardWidth), 
      y: Math.floor(Math.random() * boardHeight) 
    };
  } catch (error) {
    console.error('Error generating food position:', error);
    return { x: 5, y: 5 }; // Safe fallback
  }
};

/**
 * Get opposite direction
 */
/**
 * Wrap position around board edges for transparent mode
 */
export const wrapPosition = (position, boardWidth, boardHeight, isTransparent = false) => {
  try {
    if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
      return position;
    }
    
    if (!isTransparent) {
      return position;
    }
    
    // Wrap around walls in transparent mode
    return {
      x: ((position.x % boardWidth) + boardWidth) % boardWidth,
      y: ((position.y % boardHeight) + boardHeight) % boardHeight
    };
  } catch (error) {
    console.error('Error wrapping position:', error);
    return position;
  }
};

export const handleCollisions = (head, snakes, boardWidth, boardHeight, isTransparent = false) => {
  try {
    // Wall collision (only in classic mode)
    if (!isTransparent && !isWithinBounds(head, boardWidth, boardHeight)) {
      return { collision: true, type: 'wall' };
    }

    // Self collision
    for (const snake of snakes) {
      if (!snake || !Array.isArray(snake.body)) continue;
      
      // Check self collision (skip head)
      for (let i = 1; i < snake.body.length; i++) {
        if (positionsEqual(head, snake.body[i])) {
          return { collision: true, type: 'self' };
        }
      }
    }

    // Head-to-head collision
    for (let i = 0; i < snakes.length; i++) {
      for (let j = i + 1; j < snakes.length; j++) {
        if (positionsEqual(snakes[i].body[0], snakes[j].body[0])) {
          return { collision: true, type: 'head' };
        }
      }
    }

    return { collision: false };
  } catch (error) {
    console.error('Error checking collisions:', error);
    return { collision: false };
  }
};

export const getOppositeDirection = (direction) => {
  try {
    const opposites = {
      [DIRECTIONS.UP]: DIRECTIONS.DOWN,
      [DIRECTIONS.DOWN]: DIRECTIONS.UP,
      [DIRECTIONS.LEFT]: DIRECTIONS.RIGHT,
      [DIRECTIONS.RIGHT]: DIRECTIONS.LEFT
    };
    
    return opposites[direction] || direction;
  } catch (error) {
    console.error('Error getting opposite direction:', error);
    return DIRECTIONS.RIGHT;
  }
};

/**
 * Check if direction change is valid (prevent 180-degree turns) - ENHANCED
 */
export const isValidDirectionChange = (currentDirection, newDirection) => {
  try {
    if (!currentDirection || !newDirection) return true;
    
    const opposite = getOppositeDirection(currentDirection);
    return !positionsEqual(newDirection, opposite);
  } catch (error) {
    console.error('Error validating direction change:', error);
    return true; // Allow movement on error
  }
};

/**
 * Calculate manhattan distance between two points
 */
export const manhattanDistance = (pos1, pos2) => {
  try {
    if (!pos1 || !pos2) return Infinity;
    if (typeof pos1.x !== 'number' || typeof pos1.y !== 'number') return Infinity;
    if (typeof pos2.x !== 'number' || typeof pos2.y !== 'number') return Infinity;
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
  } catch (error) {
    console.error('Error calculating manhattan distance:', error);
    return Infinity;
  }
};

/**
 * Format time in MM:SS format
 */
export const formatTime = (seconds) => {
  try {
    if (typeof seconds !== 'number' || seconds < 0) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return '00:00';
  }
};

/**
 * Format score with commas
 */
export const formatScore = (score) => {
  try {
    if (typeof score !== 'number') return '0';
    return score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  } catch (error) {
    console.error('Error formatting score:', error);
    return '0';
  }
};

/**
 * Get snake starting positions for multiplayer - ENHANCED
 */
export const getStartingPositions = (playerCount, boardWidth, boardHeight) => {
  try {
    const positions = [];
    const margin = Math.max(3, Math.floor(Math.min(boardWidth, boardHeight) * 0.1));
    
    switch (playerCount) {
      case 1:
        positions.push({ 
          x: Math.floor(boardWidth / 2), 
          y: Math.floor(boardHeight / 2) 
        });
        break;
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
        console.warn(`Unsupported player count: ${playerCount}`);
        positions.push({ x: Math.floor(boardWidth / 2), y: Math.floor(boardHeight / 2) });
    }
    
    return positions;
  } catch (error) {
    console.error('Error getting starting positions:', error);
    return [{ x: 5, y: 5 }]; // Safe fallback
  }
};

/**
 * Get starting directions for multiplayer
 */
export const getStartingDirections = (playerCount) => {
  try {
    switch (playerCount) {
      case 1:
        return [DIRECTIONS.RIGHT];
      case 2:
        return [DIRECTIONS.RIGHT, DIRECTIONS.LEFT];
      case 3:
        return [DIRECTIONS.RIGHT, DIRECTIONS.LEFT, DIRECTIONS.UP];
      case 4:
        return [DIRECTIONS.RIGHT, DIRECTIONS.LEFT, DIRECTIONS.RIGHT, DIRECTIONS.LEFT];
      default:
        return [DIRECTIONS.RIGHT];
    }
  } catch (error) {
    console.error('Error getting starting directions:', error);
    return [DIRECTIONS.RIGHT];
  }
};

/**
 * Check if device is mobile - ENHANCED
 */
export const isMobile = () => {
  try {
    if (typeof window === 'undefined') return false;
    
    // Check user agent
    const userAgentCheck = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Check for touch support and screen size
    const touchCheck = navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform);
    
    // Check screen width
    const screenCheck = window.innerWidth <= 768;
    
    return userAgentCheck || touchCheck || screenCheck;
  } catch (error) {
    console.error('Error detecting mobile:', error);
    return false;
  }
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  try {
    if (!email || typeof email !== 'string') return false;
    
    const allowedDomains = ['gmail.com', 'outlook.com', 'yahoo.com', 'mail.com'];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) return false;
    
    const domain = email.split('@')[1];
    return allowedDomains.includes(domain);
  } catch (error) {
    console.error('Error validating email:', error);
    return false;
  }
};

/**
 * Validate username format
 */
export const isValidUsername = (username) => {
  try {
    return username && 
           typeof username === 'string' && 
           username.length >= 3 && 
           username.length <= 20 &&
           /^[a-zA-Z0-9_]+$/.test(username);
  } catch (error) {
    console.error('Error validating username:', error);
    return false;
  }
};

/**
 * Validate password format
 */
export const isValidPassword = (password) => {
  try {
    return password && typeof password === 'string' && password.length >= 6;
  } catch (error) {
    console.error('Error validating password:', error);
    return false;
  }
};

/**
 * Generate unique game ID
 */
export const generateGameId = () => {
  try {
    return `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  } catch (error) {
    console.error('Error generating game ID:', error);
    return `game_${Date.now()}_fallback`;
  }
};

/**
 * Deep clone object safely
 */
export const deepClone = (obj) => {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    console.error('Error deep cloning object:', error);
    return obj; // Return original on error
  }
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
  isValidEmail,
  isValidUsername,
  isValidPassword,
  generateGameId,
  deepClone,
  debounce,
  throttle
};