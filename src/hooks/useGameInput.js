/**
 * ULTRA-RESPONSIVE Game Input System
 * Refactored into modular keyboard and touch handler hooks.
 */

import { useCallback, useEffect, useRef } from 'react';
import { InputQueue } from './game/InputQueue.js';
import { useKeyboardInputHandlers } from './game/useKeyboardInputHandlers.js';
import { useTouchInputHandlers } from './game/useTouchInputHandlers.js';

export const useGameInput = ({
  playerCount = 1,
  sharedSinglePlayerKeys = false,
  onDirectionChange = () => {},
  onPauseToggle = () => {},
  onRestart = () => {},
  onQuit = () => {},
  onAnyKey = () => {},
  onPlayerInput = () => {}
}) => {
  const handlersRef = useRef({
    onDirectionChange,
    onPauseToggle,
    onRestart,
    onQuit,
    onAnyKey,
    onPlayerInput
  });

  const inputQueueRef = useRef(new InputQueue(15));
  const keysDownRef = useRef(new Set());
  const keyStatesRef = useRef(new Map());
  const lastInputTimeRef = useRef(new Map());
  const consecutiveInputsRef = useRef(new Map());
  const performanceRef = useRef({
    totalInputs: 0,
    processedInputs: 0,
    droppedInputs: 0,
    averageLatency: 0
  });

  useEffect(() => {
    handlersRef.current = {
      onDirectionChange,
      onPauseToggle,
      onRestart,
      onQuit,
      onAnyKey,
      onPlayerInput
    };
  }, [onDirectionChange, onPauseToggle, onRestart, onQuit, onAnyKey, onPlayerInput]);

  const { getPlayerForKey, handleKeyDown, handleKeyUp } = useKeyboardInputHandlers({
    consecutiveInputsRef,
    handlersRef,
    keyStatesRef,
    keysDownRef,
    lastInputTimeRef,
    performanceRef,
    playerCount,
    sharedSinglePlayerKeys
  });
  const {
    handleTouchControl,
    handleTouchEnd,
    handleTouchMove,
    handleTouchStart
  } = useTouchInputHandlers({
    handlersRef,
    lastInputTimeRef,
    performanceRef
  });

  useEffect(() => {
    const keysDown = keysDownRef.current;
    const keyStates = keyStatesRef.current;
    const lastInputTime = lastInputTimeRef.current;
    const consecutiveInputs = consecutiveInputsRef.current;
    const inputQueue = inputQueueRef.current;
    const performance = performanceRef.current;

    const keyOptions = {
      capture: true,
      passive: false,
      once: false
    };
    const touchOptions = {
      capture: true,
      passive: false,
      once: false
    };
    const targets = [window];

    targets.forEach((target) => {
      target.addEventListener('keydown', handleKeyDown, keyOptions);
      target.addEventListener('keyup', handleKeyUp, keyOptions);
      target.addEventListener('touchstart', handleTouchStart, touchOptions);
      target.addEventListener('touchmove', handleTouchMove, touchOptions);
      target.addEventListener('touchend', handleTouchEnd, touchOptions);
      target.addEventListener('touchcancel', handleTouchEnd, touchOptions);
    });

    const handleFocus = () => {
      keysDownRef.current.clear();
      keyStatesRef.current.clear();
    };

    const handleBlur = () => {
      inputQueueRef.current.clear();
      keysDownRef.current.clear();
      keyStatesRef.current.clear();
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleBlur);

    return () => {
      targets.forEach((target) => {
        target.removeEventListener('keydown', handleKeyDown, keyOptions);
        target.removeEventListener('keyup', handleKeyUp, keyOptions);
        target.removeEventListener('touchstart', handleTouchStart, touchOptions);
        target.removeEventListener('touchmove', handleTouchMove, touchOptions);
        target.removeEventListener('touchend', handleTouchEnd, touchOptions);
        target.removeEventListener('touchcancel', handleTouchEnd, touchOptions);
      });

      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleBlur);

      keysDown.clear();
      keyStates.clear();
      lastInputTime.clear();
      consecutiveInputs.clear();
      inputQueue.clear();
      performance.totalInputs = 0;
      performance.processedInputs = 0;
      performance.droppedInputs = 0;
      performance.averageLatency = 0;
    };
  }, [handleKeyDown, handleKeyUp, handleTouchStart, handleTouchMove, handleTouchEnd]);

  const getCurrentKeyMappings = useCallback(() => {
    if (sharedSinglePlayerKeys && playerCount === 2) {
      return [
        {
          playerId: 0,
          playerName: 'Player 1',
          keys: 'WASD or Arrow Keys',
          lastInputTime: lastInputTimeRef.current.get(0) || 0,
          consecutiveInputs: consecutiveInputsRef.current.get(0) || 0
        },
        {
          playerId: 1,
          playerName: 'Player 2',
          keys: 'AI Controlled',
          lastInputTime: 0,
          consecutiveInputs: 0
        }
      ];
    }

    const mappings = [];
    for (let index = 0; index < playerCount; index += 1) {
      mappings.push({
        playerId: index,
        playerName: `Player ${index + 1}`,
        keys: playerCount === 1
          ? 'WASD, Arrow Keys, or Touch/Swipe'
          : index === 0
            ? 'WASD'
            : index === 1
              ? 'Arrow Keys'
              : index === 2
                ? 'IJKL'
                : 'Numpad 8456',
        lastInputTime: lastInputTimeRef.current.get(index) || 0,
        consecutiveInputs: consecutiveInputsRef.current.get(index) || 0
      });
    }
    return mappings;
  }, [playerCount, sharedSinglePlayerKeys]);

  const getInputPerformance = useCallback(() => {
    const perf = performanceRef.current;
    const queue = inputQueueRef.current;

    return {
      totalInputs: perf.totalInputs,
      processedInputs: perf.processedInputs,
      droppedInputs: perf.droppedInputs,
      successRate: perf.totalInputs > 0
        ? `${((perf.processedInputs / perf.totalInputs) * 100).toFixed(1)}%`
        : '100%',
      averageLatency: `${perf.averageLatency.toFixed(2)}ms`,
      queueSize: queue.size,
      keysDown: keysDownRef.current.size,
      keyStates: keyStatesRef.current.size
    };
  }, []);

  const resetPerformanceMetrics = useCallback(() => {
    performanceRef.current = {
      totalInputs: 0,
      processedInputs: 0,
      droppedInputs: 0,
      averageLatency: 0
    };
  }, []);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    handleTouchControl,
    getCurrentKeyMappings,
    getInputPerformance,
    resetPerformanceMetrics,
    clearInputQueue: () => inputQueueRef.current.clear(),
    getQueueSize: () => inputQueueRef.current.size,
    isHighLatency: () => performanceRef.current.averageLatency > 10,
    getSuccessRate: () => {
      const perf = performanceRef.current;
      return perf.totalInputs > 0 ? (perf.processedInputs / perf.totalInputs) : 1;
    },
    getPlayerForKey
  };
};

export default useGameInput;
