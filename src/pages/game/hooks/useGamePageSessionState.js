import { useMemo } from 'react';
import { isMobile } from '../../../utils/gameUtils.js';
import { resolveGameRouteState } from '../gameSessionUtils.js';
import { useGameExitHandlers } from './useGameExitHandlers.js';
import { useGameMultiplayerHandlers } from './useGameMultiplayerHandlers.js';
import { useResolvedGameSessionState } from './useResolvedGameSessionState.js';
import { useGameUiState } from './useGameUiState.js';

export const useGamePageSessionState = ({
  currentPlayerCount,
  difficulty,
  gameStatus,
  isGameOver,
  isPaused,
  isVictory,
  mode,
  navigate,
  pauseGame,
  playerCount,
  quitToMenu,
  restartGame,
  resumeGame,
  score,
  search,
  snakes,
  updateSnakeDirection
}) => {
  const mobile = isMobile();
  const routeState = useMemo(() => resolveGameRouteState({
    difficulty,
    mode,
    playerCount,
    search
  }), [difficulty, mode, playerCount, search]);
  const isMultiplayerMode = routeState.resolvedMode === 'multiplayer';
  const numPlayers = currentPlayerCount || routeState.resolvedPlayerCount;
  const uiState = useGameUiState({
    restartGame,
    resolvedMode: routeState.resolvedMode,
    score
  });
  const exitHandlers = useGameExitHandlers({
    gameStatus,
    isGameOver,
    isPaused,
    isVictory,
    navigate,
    onExitCleanup: uiState.clearExitUi,
    pauseGame,
    quitToMenu,
    resumeGame
  });
  const multiplayerHandlers = useGameMultiplayerHandlers({
    gameStatus,
    isMultiplayerMode,
    numPlayers,
    updateSnakeDirection
  });
  const resolvedSessionState = useResolvedGameSessionState({
    currentPlayerCount,
    gameStatus,
    isGameOver,
    isPaused,
    isVictory,
    multiplayerReadyPlayers: multiplayerHandlers.multiplayerReadyPlayers,
    routeState,
    score,
    snakes
  });

  return {
    exitHandlers,
    isMultiplayerMode,
    mobile,
    multiplayerHandlers,
    numPlayers,
    resolvedSessionState,
    routeState,
    uiState
  };
};

export default useGamePageSessionState;
