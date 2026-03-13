const { functions, admin, db } = require('./runtime');
const { sanitizeText } = require('./shared/utils');
const { buildPublicProfilePayload } = require('./shared/publicProfilePayload');
const {
  calculateCollectedAchievementPoints,
  checkAchievementRequirements,
  getAchievementMeta,
  normalizeAchievementRecords,
  unlockEligibleAchievements
} = require('./shared/achievementCatalog');


const unlockUserAchievement = functions.https.onCall(async (data, context) => {
  const userId = context.auth?.uid;
  if (!userId) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required.');
  }

  const achievementId = sanitizeText(data?.achievementId || '', 128);
  if (!achievementId || !getAchievementMeta(achievementId)) {
    throw new functions.https.HttpsError('invalid-argument', 'Unknown achievement.');
  }

  const result = await db.runTransaction(async (transaction) => {
    const userRef = db.collection('users').doc(userId);
    const publicProfileRef = db.collection('publicProfiles').doc(userId);
    const [userSnap, publicProfileSnap] = await Promise.all([
      transaction.get(userRef),
      transaction.get(publicProfileRef)
    ]);

    if (!userSnap.exists) {
      throw new functions.https.HttpsError('failed-precondition', 'User profile is missing.');
    }

    const userData = userSnap.data() || {};
    const publicProfileData = publicProfileSnap.exists ? publicProfileSnap.data() || {} : {};
    const currentStats = userData.stats || {};
    const normalizedAchievements = normalizeAchievementRecords(currentStats.achievements || []);
    if (normalizedAchievements.some((achievement) => achievement.id === achievementId)) {
      return { success: true, unlocked: false, alreadyUnlocked: true };
    }

    if (!checkAchievementRequirements(achievementId, currentStats)) {
      return { success: true, unlocked: false, alreadyUnlocked: false };
    }

    const unlocked = unlockEligibleAchievements({
      achievements: normalizedAchievements,
      sourceStats: currentStats
    });
    const nextStats = {
      ...currentStats,
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
      success: true,
      unlocked: unlocked.newlyUnlockedIds.includes(achievementId),
      alreadyUnlocked: false
    };
  });

  return result;
});

const collectUserAchievements = functions.https.onCall(async (data, context) => {
  const userId = context.auth?.uid;
  if (!userId) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required.');
  }

  const achievementIds = Array.isArray(data?.achievementIds)
    ? data.achievementIds.map((achievementId) => sanitizeText(achievementId || '', 128)).filter(Boolean).slice(0, 100)
    : [];

  if (!achievementIds.length) {
    return { collectedIds: [], achievementPoints: 0 };
  }

  const result = await db.runTransaction(async (transaction) => {
    const userRef = db.collection('users').doc(userId);
    const publicProfileRef = db.collection('publicProfiles').doc(userId);
    const [userSnap, publicProfileSnap] = await Promise.all([
      transaction.get(userRef),
      transaction.get(publicProfileRef)
    ]);

    if (!userSnap.exists) {
      throw new functions.https.HttpsError('failed-precondition', 'User profile is missing.');
    }

    const userData = userSnap.data() || {};
    const publicProfileData = publicProfileSnap.exists ? publicProfileSnap.data() || {} : {};
    const currentStats = userData.stats || {};
    const normalizedAchievements = normalizeAchievementRecords(currentStats.achievements || []);
    const collectableIds = new Set(achievementIds);
    const collectedIds = [];

    const nextAchievements = normalizedAchievements.map((achievement) => {
      if (!collectableIds.has(achievement.id) || achievement.collected) {
        return achievement;
      }

      collectedIds.push(achievement.id);
      return {
        ...achievement,
        collected: true
      };
    });

    const achievementPoints = calculateCollectedAchievementPoints(nextAchievements);
    const nextStats = {
      ...currentStats,
      achievements: nextAchievements,
      achievementPoints
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
      collectedIds,
      achievementPoints
    };
  });

  return result;
});

module.exports = {
  unlockUserAchievement,
  collectUserAchievements
};


