const { functions, admin, db } = require('./runtime');
const {
  assertAdminUser,
  sanitizeText,
  toMillis,
  SUPPORT_COLLECTION,
  SUPPORT_TICKET_STATUSES,
  SUPPORT_TICKET_PRIORITIES
} = require('./shared/utils');
const { resolveGameXpGain } = require('./shared/gameFinalization');

const MAX_FILTERED_GAME_SCAN = 500;

const clampLimit = (value, fallback = 50, max = 200) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.min(max, Math.floor(parsed)));
};

const clampPage = (value, fallback = 1) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.floor(parsed));
};

const buildPagination = (page, limit, hasNext) => ({
  page,
  limit,
  hasNext: hasNext === true,
  hasPrev: page > 1
});

const toSearchValue = (value, max = 160) => sanitizeText(value || '', max).toLowerCase();

const toOptionValue = (value, allowed, fallback, { preserveCase = false } = {}) => {
  const normalized = sanitizeText(value || '', 64);
  const candidate = preserveCase ? normalized : normalized.toLowerCase();
  const allowedValues = preserveCase ? allowed : allowed.map((option) => option.toLowerCase());
  const fallbackValue = preserveCase ? fallback : fallback.toLowerCase();
  const allowedIndex = allowedValues.indexOf(candidate);
  if (allowedIndex >= 0) {
    return allowed[allowedIndex];
  }
  if (!preserveCase && allowed.includes(fallback)) {
    return fallback;
  }
  if (preserveCase) {
    return fallback;
  }
  return fallbackValue;
};

const toBooleanFlag = (value) => value === true || value === 'true';

const toOptionalNumber = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Math.max(0, Math.floor(parsed));
};

const resolveWindowStart = (windowKey, now = Date.now()) => {
  if (windowKey === '24h') return now - (24 * 60 * 60 * 1000);
  if (windowKey === '7d') return now - (7 * 24 * 60 * 60 * 1000);
  if (windowKey === '30d') return now - (30 * 24 * 60 * 60 * 1000);
  if (windowKey === '90d') return now - (90 * 24 * 60 * 60 * 1000);
  return null;
};

const mapAdminUser = (docSnap) => {
  const data = docSnap.data() || {};
  const stats = data.stats || {};

  return {
    id: docSnap.id,
    username: sanitizeText(data.username || '', 64) || null,
    displayName: sanitizeText(data.displayName || '', 120) || null,
    email: sanitizeText(data.email || '', 160) || null,
    role: sanitizeText(data.role || 'player', 32) || 'player',
    banned: data.banned === true,
    banReason: sanitizeText(data.banReason || '', 200) || null,
    createdAt: toMillis(data.createdAt) || null,
    lastActiveAt: toMillis(data.lastActiveAt) || null,
    bannedAt: toMillis(data.bannedAt) || null,
    unbannedAt: toMillis(data.unbannedAt) || null,
    stats: {
      bestScore: Number(stats.bestScore) || 0,
      totalGames: Number(stats.totalGames) || 0,
      totalScore: Number(stats.totalScore) || 0,
      achievementPoints: Number(stats.achievementPoints) || 0,
      achievementsCompleted: Array.isArray(stats.achievements)
        ? stats.achievements.length
        : Number(stats.achievementsCompleted) || 0
    }
  };
};

const mapAdminGame = (docSnap) => {
  const data = docSnap.data() || {};
  return {
    id: docSnap.id,
    userId: sanitizeText(data.userId || '', 128) || null,
    username: sanitizeText(data.username || '', 64) || 'player',
    mode: sanitizeText(data.mode || '', 64) || 'classic',
    difficulty: data.difficulty == null ? null : sanitizeText(data.difficulty, 32),
    playerCount: Math.max(1, Number(data.playerCount) || 1),
    score: Math.max(0, Number(data.score) || 0),
    duration: Math.max(0, Number(data.duration) || 0),
    foodEaten: Math.max(0, Number(data.foodEaten) || 0),
    speedReached: Math.max(1, Number(data.speedReached) || 1),
    xpGained: resolveGameXpGain({
      xpGained: data.xpGained,
      mode: data.mode,
      difficulty: data.difficulty,
      duration: data.duration,
      foodEaten: data.foodEaten,
      score: data.score,
      result: data.result
    }),
    result: sanitizeText(data.result || 'completed', 32) || 'completed',
    createdAt: toMillis(data.createdAt) || null,
    startedAt: toMillis(data.startedAt) || null,
    endedAt: toMillis(data.endedAt) || null
  };
};

