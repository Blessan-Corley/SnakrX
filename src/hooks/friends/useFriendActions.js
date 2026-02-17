import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { friendOperations } from '@/services/firebase/friends.js';
import {
  FRIENDSHIP_STATUSES,
  upsertRelationshipProfile
} from './relationshipState.js';

const useFriendActions = ({
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
}) => {
  const searchUsers = useCallback(async (term) => {
    if (!term || term.length < 3) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const results = await friendOperations.searchUsers(term);
      setSearchResults(results.filter((candidate) => candidate.id !== user?.uid));
    } catch {
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  }, [setSearchResults, setSearching, user?.uid]);

  const sendRequest = useCallback(async (targetId) => {
    if (!user?.uid || !targetId || targetId === user.uid) return;

    setLoading(true);
    setActiveTargetId(targetId);
    try {
      await friendOperations.sendFriendRequest(user.uid, targetId);

      const targetProfile =
        searchResults.find((candidate) => candidate.id === targetId) ||
        getRelationship(targetId).profile ||
        { id: targetId };

      setOutgoingRequests((previous) => (
        upsertRelationshipProfile(previous, targetProfile, FRIENDSHIP_STATUSES.PENDING_SENT)
      ));
      setPendingRequests((previous) => previous.filter((candidate) => candidate.id !== targetId));
      setFriends((previous) => previous.filter((candidate) => candidate.id !== targetId));
      toast.success('Friend request sent!');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
      setActiveTargetId(null);
    }
  }, [
    getRelationship,
    searchResults,
    setActiveTargetId,
    setFriends,
    setLoading,
    setOutgoingRequests,
    setPendingRequests,
    user
  ]);

  const acceptRequest = useCallback(async (requesterId) => {
    if (!user?.uid || !requesterId) return;

    setLoading(true);
    setActiveTargetId(requesterId);
    try {
      await friendOperations.acceptFriendRequest(user.uid, requesterId);

      const requesterProfile =
        getRelationship(requesterId).profile ||
        searchResults.find((candidate) => candidate.id === requesterId) ||
        { id: requesterId };

      setPendingRequests((previous) => previous.filter((request) => request.id !== requesterId));
      setOutgoingRequests((previous) => previous.filter((request) => request.id !== requesterId));
      setFriends((previous) => (
        upsertRelationshipProfile(previous, requesterProfile, FRIENDSHIP_STATUSES.ACCEPTED)
      ));
      toast.success('Friend request accepted!');
      await fetchData();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
      setActiveTargetId(null);
    }
  }, [
    fetchData,
    getRelationship,
    searchResults,
    setActiveTargetId,
    setFriends,
    setLoading,
    setOutgoingRequests,
    setPendingRequests,
    user
  ]);

  const rejectRequest = useCallback(async (targetId) => {
    if (!user?.uid || !targetId) return;

    setLoading(true);
    setActiveTargetId(targetId);
    try {
      await friendOperations.removeFriend(user.uid, targetId);
      setPendingRequests((previous) => previous.filter((request) => request.id !== targetId));
      setOutgoingRequests((previous) => previous.filter((request) => request.id !== targetId));
      setFriends((previous) => previous.filter((friend) => friend.id !== targetId));
      toast.success('Friend request rejected');
      await fetchData();
    } catch {
      toast.error('Failed to reject request');
    } finally {
      setLoading(false);
      setActiveTargetId(null);
    }
  }, [fetchData, setActiveTargetId, setFriends, setLoading, setOutgoingRequests, setPendingRequests, user]);

  const removeFriend = useCallback(async (targetId) => {
    if (!user?.uid || !targetId) return;

    setLoading(true);
    setActiveTargetId(targetId);
    try {
      await friendOperations.removeFriend(user.uid, targetId);
      setPendingRequests((previous) => previous.filter((request) => request.id !== targetId));
      setOutgoingRequests((previous) => previous.filter((request) => request.id !== targetId));
      setFriends((previous) => previous.filter((friend) => friend.id !== targetId));
      toast.success('Friend removed');
      await fetchData();
    } catch {
      toast.error('Failed to remove friend');
    } finally {
      setLoading(false);
      setActiveTargetId(null);
    }
  }, [fetchData, setActiveTargetId, setFriends, setLoading, setOutgoingRequests, setPendingRequests, user]);

  const cancelRequest = useCallback(async (targetId) => {
    if (!user?.uid || !targetId) return;

    setLoading(true);
    setActiveTargetId(targetId);
    try {
      await friendOperations.removeFriend(user.uid, targetId);
      setOutgoingRequests((previous) => previous.filter((request) => request.id !== targetId));
      toast.success('Friend request cancelled');
      await fetchData();
    } catch {
      toast.error('Failed to cancel request');
    } finally {
      setLoading(false);
      setActiveTargetId(null);
    }
  }, [fetchData, setActiveTargetId, setLoading, setOutgoingRequests, user]);

  return {
    acceptRequest,
    cancelRequest,
    rejectRequest,
    removeFriend,
    searchUsers,
    sendRequest
  };
};

export default useFriendActions;
