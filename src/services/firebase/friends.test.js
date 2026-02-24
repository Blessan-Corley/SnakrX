import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockDoc = vi.fn();
const mockCollection = vi.fn();
const mockQuery = vi.fn((...args) => ({ args }));
const mockWhere = vi.fn((...args) => ({ type: 'where', args }));
const mockOrderBy = vi.fn((...args) => ({ type: 'orderBy', args }));
const mockLimit = vi.fn((value) => ({ type: 'limit', value }));
const mockGetDocs = vi.fn();
const mockOnSnapshot = vi.fn();
const mockServerTimestamp = vi.fn(() => ({ __serverTimestamp: true }));

const mockDeleteDoc = vi.fn();
const mockGetDocument = vi.fn();
const mockSetDocument = vi.fn();
const mockUpdateDocument = vi.fn();
const mockSyncFriendStats = vi.fn();

vi.mock('./config.js', () => ({
  db: {},
  doc: (...args) => mockDoc(...args),
  collection: (...args) => mockCollection(...args),
  query: (...args) => mockQuery(...args),
  where: (...args) => mockWhere(...args),
  getDocs: (...args) => mockGetDocs(...args),
  orderBy: (...args) => mockOrderBy(...args),
  limit: (...args) => mockLimit(...args),
  onSnapshot: (...args) => mockOnSnapshot(...args),
  serverTimestamp: (...args) => mockServerTimestamp(...args),
  COLLECTIONS: {
    USERS: 'users',
    PUBLIC_PROFILES: 'publicProfiles'
  }
}));

vi.mock('firebase/firestore', () => ({
  deleteDoc: (...args) => mockDeleteDoc(...args)
}));

vi.mock('./firestore.js', () => ({
  firestoreOperations: {
    getDocument: (...args) => mockGetDocument(...args),
    setDocument: (...args) => mockSetDocument(...args),
    updateDocument: (...args) => mockUpdateDocument(...args)
  }
}));

vi.mock('./friendStats.js', () => ({
  syncFriendStats: (...args) => mockSyncFriendStats(...args)
}));

