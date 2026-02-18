import { useCallback, useRef } from 'react';
import logger from '@/utils/logger.js';
import { DIRECTIONS } from '../../utils/gameUtils.js';
import { playClick } from '../../utils/sound.js';

export const useTouchInputHandlers = ({
  handlersRef,
  lastInputTimeRef,
  performanceRef
}) => {
  const touchDataRef = useRef({
    startX: 0,
    startY: 0,
    startTime: 0,
    isTracking: false
  });

  const handleTouchControl = useCallback((direction) => {
    const now = performance.now();
    const playerId = 0;
    const lastInputTime = lastInputTimeRef.current.get(playerId) || 0;
    if (now - lastInputTime < 25) return;

    lastInputTimeRef.current.set(playerId, now);

    try {
      handlersRef.current.onDirectionChange(playerId, direction);

      if (navigator.vibrate) {
        navigator.vibrate(10);
      }

      playClick();
      performanceRef.current.processedInputs += 1;
    } catch (error) {
      logger.error('Touch control handler failed:', error);
      performanceRef.current.droppedInputs += 1;
    }
  }, [handlersRef, lastInputTimeRef, performanceRef]);

  const handleTouchStart = useCallback((event) => {
    event.preventDefault();
    const touch = event.touches[0];
    const touchData = touchDataRef.current;

    touchData.startX = touch.clientX;
    touchData.startY = touch.clientY;
    touchData.startTime = performance.now();
    touchData.isTracking = true;
  }, []);

  const handleTouchMove = useCallback((event) => {
    event.preventDefault();
  }, []);

  const handleTouchEnd = useCallback((event) => {
    event.preventDefault();
    const touchData = touchDataRef.current;
    if (!touchData.isTracking) return;

    const touch = event.changedTouches[0];
    const deltaX = touchData.startX - touch.clientX;
    const deltaY = touchData.startY - touch.clientY;
    const deltaTime = performance.now() - touchData.startTime;
    const distance = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));

    touchData.isTracking = false;

    const minDistance = 25;
    const maxTime = 400;
    const minVelocity = minDistance / maxTime;
    const velocity = distance / deltaTime;
    if (distance < minDistance || deltaTime > maxTime || velocity < minVelocity) {
      return;
    }

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    const minDirectionalDifference = 10;
    let direction = null;

    if (absX > absY + minDirectionalDifference) {
      direction = deltaX > 0 ? DIRECTIONS.LEFT : DIRECTIONS.RIGHT;
    } else if (absY > absX + minDirectionalDifference) {
      direction = deltaY > 0 ? DIRECTIONS.UP : DIRECTIONS.DOWN;
    }

    if (!direction) return;

    const now = performance.now();
    const playerId = 0;
    const lastInputTime = lastInputTimeRef.current.get(playerId) || 0;
    if (now - lastInputTime < 50) return;

    lastInputTimeRef.current.set(playerId, now);

    try {
      handlersRef.current.onDirectionChange(playerId, direction);

      if (navigator.vibrate) {
        navigator.vibrate([10, 10, 10]);
      }

      playClick();
      performanceRef.current.processedInputs += 1;
    } catch (error) {
      logger.error('Swipe input handler failed:', error);
      performanceRef.current.droppedInputs += 1;
    }
  }, [handlersRef, lastInputTimeRef, performanceRef]);

  return {
    handleTouchControl,
    handleTouchEnd,
    handleTouchMove,
    handleTouchStart
  };
};
