import { useCallback, useEffect, useMemo, useState } from 'react';
import { adminOperations } from '@/services/firebase';
import { supportOperations } from '@/services/firebase/support.js';
import { playClick } from '@/utils/sound';

const USERS_PAGE_SIZE = 25;
const GAMES_PAGE_SIZE = 20;
const SUPPORT_TICKETS_PAGE_SIZE = 10;
const SUPPORT_BADGE_LIMIT = 25;

const DEFAULT_USERS_FILTERS = Object.freeze({
  search: '',
  role: 'all',
  bannedState: 'all',
  activityWindow: 'all',
  sortBy: 'createdAt_desc'
});

const DEFAULT_GAMES_FILTERS = Object.freeze({
  search: '',
  mode: 'all',
  result: 'all',
  minScore: '',
  maxScore: '',
  period: 'all',
  sortBy: 'createdAt_desc'
});

const DEFAULT_TICKET_FILTERS = Object.freeze({
  search: '',
  status: 'all',
  priority: 'all',
  unreadOnly: false,
  period: 'all',
  sortBy: 'updatedAt_desc'
});

const toDateOrNow = (value) => {
  if (value instanceof Date) return value;
  if (typeof value === 'number' && Number.isFinite(value)) return new Date(value);
  if (typeof value?.seconds === 'number') return new Date(value.seconds * 1000);
  if (typeof value?.toDate === 'function') return value.toDate();
  return new Date();
};

const resolveWindowStart = (windowKey) => {
  if (windowKey === '24h') return Date.now() - (24 * 60 * 60 * 1000);
  if (windowKey === '7d') return Date.now() - (7 * 24 * 60 * 60 * 1000);
  if (windowKey === '30d') return Date.now() - (30 * 24 * 60 * 60 * 1000);
  if (windowKey === '90d') return Date.now() - (90 * 24 * 60 * 60 * 1000);
  return null;
};

const isWithinMs = (value, windowMs) => {
  const dateValue = toDateOrNow(value).getTime();
  return Date.now() - dateValue < windowMs;
};

const createDefaultPagination = (limit) => ({
  page: 1,
  limit,
  hasNext: false,
  hasPrev: false
});

const matchesUserViewFilters = (user, filters) => {
  const search = filters.search.trim().toLowerCase();
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

  const windowStart = resolveWindowStart(filters.activityWindow);
  if (windowStart != null) {
    const lastActiveAt = toDateOrNow(user.lastActiveAt || user.lastActive).getTime();
    if (!lastActiveAt || lastActiveAt < windowStart) {
      return false;
    }
  }

  return true;
};

const matchesTicketViewFilters = (ticket, filters) => {
  const search = filters.search.trim().toLowerCase();
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

  if (filters.status !== 'all' && (ticket.status || 'open') !== filters.status) {
    return false;
  }

  if (filters.priority !== 'all' && (ticket.priority || 'normal') !== filters.priority) {
    return false;
  }

  if (filters.unreadOnly && ticket.customerUnreadUpdate !== true) {
    return false;
  }

  const windowStart = resolveWindowStart(filters.period);
  if (windowStart != null) {
    const ticketTime = toDateOrNow(ticket.updatedAt || ticket.createdAt).getTime();
    if (!ticketTime || ticketTime < windowStart) {
      return false;
    }
  }

  return true;
};

