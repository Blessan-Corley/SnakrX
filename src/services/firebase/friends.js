/**
 * Friend System Operations
 * Handles friend requests, list management, and user search
 */

import { acceptFriendRequest, removeFriend, sendFriendRequest } from './friends/mutations.js';
import {
  getFriendRequests,
  getFriends,
  getOutgoingRequests,
  searchUsers
} from './friends/queries.js';
import { subscribeToFriendChanges } from './friends/realtime.js';

export const friendOperations = {
  sendFriendRequest,
  acceptFriendRequest,
  removeFriend,
  getFriends,
  getFriendRequests,
  getOutgoingRequests,
  searchUsers,
  subscribeToFriendChanges
};
