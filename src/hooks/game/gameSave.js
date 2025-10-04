/**
 * Game Save Module
 * Handles saving game data to Firebase
 */

import { gameOperations } from '../../services/firebase/index.js';
import { GAME_CONFIG } from './constants.js';
import logger from '../../utils/logger.js';

/**
 * Save game data to Firebase
 */
export const saveGameDataToFirebase = async ({
  user,
  userProfile,
  gameState,
  victory,
  updateUserStats,
  checkAndUnlockAchievements,
  refreshProfile,
  getSpeedMultiplier
}) => {
  if (!user || !updateUserStats) {
    logger.log('No user or updateUserStats - skipping save');
    return;
  }

  try {
    logger.log('Saving game data to Firebase...');

    // Complete game session data
    const gameSessionData = {
      gameId: gameState.gameId,
      userId: user.uid,
      username: userProfile?.username || userProfile?.displayName || user.email.split('@')[0],
      mode: gameState.gameMode,
      difficulty: gameState.difficulty || null,
      playerCount: gameState.playerCount || 1,
      score: gameState.score,
      duration: Math.max(0, Math.floor(gameState.gameTime)),
      foodEaten: gameState.foodEaten,
      speedReached: getSpeedMultiplier(gameState.speed),
      result: victory ? 'won' : 'lost',
      maxLength: gameState.snakes[0]?.body?.length || 1,
      stats: {
        moves: gameState.moves || 0,
        wallHits: gameState.wallHits || 0,
        selfHits: gameState.selfHits || 0,
        maxLength: gameState.snakes[0]?.body?.length || 1,
        averageSpeed: getSpeedMultiplier(gameState.speed),
        efficiency: gameState.score > 0 && gameState.moves > 0 ? gameState.score / gameState.moves : 0,
        timeToFirstFood: gameState.timeToFirstFood || 0,
        timeToMaxLength: gameState.timeToMaxLength || 0
      },
      startedAt: gameState.startTime || Date.now(),
      endedAt: Date.now()
    };

    // Save game session
    try {
      logger.log('Attempting to save game session with data:', gameSessionData);
      const gameId = await gameOperations.saveGameSession(user.uid, gameSessionData);
      if (gameId) {
        logger.log('Game session saved to Firebase with ID:', gameId);
      } else {
        logger.error('Game session save returned null - save failed');
      }
    } catch (error) {
      logger.error('Failed to save game session:', error);
      logger.error('Error details:', error.message, error.code);
    }

    // Build stat updates
    const statUpdates = buildStatUpdates(gameState, victory, getSpeedMultiplier);

    // Update user stats
    logger.log('Updating user stats:', statUpdates);
    const success = await updateUserStats(statUpdates);
    if (success) {
      logger.log('User stats updated successfully');

      // Refresh profile
      if (refreshProfile) {
        setTimeout(() => {
          logger.log('🔄 Forcing profile refresh after game save...');
          refreshProfile();
        }, GAME_CONFIG.PROFILE_REFRESH_DELAY);
      }
    } else {
      logger.warn('Failed to update user stats (offline mode)');
    }

    // Check achievements
    await checkAchievementsForGame({
      userProfile,
      gameState,
      victory,
      getSpeedMultiplier,
      checkAndUnlockAchievements
    });

    // Update leaderboard
    if (gameState.score > 0) {
      await updateLeaderboardForGame(user, userProfile, gameSessionData);
    } else {
      logger.log('Score is 0, skipping leaderboard update');
    }

  } catch (error) {
    logger.error('Error saving game data:', error);
  }
};

/**
 * Build stat updates object
 */
function buildStatUpdates(gameState, victory, getSpeedMultiplier) {
  const statUpdates = {
    // Basic game stats
    totalGames: 1,
    totalScore: gameState.score,
    bestScore: gameState.score,
    foodEaten: gameState.foodEaten,
    maxSpeed: getSpeedMultiplier(gameState.speed),
    maxLength: gameState.snakes[0]?.body?.length || 1,

    // Advanced tracking stats
    wallHits: gameState.wallHits || 0,
    selfHits: gameState.selfHits || 0,
    moves: gameState.moves || 0,

    // Time and survival stats
    totalPlayTime: Math.max(0, Math.floor(gameState.gameTime)),
    maxSurvivalTime: Math.max(0, Math.floor(gameState.gameTime)),

    // Mode-specific stats
    [`${gameState.gameMode.replace('_', '')}Games`]: 1,
    [`${gameState.gameMode.replace('_', '')}BestScore`]: gameState.score
  };

  // Win tracking
  if (victory) {
    statUpdates.totalWins = 1;
    statUpdates[`${gameState.gameMode.replace('_', '')}Wins`] = 1;
  } else {
    statUpdates.currentWinStreak = 0;
  }

  // Special tracking
  if (gameState.gameTime < GAME_CONFIG.QUICK_DEATH_THRESHOLD) {
    statUpdates.quickDeaths = 1;
  }

  // Difficulty-specific AI wins
  if (gameState.gameMode === 'vsai' && victory && gameState.difficulty) {
    statUpdates[`ai${gameState.difficulty.charAt(0).toUpperCase() + gameState.difficulty.slice(1)}Wins`] = 1;
  }

  return statUpdates;
}

