const SUSPICIOUS_STAT_VALUE = 1000000000;

const isCountKey = (key) => (
  key.includes('Games') ||
  key === 'totalGames' ||
  key === 'totalWins' ||
  key.includes('Wins') ||
  key.includes('wins')
);

const isMaxKey = (key) => (
  key.endsWith('BestScore') ||
  key.endsWith('bestScore') ||
  key === 'bestScore' ||
  key === 'maxSpeed' ||
  key === 'maxLength' ||
  key === 'bestWinStreak' ||
  key === 'leaderboardTop3BestWeekStreak' ||
  key === 'weeklyTop3BestWeekStreak' ||
  key === 'maxSurvivalTime' ||
  key === 'transparentScore' ||
  key === 'level'
);

const isTimestampKey = (key) => key.endsWith('At');

export const applyStatUpdates = (currentStats = {}, statUpdates = {}) => {
  const nextStats = { ...currentStats };

  for (const [key, value] of Object.entries(statUpdates)) {
    if (typeof value === 'number') {
      if (!Number.isFinite(value)) {
        continue;
      }

      if (isTimestampKey(key)) {
        nextStats[key] = value;
        continue;
      }

      if (Math.abs(value) > SUSPICIOUS_STAT_VALUE) {
        continue;
      }

      if (isCountKey(key)) {
        nextStats[key] = (nextStats[key] || 0) + value;
        continue;
      }

      if (isMaxKey(key)) {
        nextStats[key] = Math.max(nextStats[key] || 0, value);
        continue;
      }

      if (key === 'currentWinStreak') {
        nextStats[key] = value;
        continue;
      }

      if (key === 'aiImpossibleStreak') {
        nextStats[key] = value;
        continue;
      }

      if (key === 'leaderboardTop3WeekStreak') {
        nextStats[key] = value;
        continue;
      }

      if (key === 'weeklyTop3WeekStreak') {
        nextStats[key] = value;
        continue;
      }

      if (key === 'lastGameDuration') {
        nextStats[key] = value;
        continue;
      }

      nextStats[key] = (nextStats[key] || 0) + value;
      continue;
    }

    if (Array.isArray(value)) {
      nextStats[key] = value;
      continue;
    }

    nextStats[key] = value;
  }

  return nextStats;
};
