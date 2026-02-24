import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockSyncCallable = vi.fn();

vi.mock('./config.js', () => ({
  functions: {},
  httpsCallable: vi.fn((_, name) => {
    if (name === 'syncFriendStats') return mockSyncCallable;
    return vi.fn();
  })
}));

describe('syncFriendStats service', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { __private__ } = await import('./friendStats.js');
    __private__.resetCallables();
  });

  it('returns synced friend counts from the backend callable', async () => {
    mockSyncCallable.mockResolvedValueOnce({
      data: {
        synced: [{ userId: 'u1', friendsCount: 4 }]
      }
    });

    const { syncFriendStats } = await import('./friendStats.js');
    const result = await syncFriendStats(['u1']);

    expect(mockSyncCallable).toHaveBeenCalledWith({ userIds: ['u1'] });
    expect(result).toEqual([{ userId: 'u1', friendsCount: 4 }]);
  });

  it('falls back to an empty list when the callable returns no synced payload', async () => {
    mockSyncCallable.mockResolvedValueOnce({ data: {} });

    const { syncFriendStats } = await import('./friendStats.js');
    const result = await syncFriendStats(['u1']);

    expect(result).toEqual([]);
  });
});
