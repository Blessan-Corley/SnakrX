import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAdminDataController } from './useAdminDataController.js';

const getOverviewMock = vi.fn();
const getUsersMock = vi.fn();
const getRecentGamesMock = vi.fn();
const getSupportTicketsMock = vi.fn();
const setUserBanStateMock = vi.fn();
const subscribeToRecentTicketsMock = vi.fn();
const updateTicketMock = vi.fn();
const playClickMock = vi.fn();

vi.mock('@/services/firebase', () => ({
  adminOperations: {
    getOverview: (...args) => getOverviewMock(...args),
    getUsers: (...args) => getUsersMock(...args),
    getRecentGames: (...args) => getRecentGamesMock(...args),
    getSupportTickets: (...args) => getSupportTicketsMock(...args),
    setUserBanState: (...args) => setUserBanStateMock(...args)
  }
}));

vi.mock('@/services/firebase/support.js', () => ({
  supportOperations: {
    subscribeToRecentTickets: (...args) => subscribeToRecentTicketsMock(...args),
    updateTicket: (...args) => updateTicketMock(...args)
  }
}));

vi.mock('@/utils/sound', () => ({
  playClick: (...args) => playClickMock(...args)
}));

const nowMs = Date.UTC(2026, 2, 24, 12, 0, 0);

const createUserResponse = () => ({
  users: [
    {
      id: 'user-1',
      username: 'alpha',
      displayName: 'Alpha',
      email: 'alpha@example.com',
      role: 'player',
      banned: false,
      lastActiveAt: nowMs - (60 * 60 * 1000),
      createdAt: nowMs - (3 * 24 * 60 * 60 * 1000),
      stats: {
        bestScore: 500,
        totalGames: 10,
        achievementsCompleted: 4
      }
    }
  ],
  pagination: {
    page: 1,
    limit: 25,
    hasNext: true,
    hasPrev: false
  }
});

