import logger from '../logger.js';
import { DIRECTIONS } from './constants.js';
import { positionsEqual } from './position.js';

export const getOppositeDirection = (direction) => {
  try {
    if (positionsEqual(direction, DIRECTIONS.UP)) return DIRECTIONS.DOWN;
    if (positionsEqual(direction, DIRECTIONS.DOWN)) return DIRECTIONS.UP;
    if (positionsEqual(direction, DIRECTIONS.LEFT)) return DIRECTIONS.RIGHT;
    if (positionsEqual(direction, DIRECTIONS.RIGHT)) return DIRECTIONS.LEFT;
    return direction;
  } catch (error) {
    logger.error('Error getting opposite direction:', error);
    return DIRECTIONS.RIGHT;
  }
};

export const isValidDirectionChange = (currentDirection, newDirection) => {
  try {
    if (!currentDirection || !newDirection) return true;
    const opposite = getOppositeDirection(currentDirection);
    return !positionsEqual(newDirection, opposite);
  } catch (error) {
    logger.error('Error validating direction change:', error);
    return true;
  }
};
