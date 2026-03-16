import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAchievementCollectionOperations } from './useAchievementCollectionOperations.js';

const mockSyncCollectedAchievementsWithTransaction = vi.fn();
const mockGetAchievementById = vi.fn();
const toastSuccessMock = vi.fn();
const toastErrorMock = vi.fn();

vi.mock('@/services/firebase/index.js', () => ({
  auth: {
    currentUser: { uid: 'user-1' }
  }
}));

vi.mock('./syncCollectedAchievements.js', () => ({
  syncCollectedAchievementsWithTransaction: (...args) => mockSyncCollectedAchievementsWithTransaction(...args)
}));

vi.mock('@/data/achievements.js', () => ({
  getAchievementById: (...args) => mockGetAchievementById(...args)
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: (...args) => toastSuccessMock(...args),
    error: (...args) => toastErrorMock(...args)
  }
}));

vi.mock('@/utils/logger.js', () => ({
  default: {
    error: vi.fn(),
    log: vi.fn(),
    warn: vi.fn()
  }
}));

const createDeferred = () => {
  let resolve;
  const promise = new Promise((res) => {
    resolve = res;
  });
  return { promise, resolve };
};

const createProps = (overrides = {}) => ({
  refreshProfile: vi.fn().mockResolvedValue(undefined),
  setRecentUnlocks: vi.fn(),
  setUncollectedAchievements: vi.fn(),
  setUnlockedAchievements: vi.fn(),
  unlockedAchievements: [
    { id: 'first_game', collected: false, isPersisted: true }
  ],
  uncollectedAchievements: [
    { id: 'first_game', collected: false, isPersisted: true }
  ],
  ...overrides
});

describe('useAchievementCollectionOperations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAchievementById.mockReturnValue({ id: 'first_game', title: 'First Game' });
  });

  it('resolves single-collect before refreshProfile finishes', async () => {
    const deferred = createDeferred();
    const props = createProps({
      refreshProfile: vi.fn(() => deferred.promise)
    });
    mockSyncCollectedAchievementsWithTransaction.mockResolvedValue({
      success: true,
      updated: [{ id: 'first_game', collected: true, isPersisted: true }],
      collectedIds: ['first_game']
    });

    const { result } = renderHook(() => useAchievementCollectionOperations(props));

    let collectPromise;
    await act(async () => {
      collectPromise = result.current.collectAchievement('first_game');
      await Promise.resolve();
      await Promise.resolve();
    });

    await expect(Promise.race([
      collectPromise,
      Promise.resolve('__pending__')
    ])).resolves.toBe(true);
    expect(props.refreshProfile).toHaveBeenCalledOnce();
    expect(toastSuccessMock).toHaveBeenCalledWith('Collected: First Game');
  });

  it('resolves collect-all before refreshProfile finishes', async () => {
    const deferred = createDeferred();
    const props = createProps({
      refreshProfile: vi.fn(() => deferred.promise),
      unlockedAchievements: [
        { id: 'first_game', collected: false, isPersisted: true },
        { id: 'first_win', collected: false, isPersisted: true }
      ],
      uncollectedAchievements: [
        { id: 'first_game', collected: false, isPersisted: true },
        { id: 'first_win', collected: false, isPersisted: true }
      ]
    });
    mockSyncCollectedAchievementsWithTransaction.mockResolvedValue({
      success: true,
      updated: [
        { id: 'first_game', collected: true, isPersisted: true },
        { id: 'first_win', collected: true, isPersisted: true }
      ],
      collectedIds: ['first_game', 'first_win']
    });

    const { result } = renderHook(() => useAchievementCollectionOperations(props));

    let collectPromise;
    await act(async () => {
      collectPromise = result.current.collectAllAchievements();
      await Promise.resolve();
      await Promise.resolve();
    });

    await expect(Promise.race([
      collectPromise,
      Promise.resolve('__pending__')
    ])).resolves.toBe(true);
    expect(props.refreshProfile).toHaveBeenCalledOnce();
    expect(toastSuccessMock).toHaveBeenCalledWith('Collected 2 achievements');
  });
});
