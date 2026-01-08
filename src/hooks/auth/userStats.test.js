import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';

const mockUnlockAchievement = vi.fn();

vi.mock('../../services/firebase/index.js', () => ({
  auth: { currentUser: { uid: 'user-1' } }
}));

vi.mock('../../services/firebase/achievements.js', () => ({
  achievementOperations: {
    unlockAchievement: (...args) => mockUnlockAchievement(...args)
  }
}));

vi.mock('../../utils/logger.js', () => ({
  default: {
    warn: vi.fn(),
    error: vi.fn()
  }
}));

describe('useUserStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not allow direct client-side stat writes anymore', async () => {
    const { useUserStats } = await import('./userStats.js');
    const { result } = renderHook(() => useUserStats());

    const ok = await result.current.updateUserStats({
      totalGames: 1,
      bestScore: 120
    });

    expect(ok).toBe(false);
    expect(mockUnlockAchievement).not.toHaveBeenCalled();
  });

  it('returns false when the backend says no new achievement was unlocked', async () => {
    mockUnlockAchievement.mockResolvedValueOnce({ success: true, unlocked: false });
    const { useUserStats } = await import('./userStats.js');
    const { result } = renderHook(() => useUserStats());

    const ok = await result.current.unlockAchievement('first_game');

    expect(ok).toBe(false);
    expect(mockUnlockAchievement).toHaveBeenCalledWith('first_game');
  });

  it('returns true when the backend confirms a new achievement unlock', async () => {
    mockUnlockAchievement.mockResolvedValueOnce({ success: true, unlocked: true });
    const { useUserStats } = await import('./userStats.js');
    const { result } = renderHook(() => useUserStats());

    const ok = await result.current.unlockAchievement('first_game');

    expect(ok).toBe(true);
    expect(mockUnlockAchievement).toHaveBeenCalledWith('first_game');
  });
});
