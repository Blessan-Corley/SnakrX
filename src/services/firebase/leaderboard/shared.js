export const buildPagination = ({ page = 1, limit = 50, total = 0 }) => {
  const safeTotal = Number(total) || 0;
  const totalPages = safeTotal > 0 ? Math.ceil(safeTotal / limit) : 0;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  return {
    page,
    limit,
    total: safeTotal,
    totalPages,
    hasNext: endIndex < safeTotal,
    hasPrev: page > 1
  };
};

export const buildEmptyLeaderboardResult = ({
  page = 1,
  limit = 50,
  includeStats = true,
  extra = {}
}) => {
  const result = {
    entries: [],
    pagination: buildPagination({ page, limit, total: 0 }),
    lastUpdated: null,
    totalEntries: 0,
    ...extra
  };

  if (includeStats) {
    result.stats = {};
  }

  return result;
};

export const buildPaginatedResult = ({
  allEntries,
  page = 1,
  limit = 50,
  lastUpdated = null,
  totalEntries,
  includeStats = true,
  stats,
  extra = {}
}) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const entries = allEntries.slice(startIndex, endIndex);

  const result = {
    entries,
    pagination: buildPagination({ page, limit, total: allEntries.length }),
    lastUpdated,
    totalEntries: typeof totalEntries === 'number' ? totalEntries : allEntries.length,
    ...extra
  };

  if (includeStats) {
    result.stats = stats || {};
  }

  return result;
};

export const buildScoreStats = (entries = []) => {
  if (!entries.length) {
    return {
      highestScore: 0,
      averageScore: 0,
      uniquePlayers: 0
    };
  }

  return {
    highestScore: entries[0]?.score || 0,
    averageScore: Math.round(entries.reduce((sum, entry) => sum + entry.score, 0) / entries.length),
    uniquePlayers: entries.length
  };
};
