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

vi.mock('@/services/firebase', () => ({
  adminOperations: {
    getUsers: vi.fn().mockResolvedValue([]),
    getRecentGames: vi.fn().mockResolvedValue([]),
    setUserBanState: vi.fn().mockResolvedValue({ id: 'admin-1', banned: true })
  },
}));

vi.mock('@/services/firebase/support.js', () => ({
  supportOperations: {
    getRecentTickets: vi.fn(),
    updateTicketStatus: vi.fn(),
    updateTicket: vi.fn(),
    subscribeToRecentTickets: vi.fn(() => vi.fn())
  }
}));

vi.mock('@/utils/sound', () => ({
  playClick: vi.fn()
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
