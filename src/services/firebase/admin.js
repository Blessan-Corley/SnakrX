import { functions, httpsCallable } from './config.js';
import logger from '../../utils/logger.js';

let listAdminUsersCallable;
let listAdminGamesCallable;
let listAdminSupportTicketsCallable;
let getAdminOverviewCallable;
let setUserBanStateCallable;

const getListAdminUsersCallable = () => {
  if (!listAdminUsersCallable) {
    listAdminUsersCallable = httpsCallable(functions, 'listAdminUsers');
  }
  return listAdminUsersCallable;
};

const getListAdminGamesCallable = () => {
  if (!listAdminGamesCallable) {
    listAdminGamesCallable = httpsCallable(functions, 'listAdminGames');
  }
  return listAdminGamesCallable;
};

const getSetUserBanStateCallable = () => {
  if (!setUserBanStateCallable) {
    setUserBanStateCallable = httpsCallable(functions, 'setUserBanState');
  }
  return setUserBanStateCallable;
};

const getListAdminSupportTicketsCallable = () => {
  if (!listAdminSupportTicketsCallable) {
    listAdminSupportTicketsCallable = httpsCallable(functions, 'listAdminSupportTickets');
  }
  return listAdminSupportTicketsCallable;
};

const getAdminOverview = () => {
  if (!getAdminOverviewCallable) {
    getAdminOverviewCallable = httpsCallable(functions, 'getAdminOverview');
  }
  return getAdminOverviewCallable;
};

export const adminOperations = {
  async getUsers(options = {}) {
    try {
      const callable = getListAdminUsersCallable();
      const normalizedOptions = typeof options === 'number' ? { limit: options } : options;
      const response = await callable({
        page: normalizedOptions?.page || 1,
        limit: normalizedOptions?.limit || 25,
        filters: normalizedOptions?.filters || {}
      });
      return {
        users: Array.isArray(response?.data?.users) ? response.data.users : [],
        pagination: response?.data?.pagination || {
          page: normalizedOptions?.page || 1,
          limit: normalizedOptions?.limit || 25,
          hasNext: false,
          hasPrev: (normalizedOptions?.page || 1) > 1
        }
      };
    } catch (error) {
      logger.error('Failed to fetch admin users:', error);
      throw error;
    }
  },

  async getRecentGames(options = {}) {
    try {
      const callable = getListAdminGamesCallable();
      const normalizedOptions = typeof options === 'number' ? { limit: options } : options;
      const response = await callable({
        page: normalizedOptions?.page || 1,
        limit: normalizedOptions?.limit || 20,
        filters: normalizedOptions?.filters || {}
      });
      return {
        games: Array.isArray(response?.data?.games) ? response.data.games : [],
        pagination: response?.data?.pagination || {
          page: normalizedOptions?.page || 1,
          limit: normalizedOptions?.limit || 20,
          hasNext: false,
          hasPrev: (normalizedOptions?.page || 1) > 1
        }
      };
    } catch (error) {
      logger.error('Failed to fetch admin games:', error);
      throw error;
    }
  },

  async getSupportTickets(options = {}) {
    try {
      const callable = getListAdminSupportTicketsCallable();
      const normalizedOptions = typeof options === 'number' ? { limit: options } : options;
      const response = await callable({
        page: normalizedOptions?.page || 1,
        limit: normalizedOptions?.limit || 10,
        filters: normalizedOptions?.filters || {}
      });
      return {
        tickets: Array.isArray(response?.data?.tickets) ? response.data.tickets : [],
        pagination: response?.data?.pagination || {
          page: normalizedOptions?.page || 1,
          limit: normalizedOptions?.limit || 10,
          hasNext: false,
          hasPrev: (normalizedOptions?.page || 1) > 1
        },
        summary: response?.data?.summary || {
          open: 0,
          needsReply: 0,
          resolved: 0
        }
      };
    } catch (error) {
      logger.error('Failed to fetch admin support tickets:', error);
      throw error;
    }
  },

  async getOverview() {
    try {
      const callable = getAdminOverview();
      const response = await callable();
      return response?.data?.overview || {};
    } catch (error) {
      logger.error('Failed to fetch admin overview:', error);
      throw error;
    }
  },

  async setUserBanState(userId, banned, banReason = 'Administrative action') {
    try {
      const callable = getSetUserBanStateCallable();
      const response = await callable({ userId, banned, banReason });
      return response?.data?.user || null;
    } catch (error) {
      logger.error('Failed to update user moderation state:', error);
      throw error;
    }
  }
};

export const __private__ = {
  resetCallables() {
    listAdminUsersCallable = undefined;
    listAdminGamesCallable = undefined;
    listAdminSupportTicketsCallable = undefined;
    getAdminOverviewCallable = undefined;
    setUserBanStateCallable = undefined;
  }
};
