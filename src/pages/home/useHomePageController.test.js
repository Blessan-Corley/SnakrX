import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import useHomePageController from './useHomePageController.js';

const navigateMock = vi.fn();
const playClickMock = vi.fn();
const getLeaderboardSummaryMock = vi.fn();
const searchUsersMock = vi.fn();
const acceptRequestMock = vi.fn();
const cancelRequestMock = vi.fn();
const rejectRequestMock = vi.fn();
const sendRequestMock = vi.fn();
const getRelationshipStatusMock = vi.fn();
const getLastPlayedModeMock = vi.fn();
const getGameRouteFromSelectionMock = vi.fn();
const loggerErrorMock = vi.fn();

let mobileState = false;
let authState;
let achievementState;
let friendsState;

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => authState
}));

vi.mock('@/hooks/useAchievements', () => ({
  useAchievementOperations: () => achievementState
}));

vi.mock('@/hooks/useFriends', () => ({
  useFriends: () => friendsState
}));

vi.mock('@/hooks/useLeaderboard', () => ({
  default: () => ({
    getLeaderboardSummary: getLeaderboardSummaryMock
  })
}));

vi.mock('@/utils/sound', () => ({
  playClick: (...args) => playClickMock(...args)
}));

vi.mock('@/utils/logger.js', () => ({
  default: {
    error: (...args) => loggerErrorMock(...args)
  }
}));

vi.mock('@/utils/gamePreferences', () => ({
  getGameRouteFromSelection: (...args) => getGameRouteFromSelectionMock(...args),
  getLastPlayedMode: (...args) => getLastPlayedModeMock(...args)
}));

vi.mock('@/utils/gameUtils', async () => {
  const actual = await vi.importActual('@/utils/gameUtils');
  return {
    ...actual,
    isMobile: () => mobileState
  };
});

