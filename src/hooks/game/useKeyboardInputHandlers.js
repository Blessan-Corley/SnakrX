import { useCallback } from 'react';
import logger from '@/utils/logger.js';
import { playClick } from '../../utils/sound.js';
import {
  CONTROL_KEY_MAP,
  PLAYER_KEY_MAP,
  ULTRA_KEY_MAP
} from './inputConfig.js';

export const useKeyboardInputHandlers = ({
  consecutiveInputsRef,
  handlersRef,
  keyStatesRef,
  keysDownRef,
  lastInputTimeRef,
  performanceRef,
  playerCount,
  sharedSinglePlayerKeys = false
}) => {
  const getPlayerForKey = useCallback((code, key) => {
    if (playerCount === 1 || sharedSinglePlayerKeys) {
      return (ULTRA_KEY_MAP.has(code) || ULTRA_KEY_MAP.has(key)) ? 0 : -1;
    }

    const player = PLAYER_KEY_MAP.get(code) ?? PLAYER_KEY_MAP.get(key);
    return (player !== undefined && player < playerCount) ? player : -1;
  }, [playerCount, sharedSinglePlayerKeys]);

  const handleKeyDown = useCallback((event) => {
    const startTime = performance.now();
    const { code, key } = event;
    const target = event.target;

    const isTypingTarget =
      target &&
      (target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable);
    if (isTypingTarget) return;

    handlersRef.current.onAnyKey(event);

    const keyId = code || key;
    if (keysDownRef.current.has(keyId)) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    const now = performance.now();
    keysDownRef.current.add(keyId);
    keyStatesRef.current.set(keyId, now);
    performanceRef.current.totalInputs += 1;

    const controlAction = CONTROL_KEY_MAP.get(code) || CONTROL_KEY_MAP.get(key);
    if (controlAction) {
      const handlers = handlersRef.current;

      switch (controlAction) {
        case 'pause':
          handlers.onPauseToggle();
          playClick();
          break;
        case 'restart':
          handlers.onRestart();
          playClick();
          break;
        case 'quit':
          handlers.onQuit();
          playClick();
          break;
      }

      performanceRef.current.processedInputs += 1;
      const latency = performance.now() - startTime;
      performanceRef.current.averageLatency =
        (performanceRef.current.averageLatency + latency) / 2;
      return;
    }

    const direction = ULTRA_KEY_MAP.get(code) || ULTRA_KEY_MAP.get(key);
    if (!direction) return;

    const playerId = getPlayerForKey(code, key);
    if (playerId === -1) {
      performanceRef.current.droppedInputs += 1;
      return;
    }

    try {
      handlersRef.current.onPlayerInput(playerId, { code, key, direction });
    } catch (error) {
      logger.error('Player input callback failed:', error);
    }

    const lastInputTime = lastInputTimeRef.current.get(playerId) || 0;
    const timeDiff = now - lastInputTime;
    const minInterval = 16;
    const lastDirection = consecutiveInputsRef.current.get(`${playerId}_lastDir`);
    const isDifferentDirection =
      !lastDirection ||
      direction.x !== lastDirection.x ||
      direction.y !== lastDirection.y;

    if (timeDiff >= minInterval || isDifferentDirection) {
      lastInputTimeRef.current.set(playerId, now);
      consecutiveInputsRef.current.set(`${playerId}_lastDir`, direction);

      try {
        handlersRef.current.onDirectionChange(playerId, direction);
        performanceRef.current.processedInputs += 1;
      } catch (error) {
        logger.error('Direction change handler failed:', error);
        performanceRef.current.droppedInputs += 1;
      }
    } else {
      performanceRef.current.droppedInputs += 1;
    }

    const latency = performance.now() - startTime;
    performanceRef.current.averageLatency =
      (performanceRef.current.averageLatency + latency) / 2;
  }, [
    consecutiveInputsRef,
    getPlayerForKey,
    handlersRef,
    keyStatesRef,
    keysDownRef,
    lastInputTimeRef,
    performanceRef
  ]);

  const handleKeyUp = useCallback((event) => {
    const { code, key } = event;
    const keyId = code || key;
    keysDownRef.current.delete(keyId);
    keyStatesRef.current.delete(keyId);

    const direction = ULTRA_KEY_MAP.get(code) || ULTRA_KEY_MAP.get(key);
    if (direction) {
      const playerId = getPlayerForKey(code, key);
      if (playerId !== -1) {
        consecutiveInputsRef.current.set(playerId, 0);
      }
    }
  }, [consecutiveInputsRef, getPlayerForKey, keyStatesRef, keysDownRef]);

  return {
    getPlayerForKey,
    handleKeyDown,
    handleKeyUp
  };
};
