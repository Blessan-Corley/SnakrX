import { useEffect, useRef } from 'react';
import { playVictory } from '../../utils/sound.js';
import logger from '../../utils/logger.js';
import { GAME_STATES } from './constants.js';

export const useGameAutoSaveEffect = ({
  gameId,
  gameScore,
  gameStatus,
  saveGameData,
  user
}) => {
  const lastAutoSaveKeyRef = useRef(null);

  useEffect(() => {
    const isEnded = gameStatus === GAME_STATES.GAME_OVER || gameStatus === GAME_STATES.VICTORY;
    if (!isEnded) {
      lastAutoSaveKeyRef.current = null;
      return;
    }

    logger.log('Game ended detected in effect. Triggering save sequence...');
    const victory = gameStatus === GAME_STATES.VICTORY;
    if (victory) {
      playVictory();
    }

    if (!user || gameScore < 0) {
      return;
    }

    const saveKey = `${gameId || 'unknown'}:${gameStatus}`;
    if (lastAutoSaveKeyRef.current === saveKey) {
      return;
    }
    lastAutoSaveKeyRef.current = saveKey;

    saveGameData(victory).catch((error) => {
      logger.error('Auto-save failed:', error);
      if (lastAutoSaveKeyRef.current === saveKey) {
        lastAutoSaveKeyRef.current = null;
      }
    });
  }, [gameId, gameScore, gameStatus, saveGameData, user]);
};
