const { functions, admin, db } = require('./runtime');
const { sanitizeText } = require('./shared/utils');
const { buildPublicProfilePayload } = require('./shared/publicProfilePayload');
const { unlockEligibleAchievements } = require('./shared/achievementCatalog');


const syncFriendStats = functions.https.onCall(async (data, context) => {
  if (!context.auth?.uid) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required.');
  }

  const userIds = Array.isArray(data?.userIds)
    ? data.userIds.map((userId) => sanitizeText(userId || '', 128)).filter(Boolean).slice(0, 10)
    : [];

  if (!userIds.length) {
    return { synced: [] };
  }

  const uniqueUserIds = [...new Set(userIds)];
  const synced = [];

  for (const userId of uniqueUserIds) {
    const friendsSnap = await db.collection('users').doc(userId).collection('friends')
      .where('status', '==', 'accepted')
      .get();
    const acceptedCount = friendsSnap.size;

    const syncResult = await db.runTransaction(async (transaction) => {
      const userRef = db.collection('users').doc(userId);
      const publicProfileRef = db.collection('publicProfiles').doc(userId);
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
      const unlocked = unlockEligibleAchievements({
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
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastActiveAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      transaction.set(
        publicProfileRef,
        {
          ...buildPublicProfilePayload({ userId, userData, publicProfileData, nextStats }),
          createdAt: publicProfileSnap.exists
            ? (publicProfileData.createdAt || admin.firestore.FieldValue.serverTimestamp())
            : admin.firestore.FieldValue.serverTimestamp()
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
});

module.exports = {
  syncFriendStats
};


