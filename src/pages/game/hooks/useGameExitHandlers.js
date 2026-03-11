import { useCallback, useRef, useState } from 'react';
import { playClick } from '../../../utils/sound.js';
import { GAME_STATES } from '../../../utils/gameUtils.js';

export const useGameExitHandlers = ({
  gameStatus,
  isGameOver,
  isPaused,
  isVictory,
  navigate,
  onExitCleanup,
  pauseGame,
  quitToMenu,
  resumeGame
}) => {
  const [leaveConfirmState, setLeaveConfirmState] = useState({ isOpen: false, targetPath: null });
  const bypassNavigationGuardRef = useRef(false);
  const visibilityPauseRef = useRef(false);
  const resumeAfterLeaveCancelRef = useRef(false);

  const requestLeaveConfirmation = useCallback((targetPath) => {
    resumeAfterLeaveCancelRef.current = gameStatus === GAME_STATES.PLAYING && !isPaused;
    pauseGame();
    setLeaveConfirmState({ isOpen: true, targetPath });
  }, [gameStatus, isPaused, pauseGame]);

  const handleQuit = useCallback(() => {
    const shouldConfirmLeave = !bypassNavigationGuardRef.current && !isGameOver && !isVictory;
    if (shouldConfirmLeave) {
      requestLeaveConfirmation('/');
      return;
    }

    playClick();
    onExitCleanup?.();
    setLeaveConfirmState({ isOpen: false, targetPath: null });
    bypassNavigationGuardRef.current = true;
    quitToMenu();
    navigate('/');
    setTimeout(() => {
      bypassNavigationGuardRef.current = false;
    }, 0);
  }, [isGameOver, isVictory, navigate, onExitCleanup, quitToMenu, requestLeaveConfirmation]);

  const handleLeaveCancel = useCallback(() => {
    setLeaveConfirmState({ isOpen: false, targetPath: null });
    if (visibilityPauseRef.current || !resumeAfterLeaveCancelRef.current) {
      return;
    }
    resumeAfterLeaveCancelRef.current = false;
    resumeGame();
  }, [resumeGame]);

  const handleLeaveConfirm = useCallback(() => {
    const targetPath = leaveConfirmState.targetPath;
    setLeaveConfirmState({ isOpen: false, targetPath: null });
    resumeAfterLeaveCancelRef.current = false;
    onExitCleanup?.();

    bypassNavigationGuardRef.current = true;
    quitToMenu();

    if (targetPath === '__BACK__') {
      navigate(-1);
    } else if (targetPath) {
      navigate(targetPath);
    } else {
      navigate('/');
    }

    setTimeout(() => {
      bypassNavigationGuardRef.current = false;
    }, 0);
  }, [leaveConfirmState.targetPath, navigate, onExitCleanup, quitToMenu]);

  return {
    bypassNavigationGuardRef,
    handleLeaveCancel,
    handleLeaveConfirm,
    handleQuit,
    leaveConfirmState,
    requestLeaveConfirmation,
    visibilityPauseRef
  };
};
