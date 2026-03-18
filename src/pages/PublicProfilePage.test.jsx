import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PublicProfilePage from './PublicProfilePage.jsx';

const getDocumentMock = vi.fn();
const getUserGamesMock = vi.fn();
const getPublicRecentGamesMock = vi.fn();
const friendState = {
  acceptRequest: vi.fn(),
  activeTargetId: null,
  getRelationshipStatus: vi.fn(() => 'none'),
  sendRequest: vi.fn()
};

vi.mock('@/services/firebase/config.js', () => ({
  db: {},
  doc: vi.fn(() => ({ path: 'publicProfiles/u2' })),
  COLLECTIONS: {
    PUBLIC_PROFILES: 'publicProfiles'
  }
}));

vi.mock('@/services/firebase/firestore.js', () => ({
  firestoreOperations: {
    getDocument: (...args) => getDocumentMock(...args)
  }
}));

vi.mock('@/services/firebase', () => ({
  gameOperations: {
    getUserGames: (...args) => getUserGamesMock(...args),
    getPublicRecentGames: (...args) => getPublicRecentGamesMock(...args)
  }
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null
  })
}));

vi.mock('@/hooks/useFriends', () => ({
  useFriends: () => friendState
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

describe('PublicProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    friendState.activeTargetId = null;
    friendState.getRelationshipStatus.mockReturnValue('none');
  });

  it('keeps the profile visible when match history fails to load', async () => {
    getDocumentMock.mockResolvedValue({
      exists: () => true,
      data: () => ({
        displayName: 'Hidden Player',
        username: 'hidden-player',
        stats: {
          totalGames: 12,
          bestScore: 450,
          xp: 100
        },
        createdAt: Date.now(),
        lastActiveAt: Date.now()
      })
    });
    getPublicRecentGamesMock.mockRejectedValue(new Error('games unavailable'));

    render(
      <MemoryRouter
        initialEntries={['/player/u2']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <Routes>
          <Route path="/player/:userId" element={<PublicProfilePage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Hidden Player')).toBeInTheDocument();
    });
    expect(screen.getByText('@hidden-player')).toBeInTheDocument();
    expect(screen.getByText('No recent games yet.')).toBeInTheDocument();
    expect(screen.queryByText('Profile not found')).not.toBeInTheDocument();
  });

  it('renders relationship-aware invite states on public profiles', async () => {
    getDocumentMock.mockResolvedValue({
      exists: () => true,
      data: () => ({
        displayName: 'Teammate',
        username: 'teammate',
        stats: {
          totalGames: 12,
          bestScore: 450,
          xp: 100
        },
        createdAt: Date.now(),
        lastActiveAt: Date.now()
      })
    });
    getPublicRecentGamesMock.mockResolvedValue([]);
    friendState.getRelationshipStatus.mockReturnValue('pending_sent');

    render(
      <MemoryRouter
        initialEntries={['/player/u2']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <Routes>
          <Route path="/player/:userId" element={<PublicProfilePage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /request sent/i })).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /request sent/i })).toBeDisabled();
  });

  it('shows per-match xp in recent public match history', async () => {
    getDocumentMock.mockResolvedValue({
      exists: () => true,
      data: () => ({
        displayName: 'Teammate',
        username: 'teammate',
        stats: {
          totalGames: 12,
          bestScore: 450,
          xp: 100
        },
        createdAt: Date.now(),
        lastActiveAt: Date.now()
      })
    });
    getPublicRecentGamesMock.mockResolvedValue([
      {
        id: 'game-1',
        mode: 'vsai',
        difficulty: 'medium',
        score: 900,
        duration: 45,
        result: 'won',
        xpGained: 63,
        endedAt: Date.now()
      }
    ]);

    render(
      <MemoryRouter
        initialEntries={['/player/u2']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <Routes>
          <Route path="/player/:userId" element={<PublicProfilePage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('+63 XP')).toBeInTheDocument();
    });
  });
});
