/**
 * Friends Management Hook
 * Handles fetching, sending, and managing friend requests
 */

import { useState, useEffect, useCallback } from 'react';
import { friendOperations } from '../services/firebase/friends.js';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

export const useFriends = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  // Fetch data
  const fetchData = useCallback(async () => {
    if (!user) return;
    
    try {
      const [friendsList, requests] = await Promise.all([
        friendOperations.getFriends(user.uid),
        friendOperations.getFriendRequests(user.uid)
      ]);
      
      setFriends(friendsList);
      setPendingRequests(requests);
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  }, [user]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * Search for users
   */
  const searchUsers = useCallback(async (term) => {
    if (!term || term.length < 3) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const results = await friendOperations.searchUsers(term);
      // Filter out self and existing friends
      const filtered = results.filter(u => 
        u.id !== user.uid && 
        !friends.some(f => f.id === u.id)
      );
      setSearchResults(filtered);
    } catch (error) {
      toast.error("Search failed");
    } finally {
      setSearching(false);
    }
  }, [user, friends]);

  /**
   * Send Request
   */
  const sendRequest = useCallback(async (targetId) => {
    setLoading(true);
    try {
      await friendOperations.sendFriendRequest(user.uid, targetId);
      toast.success("Friend request sent!");
      // Optimistic update: remove from search results
      setSearchResults(prev => prev.filter(u => u.id !== targetId));
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Accept Request
   */
  const acceptRequest = useCallback(async (requesterId) => {
    setLoading(true);
    try {
      await friendOperations.acceptFriendRequest(user.uid, requesterId);
      toast.success("Friend request accepted!");
      await fetchData(); // Refresh lists
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [user, fetchData]);

  /**
   * Reject/Remove Friend
   */
  const removeFriend = useCallback(async (targetId) => {
    if (!confirm("Are you sure you want to remove this friend?")) return;
    
    setLoading(true);
    try {
      await friendOperations.removeFriend(user.uid, targetId);
      toast.success("Friend removed");
      await fetchData();
    } catch (error) {
      toast.error("Failed to remove friend");
    } finally {
      setLoading(false);
    }
  }, [user, fetchData]);

  return {
    friends,
    pendingRequests,
    searchResults,
    loading,
    searching,
    searchUsers,
    sendRequest,
    acceptRequest,
    removeFriend,
    refreshFriends: fetchData
  };
};
