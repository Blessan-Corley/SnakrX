import { GAME_MODES, getSpeedMultiplier } from '../../../utils/gameUtils.js';

export const getPreferredUsername = ({ user, userProfile }) => (
  userProfile?.username || userProfile?.displayName || user?.email?.split('@')[0] || 'player'
);

export const buildGameSessionData = ({
  gameState,
  trackedMaxLength,
  user,
  userProfile,
  victory,
  endedAt = Date.now()
}) => {
  const isCompetitiveMode =
    gameState.gameMode === GAME_MODES.VS_AI || gameState.gameMode === GAME_MODES.MULTIPLAYER;
  const sessionResult = isCompetitiveMode ? (victory ? 'won' : 'lost') : 'completed';

  return {
    gameId: gameState.gameId,
    userId: user.uid,
    username: getPreferredUsername({ user, userProfile }),
    mode: gameState.gameMode,
    difficulty: gameState.difficulty || null,
    playerCount: gameState.playerCount || 1,
    score: gameState.score,
    aiScore: gameState.gameMode === GAME_MODES.VS_AI ? (gameState.snakes?.[1]?.score || 0) : null,
    playerScores: Array.isArray(gameState.snakes)
      ? gameState.snakes
        .slice(0, 4)
        .map((snake) => Math.max(0, Math.floor(Number(snake?.score) || 0)))
      : [],
    duration: Math.max(0, Math.floor(gameState.gameTime)),
    foodEaten: gameState.foodEaten,
    speedReached: getSpeedMultiplier(gameState.speed),
    result: sessionResult,
    maxLength: trackedMaxLength,
    stats: {
      moves: gameState.moves || 0,
      wallHits: gameState.wallHits || 0,
      selfHits: gameState.selfHits || 0,
      closeCalls: gameState.closeCalls || 0,
      fastEats: gameState.fastEats || 0,
      bonusFoodsSpawned: gameState.bonusFoodsSpawned || 0,
      bonusFoodsCollected: gameState.bonusFoodsCollected || 0,
      bonusFoodPoints: gameState.bonusFoodPoints || 0,
      maxLength: trackedMaxLength,
      averageSpeed: getSpeedMultiplier(gameState.speed),
      efficiency: gameState.score > 0 && gameState.moves > 0 ? gameState.score / gameState.moves : 0,
      timeToFirstFood: gameState.timeToFirstFood || 0,
      timeToMaxLength: gameState.timeToMaxLength || 0
    },
    startedAt: gameState.startTime || endedAt,
    endedAt
  };
};
