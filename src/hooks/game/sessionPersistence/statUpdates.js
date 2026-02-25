import gameUtilsModule, {
  AI_DIFFICULTIES,
  GAME_MODES,
  getSpeedMultiplier
} from '../../../utils/gameUtils.js';
import { calculateGameXpGain, getLevelFromXp } from '../../../utils/experience.js';
import { getModeStatsKey } from './modeAndWeek.js';

export const isQualifiedCompetitiveWinSafe = ({ mode, victory, playerScore }) => {
  if (typeof gameUtilsModule?.isQualifiedCompetitiveWin === 'function') {
    return gameUtilsModule.isQualifiedCompetitiveWin({ mode, victory, playerScore });
  }

  if (!victory) return false;
  if (mode === GAME_MODES.VS_AI) {
    return (Number(playerScore) || 0) > 100;
  }
  return mode === GAME_MODES.MULTIPLAYER;
};

export const buildStatUpdates = ({
  gameState,
  previousStats = {},
  trackedMaxLength,
  victory,
  now = Date.now(),
  quickDeathThresholdSeconds,
  shouldRecordQuickDeath
}) => {
  const modeKey = getModeStatsKey(gameState.gameMode);
  const previousBestScore = Number(previousStats.bestScore) || 0;
  const previousModeBestScore = Number(previousStats[`${modeKey}BestScore`]) || 0;
  const reachedOverallBest = gameState.score > 0 && gameState.score >= previousBestScore;
  const reachedModeBest = gameState.score > 0 && gameState.score >= previousModeBestScore;
  const duration = Math.max(0, Math.floor(gameState.gameTime));
  const xpGain = calculateGameXpGain({
    mode: gameState.gameMode,
    difficulty: gameState.difficulty,
    duration,
    foodEaten: gameState.foodEaten,
    score: gameState.score,
    victory
  });
  const nextXp = (Number(previousStats.xp) || 0) + xpGain;
  const nextLevel = getLevelFromXp(nextXp);
  const isCompetitiveMode =
    gameState.gameMode === GAME_MODES.VS_AI || gameState.gameMode === GAME_MODES.MULTIPLAYER;

  const statUpdates = {
    totalGames: 1,
    totalScore: gameState.score,
    bestScore: gameState.score,
    xp: xpGain,
    level: nextLevel,
    foodEaten: gameState.foodEaten,
    maxSpeed: getSpeedMultiplier(gameState.speed),
    maxLength: trackedMaxLength,
    wallHits: gameState.wallHits || 0,
    selfHits: gameState.selfHits || 0,
    moves: gameState.moves || 0,
    closeCalls: gameState.closeCalls || 0,
    fastEats: gameState.fastEats || 0,
    bonusFoodsSpawned: gameState.bonusFoodsSpawned || 0,
    bonusFoodsCollected: gameState.bonusFoodsCollected || 0,
    bonusFoodPoints: gameState.bonusFoodPoints || 0,
    totalPlayTime: duration,
    lastGameDuration: duration,
    maxSurvivalTime: duration,
    lastGameAt: now,
    [`${modeKey}Games`]: 1,
    [`${modeKey}BestScore`]: gameState.score
  };

  if (reachedOverallBest) {
    statUpdates.bestScoreAt = now;
    statUpdates.bestScoreMode = gameState.gameMode;
  }

  if (reachedModeBest) {
    statUpdates[`${modeKey}BestScoreAt`] = now;
  }

  if (gameState.gameMode === GAME_MODES.CLASSIC_TRANSPARENT) {
    statUpdates.transparentScore = Math.max(previousStats.transparentScore || 0, gameState.score);
  }

  if (isCompetitiveMode) {
    const qualifiedCompetitiveWin = isQualifiedCompetitiveWinSafe({
      mode: gameState.gameMode,
      victory,
      playerScore: gameState.score
    });

    statUpdates.competitiveGames = 1;
    if (victory) {
      statUpdates.totalWins = 1;
      statUpdates.competitiveWins = 1;
      statUpdates[`${modeKey}Wins`] = 1;
    }

    const currentStreak = previousStats.currentWinStreak || 0;
    if (qualifiedCompetitiveWin) {
      const nextStreak = currentStreak + 1;
      statUpdates.currentWinStreak = nextStreak;
      statUpdates.bestWinStreak = nextStreak;
    } else {
      statUpdates.currentWinStreak = 0;
    }

    if (gameState.gameMode === GAME_MODES.VS_AI && gameState.difficulty === AI_DIFFICULTIES.IMPOSSIBLE) {
      const currentAiImpossibleStreak = previousStats.aiImpossibleStreak || 0;
      statUpdates.aiImpossibleStreak = qualifiedCompetitiveWin ? currentAiImpossibleStreak + 1 : 0;
    }
  }

  if (gameState.gameMode === GAME_MODES.MULTIPLAYER && gameState.playerCount === 4) {
    statUpdates.multiplayerGames4Player = 1;
    if (victory) {
      statUpdates.multiplayerWins4Player = 1;

      const allPlayersAboveFifty = (gameState.snakes || [])
        .filter((snake) => snake && typeof snake.score === 'number')
        .every((snake) => snake.score >= 50);

      if (allPlayersAboveFifty && (gameState.snakes || []).length >= 4) {
        statUpdates.multiplayerWins4PlayerAllAbove50 = 1;
      }
    }
  }

  if (shouldRecordQuickDeath?.({
    victory,
    gameTime: gameState.gameTime,
    thresholdSeconds: quickDeathThresholdSeconds
  })) {
    statUpdates.quickDeaths = 1;
  }

  if (gameState.gameMode === GAME_MODES.VS_AI && victory && gameState.difficulty) {
    const difficultyKey = gameState.difficulty.charAt(0).toUpperCase() + gameState.difficulty.slice(1);
    statUpdates[`ai${difficultyKey}Wins`] = 1;
  }

  return {
    statUpdates,
    predictedXp: nextXp,
    predictedLevel: nextLevel
  };
};
