export const CACHE_TTL_MS = 5 * 60 * 1000;

export const DEFAULT_LEADERBOARD_RESPONSE = {
  entries: [],
  stats: {},
  lastUpdated: null,
  totalEntries: 0
};

export const DEFAULT_SUMMARY = {
  topThree: [],
  userBestRank: null,
  hasData: false
};

export const USER_RANK_MODES = [
  { mode: 'classic', difficulty: null },
  { mode: 'classic_transparent', difficulty: null },
  { mode: 'vsai', difficulty: 'easy' },
  { mode: 'vsai', difficulty: 'medium' },
  { mode: 'vsai', difficulty: 'impossible' },
  { mode: 'multiplayer', difficulty: null }
];

export const getLeaderboardErrorMessage = (error) => {
  if (!error) return 'Unknown leaderboard error';
  if (typeof error === 'string') return error;
  if (typeof error.message === 'string' && error.message.trim()) {
    return error.message;
  }
  return 'Unable to load leaderboard data';
};
