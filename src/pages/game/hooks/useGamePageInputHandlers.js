import { useCallback } from 'react';
import useGameInput from '../../../hooks/useGameInput.js';
import { playClick } from '../../../utils/sound.js';
import { GAME_STATES } from '../../../utils/gameUtils.js';

export const useGamePageInputHandlers = ({
  bypassNavigationGuardRef,
  gameStatus,
  handleDirectionChange,
  handleMultiplayerReadyInput,
  handleQuit,
  handleRestart,
  isMultiplayerMode,
  navigate,
  numPlayers,
  setShowGameOverModal,
  startGame,
  togglePause
}) => {
  const handleContinue = useCallback(() => {
    playClick();
    setShowGameOverModal(false);
    bypassNavigationGuardRef.current = true;
    navigate('/game');
    setTimeout(() => {
      bypassNavigationGuardRef.current = false;
    }, 0);
  }, [bypassNavigationGuardRef, navigate, setShowGameOverModal]);

  const inputHandlers = useGameInput({
    playerCount: numPlayers,
    onDirectionChange: handleDirectionChange,
    onPlayerInput: (playerId, payload) => handleMultiplayerReadyInput(playerId, payload?.direction),
    onPauseToggle: togglePause,
    onRestart: handleRestart,
    onQuit: handleQuit,
    onAnyKey: () => {
      if (gameStatus === GAME_STATES.READY && !isMultiplayerMode) {
        startGame();
      }
    }
  });

  return {
    handleContinue,
    ...inputHandlers
  };
};

export default useGamePageInputHandlers;
