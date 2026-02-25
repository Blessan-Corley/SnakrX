import { useEffect } from 'react';
import logger from '../../utils/logger.js';
import { stopGameLoop } from './runtimeRefs.js';

export const useGameLoopLifecycleEffect = ({
  gameLoopRef,
  isGameActive,
  isPaused,
  updateGameRef
}) => {
  useEffect(() => {
    logger.log(
      'Game loop effect - isGameActive:',
      isGameActive,
      'isPaused:',
      isPaused,
      'hasLoop:',
      !!gameLoopRef.current
    );

    if (isGameActive && !isPaused) {
      if (!gameLoopRef.current && updateGameRef.current) {
        logger.log('Starting game loop...');
        gameLoopRef.current = requestAnimationFrame(updateGameRef.current);
      }
    } else if (gameLoopRef.current) {
      logger.log('Stopping game loop...');
      stopGameLoop(gameLoopRef);
    }

    return () => {
      stopGameLoop(gameLoopRef);
    };
  }, [gameLoopRef, isGameActive, isPaused, updateGameRef]);
};
