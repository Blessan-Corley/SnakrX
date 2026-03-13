import logger from '../logger.js';

export const positionsEqual = (pos1, pos2) => {
  try {
    if (!pos1 || !pos2) return false;
    if (typeof pos1.x !== 'number' || typeof pos1.y !== 'number') return false;
    if (typeof pos2.x !== 'number' || typeof pos2.y !== 'number') return false;
    return pos1.x === pos2.x && pos1.y === pos2.y;
  } catch (error) {
    logger.error('Error comparing positions:', error);
    return false;
  }
};

export const isWithinBounds = (position, boardWidth, boardHeight, isTransparent = false) => {
  try {
    if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
      return false;
    }

    if (isTransparent) {
      return true;
    }

    return position.x >= 0 && position.x < boardWidth
      && position.y >= 0 && position.y < boardHeight;
  } catch (error) {
    logger.error('Error checking bounds:', error);
    return false;
  }
};

export const wrapPosition = (position, boardWidth, boardHeight, isTransparent = false) => {
  try {
    if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
      return position;
    }

    if (!isTransparent) {
      return position;
    }

    return {
      x: ((position.x % boardWidth) + boardWidth) % boardWidth,
      y: ((position.y % boardHeight) + boardHeight) % boardHeight
    };
  } catch (error) {
    logger.error('Error wrapping position:', error);
    return position;
  }
};

export const manhattanDistance = (pos1, pos2) => {
  try {
    if (!pos1 || !pos2) return Infinity;
    if (typeof pos1.x !== 'number' || typeof pos1.y !== 'number') return Infinity;
    if (typeof pos2.x !== 'number' || typeof pos2.y !== 'number') return Infinity;
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
  } catch (error) {
    logger.error('Error calculating manhattan distance:', error);
    return Infinity;
  }
};
