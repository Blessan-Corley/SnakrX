import { functions, httpsCallable } from '../config.js';
import logger from '../../../utils/logger.js';

let upsertLeaderboardEntryCallable;
const getUpsertLeaderboardEntryCallable = () => {
  if (!upsertLeaderboardEntryCallable) {
    upsertLeaderboardEntryCallable = httpsCallable(functions, 'upsertLeaderboardEntry');
  }
  return upsertLeaderboardEntryCallable;
};

export const updateLeaderboard = async (userId, gameData) => {
  try {
    if (!userId || !gameData?.gameId) return false;

    const callable = getUpsertLeaderboardEntryCallable();
    const response = await callable({
      gameId: gameData.gameId
    });

    return response?.data?.success === true;
  } catch (error) {
    logger.error('Error updating leaderboard:', error);
    return false;
  }
};

export const __private__ = {
  resetCallables() {
    upsertLeaderboardEntryCallable = undefined;
  }
};
