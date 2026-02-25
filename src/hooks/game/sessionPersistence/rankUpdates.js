import { getIsoWeekKey, isPreviousIsoWeek } from './modeAndWeek.js';

export const buildLeaderboardRankUpdates = ({
  modeRank,
  achievementRank,
  overallRank,
  predictedStatsForAchievements,
  currentDate = new Date()
}) => {
  const rankUpdates = {};

  if (modeRank && modeRank <= 100) {
    rankUpdates.leaderboardTop100Finishes = 1;
  }
  if (modeRank && modeRank <= 10) {
    rankUpdates.leaderboardTop10Finishes = 1;
  }
  if (modeRank && modeRank <= 3) {
    rankUpdates.leaderboardTop3Finishes = 1;
  }
  if (modeRank === 1) {
    rankUpdates.leaderboardRank1Finishes = 1;
  }
  if (achievementRank && achievementRank <= 10) {
    rankUpdates.achievementLeaderboardTop10Finishes = 1;
  }
  if (overallRank && overallRank <= 10) {
    rankUpdates.overallLeaderboardTop10Finishes = 1;
  }

  const currentWeekKey = getIsoWeekKey(currentDate);
  const lastWeekKey = predictedStatsForAchievements.leaderboardTop3LastWeekKey || null;
  const inTopThree = Boolean(modeRank && modeRank <= 3);

  if (inTopThree && lastWeekKey !== currentWeekKey) {
    const nextWeekStreak = isPreviousIsoWeek(lastWeekKey, currentWeekKey)
      ? (Number(predictedStatsForAchievements.leaderboardTop3WeekStreak) || 0) + 1
      : 1;
    rankUpdates.leaderboardTop3WeekStreak = nextWeekStreak;
    rankUpdates.leaderboardTop3BestWeekStreak = nextWeekStreak;
    rankUpdates.leaderboardTop3LastWeekKey = currentWeekKey;
  } else if (!inTopThree && lastWeekKey && lastWeekKey !== currentWeekKey && isPreviousIsoWeek(lastWeekKey, currentWeekKey)) {
    rankUpdates.leaderboardTop3WeekStreak = 0;
    rankUpdates.leaderboardTop3LastWeekKey = currentWeekKey;
  }

  return rankUpdates;
};
