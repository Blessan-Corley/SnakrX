import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useGame } from '../../hooks/useGame.js';
import { useAchievementOperations } from '../../hooks/useAchievements.js';
import { buildGamePageControllerViewModel } from './gamePageControllerViewModel.js';
import { useGamePageInputHandlers } from './hooks/useGamePageInputHandlers.js';
import { useGamePageSessionState } from './hooks/useGamePageSessionState.js';
import { useGameLifecycleEffects } from './useGameLifecycleEffects.js';

export const useGamePageController = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, difficulty, playerCount } = useParams();

  const {
    gameState: gameStatus,
    boardSize,
    snakes,
    food,
    score,
    gameTime,
    foodEaten,
    isPaused,
    deadPlayers,
    highlightCollision,
    playerCount: currentPlayerCount,
    isGameActive,
    isGameOver,
    isVictory,
    speedMultiplier,
    initializeGame,
    startGame,
    updateSnakeDirection,
    pauseGame,
    resumeGame,
    togglePause,
    restartGame,
    quitToMenu
  } = useGame();

  const { recentUnlocks } = useAchievementOperations();

  const {
    exitHandlers,
    isMultiplayerMode,
    mobile,
    multiplayerHandlers,
    numPlayers,
    resolvedSessionState,
    routeState,
    uiState
  } = useGamePageSessionState({
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
    search: location.search,
    snakes,
    updateSnakeDirection
  });
  const {
    handleRestart,
    handleShareScore,
    inputWarning,
    lastShownAchievementRef,
    loading,
    newAchievement,
    setInputWarning,
    setLoading,
    setNewAchievement,
    setShowAchievementModal,
    setShowCollisionHighlight,
    setShowGameOverModal,
    setShowPerformanceMonitor,
    showAchievementModal,
    showCollisionHighlight,
    showGameOverModal,
    showPerformanceMonitor
  } = uiState;
  const {
    bypassNavigationGuardRef,
    handleLeaveCancel,
    handleLeaveConfirm,
    handleQuit,
    leaveConfirmState,
    requestLeaveConfirmation,
    visibilityPauseRef
  } = exitHandlers;
  const {
    handleDirectionChange,
    handleMultiplayerReadyInput,
    multiplayerReadyDirectionRef,
    multiplayerReadyPlayers,
    multiplayerStartTriggeredRef,
    setMultiplayerReadyPlayers
  } = multiplayerHandlers;
  const {
    getCurrentKeyMappings,
    getInputPerformance,
    getSuccessRate,
    handleContinue,
    handleTouchControl,
    isHighLatency,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  } = useGamePageInputHandlers({
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
  });

  useGameLifecycleEffects({
    allMultiplayerPlayersReady: resolvedSessionState.allMultiplayerPlayersReady,
    bypassNavigationGuardRef,
    gameStatus,
    getSuccessRate,
    hasActiveSession: resolvedSessionState.hasActiveSession,
    initializeGame,
    isHighLatency,
    isMultiplayerMode,
    lastShownAchievementRef,
    leaveConfirmState,
    location,
    multiplayerReadyDirectionRef,
    multiplayerStartTriggeredRef,
    pauseGame,
    quitToMenu,
    recentUnlocks,
    requestLeaveConfirmation,
    resolvedBonusFoodEnabled: routeState.resolvedBonusFoodEnabled,
    resolvedDifficulty: routeState.resolvedDifficulty,
    resolvedMode: routeState.resolvedMode,
    resolvedPlayerCount: routeState.resolvedPlayerCount,
    setInputWarning,
    setLoading,
    setMultiplayerReadyPlayers,
    setNewAchievement,
    setShowAchievementModal,
    setShowCollisionHighlight,
    setShowGameOverModal,
    setShowPerformanceMonitor,
    showAchievementModal,
    showPerformanceMonitor,
    startGame,
    updateSnakeDirection,
    visibilityPauseRef
  });

  return {
    ...buildGamePageControllerViewModel({
      boardSize,
      deadPlayers,
      food,
      foodEaten,
      gameStatus,
      gameTime,
      getCurrentKeyMappings,
      getInputPerformance,
      handleContinue,
      handleLeaveCancel,
      handleLeaveConfirm,
      handleQuit,
      handleRestart,
      handleShareScore,
      handleTouchControl,
      highlightCollision,
      inputWarning,
      isGameActive,
      isGameOver,
      isMultiplayerMode,
      isPaused,
      isVictory,
      leaveConfirmState,
      loading,
      mobile,
      multiplayerReadyPlayers,
      newAchievement,
      numPlayers,
      onTouchEnd,
      onTouchMove,
      onTouchStart,
      resolvedDifficulty: routeState.resolvedDifficulty,
      resolvedMode: routeState.resolvedMode,
      resolvedSessionState,
      score,
      setShowAchievementModal,
      setShowGameOverModal,
      showAchievementModal,
      showCollisionHighlight,
      showGameOverModal,
      showPerformanceMonitor,
      snakes,
      speedMultiplier,
      togglePause
    }),
    navigate
  };
};
