import logger from '../logger.js';
import { SPEED_CONFIGS } from './constants.js';

export const calculateSpeed = (foodEaten) => {
  try {
    const speedIncreases = Math.floor(foodEaten / SPEED_CONFIGS.FOOD_THRESHOLD);
    const speedDecrease = Math.min(
      speedIncreases * SPEED_CONFIGS.INCREMENT,
      SPEED_CONFIGS.INITIAL - SPEED_CONFIGS.MIN_SPEED
    );
    return Math.max(SPEED_CONFIGS.INITIAL - speedDecrease, SPEED_CONFIGS.MIN_SPEED);
  } catch (error) {
    logger.error('Error calculating speed:', error);
    return SPEED_CONFIGS.INITIAL;
  }
};

export const getSpeedMultiplier = (currentSpeed) => {
  try {
    if (!currentSpeed || currentSpeed <= 0) return 1.0;
    const multiplier = SPEED_CONFIGS.INITIAL / currentSpeed;
    return Math.round(multiplier * 10) / 10;
  } catch (error) {
    logger.error('Error getting speed multiplier:', error);
    return 1.0;
  }
};

export const getSpeedLevel = (foodEaten) => {
  try {
    return Math.floor(foodEaten / SPEED_CONFIGS.FOOD_THRESHOLD) + 1;
  } catch (error) {
    logger.error('Error getting speed level:', error);
    return 1;
  }
};

export const getNextSpeedMilestone = (foodEaten) => {
  try {
    const currentLevel = Math.floor(foodEaten / SPEED_CONFIGS.FOOD_THRESHOLD);
    const nextLevelFood = (currentLevel + 1) * SPEED_CONFIGS.FOOD_THRESHOLD;
    return nextLevelFood - foodEaten;
  } catch (error) {
    logger.error('Error getting next speed milestone:', error);
    return 1;
  }
};
