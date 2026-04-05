import { formatScore } from '@/utils/gameUtils';

export const resolveDateValue = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value?.toDate === 'function') return value.toDate();
  if (typeof value?.seconds === 'number') return new Date(value.seconds * 1000);
  if (typeof value === 'number' || typeof value === 'string') return new Date(value);
  return null;
};

export const getBestGameSubtitle = (userStats = {}, modeLabelMap = {}) => {
  const bestGameDate = resolveDateValue(userStats.bestScoreAt);
  const bestGameModeLabel = modeLabelMap[userStats.bestScoreMode] || null;

  if (!bestGameDate) {
    return 'Personal record';
  }

  return `${bestGameModeLabel || 'Best run'} - ${bestGameDate.toLocaleDateString()} ${bestGameDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  })}`;
};

export const buildQuickStats = ({
  userStats = {},
  achievementStats = {},
  totalAchievementPoints = 0,
  modeLabelMap = {}
}) => ([
  {
    title: 'Total Score',
    value: formatScore(userStats.totalScore || 0),
    subtitle: 'All time points'
  },
  {
    title: 'Best Game',
    value: formatScore(userStats.bestScore || 0),
    subtitle: getBestGameSubtitle(userStats, modeLabelMap)
  },
  {
    title: 'Games Played',
    value: userStats.totalGames || 0,
    subtitle: 'Total matches'
  },
  {
    title: 'Achievement Points',
    value: totalAchievementPoints,
    subtitle: `${achievementStats.unlocked || 0}/${achievementStats.total || 0} unlocked`
  }
]);

const getLeaderboardModeLabel = (entry = {}) => {
  if (entry.mode === 'classic') return 'Classic';
  if (entry.mode === 'vsai') return `VS AI ${entry.difficulty || ''}`.trim();
  if (entry.mode === 'multiplayer') return 'Multiplayer';
  return 'Classic';
};

export const buildRecentLeaderboard = ({
  leaderboardSummary,
  loadingLeaderboard,
  userProfile
}) => {
  if (loadingLeaderboard || !leaderboardSummary?.hasData) {
    return [];
  }

  const { topThree = [], userBestRank } = leaderboardSummary;
  const leaderboardEntries = [];

  topThree.forEach((entry, index) => {
    const entryDate = resolveDateValue(entry.timestamp);
    leaderboardEntries.push({
      rank: index + 1,
      player: entry.displayName || entry.username || 'Anonymous',
      score: formatScore(entry.score),
      mode: getLeaderboardModeLabel(entry),
      date: entryDate ? entryDate.toLocaleDateString() : 'Recently',
      highlighted: entry.userId === userProfile?.uid
    });
  });

  if (userBestRank && !topThree.some((entry) => entry.userId === userProfile?.uid)) {
    leaderboardEntries.push({
      rank: userBestRank.rank,
      player: userProfile?.displayName || userProfile?.username || 'You',
      score: formatScore(userBestRank.score),
      mode: 'Your Best',
      date: 'Personal Record',
      highlighted: true
    });
  }

  return leaderboardEntries.slice(0, 3);
};

export const getMemberSinceLabel = (createdAt) => {
  const resolvedDate = resolveDateValue(createdAt);
  return (resolvedDate || new Date()).toLocaleDateString();
};
