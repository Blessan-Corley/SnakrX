import { functions, httpsCallable } from '../config.js';

let submitSupportTicketCallable;
let updateSupportTicketCallable;
let markSupportTicketUpdatesSeenCallable;

export const getSubmitSupportTicketCallable = () => {
  if (!submitSupportTicketCallable) {
    submitSupportTicketCallable = httpsCallable(functions, 'submitSupportTicket');
  }
  return submitSupportTicketCallable;
};

export const getUpdateSupportTicketCallable = () => {
  if (!updateSupportTicketCallable) {
    updateSupportTicketCallable = httpsCallable(functions, 'updateSupportTicket');
  }
  return updateSupportTicketCallable;
};

export const getMarkSupportTicketUpdatesSeenCallable = () => {
  if (!markSupportTicketUpdatesSeenCallable) {
    markSupportTicketUpdatesSeenCallable = httpsCallable(functions, 'markSupportTicketUpdatesSeen');
  }
  return markSupportTicketUpdatesSeenCallable;
};

export const __private__ = {
  resetCallables() {
    submitSupportTicketCallable = undefined;
    updateSupportTicketCallable = undefined;
    markSupportTicketUpdatesSeenCallable = undefined;
  }
};