vi.mock('../../utils/logger.js', () => ({
  default: {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}));

const createDocSnap = (id, data) => ({
  id,
  data: () => data
});

const createExistsDoc = (data) => ({
  exists: () => true,
  data: () => data
});

const createMissingDoc = () => ({
  exists: () => false,
  data: () => ({})
});

describe('friendOperations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDoc.mockImplementation((_, ...segments) => ({
      id: segments[segments.length - 1],
      path: segments.join('/')
    }));
    mockCollection.mockImplementation((_, ...segments) => ({
      path: segments.join('/')
    }));
    mockSetDocument.mockResolvedValue(true);
    mockUpdateDocument.mockResolvedValue(true);
    mockDeleteDoc.mockResolvedValue(true);
    mockSyncFriendStats.mockResolvedValue([]);
    mockOnSnapshot.mockImplementation((_queryRef, onData) => {
      if (typeof onData === 'function') onData({ docs: [] });
      return vi.fn();
    });
  });

  it('sends a friend request by writing both edge documents', async () => {
    mockGetDocument.mockResolvedValueOnce(createMissingDoc());
    const { friendOperations } = await import('./friends.js');

    const ok = await friendOperations.sendFriendRequest('u1', 'u2');

    expect(ok).toBe(true);
    expect(mockSetDocument).toHaveBeenCalledTimes(2);
    expect(mockSetDocument).toHaveBeenCalledWith(
      expect.objectContaining({ path: 'users/u1/friends/u2' }),
      expect.objectContaining({ status: 'pending_sent' })
    );
    expect(mockSetDocument).toHaveBeenCalledWith(
      expect.objectContaining({ path: 'users/u2/friends/u1' }),
      expect.objectContaining({ status: 'pending_received' })
    );
  });

  it('rejects duplicate outgoing friend requests', async () => {
    mockGetDocument.mockResolvedValueOnce(createExistsDoc({ status: 'pending_sent' }));
    const { friendOperations } = await import('./friends.js');

    await expect(friendOperations.sendFriendRequest('u1', 'u2'))
      .rejects.toThrow(/already sent/i);

    expect(mockSetDocument).not.toHaveBeenCalled();
  });

  it('accepts a pending request and syncs friend counts for both users', async () => {
    mockGetDocument.mockResolvedValueOnce(createExistsDoc({ status: 'pending_received' }));
    mockSyncFriendStats
      .mockResolvedValueOnce([{ userId: 'u1', friendsCount: 2 }])
      .mockResolvedValueOnce([{ userId: 'u2', friendsCount: 3 }]);
    const { friendOperations } = await import('./friends.js');

    const ok = await friendOperations.acceptFriendRequest('u1', 'u2');

    expect(ok).toBe(true);
    expect(mockUpdateDocument).toHaveBeenCalledWith(
      expect.objectContaining({ path: 'users/u1/friends/u2' }),
      expect.objectContaining({ status: 'accepted' })
    );
    expect(mockUpdateDocument).toHaveBeenCalledWith(
      expect.objectContaining({ path: 'users/u2/friends/u1' }),
      expect.objectContaining({ status: 'accepted' })
    );
    expect(mockSyncFriendStats).toHaveBeenCalledWith(['u1']);
    expect(mockSyncFriendStats).toHaveBeenCalledWith(['u2']);
  });

  it('removes both friend edges and re-syncs counts', async () => {
    mockSyncFriendStats
      .mockResolvedValueOnce([{ userId: 'u1', friendsCount: 1 }])
      .mockResolvedValueOnce([{ userId: 'u2', friendsCount: 1 }]);
    const { friendOperations } = await import('./friends.js');

    const ok = await friendOperations.removeFriend('u1', 'u2');

    expect(ok).toBe(true);
    expect(mockDeleteDoc).toHaveBeenCalledWith(expect.objectContaining({ path: 'users/u1/friends/u2' }));
    expect(mockDeleteDoc).toHaveBeenCalledWith(expect.objectContaining({ path: 'users/u2/friends/u1' }));
    expect(mockSyncFriendStats).toHaveBeenCalledWith(['u1']);
    expect(mockSyncFriendStats).toHaveBeenCalledWith(['u2']);
  });

  it('builds friend list using accepted edges and public profile details', async () => {
    mockGetDocs.mockResolvedValueOnce({
      docs: [
        createDocSnap('f1', { status: 'accepted', timestamp: { seconds: 20 } }),
        createDocSnap('f2', { status: 'accepted', timestamp: { seconds: 10 } })
      ]
    });
    mockGetDocument
      .mockResolvedValueOnce(createExistsDoc({
        username: 'alpha',
        displayName: 'Alpha',
        avatar: 'alpha.png'
      }))
      .mockResolvedValueOnce(createMissingDoc());

    const { friendOperations } = await import('./friends.js');
    const friends = await friendOperations.getFriends('u1');

    expect(friends).toEqual([
      {
        id: 'f1',
        username: 'alpha',
        displayName: 'Alpha',
        avatar: 'alpha.png',
        status: 'accepted',
        timestamp: { seconds: 20 }
      }
    ]);
  });

  it('returns pending requests enriched with requester profile info', async () => {
    mockGetDocs.mockResolvedValueOnce({
      docs: [
        createDocSnap('r1', { timestamp: { seconds: 44 } })
      ]
    });
    mockGetDocument.mockResolvedValueOnce(createExistsDoc({
      username: 'requester',
      displayName: 'Requester',
      avatar: null
    }));
    const { friendOperations } = await import('./friends.js');

    const requests = await friendOperations.getFriendRequests('u1');

    expect(requests).toEqual([
      {
        id: 'r1',
        username: 'requester',
        displayName: 'Requester',
        avatar: null,
        timestamp: { seconds: 44 }
      }
    ]);
  });

  it('returns outgoing requests enriched with recipient profile info', async () => {
    mockGetDocs.mockResolvedValueOnce({
      docs: [
        createDocSnap('r2', { timestamp: { seconds: 55 } })
      ]
    });
    mockGetDocument.mockResolvedValueOnce(createExistsDoc({
      username: 'receiver',
      displayName: 'Receiver',
      avatar: 'receiver.png'
    }));
    const { friendOperations } = await import('./friends.js');

    const requests = await friendOperations.getOutgoingRequests('u1');

    expect(requests).toEqual([
      {
        id: 'r2',
        username: 'receiver',
        displayName: 'Receiver',
        avatar: 'receiver.png',
        timestamp: { seconds: 55 }
      }
    ]);
  });

  it('searches public profiles with normalized lowercase prefix query', async () => {
    mockGetDocs.mockResolvedValueOnce({
      docs: [
        createDocSnap('u3', { username: 'alice', displayName: 'Alice' })
      ]
    });
    const { friendOperations } = await import('./friends.js');

    const tooShort = await friendOperations.searchUsers('ab');
    expect(tooShort).toEqual([]);
    expect(mockGetDocs).toHaveBeenCalledTimes(0);

    const results = await friendOperations.searchUsers('  Ali ');
    expect(results).toEqual([{ id: 'u3', username: 'alice', displayName: 'Alice' }]);
    expect(mockWhere).toHaveBeenCalledWith('username', '>=', 'ali');
    expect(mockWhere).toHaveBeenCalledWith('username', '<=', 'ali\uf8ff');
  });

  it('subscribes to friend changes and forwards both updates and errors', async () => {
    const { friendOperations } = await import('./friends.js');
    const onChange = vi.fn();
    const onError = vi.fn();

    mockOnSnapshot.mockImplementationOnce((_queryRef, dataCb, errorCb) => {
      dataCb();
      errorCb(new Error('listener failed'));
      return vi.fn();
    });

    const unsubscribe = friendOperations.subscribeToFriendChanges('u1', onChange, onError);

    expect(typeof unsubscribe).toBe('function');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledTimes(1);
  });
});
