import logger from '../logger.js';
import { BOARD_CONFIGS, GAME_MODES, POINTS } from './constants.js';

export const getBoardSize = (mode, playerCount = 1, isMobile = false) => {
  try {
    if (mode === GAME_MODES.MULTIPLAYER) {
      const config = BOARD_CONFIGS[GAME_MODES.MULTIPLAYER][playerCount];
      if (!config) {
        logger.warn(`No config for ${playerCount} players, using 4-player config`);
        return BOARD_CONFIGS[GAME_MODES.MULTIPLAYER][4];
      }
      return config;
    }

    const config = BOARD_CONFIGS[mode];
    if (!config) {
      logger.warn(`No config for mode ${mode}, using classic`);
      return BOARD_CONFIGS[GAME_MODES.CLASSIC].desktop;
    }

    return isMobile ? config.mobile : config.desktop;
  } catch (error) {
    logger.error('Error getting board size:', error);
    return { width: 20, height: 18 };
  }
};

export const calculatePoints = (mode, difficulty = null, foodCount = 1) => {
  try {
    let basePoints;

    if (mode === GAME_MODES.VS_AI && difficulty) {
      basePoints = POINTS[`${mode}_${difficulty}`];
    } else {
      basePoints = POINTS[mode];
    }

    return (basePoints || 5) * foodCount;
  } catch (error) {
    logger.error('Error calculating points:', error);
    return 5;
  }
};
