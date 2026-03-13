import { onSnapshot } from '../config.js';
import logger from '../../../utils/logger.js';
import { mapAndSortTickets } from './normalize.js';
import { buildRecentTicketsQuery, buildUserTicketsQuery } from './queries.js';

export const subscribeToRecentTickets = (
  limitCount = 100,
  onData = () => {},
  onError = () => {}
) => onSnapshot(
  buildRecentTicketsQuery(limitCount),
  (snapshot) => {
    onData(mapAndSortTickets(snapshot.docs));
  },
  (error) => {
    logger.error('Failed to subscribe to support tickets:', error);
    onError(error);
  }
);

export const subscribeToUserTickets = (
  userId,
  limitCount = 25,
  onData = () => {},
  onError = () => {}
) => {
  if (!userId) return () => {};

  return onSnapshot(
    buildUserTicketsQuery(userId, limitCount),
    (snapshot) => {
      onData(mapAndSortTickets(snapshot.docs));
    },
    (error) => {
      logger.error('Failed to subscribe to user support tickets:', error);
      onError(error);
    }
  );
};
