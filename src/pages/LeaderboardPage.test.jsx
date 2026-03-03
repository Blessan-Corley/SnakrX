import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import LeaderboardPage from './LeaderboardPage.jsx';

const navigateMock = vi.fn();
const getLeaderboardMock = vi.fn();
const getAchievementLeaderboardMock = vi.fn();
const getOverallScoreLeaderboardMock = vi.fn();
const getWeeklyLeaderboardMock = vi.fn();
const sendRequestMock = vi.fn();
const acceptRequestMock = vi.fn();
const getRelationshipStatusMock = vi.fn(() => 'none');

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock
  };
});

vi.mock('../hooks/useAuth.js', () => ({
  useAuth: () => ({
    user: { uid: 'u1' },
    userProfile: { userId: 'u1', uid: 'u1' }
  })
}));

vi.mock('../hooks/useFriends.js', () => ({
  useFriends: () => ({
    acceptRequest: (...args) => acceptRequestMock(...args),
    activeTargetId: null,
    getRelationshipStatus: (...args) => getRelationshipStatusMock(...args),
    sendRequest: (...args) => sendRequestMock(...args)
  })
}));

vi.mock('../services/firebase/leaderboard.js', () => ({
  leaderboardOperations: {
    getLeaderboard: (...args) => getLeaderboardMock(...args),
    getAchievementLeaderboard: (...args) => getAchievementLeaderboardMock(...args),
    getOverallScoreLeaderboard: (...args) => getOverallScoreLeaderboardMock(...args),
    getWeeklyLeaderboard: (...args) => getWeeklyLeaderboardMock(...args)
  }
}));

vi.mock('../utils/sound.js', () => ({
  playClick: vi.fn(),
  playHover: vi.fn()
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

const baseLeaderboardResult = {
  entries: [
    {
      userId: 'u2',
      displayName: 'HiddenName',
      username: 'hiddenname',
      score: 320,
      rank: 1,
      timestamp: Date.now(),
      isPrivateLeaderboard: true
    },
    {
      userId: 'u1',
      displayName: 'CurrentUser',
      username: 'currentuser',
      score: 200,
      rank: 2,
      timestamp: Date.now(),
      isPrivateLeaderboard: false
    }
  ]
};

describe('LeaderboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getLeaderboardMock.mockResolvedValue(baseLeaderboardResult);
    getAchievementLeaderboardMock.mockResolvedValue({ entries: [] });
    getOverallScoreLeaderboardMock.mockResolvedValue({ entries: [] });
    getWeeklyLeaderboardMock.mockResolvedValue({ entries: [], weekKey: '2026-W08' });
    sendRequestMock.mockResolvedValue(true);
    acceptRequestMock.mockResolvedValue(true);
    getRelationshipStatusMock.mockReturnValue('none');
  });

  it('masks private leaderboard names and does not expose private profiles as clickable targets', async () => {
    render(<LeaderboardPage />);

    await screen.findByText('Private Player');
    expect(screen.queryByText('HiddenName')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Private Player'));
    expect(navigateMock).not.toHaveBeenCalledWith('/player/u2');
  });

  it('does not show friend invite actions for private leaderboard rows', async () => {
    render(<LeaderboardPage />);

    await screen.findByText('Private Player');
    expect(screen.queryByRole('button', { name: /invite/i })).not.toBeInTheDocument();
    expect(sendRequestMock).not.toHaveBeenCalled();
  });

  it('loads overall leaderboard source when overall filter is selected', async () => {
    getOverallScoreLeaderboardMock.mockResolvedValue({
      entries: [
        {
          userId: 'u9',
          displayName: 'OverallTop',
          username: 'overalltop',
          score: 5000,
          rank: 1,
          timestamp: Date.now(),
          isPrivateLeaderboard: false
        }
      ]
    });

    render(<LeaderboardPage />);

    await screen.findByText('Private Player');
    fireEvent.click(screen.getByRole('button', { name: /^overall$/i }));

    await waitFor(() => {
      expect(getOverallScoreLeaderboardMock).toHaveBeenCalled();
    });
    expect(screen.getByText('OverallTop')).toBeInTheDocument();
  });

  it('loads weekly leaderboard source when weekly filter is selected', async () => {
    getWeeklyLeaderboardMock.mockResolvedValue({
      entries: [
        {
          userId: 'u8',
          displayName: 'WeeklyTop',
          username: 'weeklytop',
          score: 860,
          rank: 1,
          timestamp: Date.now(),
          isPrivateLeaderboard: false
        }
      ],
      weekKey: '2026-W08'
    });

    render(<LeaderboardPage />);
    await screen.findByText('Private Player');

    fireEvent.click(screen.getByRole('button', { name: /^weekly$/i }));

    await waitFor(() => {
      expect(getWeeklyLeaderboardMock).toHaveBeenCalled();
    }, { timeout: 10000 });
    expect(await screen.findByText('WeeklyTop', {}, { timeout: 10000 })).toBeInTheDocument();
    expect(await screen.findByText(/weekly snapshot: 2026-w08/i, {}, { timeout: 10000 })).toBeInTheDocument();
  }, 15000);

  it('renders relationship-aware actions for leaderboard entries', async () => {
    getLeaderboardMock.mockResolvedValue({
      entries: [
        {
          userId: 'u2',
          displayName: 'FriendPlayer',
          username: 'friendplayer',
          score: 320,
          rank: 1,
          timestamp: Date.now(),
          isPrivateLeaderboard: false
        }
      ]
    });
    getRelationshipStatusMock.mockImplementation((targetId) => (
      targetId === 'u2' ? 'accepted' : 'none'
    ));

    render(<LeaderboardPage />);

    await screen.findByText('FriendPlayer');
    expect(screen.getByRole('button', { name: /friends/i })).toBeDisabled();
    expect(sendRequestMock).not.toHaveBeenCalled();
  });
});
