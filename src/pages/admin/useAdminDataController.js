import { useCallback, useEffect, useMemo, useState } from 'react';
import { adminOperations } from '@/services/firebase';
import { supportOperations } from '@/services/firebase/support.js';
import { playClick } from '@/utils/sound';

const toDateOrNow = (value) => {
  if (value instanceof Date) return value;
  if (typeof value === 'number' && Number.isFinite(value)) return new Date(value);
  if (typeof value?.seconds === 'number') return new Date(value.seconds * 1000);
  if (typeof value?.toDate === 'function') return value.toDate();
  return new Date();
};

export const useAdminDataController = ({ activeTab, isAdmin }) => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [matchHistory, setMatchHistory] = useState([]);
  const [stats, setStats] = useState({});
  const [supportTickets, setSupportTickets] = useState([]);
  const [error, setError] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const usersData = (await adminOperations.getUsers(150)).map((user) => ({
        ...user,
        lastActive: toDateOrNow(user.lastActiveAt),
        createdAt: toDateOrNow(user.createdAt),
        banned: user.banned === true
      }));

      setUsers(usersData);

      const now = new Date();
      const dayAgo = new Date(now - 24 * 60 * 60 * 1000);
      const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
      const totalUsers = usersData.length;
      const activeUsers = usersData.filter((user) => !user.banned && user.lastActive > dayAgo).length;
      const weeklyActiveUsers = usersData.filter((user) => !user.banned && user.lastActive > weekAgo).length;
      const bannedUsers = usersData.filter((user) => user.banned).length;
      const totalGames = usersData.reduce((sum, user) => sum + (user.stats?.totalGames || 0), 0);
      const totalScore = usersData.reduce((sum, user) => sum + (user.stats?.totalScore || 0), 0);
      const totalAchievements = usersData.reduce((sum, user) => sum + (user.stats?.achievementsCompleted || 0), 0);
      const newUsersToday = usersData.filter((user) => user.createdAt > dayAgo).length;

      setStats({
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
      });
    } catch (fetchError) {
      setError('Failed to fetch users data');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMatchHistory = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const gamesData = (await adminOperations.getRecentGames(50)).map((game) => ({
        ...game,
        timestamp: toDateOrNow(game.createdAt),
        startedAt: toDateOrNow(game.startedAt),
        endedAt: toDateOrNow(game.endedAt)
      }));

      setMatchHistory(gamesData);
    } catch (fetchError) {
      setError('Failed to fetch match history');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleUserBan = useCallback(async (userId, isBanned) => {
    try {
      setError('');
      const nextBannedState = !isBanned;
      const updatedUser = await adminOperations.setUserBanState(
        userId,
        nextBannedState,
        'Administrative action'
      );
      if (!updatedUser) {
        throw new Error('Moderation update did not return a user payload.');
      }

      setUsers((previous) => previous.map((user) => (
        user.id === userId
          ? {
              ...user,
              banned: updatedUser.banned === true,
              banReason: updatedUser.banReason || null
            }
          : user
      )));

      setStats((previous) => ({
        ...previous,
        bannedUsers: nextBannedState ? previous.bannedUsers + 1 : Math.max(0, previous.bannedUsers - 1),
        activeUsers: nextBannedState ? Math.max(0, previous.activeUsers - 1) : previous.activeUsers + 1
      }));

      playClick();
    } catch (updateError) {
      setError('Failed to update user status');
    }
  }, []);

  const fetchSupportTickets = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const tickets = await supportOperations.getRecentTickets(150);
      setSupportTickets(tickets);
    } catch (fetchError) {
      setError('Failed to fetch support tickets');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleTicketUpdate = useCallback(async (ticketId, updates) => {
    const updatedTicket = await supportOperations.updateTicket(ticketId, updates);
    if (!updatedTicket) {
      setError('Failed to update ticket');
      return;
    }
    setSupportTickets((previous) => previous.map((ticket) => (
      ticket.id === ticketId ? { ...ticket, ...updatedTicket } : ticket
    )));
  }, []);

  useEffect(() => {
    if (!isAdmin || activeTab !== 'tickets') return undefined;

    setLoading(true);
    const unsubscribe = supportOperations.subscribeToRecentTickets(
      150,
      (tickets) => {
        setSupportTickets(tickets);
        setLoading(false);
        setError('');
      },
      () => {
        setError('Failed to subscribe to support tickets');
        setLoading(false);
      }
    );

    return () => {
      unsubscribe?.();
    };
  }, [activeTab, isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    if (activeTab === 'users') {
      fetchUsers();
      return;
    }
    if (activeTab === 'history') {
      fetchMatchHistory();
    }
  }, [activeTab, fetchMatchHistory, fetchUsers, isAdmin]);

  const supportInboxBadge = useMemo(
    () => supportTickets.filter((ticket) => ['open', 'in_progress', 'pending_user'].includes(ticket.status || 'open')).length,
    [supportTickets]
  );

  return {
    error,
    fetchSupportTickets,
    fetchUsers,
    handleTicketUpdate,
    handleUserBan,
    loading,
    matchHistory,
    setError,
    stats,
    supportInboxBadge,
    supportTickets,
    users
  };
};
