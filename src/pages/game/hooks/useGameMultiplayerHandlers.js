import { useCallback, useRef, useState } from 'react';
import { GAME_STATES } from '../../../utils/gameUtils.js';

export const useGameMultiplayerHandlers = ({
  gameStatus,
  isMultiplayerMode,
  numPlayers,
  updateSnakeDirection
}) => {
  const [multiplayerReadyPlayers, setMultiplayerReadyPlayers] = useState({});
  const multiplayerReadyDirectionRef = useRef(new Map());
  const multiplayerStartTriggeredRef = useRef(false);

  const handleMultiplayerReadyInput = useCallback((playerId, direction) => {
    if (!isMultiplayerMode || gameStatus !== GAME_STATES.READY) return;
    if (typeof playerId !== 'number' || playerId < 0 || playerId >= numPlayers) return;

    if (direction && typeof direction.x === 'number' && typeof direction.y === 'number') {
      multiplayerReadyDirectionRef.current.set(playerId, direction);
    }

    setMultiplayerReadyPlayers((previous) => {
      if (previous[playerId]) return previous;
      return {
        ...previous,
        [playerId]: true
      };
    });
  }, [gameStatus, isMultiplayerMode, numPlayers]);

  const handleDirectionChange = useCallback((playerId, direction) => {
    if (isMultiplayerMode && gameStatus === GAME_STATES.READY) {
      return;
    }

    updateSnakeDirection(playerId, direction);
  }, [gameStatus, isMultiplayerMode, updateSnakeDirection]);

  return {
    handleDirectionChange,
    handleMultiplayerReadyInput,
    multiplayerReadyDirectionRef,
    multiplayerReadyPlayers,
    multiplayerStartTriggeredRef,
    setMultiplayerReadyPlayers
  };
};
