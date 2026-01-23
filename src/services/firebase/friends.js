/**
 * Friend System Operations
 * Handles friend requests, list management, and user search
 */

import { 
  db, 
  doc, 
  collection, 
  query, 
  where, 
  getDocs, 
  deleteDoc,
  limit,
  serverTimestamp, 
  COLLECTIONS 
} from './config.js';
import { firestoreOperations } from './firestore.js';
import logger from '../../utils/logger.js';

export const friendOperations = {
  /**
   * Send a friend request
   */
  async sendFriendRequest(currentUserId, targetUserId) {
    try {
      if (currentUserId === targetUserId) throw new Error("You cannot add yourself.");

      // Check if already friends or request pending
      const friendRef = doc(db, COLLECTIONS.USERS, currentUserId, 'friends', targetUserId);
      const friendDoc = await firestoreOperations.getDocument(friendRef);

      if (friendDoc.exists()) {
        const status = friendDoc.data().status;
        if (status === 'accepted') throw new Error("User is already your friend.");
        if (status === 'pending_sent') throw new Error("Friend request already sent.");
        if (status === 'pending_received') throw new Error("User has already sent you a request. Please accept it.");
      }

      // Add to current user's friends collection as 'pending_sent'
      await firestoreOperations.setDocument(friendRef, {
        status: 'pending_sent',
        timestamp: serverTimestamp()
      });

      // Add to target user's friends collection as 'pending_received'
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
  },

  /**
   * Accept a friend request
   */
  async acceptFriendRequest(currentUserId, requesterId) {
    try {
      const friendRef = doc(db, COLLECTIONS.USERS, currentUserId, 'friends', requesterId);
      const requesterRef = doc(db, COLLECTIONS.USERS, requesterId, 'friends', currentUserId);

      // Verify request exists
      const friendDoc = await firestoreOperations.getDocument(friendRef);
      if (!friendDoc.exists() || friendDoc.data().status !== 'pending_received') {
        throw new Error("No pending friend request from this user.");
      }

      // Update both documents to 'accepted'
      const timestamp = serverTimestamp();
      
      await Promise.all([
        firestoreOperations.updateDocument(friendRef, { status: 'accepted', timestamp }),
        firestoreOperations.updateDocument(requesterRef, { status: 'accepted', timestamp })
      ]);

      return true;
    } catch (error) {
      logger.error('Error accepting friend request:', error);
      throw error;
    }
  },

  /**
   * Reject a friend request or Remove a friend
   */
  async removeFriend(currentUserId, targetId) {
    try {
      const friendRef = doc(db, COLLECTIONS.USERS, currentUserId, 'friends', targetId);
      const targetRef = doc(db, COLLECTIONS.USERS, targetId, 'friends', currentUserId);

      await Promise.all([
        deleteDoc(friendRef),
        deleteDoc(targetRef)
      ]);

      return true;
    } catch (error) {
      logger.error('Error removing friend:', error);
      throw error;
    }
  },

  /**
   * Get friend list with details
   */
  async getFriends(userId) {
    try {
      const friendsRef = collection(db, COLLECTIONS.USERS, userId, 'friends');
      const q = query(friendsRef, where('status', '==', 'accepted'));
      const snapshot = await getDocs(q);

      const friends = [];
      for (const docSnap of snapshot.docs) {
        const friendId = docSnap.id;
        // Fetch friend profile details
        const friendProfileRef = doc(db, COLLECTIONS.USERS, friendId);
        const friendProfileSnap = await firestoreOperations.getDocument(friendProfileRef);
        
        if (friendProfileSnap.exists()) {
          const data = friendProfileSnap.data();
          friends.push({
            id: friendId,
            username: data.username,
            displayName: data.displayName,
            avatar: data.avatar || null,
            ...docSnap.data() // timestamp
          });
        }
      }
      
      return friends;
    } catch (error) {
      logger.error('Error fetching friends:', error);
      return [];
    }
  },

  /**
   * Get pending requests
   */
  async getFriendRequests(userId) {
    try {
      const friendsRef = collection(db, COLLECTIONS.USERS, userId, 'friends');
      const q = query(friendsRef, where('status', '==', 'pending_received'));
      const snapshot = await getDocs(q);

      const requests = [];
      for (const docSnap of snapshot.docs) {
        const requesterId = docSnap.id;
        const profileRef = doc(db, COLLECTIONS.USERS, requesterId);
        const profileSnap = await firestoreOperations.getDocument(profileRef);
        
        if (profileSnap.exists()) {
          const data = profileSnap.data();
          requests.push({
            id: requesterId,
            username: data.username,
            displayName: data.displayName,
            timestamp: docSnap.data().timestamp
          });
        }
      }
      return requests;
    } catch (error) {
      logger.error('Error fetching requests:', error);
      return [];
    }
  },

  /**
   * Search users by username (simple exact/prefix match)
   */
  async searchUsers(searchTerm) {
    try {
      if (!searchTerm || searchTerm.length < 3) return [];
      
      const usersRef = collection(db, COLLECTIONS.USERS);
      // Ensure we search against the lowercase stored username
      const term = searchTerm.toLowerCase().trim();
      
      const q = query(
        usersRef, 
        where('username', '>=', term),
        where('username', '<=', term + '\uf8ff'),
        limit(10)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      logger.error('Error searching users:', error);
      return [];
    }
  }
};
