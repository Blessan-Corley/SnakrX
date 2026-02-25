import { useEffect } from 'react';
import { saveLastPlayedMode } from '../../../utils/gamePreferences.js';

export const useGameInitializationEffect = ({
  initializeGame,
  resolvedBonusFoodEnabled,
  resolvedDifficulty,
  resolvedMode,
  resolvedPlayerCount,
  setLoading
}) => {
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    saveLastPlayedMode({
      mode: resolvedMode,
      difficulty: resolvedDifficulty,
      playerCount: resolvedPlayerCount,
      bonusFoodEnabled: resolvedBonusFoodEnabled
    });
    initializeGame(
      resolvedMode,
      resolvedDifficulty,
      resolvedPlayerCount,
      resolvedBonusFoodEnabled
    ).finally(() => {
      if (mounted) setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [
    initializeGame,
    resolvedMode,
    resolvedDifficulty,
    resolvedPlayerCount,
    resolvedBonusFoodEnabled,
    setLoading
  ]);
};
