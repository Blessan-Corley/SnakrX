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

const sanitizeAchievementIds = (achievementIds = []) => (
  Array.isArray(achievementIds)
    ? achievementIds
      .map((achievementId) => sanitizeText(achievementId || '', 128))
      .filter(Boolean)
      .slice(0, 100)
    : []
);

const createAchievementRecord = (achievementId, now) => {
  const meta = getAchievementMeta(achievementId);
  if (!meta) return null;

  return {
    id: achievementId,
    collected: false,
    unlockedAt: now,
    timestamp: now,
    points: meta.points
  };
};

const resolveUnlockedAchievements = ({
  currentStats = {},
  achievementIds = [],
  now = Date.now()
}) => {
  const normalizedAchievements = normalizeAchievementRecords(currentStats.achievements || [], now);
  const achievementMap = new Map(normalizedAchievements.map((achievement) => [achievement.id, achievement]));
  const syncedIds = [];

  achievementIds.forEach((achievementId) => {
    if (achievementMap.has(achievementId)) {
      return;
    }

    if (!getAchievementMeta(achievementId) || !checkAchievementRequirements(achievementId, currentStats)) {
      return;
    }

    const record = createAchievementRecord(achievementId, now);
    if (!record) {
      return;
    }

    normalizedAchievements.push(record);
    achievementMap.set(achievementId, record);
    syncedIds.push(achievementId);
  });

  return {
    syncedIds,
    nextStats: {
      ...currentStats,
      achievements: normalizedAchievements,
      achievementPoints: calculateCollectedAchievementPoints(normalizedAchievements)
    }
  };
};

const resolveCollectedAchievements = ({
  currentStats = {},
  achievementIds = [],
  now = Date.now()
}) => {
  const resolved = resolveUnlockedAchievements({ currentStats, achievementIds, now });
  const collectableIds = new Set(achievementIds);
  const collectedIds = [];

  const nextAchievements = (resolved.nextStats.achievements || []).map((achievement) => {
    if (!collectableIds.has(achievement.id) || achievement.collected) {
      return achievement;
    }

    collectedIds.push(achievement.id);
    return {
      ...achievement,
      collected: true
    };
  });

  return {
    syncedIds: resolved.syncedIds,
    collectedIds,
    nextStats: {
      ...resolved.nextStats,
      achievements: nextAchievements,
      achievementPoints: calculateCollectedAchievementPoints(nextAchievements)
    }
  };
};

const writeUserStatsAndPublicProfile = ({
  transaction,
  userId,
  userData,
  publicProfileData,
  publicProfileExists,
  publicProfileRef,
  userRef,
  nextStats
}) => {
  transaction.set(userRef, {
    stats: nextStats,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    lastActiveAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  transaction.set(
    publicProfileRef,
    {
      ...buildPublicProfilePayload({ userId, userData, publicProfileData, nextStats }),
      createdAt: publicProfileExists
        ? (publicProfileData.createdAt || admin.firestore.FieldValue.serverTimestamp())
        : admin.firestore.FieldValue.serverTimestamp()
    },
    { merge: true }
  );
};

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

    writeUserStatsAndPublicProfile({
      transaction,
      userId,
      userData,
      publicProfileData,
      publicProfileExists: publicProfileSnap.exists,
      publicProfileRef,
      userRef,
      nextStats
    });

    return {
      success: true,
      unlocked: unlocked.newlyUnlockedIds.includes(achievementId),
      alreadyUnlocked: false
    };
  });

  return result;
});

const syncUserAchievements = functions.https.onCall(async (data, context) => {
  const userId = context.auth?.uid;
  if (!userId) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required.');
  }

  const achievementIds = sanitizeAchievementIds(data?.achievementIds);
  if (!achievementIds.length) {
    return { syncedIds: [] };
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
    const resolved = resolveUnlockedAchievements({
      currentStats,
      achievementIds
    });

    if (!resolved.syncedIds.length) {
      return { syncedIds: [] };
    }

    writeUserStatsAndPublicProfile({
      transaction,
      userId,
      userData,
      publicProfileData,
      publicProfileExists: publicProfileSnap.exists,
      publicProfileRef,
      userRef,
      nextStats: resolved.nextStats
    });

    return {
      syncedIds: resolved.syncedIds
    };
  });

  return result;
});

const collectUserAchievements = functions.https.onCall(async (data, context) => {
  const userId = context.auth?.uid;
  if (!userId) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required.');
  }

  const achievementIds = sanitizeAchievementIds(data?.achievementIds);
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
    const resolved = resolveCollectedAchievements({
      currentStats,
      achievementIds
    });

    if (!resolved.collectedIds.length) {
      return {
        collectedIds: [],
        achievementPoints: calculateCollectedAchievementPoints(
          normalizeAchievementRecords(currentStats.achievements || [])
        )
      };
    }

    writeUserStatsAndPublicProfile({
      transaction,
      userId,
      userData,
      publicProfileData,
      publicProfileExists: publicProfileSnap.exists,
      publicProfileRef,
      userRef,
      nextStats: resolved.nextStats
    });

    return {
      collectedIds: resolved.collectedIds,
      achievementPoints: resolved.nextStats.achievementPoints
    };
  });

  return result;
});

const __private__ = {
  resolveUnlockedAchievements,
  resolveCollectedAchievements,
  sanitizeAchievementIds
};

module.exports = {
  unlockUserAchievement,
  syncUserAchievements,
  collectUserAchievements,
  __private__
};
