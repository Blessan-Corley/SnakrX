import { functions, httpsCallable } from './config.js';
import logger from '../../utils/logger.js';

let listAdminUsersCallable;
let listAdminGamesCallable;
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

export const adminOperations = {
  async getUsers(limit = 100) {
    try {
      const callable = getListAdminUsersCallable();
      const response = await callable({ limit });
      return Array.isArray(response?.data?.users) ? response.data.users : [];
    } catch (error) {
      logger.error('Failed to fetch admin users:', error);
      throw error;
    }
  },

  async getRecentGames(limit = 50) {
    try {
      const callable = getListAdminGamesCallable();
      const response = await callable({ limit });
      return Array.isArray(response?.data?.games) ? response.data.games : [];
    } catch (error) {
      logger.error('Failed to fetch admin games:', error);
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
    setUserBanStateCallable = undefined;
  }
};