const mapAdminSupportTicket = (docSnap) => {
  const data = docSnap.data() || {};
  return {
    id: docSnap.id,
    userId: sanitizeText(data.userId || '', 128) || null,
    username: sanitizeText(data.username || '', 64) || null,
    displayName: sanitizeText(data.displayName || '', 120) || null,
    email: sanitizeText(data.email || '', 160) || null,
    category: sanitizeText(data.category || '', 64) || 'general',
    title: sanitizeText(data.title || '', 140) || 'Support request',
    description: sanitizeText(data.description || '', 4000) || '',
    status: sanitizeText(data.status || 'open', 32) || 'open',
    priority: sanitizeText(data.priority || 'normal', 32) || 'normal',
    adminResponse: sanitizeText(data.adminResponse || '', 2000) || '',
    customerUnreadUpdate: data.customerUnreadUpdate === true,
    customerUnreadUpdateCount: Math.max(0, Number(data.customerUnreadUpdateCount) || 0),
    createdAt: toMillis(data.createdAt) || null,
    updatedAt: toMillis(data.updatedAt) || null,
    adminUpdatedAt: toMillis(data.adminUpdatedAt) || null,
    attachmentNames: Array.isArray(data.attachmentNames) ? data.attachmentNames : [],
    source: sanitizeText(data.source || '', 64) || 'support_form'
  };
};

const buildAdminOverview = (userDocs = []) => {
  const users = userDocs.map(mapAdminUser);
  const now = Date.now();
  const dayAgo = now - (24 * 60 * 60 * 1000);
  const weekAgo = now - (7 * 24 * 60 * 60 * 1000);

  const totalUsers = users.length;
  const activeUsers = users.filter((user) => !user.banned && Number(user.lastActiveAt || 0) > dayAgo).length;
  const weeklyActiveUsers = users.filter((user) => !user.banned && Number(user.lastActiveAt || 0) > weekAgo).length;
  const bannedUsers = users.filter((user) => user.banned).length;
  const totalGames = users.reduce((sum, user) => sum + (Number(user.stats?.totalGames) || 0), 0);
  const totalScore = users.reduce((sum, user) => sum + (Number(user.stats?.totalScore) || 0), 0);
  const totalAchievements = users.reduce((sum, user) => sum + (Number(user.stats?.achievementsCompleted) || 0), 0);
  const newUsersToday = users.filter((user) => Number(user.createdAt || 0) > dayAgo).length;

  return {
    totalUsers,
    activeUsers,
    weeklyActiveUsers,
    bannedUsers,
    totalGames,
    totalScore,
    totalAchievements,
    newUsersToday,
    averageScore: totalGames > 0 ? Math.round(totalScore / totalGames) : 0,
    retentionRate: totalUsers > 0 ? Math.round((weeklyActiveUsers / totalUsers) * 100) : 0
  };
};

const normalizeUsersFilters = (filters = {}) => ({
  search: toSearchValue(filters.search, 120),
  role: toOptionValue(filters.role, ['all', 'player', 'admin'], 'all'),
  bannedState: toOptionValue(filters.bannedState, ['all', 'active', 'banned'], 'all'),
  activityWindow: toOptionValue(filters.activityWindow, ['all', '24h', '7d', '30d', '90d'], 'all'),
  sortBy: toOptionValue(
    filters.sortBy,
    ['createdAt_desc', 'lastActive_desc', 'bestScore_desc', 'totalGames_desc'],
    'createdAt_desc',
    { preserveCase: true }
  )
});

const normalizeGamesFilters = (filters = {}) => {
  const minScore = toOptionalNumber(filters.minScore);
  const maxScore = toOptionalNumber(filters.maxScore);
  return {
    search: toSearchValue(filters.search, 120),
    mode: toOptionValue(filters.mode, ['all', 'classic', 'classic_transparent', 'vsai', 'multiplayer'], 'all'),
    result: toOptionValue(filters.result, ['all', 'completed', 'won', 'lost', 'victory', 'defeat'], 'all'),
    minScore,
    maxScore: maxScore != null && minScore != null && maxScore < minScore ? minScore : maxScore,
    period: toOptionValue(filters.period, ['all', '24h', '7d', '30d', '90d'], 'all'),
    sortBy: toOptionValue(
      filters.sortBy,
      ['createdAt_desc', 'score_desc', 'xp_desc', 'duration_desc'],
      'createdAt_desc',
      { preserveCase: true }
    )
  };
};

