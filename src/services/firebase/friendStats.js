import { functions, httpsCallable } from './config.js';

let syncFriendStatsCallable;

const getSyncFriendStatsCallable = () => {
  if (!syncFriendStatsCallable) {
    syncFriendStatsCallable = httpsCallable(functions, 'syncFriendStats');
  }

  return syncFriendStatsCallable;
};

export const syncFriendStats = async (userIds = []) => {
  const callable = getSyncFriendStatsCallable();
  const response = await callable({ userIds });
  return Array.isArray(response?.data?.synced) ? response.data.synced : [];
};

export const __private__ = {
  resetCallables() {
    syncFriendStatsCallable = undefined;
  }
};
