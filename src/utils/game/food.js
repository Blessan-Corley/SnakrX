import logger from '../logger.js';
import { BONUS_FOOD_CONFIG, FOOD_TYPES } from './constants.js';

const addSnakeSegmentsToOccupiedPositions = (snake, occupiedPositions) => {
  if (snake && snake.body && Array.isArray(snake.body)) {
    snake.body.forEach((segment) => {
      if (segment && typeof segment.x === 'number' && typeof segment.y === 'number') {
        occupiedPositions.add(`${segment.x},${segment.y}`);
      }
    });
  } else if (Array.isArray(snake)) {
    snake.forEach((segment) => {
      if (segment && typeof segment.x === 'number' && typeof segment.y === 'number') {
        occupiedPositions.add(`${segment.x},${segment.y}`);
      }
    });
  } else if (snake && typeof snake.x === 'number' && typeof snake.y === 'number') {
    occupiedPositions.add(`${snake.x},${snake.y}`);
  }
};

export const generateFoodPosition = (boardWidth, boardHeight, snakes = []) => {
  try {
    const occupiedPositions = new Set();

    if (Array.isArray(snakes)) {
      snakes.forEach((snake) => addSnakeSegmentsToOccupiedPositions(snake, occupiedPositions));
    }

    let attempts = 0;
    const maxAttempts = Math.min(boardWidth * boardHeight, 1000);

    while (attempts < maxAttempts) {
      const x = Math.floor(Math.random() * boardWidth);
      const y = Math.floor(Math.random() * boardHeight);
      const posKey = `${x},${y}`;

      if (!occupiedPositions.has(posKey)) {
        return { x, y };
      }

      attempts++;
    }

    for (let x = 0; x < boardWidth; x++) {
      for (let y = 0; y < boardHeight; y++) {
        const posKey = `${x},${y}`;
        if (!occupiedPositions.has(posKey)) {
          return { x, y };
        }
      }
    }

    return {
      x: Math.floor(Math.random() * boardWidth),
      y: Math.floor(Math.random() * boardHeight)
    };
  } catch (error) {
    logger.error('Error generating food position:', error);
    return { x: 5, y: 5 };
  }
};

export const isBonusFood = (foodItem) => foodItem?.type === FOOD_TYPES.BONUS_LARGE;

export const getFoodCells = (foodItem) => {
  try {
    if (!foodItem || typeof foodItem.x !== 'number' || typeof foodItem.y !== 'number') {
      return [];
    }

    if (!isBonusFood(foodItem)) {
      return [{ x: foodItem.x, y: foodItem.y }];
    }

    const size = Number(foodItem.size) || BONUS_FOOD_CONFIG.SIZE;
    const cells = [];

    for (let offsetX = 0; offsetX < size; offsetX++) {
      for (let offsetY = 0; offsetY < size; offsetY++) {
        cells.push({
          x: foodItem.x + offsetX,
          y: foodItem.y + offsetY
        });
      }
    }

    return cells;
  } catch (error) {
    logger.error('Error getting food cells:', error);
    return [];
  }
};

export const createNormalFood = (position, now = Date.now()) => ({
  ...position,
  type: FOOD_TYPES.NORMAL,
  createdAt: now,
  id: Math.random()
});

export const createLargeBonusFood = (position, now = Date.now()) => ({
  ...position,
  type: FOOD_TYPES.BONUS_LARGE,
  size: BONUS_FOOD_CONFIG.SIZE,
  createdAt: now,
  spawnedAt: now,
  expiresAt: now + BONUS_FOOD_CONFIG.LIFETIME_MS,
  maxPoints: BONUS_FOOD_CONFIG.MAX_POINTS,
  minPoints: BONUS_FOOD_CONFIG.MIN_POINTS,
  claimedBy: [],
  id: Math.random()
});

export const isFoodExpired = (foodItem, now = Date.now()) => {
  try {
    return isBonusFood(foodItem) && Number(foodItem.expiresAt) > 0 && now >= Number(foodItem.expiresAt);
  } catch (error) {
    logger.error('Error checking food expiry:', error);
    return false;
  }
};

export const calculateBonusFoodPoints = (foodItem, now = Date.now()) => {
  try {
    if (!isBonusFood(foodItem)) return 0;

    const maxPoints = Number(foodItem.maxPoints) || BONUS_FOOD_CONFIG.MAX_POINTS;
    const minPoints = Number(foodItem.minPoints) || BONUS_FOOD_CONFIG.MIN_POINTS;
    const spawnedAt = Number(foodItem.spawnedAt) || Number(foodItem.createdAt) || now;
    const expiresAt = Number(foodItem.expiresAt) || (spawnedAt + BONUS_FOOD_CONFIG.LIFETIME_MS);
    const lifetime = Math.max(1, expiresAt - spawnedAt);
    const remainingRatio = Math.max(0, Math.min(1, (expiresAt - now) / lifetime));

    return Math.round(minPoints + ((maxPoints - minPoints) * remainingRatio));
  } catch (error) {
    logger.error('Error calculating bonus food points:', error);
    return BONUS_FOOD_CONFIG.MIN_POINTS;
  }
};

export const generateLargeFoodPosition = (boardWidth, boardHeight, snakes = [], foods = []) => {
  try {
    const size = BONUS_FOOD_CONFIG.SIZE;
    if (boardWidth < size || boardHeight < size) {
      return null;
    }

    const occupiedPositions = new Set();

    if (Array.isArray(snakes)) {
      snakes.forEach((snake) => addSnakeSegmentsToOccupiedPositions(snake, occupiedPositions));
    }

    if (Array.isArray(foods)) {
      foods.forEach((foodItem) => {
        getFoodCells(foodItem).forEach((cell) => {
          occupiedPositions.add(`${cell.x},${cell.y}`);
        });
      });
    }

    const candidates = [];
    for (let x = 0; x <= boardWidth - size; x++) {
      for (let y = 0; y <= boardHeight - size; y++) {
        let blocked = false;
        for (let offsetX = 0; offsetX < size && !blocked; offsetX++) {
          for (let offsetY = 0; offsetY < size; offsetY++) {
            if (occupiedPositions.has(`${x + offsetX},${y + offsetY}`)) {
              blocked = true;
              break;
            }
          }
        }

        if (!blocked) {
          candidates.push({ x, y });
        }
      }
    }

    if (!candidates.length) return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
  } catch (error) {
    logger.error('Error generating large food position:', error);
    return null;
  }
};