const normalizeSupportTicketFilters = (filters = {}) => ({
  search: toSearchValue(filters.search, 160),
  status: toOptionValue(filters.status, ['all', ...Array.from(SUPPORT_TICKET_STATUSES)], 'all'),
  priority: toOptionValue(filters.priority, ['all', ...Array.from(SUPPORT_TICKET_PRIORITIES)], 'all'),
  unreadOnly: toBooleanFlag(filters.unreadOnly),
  period: toOptionValue(filters.period, ['all', '24h', '7d', '30d', '90d'], 'all'),
  sortBy: toOptionValue(
    filters.sortBy,
    ['updatedAt_desc', 'createdAt_desc', 'priority_desc'],
    'updatedAt_desc',
    { preserveCase: true }
  )
});

const hasActiveUserFilters = (filters) => (
  Boolean(filters.search)
  || filters.role !== 'all'
  || filters.bannedState !== 'all'
  || filters.activityWindow !== 'all'
  || filters.sortBy !== 'createdAt_desc'
);

const hasActiveGameFilters = (filters) => (
  Boolean(filters.search)
  || filters.mode !== 'all'
  || filters.result !== 'all'
  || filters.minScore != null
  || filters.maxScore != null
  || filters.period !== 'all'
  || filters.sortBy !== 'createdAt_desc'
);

const matchesUserFilters = (user, filters, now = Date.now()) => {
  const search = filters.search;
  if (search) {
    const haystack = [
      user.id,
      user.username,
      user.displayName,
      user.email
    ].filter(Boolean).join(' ').toLowerCase();
    if (!haystack.includes(search)) {
      return false;
    }
  }

  if (filters.role !== 'all' && (user.role || 'player') !== filters.role) {
    return false;
  }

  if (filters.bannedState === 'banned' && user.banned !== true) {
    return false;
  }

  if (filters.bannedState === 'active' && user.banned === true) {
    return false;
  }

  const windowStart = resolveWindowStart(filters.activityWindow, now);
  if (windowStart != null) {
    const lastActiveAt = Number(user.lastActiveAt || 0);
    if (!lastActiveAt || lastActiveAt < windowStart) {
      return false;
    }
  }

  return true;
};

const matchesGameFilters = (game, filters, now = Date.now()) => {
  const search = filters.search;
  if (search) {
    const haystack = [
      game.id,
      game.userId,
      game.username
    ].filter(Boolean).join(' ').toLowerCase();
    if (!haystack.includes(search)) {
      return false;
    }
  }

  if (filters.mode !== 'all' && game.mode !== filters.mode) {
    return false;
  }

  if (filters.result !== 'all' && game.result !== filters.result) {
    return false;
  }

  if (filters.minScore != null && Number(game.score || 0) < filters.minScore) {
    return false;
  }

  if (filters.maxScore != null && Number(game.score || 0) > filters.maxScore) {
    return false;
  }

  const windowStart = resolveWindowStart(filters.period, now);
  if (windowStart != null) {
    const gameTime = Number(game.createdAt || game.endedAt || game.startedAt || 0);
    if (!gameTime || gameTime < windowStart) {
      return false;
    }
  }

  return true;
};

const matchesSupportTicketFilters = (ticket, filters, now = Date.now()) => {
  const search = filters.search;
  if (search) {
    const haystack = [
      ticket.id,
      ticket.title,
      ticket.description,
      ticket.email,
      ticket.displayName,
      ticket.username,
      ticket.category
    ].filter(Boolean).join(' ').toLowerCase();
    if (!haystack.includes(search)) {
      return false;
    }
  }

  if (filters.status !== 'all' && ticket.status !== filters.status) {
    return false;
  }

  if (filters.priority !== 'all' && ticket.priority !== filters.priority) {
    return false;
  }

  if (filters.unreadOnly && ticket.customerUnreadUpdate !== true) {
    return false;
  }

  const windowStart = resolveWindowStart(filters.period, now);
  if (windowStart != null) {
    const ticketTime = Number(ticket.updatedAt || ticket.createdAt || 0);
    if (!ticketTime || ticketTime < windowStart) {
      return false;
    }
  }

  return true;
};

