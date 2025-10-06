/**
 * Game Logic Functions
 * Core game mechanics and collision detection
 */

import { GAME_MODES } from './constants.js';
import { generateFood } from '../../utils/gameUtils.js';
import { playFoodEat, playDeath } from '../../utils/sound.js';
import logger from '../../utils/logger.js';

/**
 * Update all snakes' positions and handle collisions
 */
export const updateSnakesPosition = (snakes, food, boardSize, gameMode, aiControllers) => {
  const newSnakes = [...snakes];
  let newFood = food;
  let foodConsumed = false;

  for (let i = 0; i < newSnakes.length; i++) {
    const snake = newSnakes[i];

    if (!snake.isAlive) continue;

    let direction = snake.direction;

    // AI movement
    if (snake.isAI && aiControllers[i]) {
      try {
        const aiDirection = aiControllers[i].getNextMove(
          snake.body,
          newFood,
          newSnakes.filter((_, idx) => idx !== i),
          boardSize
        );

        if (aiDirection && typeof aiDirection.x === 'number' && typeof aiDirection.y === 'number') {
          direction = aiDirection;
        }
      } catch (error) {
        logger.error('AI error:', error);
      }
    }

    // Calculate new head position
    const head = snake.body[0];
    if (!head || typeof head.x !== 'number' || typeof head.y !== 'number') {
      logger.error(`Invalid head position for snake ${i}:`, head);
      snake.isAlive = false;
      continue;
    }

    const newHead = {
      x: head.x + direction.x,
      y: head.y + direction.y
    };

    // Wall collision (classic mode only)
    if (gameMode === GAME_MODES.CLASSIC) {
      if (newHead.x < 0 || newHead.x >= boardSize.width ||
          newHead.y < 0 || newHead.y >= boardSize.height) {
        newSnakes[i] = { ...snake, isAlive: false };
        playDeath();
        continue;
      }
    } else {
      // Transparent mode - wrap around
      newHead.x = (newHead.x + boardSize.width) % boardSize.width;
      newHead.y = (newHead.y + boardSize.height) % boardSize.height;
    }

    // Self collision check
    for (let j = 1; j < snake.body.length; j++) {
      const segment = snake.body[j];
      if (!segment || typeof segment.x !== 'number' || typeof segment.y !== 'number') {
        logger.warn(`Invalid segment at position ${j} for snake ${i}:`, segment);
        continue;
      }

      if (newHead.x === segment.x && newHead.y === segment.y) {
        newSnakes[i] = { ...snake, isAlive: false };
        playDeath();
        break;
      }
    }

    if (!newSnakes[i].isAlive) continue;

    // Collision with other snakes
    for (let j = 0; j < newSnakes.length; j++) {
      if (i === j || !newSnakes[j].isAlive) continue;

      const otherSnake = newSnakes[j];

      for (const segment of otherSnake.body) {
        if (newHead.x === segment.x && newHead.y === segment.y) {
          newSnakes[i] = { ...snake, isAlive: false };
          playDeath();
          break;
        }
      }

      if (!newSnakes[i].isAlive) break;
    }

    if (!newSnakes[i].isAlive) continue;

    // Food collision
    if (newFood &&
        typeof newFood.x === 'number' &&
        typeof newFood.y === 'number' &&
        newHead.x === newFood.x &&
        newHead.y === newFood.y) {
      foodConsumed = true;
      playFoodEat();
      logger.log(`Snake ${i} ate food at:`, newFood);

      newSnakes[i] = {
        ...snake,
        body: [newHead, ...snake.body],
        direction
      };
    } else {
      // Move without growing
      newSnakes[i] = {
        ...snake,
        body: [newHead, ...snake.body.slice(0, -1)],
        direction
      };
    }
  }

  // Generate new food if consumed
  if (foodConsumed) {
    const allSnakeBodies = newSnakes.flatMap(s => s.body);
    newFood = generateFood(boardSize, allSnakeBodies);
  }

  return { snakes: newSnakes, food: newFood, foodConsumed };
};

/**
 * Check if direction change is valid (not opposite direction)
 */
export const isValidDirectionChange = (currentDirection, newDirection, snakeBody) => {
  // Check if it's the opposite direction
  const isOpposite =
    currentDirection.x === -newDirection.x &&
    currentDirection.y === -newDirection.y;

  if (isOpposite && snakeBody.length > 1) {
    return false;
  }

  return true;
};
