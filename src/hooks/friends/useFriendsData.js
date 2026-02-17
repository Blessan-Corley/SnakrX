import { useCallback, useEffect, useState } from 'react';
import { friendOperations } from '@/services/firebase/friends.js';
import logger from '@/utils/logger.js';

const useFriendsData = ({ userId }) => {
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [activeTargetId, setActiveTargetId] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!userId) {
      setFriends([]);
      setPendingRequests([]);
      setOutgoingRequests([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [friendsList, requests, outgoing] = await Promise.all([
        friendOperations.getFriends(userId),
        friendOperations.getFriendRequests(userId),
        friendOperations.getOutgoingRequests(userId)
      ]);

      setFriends(friendsList);
      setPendingRequests(requests);
      setOutgoingRequests(outgoing);
    } catch (fetchError) {
      logger.error('Failed to fetch friends data:', fetchError);
      setError('Unable to load friends right now.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!userId) return undefined;

    const unsubscribe = friendOperations.subscribeToFriendChanges(
      userId,
      () => {
        void fetchData();
      },
      (subscriptionError) => {
        logger.warn('Realtime friends subscription failed:', subscriptionError);
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [fetchData, userId]);

  return {
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
    setError,
    setFriends,
    setLoading,
    setOutgoingRequests,
    setPendingRequests,
    setSearchResults,
    setSearching
  };
};

export default useFriendsData;
