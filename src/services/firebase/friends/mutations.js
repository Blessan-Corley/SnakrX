import { deleteDoc } from 'firebase/firestore';
import {
  COLLECTIONS,
  db,
  doc,
  serverTimestamp
} from '../config.js';
import { firestoreOperations } from '../firestore.js';
import logger from '../../../utils/logger.js';
import { syncFriendsCountForUser } from './helpers.js';

export const sendFriendRequest = async (currentUserId, targetUserId) => {
  try {
    if (currentUserId === targetUserId) throw new Error('You cannot add yourself.');

    const friendRef = doc(db, COLLECTIONS.USERS, currentUserId, 'friends', targetUserId);
    const friendDoc = await firestoreOperations.getDocument(friendRef);

    if (friendDoc.exists()) {
      const status = friendDoc.data().status;
      if (status === 'accepted') throw new Error('User is already your friend.');
      if (status === 'pending_sent') throw new Error('Friend request already sent.');
      if (status === 'pending_received') {
        throw new Error('User has already sent you a request. Please accept it.');
      }
    }

    await firestoreOperations.setDocument(friendRef, {
      status: 'pending_sent',
      timestamp: serverTimestamp()
    });

    const targetFriendRef = doc(db, COLLECTIONS.USERS, targetUserId, 'friends', currentUserId);
    await firestoreOperations.setDocument(targetFriendRef, {
      status: 'pending_received',
      timestamp: serverTimestamp()
    });

    return true;
  } catch (error) {
    logger.error('Error sending friend request:', error);
    throw error;
  }
};

export const acceptFriendRequest = async (currentUserId, requesterId) => {
  try {
    const friendRef = doc(db, COLLECTIONS.USERS, currentUserId, 'friends', requesterId);
    const requesterRef = doc(db, COLLECTIONS.USERS, requesterId, 'friends', currentUserId);

    const friendDoc = await firestoreOperations.getDocument(friendRef);
    if (!friendDoc.exists() || friendDoc.data().status !== 'pending_received') {
      throw new Error('No pending friend request from this user.');
    }

    const timestamp = serverTimestamp();
    await Promise.all([
      firestoreOperations.updateDocument(friendRef, { status: 'accepted', timestamp }),
      firestoreOperations.updateDocument(requesterRef, { status: 'accepted', timestamp })
    ]);

    await Promise.all([
      syncFriendsCountForUser(currentUserId),
      syncFriendsCountForUser(requesterId)
    ]);

    return true;
  } catch (error) {
    logger.error('Error accepting friend request:', error);
    throw error;
  }
};

export const removeFriend = async (currentUserId, targetId) => {
  try {
    const friendRef = doc(db, COLLECTIONS.USERS, currentUserId, 'friends', targetId);
    const targetRef = doc(db, COLLECTIONS.USERS, targetId, 'friends', currentUserId);

    await Promise.all([
      deleteDoc(friendRef),
      deleteDoc(targetRef)
    ]);

    await Promise.all([
      syncFriendsCountForUser(currentUserId),
      syncFriendsCountForUser(targetId)
    ]);

    return true;
  } catch (error) {
    logger.error('Error removing friend:', error);
    throw error;
  }
};