const compareDesc = (left, right) => Number(right || 0) - Number(left || 0);

const sortUsers = (users, sortBy) => [...users].sort((left, right) => {
  if (sortBy === 'lastActive_desc') {
    return compareDesc(left.lastActiveAt, right.lastActiveAt) || compareDesc(left.createdAt, right.createdAt) || left.id.localeCompare(right.id);
  }
  if (sortBy === 'bestScore_desc') {
    return compareDesc(left.stats?.bestScore, right.stats?.bestScore) || compareDesc(left.createdAt, right.createdAt) || left.id.localeCompare(right.id);
  }
  if (sortBy === 'totalGames_desc') {
    return compareDesc(left.stats?.totalGames, right.stats?.totalGames) || compareDesc(left.createdAt, right.createdAt) || left.id.localeCompare(right.id);
  }
  return compareDesc(left.createdAt, right.createdAt) || left.id.localeCompare(right.id);
});

const sortGames = (games, sortBy) => [...games].sort((left, right) => {
  if (sortBy === 'score_desc') {
    return compareDesc(left.score, right.score) || compareDesc(left.createdAt, right.createdAt) || left.id.localeCompare(right.id);
  }
  if (sortBy === 'xp_desc') {
    return compareDesc(left.xpGained, right.xpGained) || compareDesc(left.createdAt, right.createdAt) || left.id.localeCompare(right.id);
  }
  if (sortBy === 'duration_desc') {
    return compareDesc(left.duration, right.duration) || compareDesc(left.createdAt, right.createdAt) || left.id.localeCompare(right.id);
  }
  return compareDesc(left.createdAt, right.createdAt) || left.id.localeCompare(right.id);
});

const PRIORITY_RANK = {
  urgent: 3,
  high: 2,
  normal: 1
};

const sortSupportTickets = (tickets, sortBy) => [...tickets].sort((left, right) => {
  if (sortBy === 'createdAt_desc') {
    return compareDesc(left.createdAt, right.createdAt) || compareDesc(left.updatedAt, right.updatedAt) || left.id.localeCompare(right.id);
  }
  if (sortBy === 'priority_desc') {
    return compareDesc(PRIORITY_RANK[left.priority], PRIORITY_RANK[right.priority])
      || compareDesc(left.updatedAt, right.updatedAt)
      || left.id.localeCompare(right.id);
  }
  return compareDesc(left.updatedAt, right.updatedAt) || compareDesc(left.createdAt, right.createdAt) || left.id.localeCompare(right.id);
});

const paginateItems = (items, page, limit) => {
  const startIndex = (page - 1) * limit;
  const pagedItems = items.slice(startIndex, startIndex + limit);
  return {
    items: pagedItems,
    pagination: buildPagination(page, limit, startIndex + limit < items.length)
  };
};

const buildSupportTicketSummary = (tickets = []) => ({
  open: tickets.filter((ticket) => ['open', 'in_progress', 'pending_user'].includes(ticket.status || 'open')).length,
  needsReply: tickets.filter((ticket) => ticket.customerUnreadUpdate === true).length,
  resolved: tickets.filter((ticket) => ['resolved', 'closed'].includes(ticket.status || 'open')).length
});

const listAdminUsers = functions.https.onCall(async (data, context) => {
  await assertAdminUser(context);

  const page = clampPage(data?.page, 1);
  const limitCount = clampLimit(data?.limit, 25, 100);
  const filters = normalizeUsersFilters(data?.filters);

  if (!hasActiveUserFilters(filters)) {
    const snapshot = await db.collection('users')
      .orderBy('createdAt', 'desc')
      .offset((page - 1) * limitCount)
      .limit(limitCount + 1)
      .get();
    const docs = snapshot.docs.slice(0, limitCount);

    return {
      users: docs.map(mapAdminUser),
      pagination: buildPagination(page, limitCount, snapshot.docs.length > limitCount),
      filters
    };
  }

  const snapshot = await db.collection('users').get();
  const filteredUsers = sortUsers(
    snapshot.docs.map(mapAdminUser).filter((user) => matchesUserFilters(user, filters)),
    filters.sortBy
  );
  const paged = paginateItems(filteredUsers, page, limitCount);

  return {
    users: paged.items,
    pagination: paged.pagination,
    filters
  };
});

