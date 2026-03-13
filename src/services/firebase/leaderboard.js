import logger from '../../utils/logger.js';
import { getAchievementLeaderboard, getOverallScoreLeaderboard } from './leaderboard/profileLeaderboards.js';
import { getLeaderboard, getWeeklyLeaderboard } from './leaderboard/standardLeaderboards.js';
import { updateLeaderboard } from './leaderboard/updateLeaderboard.js';

const OVERALL_MODE_CONFIGS = [
  { mode: 'classic', difficulty: null },
  { mode: 'classic_transparent', difficulty: null },
  { mode: 'vsai', difficulty: 'easy' },
  { mode: 'vsai', difficulty: 'medium' },
  { mode: 'vsai', difficulty: 'impossible' },
  { mode: 'multiplayer', difficulty: null }
];

export const leaderboardOperations = {
  updateLeaderboard,
  getLeaderboard,
  getAchievementLeaderboard,
  getOverallScoreLeaderboard,
  getWeeklyLeaderboard,

  async getTopPlayersOverall(limit = 10) {
    try {
      const allEntries = [];

      for (const modeConfig of OVERALL_MODE_CONFIGS) {
        const leaderboard = await this.getLeaderboard(modeConfig.mode, modeConfig.difficulty, {
          page: 1,
          limit: 50,
          includeStats: false
        });
        allEntries.push(...leaderboard.entries);
      }

      const userBestScores = {};
      allEntries.forEach((entry) => {
        if (!userBestScores[entry.userId] || userBestScores[entry.userId].score < entry.score) {
          userBestScores[entry.userId] = entry;
        }
      });

      return Object.values(userBestScores)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((entry, index) => ({
          ...entry,
          rank: index + 1
        }));
    } catch (error) {
      logger.error('Error fetching top players:', error);
      return [];
    }
  },

  async getUserRank(userId, mode = 'classic', difficulty = null) {
    try {
      const leaderboard = await this.getLeaderboard(mode, difficulty, {
        page: 1,
        limit: 1000,
        includeStats: false
      });
      const userEntry = leaderboard.entries.find((entry) => entry.userId === userId);

      if (!userEntry) return null;

      return {
        rank: userEntry.rank,
        score: userEntry.score,
        totalPlayers: leaderboard.totalEntries
      };
    } catch (error) {
      logger.error('Error fetching user rank:', error);
      return null;
    }
  }
};
