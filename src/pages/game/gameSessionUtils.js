import { GAME_STATES } from '../../utils/gameUtils.js';

export const SHOWN_ACHIEVEMENT_STORAGE_KEY = 'snakrx.shownAchievementUnlocks';

export const resolveGameRouteState = ({ difficulty, mode, playerCount, search }) => {
  const resolvedMode = mode || 'classic';
  const resolvedDifficulty = resolvedMode === 'vsai' ? (difficulty || 'impossible') : null;
  const resolvedPlayerCount = resolvedMode === 'multiplayer'
    ? Math.max(2, Number(playerCount || difficulty) || 2)
    : resolvedMode === 'vsai'
      ? 2
      : 1;
  const resolvedBonusFoodEnabled = new URLSearchParams(search).get('bonusFood') !== 'off';

  return {
    resolvedMode,
    resolvedDifficulty,
    resolvedPlayerCount,
    resolvedBonusFoodEnabled
  };
};

export const hasActiveSessionState = ({ gameStatus, isGameOver, isPaused, isVictory }) =>
  (gameStatus === GAME_STATES.PLAYING || gameStatus === GAME_STATES.READY || isPaused) &&
  !isGameOver &&
  !isVictory;

export const getReadyPlayersCount = (multiplayerReadyPlayers) =>
  Object.values(multiplayerReadyPlayers).filter(Boolean).length;

export const getGameResultDetails = ({ isMultiplayerMode, isVictory, resolvedMode, score, snakes }) => {
  const modalTitle = isVictory ? 'Victory!' : 'Game Over';
  const isVsAiMode = resolvedMode === 'vsai';
  const userFinalScore = snakes?.[0]?.score ?? score ?? 0;
  const aiFinalScore = snakes?.[1]?.score ?? 0;
  const vsAiResultLabel = isVictory ? 'You Win' : 'You Lose';
  const multiplayerScoreRows = isMultiplayerMode
    ? (snakes || [])
      .map((snake, index) => ({
        playerId: index,
        label: `Player ${index + 1}`,
        score: Number(snake?.score) || 0,
        isAlive: !!snake?.isAlive
      }))
      .sort((a, b) => b.score - a.score || a.playerId - b.playerId)
    : [];
  const multiplayerWinner = multiplayerScoreRows[0] || null;

  return {
    aiFinalScore,
    isVsAiMode,
    modalTitle,
    multiplayerScoreRows,
    multiplayerWinner,
    userFinalScore,
    vsAiResultLabel
  };
};

export const getLatestPendingAchievement = (recentUnlocks) => recentUnlocks?.find((achievement) => !achievement?.collected) || null;

export const buildAchievementStorageKey = (achievement) =>
  `${achievement.id}-${achievement.timestamp || achievement.unlockedAt || 0}`;

export const recordShownAchievement = (storage, achievementKey) => {
  try {
    const shownRaw = storage.getItem(SHOWN_ACHIEVEMENT_STORAGE_KEY);
    const parsed = JSON.parse(shownRaw || '[]');
    const shownKeys = Array.isArray(parsed) ? parsed : [];

    if (shownKeys.includes(achievementKey)) {
      return false;
    }

    const updatedKeys = [...shownKeys, achievementKey].slice(-100);
    storage.setItem(SHOWN_ACHIEVEMENT_STORAGE_KEY, JSON.stringify(updatedKeys));
    return true;
  } catch {
    return true;
  }
};