const listAdminGames = functions.https.onCall(async (data, context) => {
  await assertAdminUser(context);

  const page = clampPage(data?.page, 1);
  const limitCount = clampLimit(data?.limit, 20, 50);
  const filters = normalizeGamesFilters(data?.filters);

  if (!hasActiveGameFilters(filters)) {
    const snapshot = await db.collection('games')
      .orderBy('createdAt', 'desc')
      .offset((page - 1) * limitCount)
      .limit(limitCount + 1)
      .get();
    const docs = snapshot.docs.slice(0, limitCount);

    return {
      games: docs.map(mapAdminGame),
      pagination: buildPagination(page, limitCount, snapshot.docs.length > limitCount),
      filters
    };
  }

  const snapshot = await db.collection('games')
    .orderBy('createdAt', 'desc')
    .limit(MAX_FILTERED_GAME_SCAN)
    .get();
  const filteredGames = sortGames(
    snapshot.docs.map(mapAdminGame).filter((game) => matchesGameFilters(game, filters)),
    filters.sortBy
  );
  const paged = paginateItems(filteredGames, page, limitCount);

  return {
    games: paged.items,
    pagination: paged.pagination,
    filters,
    scannedCount: snapshot.size
  };
});

const listAdminSupportTickets = functions.https.onCall(async (data, context) => {
  await assertAdminUser(context);

  const page = clampPage(data?.page, 1);
  const limitCount = clampLimit(data?.limit, 10, 50);
  const filters = normalizeSupportTicketFilters(data?.filters);
  const snapshot = await db.collection(SUPPORT_COLLECTION).get();
  const filteredTickets = sortSupportTickets(
    snapshot.docs.map(mapAdminSupportTicket).filter((ticket) => matchesSupportTicketFilters(ticket, filters)),
    filters.sortBy
  );
  const paged = paginateItems(filteredTickets, page, limitCount);

  return {
    tickets: paged.items,
    pagination: paged.pagination,
    filters,
    summary: buildSupportTicketSummary(filteredTickets)
  };
});

const getAdminOverview = functions.https.onCall(async (_data, context) => {
  await assertAdminUser(context);

  const snapshot = await db.collection('users').get();
  return {
    overview: buildAdminOverview(snapshot.docs)
  };
});

const setUserBanState = functions.https.onCall(async (data, context) => {
  await assertAdminUser(context);

  const userId = sanitizeText(data?.userId || '', 128);
  const banned = Boolean(data?.banned);
  const banReason = sanitizeText(data?.banReason || '', 200) || 'Administrative action';

  if (!userId) {
    throw new functions.https.HttpsError('invalid-argument', 'User id is required.');
  }

  const userRef = db.collection('users').doc(userId);
  const now = admin.firestore.FieldValue.serverTimestamp();

  const updatedUser = await db.runTransaction(async (transaction) => {
    const userSnap = await transaction.get(userRef);
    if (!userSnap.exists) {
      throw new functions.https.HttpsError('not-found', 'User was not found.');
    }

    const currentData = userSnap.data() || {};
    const updatePayload = banned
      ? {
          banned: true,
          banReason,
          bannedAt: now,
          bannedBy: context.auth.uid,
          unbannedAt: null,
          unbannedBy: null,
          updatedAt: now
        }
      : {
          banned: false,
          banReason: null,
          bannedAt: null,
          bannedBy: null,
          unbannedAt: now,
          unbannedBy: context.auth.uid,
          updatedAt: now
        };

    transaction.set(userRef, updatePayload, { merge: true });
    return {
      ...currentData,
      ...updatePayload,
      id: userSnap.id,
      banned
    };
  });

  return {
    user: {
      id: updatedUser.id,
      banned: updatedUser.banned === true,
      banReason: updatedUser.banReason || null
    }
  };
});

const __private__ = {
  buildAdminOverview,
  buildPagination,
  buildSupportTicketSummary,
  clampLimit,
  clampPage,
  mapAdminUser,
  mapAdminGame,
  mapAdminSupportTicket,
  normalizeUsersFilters,
  normalizeGamesFilters,
  normalizeSupportTicketFilters,
  matchesUserFilters,
  matchesGameFilters,
  matchesSupportTicketFilters,
  sortUsers,
  sortGames,
  sortSupportTickets
};

module.exports = {
  listAdminUsers,
  listAdminGames,
  listAdminSupportTickets,
  getAdminOverview,
  setUserBanState,
  __private__
};
