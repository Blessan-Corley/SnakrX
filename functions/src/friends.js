const { functions, admin, db } = require('./runtime');
const { sanitizeText } = require('./shared/utils');
const { buildPublicProfilePayload } = require('./shared/publicProfilePayload');
const { unlockEligibleAchievements } = require('./shared/achievementCatalog');

const syncFriendStatsCore = async (data, context, services = {}) => {
  const runtimeFunctions = services.functions || functions;
  const runtimeAdmin = services.admin || admin;
  const runtimeDb = services.db || db;
  const sanitize = services.sanitizeText || sanitizeText;
  const buildPayload = services.buildPublicProfilePayload || buildPublicProfilePayload;
  const unlockAchievements = services.unlockEligibleAchievements || unlockEligibleAchievements;

  if (!context.auth?.uid) {
    throw new runtimeFunctions.https.HttpsError('unauthenticated', 'Authentication required.');
  }

  const userIds = Array.isArray(data?.userIds)
    ? data.userIds.map((userId) => sanitize(userId || '', 128)).filter(Boolean).slice(0, 10)
    : [];

  if (!userIds.length) {
    return { synced: [] };
  }

  const uniqueUserIds = [...new Set(userIds)];
  const synced = [];

  for (const userId of uniqueUserIds) {
    const friendsSnap = await runtimeDb.collection('users').doc(userId).collection('friends')
      .where('status', '==', 'accepted')
      .get();
    const acceptedCount = friendsSnap.size;

    const syncResult = await runtimeDb.runTransaction(async (transaction) => {
      const userRef = runtimeDb.collection('users').doc(userId);
      const publicProfileRef = runtimeDb.collection('publicProfiles').doc(userId);
      const [userSnap, publicProfileSnap] = await Promise.all([
        transaction.get(userRef),
        transaction.get(publicProfileRef)
      ]);

      if (!userSnap.exists) {
        return null;
      }

      const userData = userSnap.data() || {};
      const publicProfileData = publicProfileSnap.exists ? publicProfileSnap.data() || {} : {};
      const currentStats = userData.stats || {};
      const unlocked = unlockAchievements({
        achievements: currentStats.achievements || [],
        sourceStats: {
          ...currentStats,
          friendsCount: acceptedCount
        }
      });
      const nextStats = {
        ...currentStats,
        friendsCount: acceptedCount,
        achievements: unlocked.achievements
      };

      transaction.set(userRef, {
        stats: nextStats,
        updatedAt: runtimeAdmin.firestore.FieldValue.serverTimestamp(),
        lastActiveAt: runtimeAdmin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      transaction.set(
        publicProfileRef,
        {
          ...buildPayload({ userId, userData, publicProfileData, nextStats }),
          createdAt: publicProfileSnap.exists
            ? (publicProfileData.createdAt || runtimeAdmin.firestore.FieldValue.serverTimestamp())
            : runtimeAdmin.firestore.FieldValue.serverTimestamp()
        },
        { merge: true }
      );

      return {
        userId,
        friendsCount: acceptedCount,
        unlockedAchievementIds: unlocked.newlyUnlockedIds
      };
    });

    if (syncResult) {
      synced.push(syncResult);
    }
  }

  return { synced };
};

const syncFriendStats = functions.https.onCall(async (data, context) => (
  syncFriendStatsCore(data, context)
));

module.exports = {
  syncFriendStats,
  __private__: {
    syncFriendStatsCore
  }
};
