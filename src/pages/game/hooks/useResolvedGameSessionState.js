import { useMemo } from 'react';
import { GAME_STATES } from '../../../utils/gameUtils.js';
import {
  getGameResultDetails,
  getReadyPlayersCount,
  hasActiveSessionState
} from '../gameSessionUtils.js';

export const useResolvedGameSessionState = ({
  currentPlayerCount,
  gameStatus,
  isGameOver,
  isPaused,
  isVictory,
  multiplayerReadyPlayers,
  routeState,
  score,
  snakes
}) => {
  const {
    resolvedMode,
    resolvedDifficulty,
    resolvedPlayerCount,
    resolvedBonusFoodEnabled
  } = routeState;

  const isMultiplayerMode = resolvedMode === 'multiplayer';
  const numPlayers = currentPlayerCount || resolvedPlayerCount;
  const allMultiplayerPlayersReady = isMultiplayerMode &&
    gameStatus === GAME_STATES.READY &&
    Array.from({ length: numPlayers }, (_, index) => multiplayerReadyPlayers[index] === true).every(Boolean);
  const hasActiveSession = hasActiveSessionState({
    gameStatus,
    isGameOver,
    isPaused,
    isVictory
  });
  const gameResult = getGameResultDetails({
    isMultiplayerMode,
    isVictory,
    resolvedMode,
    score,
    snakes
  });
  const readyPlayersCount = getReadyPlayersCount(multiplayerReadyPlayers);

  return useMemo(() => ({
    allMultiplayerPlayersReady,
    hasActiveSession,
    isMultiplayerMode,
    numPlayers,
    readyPlayersCount,
    resolvedBonusFoodEnabled,
    resolvedDifficulty,
    resolvedMode,
    resolvedPlayerCount,
    ...gameResult
  }), [
    allMultiplayerPlayersReady,
    gameResult,
    hasActiveSession,
    isMultiplayerMode,
    numPlayers,
    readyPlayersCount,
    resolvedBonusFoodEnabled,
    resolvedDifficulty,
    resolvedMode,
    resolvedPlayerCount
  ]);
};

export default useResolvedGameSessionState;
