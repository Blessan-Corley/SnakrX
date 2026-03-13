const { functions, admin, db } = require('./runtime');
const { assertAdminUser, sanitizeText, toMillis } = require('./shared/utils');

const clampLimit = (value, fallback = 50, max = 200) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.min(max, Math.floor(parsed)));
};

const mapAdminUser = (docSnap) => {
  const data = docSnap.data() || {};
  const stats = data.stats || {};

  return {
    id: docSnap.id,
    username: sanitizeText(data.username || '', 64) || null,
    displayName: sanitizeText(data.displayName || '', 120) || null,
    email: sanitizeText(data.email || '', 160) || null,
    role: sanitizeText(data.role || 'player', 32) || 'player',
    banned: data.banned === true,
    banReason: sanitizeText(data.banReason || '', 200) || null,
    createdAt: toMillis(data.createdAt) || null,
    lastActiveAt: toMillis(data.lastActiveAt) || null,
    bannedAt: toMillis(data.bannedAt) || null,
    unbannedAt: toMillis(data.unbannedAt) || null,
    stats: {
      bestScore: Number(stats.bestScore) || 0,
      totalGames: Number(stats.totalGames) || 0,
      totalScore: Number(stats.totalScore) || 0,
      achievementPoints: Number(stats.achievementPoints) || 0,
      achievementsCompleted: Array.isArray(stats.achievements)
        ? stats.achievements.length
        : Number(stats.achievementsCompleted) || 0
    }
  };
};

const mapAdminGame = (docSnap) => {
  const data = docSnap.data() || {};
  return {
    id: docSnap.id,
    userId: sanitizeText(data.userId || '', 128) || null,
    username: sanitizeText(data.username || '', 64) || 'player',
    mode: sanitizeText(data.mode || '', 64) || 'classic',
    difficulty: data.difficulty == null ? null : sanitizeText(data.difficulty, 32),
    playerCount: Math.max(1, Number(data.playerCount) || 1),
    score: Math.max(0, Number(data.score) || 0),
    duration: Math.max(0, Number(data.duration) || 0),
    foodEaten: Math.max(0, Number(data.foodEaten) || 0),
    speedReached: Math.max(1, Number(data.speedReached) || 1),
    result: sanitizeText(data.result || 'completed', 32) || 'completed',
    createdAt: toMillis(data.createdAt) || null,
    startedAt: toMillis(data.startedAt) || null,
    endedAt: toMillis(data.endedAt) || null
  };
};

const listAdminUsers = functions.https.onCall(async (data, context) => {
  await assertAdminUser(context);

  const limitCount = clampLimit(data?.limit, 100, 200);
  const snapshot = await db.collection('users')
    .orderBy('createdAt', 'desc')
    .limit(limitCount)
    .get();

  return {
    users: snapshot.docs.map(mapAdminUser)
  };
});

const listAdminGames = functions.https.onCall(async (data, context) => {
  await assertAdminUser(context);

  const limitCount = clampLimit(data?.limit, 50, 100);
  const snapshot = await db.collection('games')
    .orderBy('createdAt', 'desc')
    .limit(limitCount)
    .get();

  return {
    games: snapshot.docs.map(mapAdminGame)
  };
});

const setUserBanState = functions.https.onCall(async (data, context) => {
  await assertAdminUser(context);

  const userId = sanitizeText(data?.userId || '', 128);
  const banned = Boolean(data?.banned);
  const banReason = sanitizeText(data?.banReason || '', 200) || 'Administrative action';

  if (!userId) {
    throw new functions.https.HttpsError('invalid-argument', 'User id is required.');
  }

  const userRef = db.collection('users').doc(userId);
  const now = admin.firestore.FieldValue.serverTimestamp();

  const updatedUser = await db.runTransaction(async (transaction) => {
    const userSnap = await transaction.get(userRef);
    if (!userSnap.exists) {
      throw new functions.https.HttpsError('not-found', 'User was not found.');
    }

    const currentData = userSnap.data() || {};
    const updatePayload = banned
      ? {
          banned: true,
          banReason,
          bannedAt: now,
          bannedBy: context.auth.uid,
          unbannedAt: null,
          unbannedBy: null,
          updatedAt: now
        }
      : {
          banned: false,
          banReason: null,
          bannedAt: null,
          bannedBy: null,
          unbannedAt: now,
          unbannedBy: context.auth.uid,
          updatedAt: now
        };

    transaction.set(userRef, updatePayload, { merge: true });
    return {
      ...currentData,
      ...updatePayload,
      id: userSnap.id,
      banned
    };
  });

  return {
    user: {
      id: updatedUser.id,
      banned: updatedUser.banned === true,
      banReason: updatedUser.banReason || null
    }
  };
});

const __private__ = {
  clampLimit,
  mapAdminUser,
  mapAdminGame
};

module.exports = {
  listAdminUsers,
  listAdminGames,
  setUserBanState,
  __private__
};

