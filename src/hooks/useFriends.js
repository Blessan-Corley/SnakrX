import { createElement, useCallback, useMemo } from 'react';
import { useAuth } from './useAuth';
import { FriendsContext, useFriends } from './friends/context.js';
import {
  buildFriendRelationshipMap,
  getRelationshipState
} from './friends/relationshipState.js';
import useFriendActions from './friends/useFriendActions.js';
import useFriendsData from './friends/useFriendsData.js';

export const FriendsProvider = ({ children }) => {
  const { user } = useAuth();
  const {
    activeTargetId,
    error,
    fetchData,
    friends,
    loading,
    outgoingRequests,
    pendingRequests,
    searchResults,
    searching,
    setActiveTargetId,
    setFriends,
    setLoading,
    setOutgoingRequests,
    setPendingRequests,
    setSearchResults,
    setSearching
  } = useFriendsData({ userId: user?.uid });

  const relationshipMap = useMemo(() => buildFriendRelationshipMap({
    currentUserId: user?.uid || null,
    friends,
    pendingRequests,
    outgoingRequests
  }), [friends, outgoingRequests, pendingRequests, user?.uid]);

  const getRelationship = useCallback((targetId) => (
    getRelationshipState(relationshipMap, targetId, user?.uid || null)
  ), [relationshipMap, user?.uid]);

  const getRelationshipStatus = useCallback((targetId) => (
    getRelationship(targetId).status
  ), [getRelationship]);

  const {
    acceptRequest,
    cancelRequest,
    rejectRequest,
    removeFriend,
    searchUsers,
    sendRequest
  } = useFriendActions({
    fetchData,
    getRelationship,
    searchResults,
    setActiveTargetId,
    setFriends,
    setLoading,
    setOutgoingRequests,
    setPendingRequests,
    setSearchResults,
    setSearching,
    user
  });

  const value = {
    friends,
    pendingRequests,
    outgoingRequests,
    searchResults,
    loading,
    error,
    searching,
    activeTargetId,
    relationshipMap,
    searchUsers,
    sendRequest,
    acceptRequest,
    removeFriend,
    cancelRequest,
    rejectRequest,
    refreshFriends: fetchData,
    getRelationship,
    getRelationshipStatus
  };

  return createElement(FriendsContext.Provider, { value }, children);
};

export { useFriends };
