export const resetRuntimeRefs = ({
  gameStartTimeRef,
  lastTimerSecondRef,
  lastUpdateTimeRef,
  pauseStartRef,
  pausedTimeRef,
  pendingDirectionQueuesRef
}) => {
  lastUpdateTimeRef.current = 0;
  gameStartTimeRef.current = 0;
  lastTimerSecondRef.current = -1;
  pausedTimeRef.current = 0;
  pauseStartRef.current = 0;
  pendingDirectionQueuesRef.current = new Map();
};

export const stopGameLoop = (gameLoopRef) => {
  if (gameLoopRef.current) {
    cancelAnimationFrame(gameLoopRef.current);
    gameLoopRef.current = null;
  }
};