export const useAdminDataController = ({ activeTab, isAdmin }) => {
  const [usersLoading, setUsersLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [matchHistory, setMatchHistory] = useState([]);
  const [stats, setStats] = useState({});
  const [supportTickets, setSupportTickets] = useState([]);
  const [supportTicketSummary, setSupportTicketSummary] = useState({
    open: 0,
    needsReply: 0,
    resolved: 0
  });
  const [supportInboxBadge, setSupportInboxBadge] = useState(0);
  const [error, setError] = useState('');
  const [moderatingUserId, setModeratingUserId] = useState(null);
  const [usersPagination, setUsersPagination] = useState(createDefaultPagination(USERS_PAGE_SIZE));
  const [gamesPagination, setGamesPagination] = useState(createDefaultPagination(GAMES_PAGE_SIZE));
  const [supportTicketsPagination, setSupportTicketsPagination] = useState(createDefaultPagination(SUPPORT_TICKETS_PAGE_SIZE));
  const [userDraftFilters, setUserDraftFilters] = useState({ ...DEFAULT_USERS_FILTERS });
  const [activeUserFilters, setActiveUserFilters] = useState({ ...DEFAULT_USERS_FILTERS });
  const [gameDraftFilters, setGameDraftFilters] = useState({ ...DEFAULT_GAMES_FILTERS });
  const [activeGameFilters, setActiveGameFilters] = useState({ ...DEFAULT_GAMES_FILTERS });
  const [ticketDraftFilters, setTicketDraftFilters] = useState({ ...DEFAULT_TICKET_FILTERS });
  const [activeTicketFilters, setActiveTicketFilters] = useState({ ...DEFAULT_TICKET_FILTERS });

  const fetchOverview = useCallback(async () => {
    setOverviewLoading(true);
    setError('');
    try {
      const overview = await adminOperations.getOverview();
      setStats(overview);
    } catch (_fetchError) {
      setError('Failed to fetch admin overview');
    } finally {
      setOverviewLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async ({
    page = 1,
    filters = activeUserFilters
  } = {}) => {
    setUsersLoading(true);
    setError('');
    try {
      const response = await adminOperations.getUsers({
        page,
        limit: USERS_PAGE_SIZE,
        filters
      });
      const usersData = response.users.map((user) => ({
        ...user,
        lastActive: toDateOrNow(user.lastActiveAt),
        createdAt: toDateOrNow(user.createdAt),
        banned: user.banned === true
      }));

      setUsers(usersData);
      setUsersPagination(response.pagination);
    } catch (_fetchError) {
      setError('Failed to fetch users data');
    } finally {
      setUsersLoading(false);
    }
  }, [activeUserFilters]);

  const fetchMatchHistory = useCallback(async ({
    page = 1,
    filters = activeGameFilters
  } = {}) => {
    setHistoryLoading(true);
    setError('');
    try {
      const response = await adminOperations.getRecentGames({
        page,
        limit: GAMES_PAGE_SIZE,
        filters
      });
      const gamesData = response.games.map((game) => ({
        ...game,
        timestamp: toDateOrNow(game.createdAt),
        startedAt: toDateOrNow(game.startedAt),
        endedAt: toDateOrNow(game.endedAt)
      }));

      setMatchHistory(gamesData);
      setGamesPagination(response.pagination);
    } catch (_fetchError) {
      setError('Failed to fetch match history');
    } finally {
      setHistoryLoading(false);
    }
  }, [activeGameFilters]);

  const fetchSupportTickets = useCallback(async ({
    page = 1,
    filters = activeTicketFilters
  } = {}) => {
    setTicketsLoading(true);
    setError('');
    try {
      const response = await adminOperations.getSupportTickets({
        page,
        limit: SUPPORT_TICKETS_PAGE_SIZE,
        filters
      });
      setSupportTickets(response.tickets);
      setSupportTicketsPagination(response.pagination);
      setSupportTicketSummary(response.summary || {
        open: 0,
        needsReply: 0,
        resolved: 0
      });
      if (
        filters.status === 'all'
        && filters.priority === 'all'
        && filters.unreadOnly === false
        && filters.period === 'all'
        && !filters.search
      ) {
        setSupportInboxBadge(Number(response.summary?.open || 0));
      }
    } catch (_fetchError) {
      setError('Failed to fetch support tickets');
    } finally {
      setTicketsLoading(false);
    }
  }, [activeTicketFilters]);

  const handleUserBan = useCallback(async (userId, isBanned) => {
    const currentUser = users.find((user) => user.id === userId);
    if (!currentUser) {
      return;
    }

    try {
      setError('');
      const nextBannedState = !isBanned;
      const affectsDailyActive = isWithinMs(currentUser.lastActive, 24 * 60 * 60 * 1000);
      const affectsWeeklyActive = isWithinMs(currentUser.lastActive, 7 * 24 * 60 * 60 * 1000);
      setModeratingUserId(userId);

      setUsers((previous) => previous.map((user) => (
        user.id === userId
          ? {
              ...user,
              banned: nextBannedState,
              banReason: nextBannedState ? 'Administrative action' : null
            }
          : user
      )));

      setStats((previous) => ({
        ...previous,
        bannedUsers: Math.max(0, Number(previous.bannedUsers || 0) + (nextBannedState ? 1 : -1)),
        activeUsers: Math.max(0, Number(previous.activeUsers || 0) + (affectsDailyActive ? (nextBannedState ? -1 : 1) : 0)),
        weeklyActiveUsers: Math.max(0, Number(previous.weeklyActiveUsers || 0) + (affectsWeeklyActive ? (nextBannedState ? -1 : 1) : 0))
      }));

      const updatedUser = await adminOperations.setUserBanState(
        userId,
        nextBannedState,
        'Administrative action'
      );
      if (!updatedUser) {
        throw new Error('Moderation update did not return a user payload.');
      }

      setUsers((previous) => previous
        .map((user) => (
          user.id === userId
            ? {
                ...user,
                banned: updatedUser.banned === true,
                banReason: updatedUser.banReason || null
              }
            : user
        ))
        .filter((user) => matchesUserViewFilters(user, activeUserFilters)));

      playClick();
    } catch (_updateError) {
      setUsers((previous) => previous.map((user) => (
        user.id === userId
          ? {
              ...user,
              banned: isBanned,
              banReason: currentUser.banReason || null
            }
          : user
      )));
      void fetchOverview();
      setError('Failed to update user status');
    } finally {
      setModeratingUserId(null);
    }
  }, [activeUserFilters, fetchOverview, users]);

  const handleTicketUpdate = useCallback(async (ticketId, updates) => {
    const currentTicket = supportTickets.find((ticket) => ticket.id === ticketId);
    setSupportTickets((previous) => previous.map((ticket) => (
      ticket.id === ticketId
        ? {
            ...ticket,
            ...updates,
            updatedAt: Date.now()
          }
        : ticket
    )));

    const updatedTicket = await supportOperations.updateTicket(ticketId, updates);
    if (!updatedTicket) {
      setSupportTickets((previous) => previous.map((ticket) => (
        ticket.id === ticketId ? currentTicket || ticket : ticket
      )));
      setError('Failed to update ticket');
      return;
    }

    setSupportTickets((previous) => previous
      .map((ticket) => (ticket.id === ticketId ? { ...ticket, ...updatedTicket } : ticket))
      .filter((ticket) => matchesTicketViewFilters(ticket, activeTicketFilters)));

    void fetchSupportTickets({
      page: supportTicketsPagination.page || 1,
      filters: activeTicketFilters
    });
  }, [activeTicketFilters, fetchSupportTickets, supportTickets, supportTicketsPagination.page]);

  useEffect(() => {
    if (!isAdmin) return undefined;

    const unsubscribe = supportOperations.subscribeToRecentTickets(
      SUPPORT_BADGE_LIMIT,
      (tickets) => {
        setSupportInboxBadge(
          tickets.filter((ticket) => ['open', 'in_progress', 'pending_user'].includes(ticket.status || 'open')).length
        );
      },
      () => {}
    );

    return () => {
      unsubscribe?.();
    };
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    fetchOverview();
  }, [fetchOverview, isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;

    if (activeTab === 'users') {
      fetchUsers({ page: usersPagination.page || 1, filters: activeUserFilters });
      return;
    }

    if (activeTab === 'history') {
      fetchMatchHistory({ page: gamesPagination.page || 1, filters: activeGameFilters });
      return;
    }

    if (activeTab === 'tickets') {
      fetchSupportTickets({ page: supportTicketsPagination.page || 1, filters: activeTicketFilters });
    }
  }, [
    activeGameFilters,
    activeTab,
    activeTicketFilters,
    activeUserFilters,
    fetchMatchHistory,
    fetchSupportTickets,
    fetchUsers,
    gamesPagination.page,
    isAdmin,
    supportTicketsPagination.page,
    usersPagination.page
  ]);

  const userFilterState = useMemo(() => ({
    draft: userDraftFilters,
    active: activeUserFilters
  }), [activeUserFilters, userDraftFilters]);

  const gameFilterState = useMemo(() => ({
    draft: gameDraftFilters,
    active: activeGameFilters
  }), [activeGameFilters, gameDraftFilters]);

  const ticketFilterState = useMemo(() => ({
    draft: ticketDraftFilters,
    active: activeTicketFilters
  }), [activeTicketFilters, ticketDraftFilters]);

  return {
    error,
    fetchSupportTickets: () => fetchSupportTickets({
      page: supportTicketsPagination.page || 1,
      filters: activeTicketFilters
    }),
    handleTicketUpdate,
    handleUserBan,
    historyLoading,
    matchHistory,
    moderatingUserId,
    overviewLoading,
    setError,
    stats,
    supportInboxBadge,
    supportTicketSummary,
    supportTickets,
    supportTicketsPagination,
    ticketsLoading,
    users,
    usersLoading,
    usersPagination,
    gamesPagination,
    userFilters: userFilterState,
    gameFilters: gameFilterState,
    ticketFilters: ticketFilterState,
    updateUserDraftFilter: (key, value) => setUserDraftFilters((previous) => ({ ...previous, [key]: value })),
    updateGameDraftFilter: (key, value) => setGameDraftFilters((previous) => ({ ...previous, [key]: value })),
    updateTicketDraftFilter: (key, value) => setTicketDraftFilters((previous) => ({ ...previous, [key]: value })),
    applyUserFilters: () => {
      setUsersPagination(createDefaultPagination(USERS_PAGE_SIZE));
      setActiveUserFilters({ ...userDraftFilters });
    },
    resetUserFilters: () => {
      const nextFilters = { ...DEFAULT_USERS_FILTERS };
      setUsersPagination(createDefaultPagination(USERS_PAGE_SIZE));
      setUserDraftFilters(nextFilters);
      setActiveUserFilters(nextFilters);
    },
    applyGameFilters: () => {
      setGamesPagination(createDefaultPagination(GAMES_PAGE_SIZE));
      setActiveGameFilters({ ...gameDraftFilters });
    },
    resetGameFilters: () => {
      const nextFilters = { ...DEFAULT_GAMES_FILTERS };
      setGamesPagination(createDefaultPagination(GAMES_PAGE_SIZE));
      setGameDraftFilters(nextFilters);
      setActiveGameFilters(nextFilters);
    },
    applyTicketFilters: () => {
      setSupportTicketsPagination(createDefaultPagination(SUPPORT_TICKETS_PAGE_SIZE));
      setActiveTicketFilters({ ...ticketDraftFilters });
    },
    resetTicketFilters: () => {
      const nextFilters = { ...DEFAULT_TICKET_FILTERS };
      setSupportTicketsPagination(createDefaultPagination(SUPPORT_TICKETS_PAGE_SIZE));
      setTicketDraftFilters(nextFilters);
      setActiveTicketFilters(nextFilters);
    },
    refreshUsers: () => fetchUsers({
      page: usersPagination.page || 1,
      filters: activeUserFilters
    }),
    nextUsersPage: () => setUsersPagination((previous) => ({ ...previous, page: (previous.page || 1) + 1 })),
    previousUsersPage: () => setUsersPagination((previous) => ({ ...previous, page: Math.max(1, (previous.page || 1) - 1) })),
    nextGamesPage: () => setGamesPagination((previous) => ({ ...previous, page: (previous.page || 1) + 1 })),
    previousGamesPage: () => setGamesPagination((previous) => ({ ...previous, page: Math.max(1, (previous.page || 1) - 1) })),
    refreshMatchHistory: () => fetchMatchHistory({
      page: gamesPagination.page || 1,
      filters: activeGameFilters
    }),
    nextSupportTicketsPage: () => setSupportTicketsPagination((previous) => ({ ...previous, page: (previous.page || 1) + 1 })),
    previousSupportTicketsPage: () => setSupportTicketsPagination((previous) => ({ ...previous, page: Math.max(1, (previous.page || 1) - 1) }))
  };
};