/**
 * Check and unlock achievements
 */
async function checkAchievementsForGame({
  userProfile,
  gameState,
  victory,
  getSpeedMultiplier,
  checkAndUnlockAchievements
}) {
  try {
    const achievementGameStats = {
      games: (userProfile?.stats?.totalGames || 0) + 1,
      wins: victory ? (userProfile?.stats?.totalWins || 0) + 1 : (userProfile?.stats?.totalWins || 0),
      totalScore: (userProfile?.stats?.totalScore || 0) + gameState.score,
      bestScore: Math.max(userProfile?.stats?.bestScore || 0, gameState.score),
      singleScore: gameState.score,
      maxSpeed: Math.max(userProfile?.stats?.maxSpeed || 1, getSpeedMultiplier(gameState.speed)),
      foodEaten: (userProfile?.stats?.foodEaten || 0) + gameState.foodEaten,
      singleGameFood: gameState.foodEaten,
      maxLength: Math.max(userProfile?.stats?.maxLength || 1, gameState.snakes[0]?.body?.length || 1),
      survivalTime: Math.max(0, Math.floor(gameState.gameTime)),
      maxSurvivalTime: Math.max(userProfile?.stats?.maxSurvivalTime || 0, Math.floor(gameState.gameTime)),
      winStreak: victory ? (userProfile?.stats?.currentWinStreak || 0) + 1 : 0,
      bestWinStreak: victory ? Math.max(userProfile?.stats?.bestWinStreak || 0, (userProfile?.stats?.currentWinStreak || 0) + 1) : (userProfile?.stats?.bestWinStreak || 0),
      wallHits: (userProfile?.stats?.wallHits || 0) + (gameState.wallHits || 0),
      selfHits: (userProfile?.stats?.selfHits || 0) + (gameState.selfHits || 0),
      quickDeaths: gameState.gameTime < GAME_CONFIG.QUICK_DEATH_THRESHOLD ? (userProfile?.stats?.quickDeaths || 0) + 1 : (userProfile?.stats?.quickDeaths || 0),
      aiWins: gameState.gameMode === 'vsai' && victory ? (userProfile?.stats?.totalWins || 0) + 1 : (userProfile?.stats?.totalWins || 0),
      aiEasyWins: gameState.gameMode === 'vsai' && victory && gameState.difficulty === 'easy' ? (userProfile?.stats?.aiEasyWins || 0) + 1 : (userProfile?.stats?.aiEasyWins || 0),
      aiMediumWins: gameState.gameMode === 'vsai' && victory && gameState.difficulty === 'medium' ? (userProfile?.stats?.aiMediumWins || 0) + 1 : (userProfile?.stats?.aiMediumWins || 0),
      aiImpossibleWins: gameState.gameMode === 'vsai' && victory && gameState.difficulty === 'impossible' ? (userProfile?.stats?.aiImpossibleWins || 0) + 1 : (userProfile?.stats?.aiImpossibleWins || 0),
      multiplayerGames: gameState.gameMode === 'multiplayer' ? (userProfile?.stats?.multiplayerGames || 0) + 1 : (userProfile?.stats?.multiplayerGames || 0),
      multiplayerWins: gameState.gameMode === 'multiplayer' && victory ? (userProfile?.stats?.multiplayerWins || 0) + 1 : (userProfile?.stats?.multiplayerWins || 0),
      transparentScore: gameState.gameMode === 'classictransparent' ? gameState.score : (userProfile?.stats?.transparentScore || 0),
      perfectGame: (gameState.wallHits || 0) === 0 && (gameState.selfHits || 0) === 0 && gameState.score > 0
    };

    logger.log('Checking achievements with stats:', achievementGameStats);
    await checkAndUnlockAchievements(achievementGameStats);
  } catch (error) {
    logger.error('Error checking achievements:', error);
  }
}

/**
 * Update leaderboard
 */
async function updateLeaderboardForGame(user, userProfile, gameSessionData) {
  try {
    logger.log('Attempting to update leaderboard for user:', user.uid);
    const leaderboardData = {
      ...gameSessionData,
      username: userProfile?.username || userProfile?.displayName || user.email.split('@')[0]
    };
    logger.log('Leaderboard data being sent:', leaderboardData);
    await gameOperations.updateLeaderboard(user.uid, leaderboardData);
    logger.log('Leaderboard updated successfully');
  } catch (error) {
    logger.error('Failed to update leaderboard:', error);
    logger.error('Leaderboard error details:', error.message, error.code);
  }
}
