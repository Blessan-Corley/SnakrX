import {
  COLLECTIONS,
  collection,
  db,
  onSnapshot,
  query,
  where
} from '../config.js';
import logger from '../../../utils/logger.js';

export const subscribeToFriendChanges = (userId, onChange, onError) => {
  if (!userId) return () => {};

  const friendsRef = collection(db, COLLECTIONS.USERS, userId, 'friends');
  const friendsQuery = query(
    friendsRef,
    where('status', 'in', ['accepted', 'pending_received', 'pending_sent'])
  );

  return onSnapshot(
    friendsQuery,
    () => {
      if (typeof onChange === 'function') onChange();
    },
    (error) => {
      logger.warn('Realtime friends listener failed:', error);
      if (typeof onError === 'function') onError(error);
    }
  );
};
