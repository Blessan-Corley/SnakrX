import { createElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';

const authState = {
  user: { uid: 'u1' }
};

const mockGetFriends = vi.fn();
const mockGetFriendRequests = vi.fn();
const mockGetOutgoingRequests = vi.fn();
const mockSearchUsers = vi.fn();
const mockSendFriendRequest = vi.fn();
const mockAcceptFriendRequest = vi.fn();
const mockRemoveFriend = vi.fn();
const mockSubscribeToFriendChanges = vi.fn();

vi.mock('./useAuth', () => ({
  useAuth: () => authState
}));

vi.mock('../services/firebase/friends.js', () => ({
  friendOperations: {
    getFriends: (...args) => mockGetFriends(...args),
    getFriendRequests: (...args) => mockGetFriendRequests(...args),
    getOutgoingRequests: (...args) => mockGetOutgoingRequests(...args),
    searchUsers: (...args) => mockSearchUsers(...args),
    sendFriendRequest: (...args) => mockSendFriendRequest(...args),
    acceptFriendRequest: (...args) => mockAcceptFriendRequest(...args),
    removeFriend: (...args) => mockRemoveFriend(...args),
    subscribeToFriendChanges: (...args) => mockSubscribeToFriendChanges(...args)
  }
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

describe('useFriends provider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.user = { uid: 'u1' };
    mockGetFriends.mockResolvedValue([{ id: 'u2', displayName: 'Friend' }]);
    mockGetFriendRequests.mockResolvedValue([{ id: 'u3', displayName: 'Incoming' }]);
    mockGetOutgoingRequests.mockResolvedValue([{ id: 'u4', displayName: 'Outgoing' }]);
    mockSearchUsers.mockResolvedValue([
      { id: 'u2', displayName: 'Friend', username: 'friend' },
      { id: 'u5', displayName: 'New Person', username: 'newperson' }
    ]);
    mockSendFriendRequest.mockResolvedValue(true);
    mockAcceptFriendRequest.mockResolvedValue(true);
    mockRemoveFriend.mockResolvedValue(true);
    mockSubscribeToFriendChanges.mockImplementation((_userId, onChange) => {
      if (typeof onChange === 'function') {
        onChange();
      }
      return vi.fn();
    });
  });

  it('hydrates accepted, incoming, and outgoing relationships', async () => {
    const { FriendsProvider, useFriends } = await import('./useFriends.js');
    const wrapper = ({ children }) => createElement(FriendsProvider, null, children);

    const { result } = renderHook(() => useFriends(), { wrapper });

    await waitFor(() => {
      expect(result.current.friends).toHaveLength(1);
    });

    expect(result.current.pendingRequests).toHaveLength(1);
    expect(result.current.outgoingRequests).toHaveLength(1);
    expect(result.current.getRelationshipStatus('u2')).toBe('accepted');
    expect(result.current.getRelationshipStatus('u3')).toBe('pending_received');
    expect(result.current.getRelationshipStatus('u4')).toBe('pending_sent');
    expect(result.current.getRelationshipStatus('u1')).toBe('self');
  });

  it('keeps searched users visible and updates them to request sent after sendRequest', async () => {
    const { FriendsProvider, useFriends } = await import('./useFriends.js');
    const wrapper = ({ children }) => createElement(FriendsProvider, null, children);
    const { result } = renderHook(() => useFriends(), { wrapper });

    await waitFor(() => {
      expect(result.current.friends).toHaveLength(1);
    });

    await act(async () => {
      await result.current.searchUsers('new');
    });

    expect(result.current.searchResults.map((item) => item.id)).toContain('u5');

    await act(async () => {
      await result.current.sendRequest('u5');
    });

    expect(result.current.getRelationshipStatus('u5')).toBe('pending_sent');
    expect(result.current.searchResults.map((item) => item.id)).toContain('u5');
  });

  it('moves an incoming request into friends when accepted', async () => {
    mockGetFriends
      .mockResolvedValueOnce([{ id: 'u2', displayName: 'Friend' }])
      .mockResolvedValueOnce([{ id: 'u2', displayName: 'Friend' }])
      .mockResolvedValueOnce([
        { id: 'u2', displayName: 'Friend' },
        { id: 'u3', displayName: 'Incoming' }
      ]);
    mockGetFriendRequests
      .mockResolvedValueOnce([{ id: 'u3', displayName: 'Incoming' }])
      .mockResolvedValueOnce([{ id: 'u3', displayName: 'Incoming' }])
      .mockResolvedValueOnce([]);
    mockGetOutgoingRequests
      .mockResolvedValueOnce([{ id: 'u4', displayName: 'Outgoing' }])
      .mockResolvedValueOnce([{ id: 'u4', displayName: 'Outgoing' }])
      .mockResolvedValueOnce([{ id: 'u4', displayName: 'Outgoing' }]);

    const { FriendsProvider, useFriends } = await import('./useFriends.js');
    const wrapper = ({ children }) => createElement(FriendsProvider, null, children);
    const { result } = renderHook(() => useFriends(), { wrapper });

    await waitFor(() => {
      expect(result.current.pendingRequests).toHaveLength(1);
    });

    await act(async () => {
      await result.current.acceptRequest('u3');
    });

    expect(result.current.getRelationshipStatus('u3')).toBe('accepted');
  });
});
