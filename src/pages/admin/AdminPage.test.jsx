import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AdminPage from './AdminPage.jsx';

const authState = {
  userProfile: { uid: 'admin-1', role: 'admin' }
};

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => authState
}));

vi.mock('@/utils/sound', () => ({
  playClick: vi.fn()
}));

vi.mock('./useAdminDataController.js', () => ({
  useAdminDataController: () => ({
    error: '',
    applyGameFilters: vi.fn(),
    applyTicketFilters: vi.fn(),
    applyUserFilters: vi.fn(),
    fetchSupportTickets: vi.fn(),
    gameFilters: { draft: {}, active: {} },
    handleTicketUpdate: vi.fn(),
    handleUserBan: vi.fn(),
    historyLoading: false,
    matchHistory: [],
    moderatingUserId: null,
    overviewLoading: false,
    previousGamesPage: vi.fn(),
    previousUsersPage: vi.fn(),
    refreshMatchHistory: vi.fn(),
    gamesPagination: { page: 1, limit: 20, hasNext: false, hasPrev: false },
    refreshUsers: vi.fn(),
    setError: vi.fn(),
    stats: {},
    supportInboxBadge: 0,
    supportTicketSummary: { open: 0, needsReply: 0, resolved: 0 },
    supportTickets: [],
    supportTicketsPagination: { page: 1, limit: 10, hasNext: false, hasPrev: false },
    ticketFilters: { draft: {}, active: {} },
    ticketsLoading: false,
    updateGameDraftFilter: vi.fn(),
    updateTicketDraftFilter: vi.fn(),
    updateUserDraftFilter: vi.fn(),
    users: [],
    userFilters: { draft: {}, active: {} },
    usersLoading: false,
    usersPagination: { page: 1, limit: 25, hasNext: false, hasPrev: false },
    nextGamesPage: vi.fn(),
    nextSupportTicketsPage: vi.fn(),
    nextUsersPage: vi.fn(),
    previousSupportTicketsPage: vi.fn(),
    resetGameFilters: vi.fn(),
    resetTicketFilters: vi.fn(),
    resetUserFilters: vi.fn()
  })
}));

vi.mock('@/components/admin', () => ({
  AdminStats: () => <div>Admin Stats</div>,
  AdminTabs: ({ activeTab, onTabChange }) => (
    <div>
      <div>Active Tab: {activeTab}</div>
      <button type="button" onClick={() => onTabChange('analytics')}>Analytics</button>
      <button type="button" onClick={() => onTabChange('users')}>Users</button>
    </div>
  ),
  UsersTab: () => <div>Users Tab</div>,
  MatchHistoryTab: () => <div>History Tab</div>,
  AnalyticsTab: () => <div>Analytics Tab</div>,
  SupportTicketsTab: () => <div>Tickets Tab</div>
}));

describe('AdminPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.userProfile = { uid: 'admin-1', role: 'admin' };
  });

  it('honors the tab query param for admin users', () => {
    render(
      <MemoryRouter
        initialEntries={['/admin?tab=analytics']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <Routes>
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Active Tab: analytics')).toBeInTheDocument();
    expect(screen.getByText('Analytics Tab')).toBeInTheDocument();
    expect(screen.queryByText('Users Tab')).not.toBeInTheDocument();
  });

  it('shows an access denied message for non-admin users', () => {
    authState.userProfile = { uid: 'user-1', role: 'player' };

    render(
      <MemoryRouter
        initialEntries={['/admin']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <Routes>
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Admin access required')).toBeInTheDocument();
  });
});
