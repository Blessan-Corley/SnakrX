import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useLeaderboard } from './useLeaderboard.js';

const mockGetLeaderboard = vi.fn();
const mockGetTopPlayersOverall = vi.fn();
const mockGetUserRank = vi.fn();

let mockUser = null;

vi.mock('../services/firebase/index.js', () => ({
  leaderboardOperations: {
    getLeaderboard: (...args) => mockGetLeaderboard(...args),
    getTopPlayersOverall: (...args) => mockGetTopPlayersOverall(...args),
    getUserRank: (...args) => mockGetUserRank(...args)
  }
}));

vi.mock('./useAuth.js', () => ({
  useAuth: () => ({
    user: mockUser
  })
}));

const createDeferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((nextResolve, nextReject) => {
    resolve = nextResolve;
    reject = nextReject;
  });
  return { promise, resolve, reject };
};

describe('useLeaderboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUser = null;
  });

  it('deduplicates concurrent leaderboard requests for the same cache key', async () => {
    const deferred = createDeferred();
    const leaderboardResponse = {
      entries: [{ userId: 'u1', score: 100, rank: 1 }],
      stats: { highestScore: 100 },
      lastUpdated: 123,
      totalEntries: 1
    };

    mockGetTopPlayersOverall.mockResolvedValue([]);
    mockGetLeaderboard.mockReturnValueOnce(deferred.promise);

    const { result } = renderHook(() => useLeaderboard());

    let firstPromise;
    let secondPromise;
    await act(async () => {
      firstPromise = result.current.getLeaderboard('classic', null, 10, false);
      secondPromise = result.current.getLeaderboard('classic', null, 10, false);
    });

    await waitFor(() => expect(result.current.loading).toBe(true));
    expect(mockGetLeaderboard).toHaveBeenCalledTimes(1);

    await act(async () => {
      deferred.resolve(leaderboardResponse);
      await Promise.all([firstPromise, secondPromise]);
    });

    expect(await firstPromise).toEqual(leaderboardResponse);
    expect(await secondPromise).toEqual(leaderboardResponse);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.leaderboardData.classic_default_10).toEqual(leaderboardResponse);
  });

  it('returns cached top players when a forced refresh fails', async () => {
    const cachedPlayers = [
      { userId: 'u1', score: 300, rank: 1 },
      { userId: 'u2', score: 200, rank: 2 }
    ];

    mockGetTopPlayersOverall.mockResolvedValue([]);

    const { result } = renderHook(() => useLeaderboard());

    await waitFor(() => expect(mockGetTopPlayersOverall).toHaveBeenCalledTimes(1));
    mockGetTopPlayersOverall.mockReset();
    mockGetTopPlayersOverall
      .mockResolvedValueOnce(cachedPlayers)
      .mockRejectedValueOnce(new Error('service unavailable'));

    let firstResult;
    await act(async () => {
      firstResult = await result.current.getTopPlayersOverall(5, false);
    });

    expect(firstResult).toEqual(cachedPlayers);

    let secondResult;
    await act(async () => {
      secondResult = await result.current.getTopPlayersOverall(5, false);
    });

    expect(secondResult).toEqual(cachedPlayers);
    expect(result.current.topPlayers).toEqual(cachedPlayers);
    expect(result.current.error).toBe('service unavailable');
  });

  it('builds leaderboard summary using the user best rank across all modes', async () => {
    mockUser = { uid: 'player-1' };
    const topThree = [
      { userId: 'u1', score: 500, rank: 1 },
      { userId: 'u2', score: 450, rank: 2 },
      { userId: 'u3', score: 400, rank: 3 }
    ];

    mockGetTopPlayersOverall.mockResolvedValue(topThree);
    mockGetUserRank.mockImplementation(async (_userId, mode, difficulty) => {
      if (mode === 'vsai' && difficulty === 'medium') {
        return { rank: 2, score: 380, totalPlayers: 200 };
      }
      if (mode === 'classic') {
        return { rank: 5, score: 210, totalPlayers: 300 };
      }
      return null;
    });

    const { result } = renderHook(() => useLeaderboard());

    await waitFor(() => expect(mockGetUserRank).toHaveBeenCalled());

    let summary;
    await act(async () => {
      summary = await result.current.getLeaderboardSummary();
    });

    expect(summary).toEqual({
      topThree,
      userBestRank: { rank: 2, score: 380, totalPlayers: 200 },
      hasData: true
    });
  });
});
