import logger from '../logger.js';
import { isWithinBounds, positionsEqual } from './position.js';

export const checkSelfCollision = (head, body) => {
  try {
    if (!head || !Array.isArray(body)) return false;
    return body.some((segment) => {
      if (!segment) return false;
      return positionsEqual(head, segment);
    });
  } catch (error) {
    logger.error('Error checking self collision:', error);
    return false;
  }
};

export const checkHeadCollision = (snake1Head, snake2Head) => {
  try {
    return positionsEqual(snake1Head, snake2Head);
  } catch (error) {
    logger.error('Error checking head collision:', error);
    return false;
  }
};

export const checkSnakeCollision = (head, otherSnake) => {
  try {
    if (!head || !Array.isArray(otherSnake)) return false;
    return otherSnake.some((segment) => {
      if (!segment) return false;
      return positionsEqual(head, segment);
    });
  } catch (error) {
    logger.error('Error checking snake collision:', error);
    return false;
  }
};

export const handleCollisions = (head, snakes, boardWidth, boardHeight, isTransparent = false) => {
  try {
    if (!isTransparent && !isWithinBounds(head, boardWidth, boardHeight)) {
      return { collision: true, type: 'wall' };
    }

    for (const snake of snakes) {
      if (!snake || !Array.isArray(snake.body)) continue;
      for (let i = 1; i < snake.body.length; i++) {
        if (positionsEqual(head, snake.body[i])) {
          return { collision: true, type: 'self' };
        }
      }
    }

    for (let i = 0; i < snakes.length; i++) {
      for (let j = i + 1; j < snakes.length; j++) {
        if (positionsEqual(snakes[i].body[0], snakes[j].body[0])) {
          return { collision: true, type: 'head' };
        }
      }
    }

    return { collision: false };
  } catch (error) {
    logger.error('Error checking collisions:', error);
    return { collision: false };
  }
};
