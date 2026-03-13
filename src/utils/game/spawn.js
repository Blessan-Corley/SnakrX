import logger from '../logger.js';
import { DIRECTIONS } from './constants.js';

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
        logger.warn(`Unsupported player count: ${playerCount}`);
        positions.push({ x: Math.floor(boardWidth / 2), y: Math.floor(boardHeight / 2) });
    }

    return positions;
  } catch (error) {
    logger.error('Error getting starting positions:', error);
    return [{ x: 5, y: 5 }];
  }
};

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
    logger.error('Error getting starting directions:', error);
    return [DIRECTIONS.RIGHT];
  }
};
