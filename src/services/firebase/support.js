import {
  markTicketUpdatesSeen,
  submitTicket,
  updateTicket,
  updateTicketStatus
} from './support/mutations.js';
import { getRecentTickets, getUserTickets } from './support/queries.js';
import { subscribeToRecentTickets, subscribeToUserTickets } from './support/realtime.js';

export const supportOperations = {
  submitTicket,
  getRecentTickets,
  subscribeToRecentTickets,
  getUserTickets,
  subscribeToUserTickets,
  updateTicket,
  markTicketUpdatesSeen,
  updateTicketStatus
};
