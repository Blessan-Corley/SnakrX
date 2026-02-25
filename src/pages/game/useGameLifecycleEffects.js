import { useGameInitializationEffect } from './effects/useGameInitializationEffect.js';
import { useGameSessionGuardEffects } from './effects/useGameSessionGuardEffects.js';
import { useGameUiEffects } from './effects/useGameUiEffects.js';
import { useMultiplayerLifecycleEffects } from './effects/useMultiplayerLifecycleEffects.js';

export const useGameLifecycleEffects = ({
  allMultiplayerPlayersReady,
  bypassNavigationGuardRef,
  gameStatus,
  getSuccessRate,
  hasActiveSession,
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
  resolvedBonusFoodEnabled,
  resolvedDifficulty,
  resolvedMode,
  resolvedPlayerCount,
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
}) => {
  useMultiplayerLifecycleEffects({
    allMultiplayerPlayersReady,
    gameStatus,
    isMultiplayerMode,
    multiplayerReadyDirectionRef,
    multiplayerStartTriggeredRef,
    setMultiplayerReadyPlayers,
    startGame,
    updateSnakeDirection
  });

  useGameInitializationEffect({
    initializeGame,
    resolvedBonusFoodEnabled,
    resolvedDifficulty,
    resolvedMode,
    resolvedPlayerCount,
    setLoading
  });

  useGameSessionGuardEffects({
    bypassNavigationGuardRef,
    hasActiveSession,
    leaveConfirmState,
    location,
    pauseGame,
    requestLeaveConfirmation,
    showAchievementModal,
    visibilityPauseRef
  });

  useGameUiEffects({
    gameStatus,
    getSuccessRate,
    isHighLatency,
    lastShownAchievementRef,
    quitToMenu,
    recentUnlocks,
    setInputWarning,
    setNewAchievement,
    setShowAchievementModal,
    setShowCollisionHighlight,
    setShowGameOverModal,
    setShowPerformanceMonitor,
    showPerformanceMonitor
  });
};
