import logger from '../logger.js';
import { GAME_MODES } from './constants.js';

export const formatTime = (seconds) => {
  try {
    if (typeof seconds !== 'number' || seconds < 0) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  } catch (error) {
    logger.error('Error formatting time:', error);
    return '00:00';
  }
};

export const formatScore = (score) => {
  try {
    if (typeof score !== 'number') return '0';
    return score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  } catch (error) {
    logger.error('Error formatting score:', error);
    return '0';
  }
};

export const resolveVsAiWinner = (playerScore, aiScore) => {
  try {
    const user = Number(playerScore) || 0;
    const ai = Number(aiScore) || 0;
    return user > ai ? 'player' : 'ai';
  } catch (error) {
    logger.error('Error resolving VS AI winner:', error);
    return 'ai';
  }
};

export const isQualifiedCompetitiveWin = ({ mode, victory, playerScore }) => {
  try {
    if (!victory) return false;
    if (mode === GAME_MODES.VS_AI) {
      return (Number(playerScore) || 0) > 100;
    }
    return mode === GAME_MODES.MULTIPLAYER;
  } catch (error) {
    logger.error('Error evaluating qualified competitive win:', error);
    return false;
  }
};
