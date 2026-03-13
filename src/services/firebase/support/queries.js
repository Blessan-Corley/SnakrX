import {
  db,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
  COLLECTIONS
} from '../config.js';
import logger from '../../../utils/logger.js';
import { mapAndSortTickets } from './normalize.js';

export const buildRecentTicketsQuery = (limitCount = 100) => query(
  collection(db, COLLECTIONS.SUPPORT_TICKETS),
  orderBy('createdAt', 'desc'),
  limit(limitCount)
);

export const buildUserTicketsQuery = (userId, limitCount = 25) => query(
  collection(db, COLLECTIONS.SUPPORT_TICKETS),
  where('userId', '==', userId),
  limit(limitCount)
);

export const getRecentTickets = async (limitCount = 100) => {
  try {
    const snapshot = await getDocs(buildRecentTicketsQuery(limitCount));
    return mapAndSortTickets(snapshot.docs);
  } catch (error) {
    logger.error('Failed to fetch support tickets:', error);
    return [];
  }
};

export const getUserTickets = async (userId, limitCount = 25) => {
  try {
    if (!userId) return [];

    const snapshot = await getDocs(buildUserTicketsQuery(userId, limitCount));
    return mapAndSortTickets(snapshot.docs);
  } catch (error) {
    logger.error('Failed to fetch user support tickets:', error);
    return [];
  }
};