describe('useHomePageController', () => {
  beforeEach(() => {
    mobileState = false;
    navigateMock.mockReset();
    playClickMock.mockReset();
    getLeaderboardSummaryMock.mockReset();
    searchUsersMock.mockReset();
    acceptRequestMock.mockReset();
    cancelRequestMock.mockReset();
    rejectRequestMock.mockReset();
    sendRequestMock.mockReset();
    getRelationshipStatusMock.mockReset();
    getLastPlayedModeMock.mockReset();
    getGameRouteFromSelectionMock.mockReset();
    loggerErrorMock.mockReset();

    authState = {
      userProfile: {
        uid: 'user-1',
        role: 'admin',
        username: 'alpha',
        displayName: 'Alpha',
        createdAt: new Date('2026-03-01T00:00:00.000Z'),
        stats: {
          totalGames: 8,
          totalScore: 1200,
          bestScore: 400,
          bestScoreMode: 'vsai',
          bestScoreAt: new Date('2026-03-20T10:30:00.000Z')
        }
      }
    };

    achievementState = {
      recentUnlocks: [{ id: 'achievement-1', title: 'Winner' }],
      getNextAchievements: vi.fn(() => [{ id: 'next-1', title: 'Next Up', progress: 50 }]),
      getAchievementStats: vi.fn(() => ({ unlocked: 4, total: 12 })),
      getTotalPointsEarned: vi.fn(() => 90)
    };

    friendsState = {
      pendingRequests: [{ id: 'pending-1' }],
      outgoingRequests: [{ id: 'outgoing-1' }],
      acceptRequest: acceptRequestMock,
      cancelRequest: cancelRequestMock,
      getRelationshipStatus: getRelationshipStatusMock,
      rejectRequest: rejectRequestMock,
      searchUsers: searchUsersMock,
      searchResults: [{ id: 'friend-1', username: 'beta' }],
      sendRequest: sendRequestMock,
      searching: false
    };

    getLastPlayedModeMock.mockReturnValue({
      mode: 'vsai',
      difficulty: 'hard',
      playerCount: 1,
      bonusFoodEnabled: true
    });
    getGameRouteFromSelectionMock.mockReturnValue('/game?mode=vsai&difficulty=hard');
  });

  it('loads leaderboard data, refreshes for returning players, and exposes derived state', async () => {
    getLeaderboardSummaryMock
      .mockResolvedValueOnce({
        hasData: true,
        topThree: [
          {
            userId: 'user-1',
            username: 'alpha',
            displayName: 'Alpha',
            score: 1234,
            mode: 'vsai',
            difficulty: 'hard',
            timestamp: Date.UTC(2026, 2, 20)
          }
        ],
        userBestRank: null
      })
      .mockResolvedValueOnce({
        hasData: true,
        topThree: [
          {
            userId: 'user-2',
            username: 'beta',
            displayName: 'Beta',
            score: 1500,
            mode: 'classic',
            timestamp: Date.UTC(2026, 2, 21)
          }
        ],
        userBestRank: {
          rank: 5,
          score: 980
        }
      });

    const { result } = renderHook(() => useHomePageController());

    await waitFor(() => {
      expect(getLeaderboardSummaryMock).toHaveBeenCalledTimes(2);
    });

    await waitFor(() => {
      expect(result.current.loadingLeaderboard).toBe(false);
    });

    expect(result.current.isAdmin).toBe(true);
    expect(result.current.userDisplayName).toBe('Alpha');
    expect(result.current.totalGames).toBe(8);
    expect(result.current.quickStats).toHaveLength(4);
    expect(result.current.lastPlayedSelection).toEqual({
      mode: 'vsai',
      difficulty: 'hard',
      playerCount: 1,
      bonusFoodEnabled: true
    });
    expect(result.current.recentLeaderboard).toEqual([
      expect.objectContaining({
        rank: 1,
        player: 'Beta',
        mode: 'Classic',
        highlighted: false
      }),
      expect.objectContaining({
        rank: 5,
        player: 'Alpha',
        mode: 'Your Best',
        highlighted: true
      })
    ]);
    expect(result.current.memberSinceLabel).toBe(new Date('2026-03-01T00:00:00.000Z').toLocaleDateString());
  });

  it('falls back when leaderboard loading fails and blocks multiplayer navigation on mobile', async () => {
    mobileState = true;
    authState.userProfile.stats.totalGames = 0;
    getLeaderboardSummaryMock.mockRejectedValue(new Error('service unavailable'));

    const { result } = renderHook(() => useHomePageController());

    await waitFor(() => {
      expect(result.current.loadingLeaderboard).toBe(false);
    });

    expect(getLeaderboardSummaryMock).toHaveBeenCalledTimes(1);
    expect(loggerErrorMock).toHaveBeenCalledWith(
      'Error loading leaderboard summary:',
      expect.any(Error)
    );
    expect(result.current.recentLeaderboard).toEqual([]);

    act(() => {
      result.current.handleGameMode('multiplayer');
    });

    expect(playClickMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('handles direct game navigation, last-played fallback, and friend search submission', async () => {
    getLeaderboardSummaryMock.mockResolvedValue({
      hasData: false,
      topThree: [],
      userBestRank: null
    });

    const { result } = renderHook(() => useHomePageController());

    await waitFor(() => {
      expect(result.current.loadingLeaderboard).toBe(false);
    });

    act(() => {
      result.current.handleGameMode('classic');
    });
    expect(navigateMock).toHaveBeenCalledWith('/game?mode=classic');

    act(() => {
      result.current.handleGameMode('vsai');
    });
    expect(navigateMock).toHaveBeenCalledWith('/game');

    getLastPlayedModeMock.mockReturnValueOnce(null);
    act(() => {
      result.current.handlePlayLastMode();
    });
    expect(navigateMock).toHaveBeenCalledWith('/game?mode=classic');

    const selection = {
      mode: 'multiplayer',
      difficulty: null,
      playerCount: 2,
      bonusFoodEnabled: false
    };
    getLastPlayedModeMock.mockReturnValueOnce(selection);
    act(() => {
      result.current.handlePlayLastMode();
    });
    expect(getGameRouteFromSelectionMock).toHaveBeenCalledWith(selection);
    expect(navigateMock).toHaveBeenCalledWith('/game?mode=vsai&difficulty=hard');

    await act(async () => {
      result.current.setFriendSearch('gamma');
    });
    await act(async () => {
      await result.current.handleFriendSearch({
        preventDefault: vi.fn()
      });
    });
    expect(searchUsersMock).toHaveBeenCalledWith('gamma');

    act(() => {
      result.current.handleOpenHelp();
      result.current.handleManageFriends();
      result.current.handleNavigate('/leaderboard');
      result.current.markTypingComplete();
    });

    expect(navigateMock).toHaveBeenCalledWith('/help');
    expect(navigateMock).toHaveBeenCalledWith('/friends');
    expect(navigateMock).toHaveBeenCalledWith('/leaderboard');
    expect(result.current.typingComplete).toBe(true);
  });
});
