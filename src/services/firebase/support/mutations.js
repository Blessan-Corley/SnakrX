import logger from '../../../utils/logger.js';
import {
  getMarkSupportTicketUpdatesSeenCallable,
  getSubmitSupportTicketCallable,
  getUpdateSupportTicketCallable
} from './callables.js';
import { serializeSupportAttachments } from '../supportAttachments.js';

export const submitTicket = async (user, payload) => {
  const callable = getSubmitSupportTicketCallable();

  try {
    const attachmentFiles = Array.isArray(payload?.attachmentFiles) ? payload.attachmentFiles : [];
    const attachments = await serializeSupportAttachments(attachmentFiles);
    const response = await callable({
      user: {
        uid: user?.uid || null,
        email: user?.email || null,
        username: user?.username || null,
        displayName: user?.displayName || null
      },
      payload: {
        name: payload?.name || '',
        email: payload?.email || '',
        username: payload?.username || '',
        category: payload?.category || 'other',
        title: payload?.title || 'Support request',
        description: payload?.description || '',
        device: payload?.device || '',
        attachments,
        attachmentNames: Array.isArray(payload?.attachmentNames) ? payload.attachmentNames : [],
        source: payload?.source || 'support_form'
      }
    });

    return response?.data?.ticketId || null;
  } catch (error) {
    logger.error('Failed to submit support ticket via function:', error);
    throw error;
  }
};

export const updateTicket = async (ticketId, updates) => {
  try {
    const callable = getUpdateSupportTicketCallable();
    const response = await callable({
      ticketId,
      status: updates?.status || 'open',
      priority: updates?.priority || 'normal',
      adminResponse: updates?.adminResponse || ''
    });
    return response?.data?.ticket || null;
  } catch (error) {
    logger.error('Failed to update support ticket:', error);
    return null;
  }
};

export const markTicketUpdatesSeen = async (ticketIds = []) => {
  try {
    const normalizedIds = ticketIds.filter(Boolean);
    if (!normalizedIds.length) return 0;

    const callable = getMarkSupportTicketUpdatesSeenCallable();
    const response = await callable({ ticketIds: normalizedIds });
    return response?.data?.updatedCount || 0;
  } catch (error) {
    logger.error('Failed to mark support ticket updates as seen:', error);
    return 0;
  }
};

export const updateTicketStatus = async (ticketId, status, _adminUserId = null) => {
  const ticket = await updateTicket(ticketId, {
    status,
    priority: 'normal',
    adminResponse: ''
  });
  return !!ticket;
};
