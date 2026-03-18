import logger from '../logger.js';
import { GAME_MODES, POINTS, SPEED_CONFIGS, SPEED_PROFILE_CONFIGS } from './constants.js';
import { calculatePoints } from './mode.js';

const CLASSIC_POINTS_BASELINE = POINTS[GAME_MODES.CLASSIC] || 5;

export const getSpeedProfile = (mode) => {
  if (mode === GAME_MODES.VS_AI || mode === GAME_MODES.MULTIPLAYER) {
    return SPEED_PROFILE_CONFIGS.competitive;
  }

  return SPEED_PROFILE_CONFIGS.solo;
};

export const calculateSpeed = (progressUnits, { mode } = {}) => {
  try {
    const speedProfile = getSpeedProfile(mode);
    const normalizedProgressUnits = Number(progressUnits) || 0;
    const speedIncreases = Math.floor(normalizedProgressUnits / speedProfile.FOOD_THRESHOLD);
    const speedDecrease = Math.min(
      speedIncreases * speedProfile.INCREMENT,
      speedProfile.INITIAL - speedProfile.MIN_SPEED
    );
    return Math.max(speedProfile.INITIAL - speedDecrease, speedProfile.MIN_SPEED);
  } catch (error) {
    logger.error('Error calculating speed:', error);
    return SPEED_CONFIGS.INITIAL;
  }
};

export const getSpeedProgressUnits = ({
  bonusFoodPoints = 0,
  difficulty = null,
  foodEaten = 0,
  mode
} = {}) => {
  try {
    const normalizedFoodEaten = Number(foodEaten) || 0;
    const normalizedBonusFoodPoints = Number(bonusFoodPoints) || 0;
    const pointsPerFood = calculatePoints(mode, difficulty);
    const speedProfile = getSpeedProfile(mode);

    if (!pointsPerFood || pointsPerFood <= 0) {
      return normalizedFoodEaten;
    }

    if (speedProfile === SPEED_PROFILE_CONFIGS.competitive) {
      const scorePacedProgress = (
        (normalizedFoodEaten * pointsPerFood) + normalizedBonusFoodPoints
      ) / CLASSIC_POINTS_BASELINE;

      return Math.max(Math.floor(scorePacedProgress), 0);
    }

    return normalizedFoodEaten + Math.floor(normalizedBonusFoodPoints / pointsPerFood);
  } catch (error) {
    logger.error('Error calculating speed progress units:', error);
    return Number(foodEaten) || 0;
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

export const getSpeedLevel = (progressUnits, { mode } = {}) => {
  try {
    const speedProfile = getSpeedProfile(mode);
    return Math.floor((Number(progressUnits) || 0) / speedProfile.FOOD_THRESHOLD) + 1;
  } catch (error) {
    logger.error('Error getting speed level:', error);
    return 1;
  }
};

export const getNextSpeedMilestone = (progressUnits, { mode } = {}) => {
  try {
    const speedProfile = getSpeedProfile(mode);
    const normalizedProgressUnits = Number(progressUnits) || 0;
    const currentLevel = Math.floor(normalizedProgressUnits / speedProfile.FOOD_THRESHOLD);
    const nextLevelFood = (currentLevel + 1) * speedProfile.FOOD_THRESHOLD;
    return nextLevelFood - normalizedProgressUnits;
  } catch (error) {
    logger.error('Error getting next speed milestone:', error);
    return 1;
  }
};
