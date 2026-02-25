import { useEffect } from 'react';
import { GAME_STATES } from '../../../utils/gameUtils.js';

export const useMultiplayerLifecycleEffects = ({
  allMultiplayerPlayersReady,
  gameStatus,
  isMultiplayerMode,
  multiplayerReadyDirectionRef,
  multiplayerStartTriggeredRef,
  setMultiplayerReadyPlayers,
  startGame,
  updateSnakeDirection
}) => {
  useEffect(() => {
    if (!isMultiplayerMode) {
      setMultiplayerReadyPlayers({});
      multiplayerReadyDirectionRef.current = new Map();
      multiplayerStartTriggeredRef.current = false;
      return;
    }

    if (gameStatus === GAME_STATES.READY) {
      setMultiplayerReadyPlayers({});
      multiplayerReadyDirectionRef.current = new Map();
      multiplayerStartTriggeredRef.current = false;
    }
  }, [
    gameStatus,
    isMultiplayerMode,
    multiplayerReadyDirectionRef,
    multiplayerStartTriggeredRef,
    setMultiplayerReadyPlayers
  ]);

  useEffect(() => {
    if (!allMultiplayerPlayersReady || multiplayerStartTriggeredRef.current) return;

    multiplayerStartTriggeredRef.current = true;
    multiplayerReadyDirectionRef.current.forEach((direction, playerId) => {
      updateSnakeDirection(playerId, direction);
    });
    startGame();
  }, [
    allMultiplayerPlayersReady,
    multiplayerReadyDirectionRef,
    multiplayerStartTriggeredRef,
    startGame,
    updateSnakeDirection
  ]);
};
