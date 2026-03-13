const { admin } = require('../runtime');
const { projectPublicProfileStats } = require('./profileSeeds');
const { sanitizeText } = require('./coreUtils');

const buildPublicProfilePayload = ({
  userId,
  userData = {},
  publicProfileData = {},
  nextStats = {}
}) => ({
  uid: userId,
  username: sanitizeText(userData.username || publicProfileData.username || '', 64) || 'player',
  displayName: sanitizeText(
    userData.displayName || publicProfileData.displayName || userData.username || 'player',
    120
  ) || 'player',
  avatar: userData.avatar || publicProfileData.avatar || null,
  avatarPath: userData.avatarPath || publicProfileData.avatarPath || null,
  isPrivateLeaderboard: Boolean(userData?.preferences?.privateLeaderboard ?? publicProfileData?.isPrivateLeaderboard),
  preferences: {
    hideMatchHistory: Boolean(userData?.preferences?.hideMatchHistory ?? publicProfileData?.preferences?.hideMatchHistory)
  },
  stats: projectPublicProfileStats(nextStats),
  updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  lastActiveAt: admin.firestore.FieldValue.serverTimestamp()
});

module.exports = {
  buildPublicProfilePayload
};
