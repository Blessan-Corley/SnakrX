import {
  COLLECTIONS,
  collection,
  db,
  getDocs,
  limit,
  orderBy,
  query,
  where
} from '../config.js';
import logger from '../../../utils/logger.js';
import { getRelationshipProfilesByStatus } from './helpers.js';

export const getFriends = async (userId) => {
  try {
    return await getRelationshipProfilesByStatus(userId, 'accepted', ({
      targetUserId,
      friendData,
      profileData
    }) => ({
      id: targetUserId,
      username: profileData.username,
      displayName: profileData.displayName,
      avatar: profileData.avatar || null,
      ...friendData
    }));
  } catch (error) {
    logger.error('Error fetching friends:', error);
    return [];
  }
};

export const getFriendRequests = async (userId) => {
  try {
    return await getRelationshipProfilesByStatus(userId, 'pending_received', ({
      targetUserId,
      friendData,
      profileData
    }) => ({
      id: targetUserId,
      username: profileData.username,
      displayName: profileData.displayName,
      avatar: profileData.avatar || null,
      timestamp: friendData.timestamp
    }));
  } catch (error) {
    logger.error('Error fetching requests:', error);
    return [];
  }
};

export const getOutgoingRequests = async (userId) => {
  try {
    return await getRelationshipProfilesByStatus(userId, 'pending_sent', ({
      targetUserId,
      friendData,
      profileData
    }) => ({
      id: targetUserId,
      username: profileData.username,
      displayName: profileData.displayName,
      avatar: profileData.avatar || null,
      timestamp: friendData.timestamp
    }));
  } catch (error) {
    logger.error('Error fetching outgoing requests:', error);
    return [];
  }
};

export const searchUsers = async (searchTerm) => {
  try {
    if (!searchTerm || searchTerm.length < 3) return [];

    const usersRef = collection(db, COLLECTIONS.PUBLIC_PROFILES);
    const term = searchTerm.toLowerCase().trim();

    const usersQuery = query(
      usersRef,
      where('username', '>=', term),
      where('username', '<=', term + '\uf8ff'),
      orderBy('username'),
      limit(10)
    );

    const snapshot = await getDocs(usersQuery);
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data()
    }));
  } catch (error) {
    logger.error('Error searching users:', error);
    return [];
  }
};
