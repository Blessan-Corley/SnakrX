import {
  COLLECTIONS,
  collection,
  db,
  doc,
  getDocs,
  query,
  where
} from '../config.js';
import { firestoreOperations } from '../firestore.js';
import logger from '../../../utils/logger.js';
import { syncFriendStats } from '../friendStats.js';

export const getRelationshipProfilesByStatus = async (userId, status, mapResult) => {
  const friendsRef = collection(db, COLLECTIONS.USERS, userId, 'friends');
  const relationshipQuery = query(friendsRef, where('status', '==', status));
  const snapshot = await getDocs(relationshipQuery);

  const results = [];
  for (const docSnap of snapshot.docs) {
    const targetUserId = docSnap.id;
    const profileRef = doc(db, COLLECTIONS.PUBLIC_PROFILES, targetUserId);
    const profileSnap = await firestoreOperations.getDocument(profileRef);

    if (!profileSnap.exists()) continue;

    results.push(mapResult({
      targetUserId,
      friendData: docSnap.data(),
      profileData: profileSnap.data()
    }));
  }

  return results;
};

export const syncFriendsCountForUser = async (userId) => {
  try {
    const synced = await syncFriendStats([userId]);
    return synced[0]?.friendsCount ?? null;
  } catch (error) {
    logger.warn('Unable to sync friends count for user:', userId, error);
    return null;
  }
};