describe('useAdminDataController', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(Date, 'now').mockReturnValue(nowMs);

    getOverviewMock.mockReset();
    getUsersMock.mockReset();
    getRecentGamesMock.mockReset();
    getSupportTicketsMock.mockReset();
    setUserBanStateMock.mockReset();
    subscribeToRecentTicketsMock.mockReset();
    updateTicketMock.mockReset();
    playClickMock.mockReset();

    getOverviewMock.mockResolvedValue({
      bannedUsers: 1,
      activeUsers: 10,
      weeklyActiveUsers: 12
    });
    getUsersMock.mockResolvedValue(createUserResponse());
    getRecentGamesMock.mockResolvedValue({
      games: [],
      pagination: { page: 1, limit: 20, hasNext: false, hasPrev: false }
    });
    getSupportTicketsMock.mockResolvedValue({
      tickets: [
        {
          id: 'ticket-1',
          status: 'open',
          priority: 'normal',
          customerUnreadUpdate: true,
          createdAt: nowMs - 1000,
          updatedAt: nowMs - 1000
        }
      ],
      pagination: { page: 1, limit: 10, hasNext: false, hasPrev: false },
      summary: { open: 3, needsReply: 1, resolved: 0 }
    });
    subscribeToRecentTicketsMock.mockImplementation((_limit, onTickets) => {
      onTickets([]);
      return vi.fn();
    });
    updateTicketMock.mockResolvedValue({
      id: 'ticket-1',
      status: 'resolved',
      priority: 'high',
      customerUnreadUpdate: false
    });
  });

  it('loads admin overview and users, updates the support badge from the subscription, and cleans up on unmount', async () => {
    const unsubscribeMock = vi.fn();
    let recentTicketsCallback;
    subscribeToRecentTicketsMock.mockImplementation((_limit, onTickets) => {
      recentTicketsCallback = onTickets;
      return unsubscribeMock;
    });

    const { result, unmount } = renderHook(() => useAdminDataController({
      activeTab: 'users',
      isAdmin: true
    }));

    await waitFor(() => {
      expect(result.current.overviewLoading).toBe(false);
      expect(result.current.usersLoading).toBe(false);
    });

    expect(getOverviewMock).toHaveBeenCalledTimes(1);
    expect(getUsersMock).toHaveBeenCalledWith({
      page: 1,
      limit: 25,
      filters: {
        search: '',
        role: 'all',
        bannedState: 'all',
        activityWindow: 'all',
        sortBy: 'createdAt_desc'
      }
    });
    expect(result.current.users[0]).toEqual(expect.objectContaining({
      id: 'user-1',
      banned: false,
      lastActive: expect.any(Date),
      createdAt: expect.any(Date)
    }));

    act(() => {
      recentTicketsCallback([
        { id: 't1', status: 'open' },
        { id: 't2', status: 'resolved' },
        { id: 't3', status: 'pending_user' }
      ]);
    });

    expect(result.current.supportInboxBadge).toBe(2);

    unmount();
    expect(unsubscribeMock).toHaveBeenCalledTimes(1);
  });

  it('applies and resets user filters and refetches users with the new active state', async () => {
    const responses = [
      createUserResponse(),
      {
        users: [],
        pagination: { page: 1, limit: 25, hasNext: false, hasPrev: false }
      },
      createUserResponse()
    ];
    getUsersMock.mockImplementation(() => Promise.resolve(responses.shift()));

    const { result } = renderHook(() => useAdminDataController({
      activeTab: 'users',
      isAdmin: true
    }));

    await waitFor(() => {
      expect(getUsersMock).toHaveBeenCalledTimes(1);
    });

    act(() => {
      result.current.updateUserDraftFilter('search', 'alpha');
    });
    act(() => {
      result.current.updateUserDraftFilter('role', 'admin');
    });
    act(() => {
      result.current.applyUserFilters();
    });

    await waitFor(() => {
      expect(getUsersMock).toHaveBeenCalledTimes(2);
    });
    expect(getUsersMock.mock.calls[1][0]).toMatchObject({
      page: 1,
      filters: {
        search: 'alpha',
        role: 'admin',
        bannedState: 'all',
        activityWindow: 'all',
        sortBy: 'createdAt_desc'
      }
    });
    expect(result.current.userFilters.active.search).toBe('alpha');

    act(() => {
      result.current.resetUserFilters();
    });

    await waitFor(() => {
      expect(getUsersMock).toHaveBeenCalledTimes(3);
    });
    expect(getUsersMock.mock.calls[2][0]).toMatchObject({
      page: 1,
      filters: {
        search: '',
        role: 'all',
        bannedState: 'all',
        activityWindow: 'all',
        sortBy: 'createdAt_desc'
      }
    });
    expect(result.current.userFilters.active.search).toBe('');
  });

  it('optimistically bans a user, updates aggregate stats, and keeps the change on success', async () => {
    setUserBanStateMock.mockResolvedValue({
      id: 'user-1',
      banned: true,
      banReason: 'Administrative action'
    });

    const { result } = renderHook(() => useAdminDataController({
      activeTab: 'users',
      isAdmin: true
    }));

    await waitFor(() => {
      expect(result.current.usersLoading).toBe(false);
    });

    await act(async () => {
      await result.current.handleUserBan('user-1', false);
    });

    expect(setUserBanStateMock).toHaveBeenCalledWith(
      'user-1',
      true,
      'Administrative action'
    );
    expect(playClickMock).toHaveBeenCalledTimes(1);
    expect(result.current.users[0]).toEqual(expect.objectContaining({
      id: 'user-1',
      banned: true,
      banReason: 'Administrative action'
    }));
    expect(result.current.stats).toMatchObject({
      bannedUsers: 2,
      activeUsers: 9,
      weeklyActiveUsers: 11
    });
    expect(result.current.moderatingUserId).toBeNull();
  });

  it('rolls back a failed ban update and reports an error', async () => {
    setUserBanStateMock.mockRejectedValue(new Error('permission denied'));

    const { result } = renderHook(() => useAdminDataController({
      activeTab: 'users',
      isAdmin: true
    }));

    await waitFor(() => {
      expect(result.current.usersLoading).toBe(false);
    });

    await act(async () => {
      await result.current.handleUserBan('user-1', false);
    });

    await waitFor(() => {
      expect(getOverviewMock).toHaveBeenCalledTimes(2);
    });

    expect(result.current.users[0]).toEqual(expect.objectContaining({
      id: 'user-1',
      banned: false,
      banReason: null
    }));
    expect(result.current.error).toBe('Failed to update user status');
    expect(result.current.moderatingUserId).toBeNull();
  });

  it('loads tickets for the tickets tab and refreshes them after a successful ticket update', async () => {
    getSupportTicketsMock
      .mockResolvedValueOnce({
        tickets: [
          {
            id: 'ticket-1',
            status: 'open',
            priority: 'normal',
            customerUnreadUpdate: true,
            createdAt: nowMs - 1000,
            updatedAt: nowMs - 1000
          }
        ],
        pagination: { page: 1, limit: 10, hasNext: false, hasPrev: false },
        summary: { open: 3, needsReply: 1, resolved: 0 }
      })
      .mockResolvedValueOnce({
        tickets: [
          {
            id: 'ticket-1',
            status: 'resolved',
            priority: 'high',
            customerUnreadUpdate: false,
            createdAt: nowMs - 1000,
            updatedAt: nowMs
          }
        ],
        pagination: { page: 1, limit: 10, hasNext: false, hasPrev: false },
        summary: { open: 2, needsReply: 0, resolved: 1 }
      });

    const { result } = renderHook(() => useAdminDataController({
      activeTab: 'tickets',
      isAdmin: true
    }));

    await waitFor(() => {
      expect(result.current.ticketsLoading).toBe(false);
    });

    expect(result.current.supportInboxBadge).toBe(3);
    expect(result.current.supportTickets).toHaveLength(1);

    await act(async () => {
      await result.current.handleTicketUpdate('ticket-1', {
        status: 'resolved',
        priority: 'high'
      });
    });

    await waitFor(() => {
      expect(getSupportTicketsMock).toHaveBeenCalledTimes(2);
    });

    expect(updateTicketMock).toHaveBeenCalledWith('ticket-1', {
      status: 'resolved',
      priority: 'high'
    });
    expect(result.current.supportTicketSummary).toEqual({
      open: 2,
      needsReply: 0,
      resolved: 1
    });
  });
});
