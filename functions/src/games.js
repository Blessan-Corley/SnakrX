const { functions, admin, crypto, db } = require('./runtime');
const { sanitizeText, toMillis } = require('./shared/utils');
const {
  buildStatUpdatesFromSession,
  resolveGameXpGain
} = require('./shared/gameFinalization');
const { buildPublicProfilePayload } = require('./shared/publicProfilePayload');
const { createLeaderboardEntryCore } = require('./shared/leaderboardCore');
const { applyStatUpdates, buildLeaderboardRankUpdates } = require('./shared/gameStats');
const { unlockEligibleAchievements } = require('./shared/achievementCatalog');

const clampLimit = (value, fallback = 8, max = 12) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.min(max, Math.floor(parsed)));
};

const MAX_GAME_SCORE = 1000000;
const MAX_GAME_DURATION = 86400;
const MAX_FOOD_EATEN = 100000;
const MAX_SPEED_REACHED = 100;
const VALID_GAME_MODES = new Set(['classic', 'classic_transparent', 'vsai', 'multiplayer']);
const VALID_GAME_RESULTS = new Set(['completed', 'won', 'lost', 'quit', 'victory', 'defeat']);
const VALID_AI_DIFFICULTIES = new Set(['easy', 'medium', 'impossible']);
const upsertLeaderboardEntryCore = createLeaderboardEntryCore({
  functions,
  admin,
  db
});

const getGameDocumentId = (userId, gameId) => {
  const hash = crypto.createHash('sha256')
    .update(`${userId}:${gameId}`)
    .digest('hex')
    .slice(0, 40);

  return `game_${hash}`;
};

const normalizePlayerScores = (playerScores = []) => {
  if (!Array.isArray(playerScores)) return [];
  return playerScores
    .slice(0, 4)
    .map((score) => Math.max(0, Math.floor(Number(score) || 0)));
};

const normalizeSessionPayload = (payload = {}, userId) => {
  const gameId = sanitizeText(payload.gameId || '', 128);
  const mode = sanitizeText(payload.mode || '', 64).toLowerCase();
  const difficulty = payload.difficulty == null
    ? null
    : sanitizeText(payload.difficulty || '', 32).toLowerCase();
  const result = sanitizeText(payload.result || 'completed', 32).toLowerCase();
  const duration = Math.max(0, Math.floor(Number(payload.duration) || 0));
  const score = Math.max(0, Math.floor(Number(payload.score) || 0));
  const foodEaten = Math.max(0, Math.floor(Number(payload.foodEaten) || 0));
  const speedReached = Math.max(1, Number(payload.speedReached) || 1);
  const playerCount = Math.max(1, Math.min(4, Math.floor(Number(payload.playerCount) || 1)));
  const startedAt = Math.max(0, toMillis(payload.startedAt));
  const endedAt = Math.max(0, toMillis(payload.endedAt));

  if (!gameId) {
    throw new functions.https.HttpsError('invalid-argument', 'Game id is required.');
  }

  if (!VALID_GAME_MODES.has(mode)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid game mode.');
  }

  if ((mode === 'vsai' && !VALID_AI_DIFFICULTIES.has(difficulty)) || (mode !== 'vsai' && difficulty !== null)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid game difficulty.');
  }

  if (!VALID_GAME_RESULTS.has(result)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid game result.');
  }

  if (score > MAX_GAME_SCORE || duration > MAX_GAME_DURATION || foodEaten > MAX_FOOD_EATEN || speedReached > MAX_SPEED_REACHED) {
    throw new functions.https.HttpsError('invalid-argument', 'Game payload exceeds allowed limits.');
  }

  if (!startedAt || !endedAt || endedAt < startedAt) {
    throw new functions.https.HttpsError('invalid-argument', 'Game timestamps are invalid.');
  }

  const stats = payload.stats && typeof payload.stats === 'object' ? payload.stats : {};

  return {
    gameId,
    userId,
    mode,
    difficulty,
    playerCount,
    score,
    aiScore: payload.aiScore == null ? null : Math.max(0, Math.floor(Number(payload.aiScore) || 0)),
    duration,
    foodEaten,
    speedReached,
    result,
    maxLength: Math.max(1, Math.floor(Number(payload.maxLength) || 1)),
    playerScores: normalizePlayerScores(payload.playerScores),
    stats: {
      moves: Math.max(0, Math.floor(Number(stats.moves) || 0)),
      wallHits: Math.max(0, Math.floor(Number(stats.wallHits) || 0)),
      selfHits: Math.max(0, Math.floor(Number(stats.selfHits) || 0)),
      closeCalls: Math.max(0, Math.floor(Number(stats.closeCalls) || 0)),
      fastEats: Math.max(0, Math.floor(Number(stats.fastEats) || 0)),
      bonusFoodsSpawned: Math.max(0, Math.floor(Number(stats.bonusFoodsSpawned) || 0)),
      bonusFoodsCollected: Math.max(0, Math.floor(Number(stats.bonusFoodsCollected) || 0)),
      bonusFoodPoints: Math.max(0, Math.floor(Number(stats.bonusFoodPoints) || 0)),
      maxLength: Math.max(1, Math.floor(Number(stats.maxLength) || Number(payload.maxLength) || 1)),
      averageSpeed: Math.max(1, Number(stats.averageSpeed) || speedReached),
      efficiency: Math.max(0, Number(stats.efficiency) || 0),
      timeToFirstFood: Math.max(0, Math.floor(Number(stats.timeToFirstFood) || 0)),
      timeToMaxLength: Math.max(0, Math.floor(Number(stats.timeToMaxLength) || 0))
    },
    startedAt: admin.firestore.Timestamp.fromMillis(startedAt),
    endedAt: admin.firestore.Timestamp.fromMillis(endedAt)
  };
};


const mapPublicGame = (docSnap) => {
  const data = docSnap.data() || {};
  return {
    id: docSnap.id,
    mode: sanitizeText(data.mode || '', 64) || 'classic',
    difficulty: data.difficulty == null ? null : sanitizeText(data.difficulty, 32),
    score: Math.max(0, Number(data.score) || 0),
    duration: Math.max(0, Number(data.duration) || 0),
    foodEaten: Math.max(0, Number(data.foodEaten) || 0),
    xpGained: resolveGameXpGain({
      xpGained: data.xpGained,
      mode: data.mode,
      difficulty: data.difficulty,
      duration: data.duration,
      foodEaten: data.foodEaten,
      score: data.score,
      result: data.result
    }),
    result: sanitizeText(data.result || 'completed', 32) || 'completed',
    endedAt: toMillis(data.endedAt) || null
  };
};

const applyLeaderboardRankProgress = async ({ gameDocId, modeRank, userId }) => {
  if (!modeRank) {
    return {
      applied: false,
      statsSnapshot: null,
      unlockedAchievementIds: []
    };
  }

  const gameRef = db.collection('games').doc(gameDocId);
  const userRef = db.collection('users').doc(userId);
  const publicProfileRef = db.collection('publicProfiles').doc(userId);

  return db.runTransaction(async (transaction) => {
    const [gameSnap, userSnap, publicProfileSnap] = await Promise.all([
      transaction.get(gameRef),
      transaction.get(userRef),
      transaction.get(publicProfileRef)
    ]);

    if (!gameSnap.exists || !userSnap.exists) {
      return {
        applied: false,
        statsSnapshot: null,
        unlockedAchievementIds: []
      };
    }

    const gameData = gameSnap.data() || {};
    if (gameData.leaderboardStatsAppliedAt) {
      return {
        applied: false,
        statsSnapshot: userSnap.data()?.stats || {},
        unlockedAchievementIds: []
      };
    }

    const userData = userSnap.data() || {};
    const currentStats = userData.stats || {};
    const rankUpdates = buildLeaderboardRankUpdates({
      modeRank,
      achievementRank: null,
      overallRank: null,
      predictedStatsForAchievements: currentStats,
      currentDate: new Date()
    });

    if (!Object.keys(rankUpdates).length) {
      transaction.set(gameRef, {
        leaderboardStatsAppliedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      return {
        applied: false,
        statsSnapshot: currentStats,
        unlockedAchievementIds: []
      };
    }

    const nextStats = applyStatUpdates(currentStats, rankUpdates);
    const unlocked = unlockEligibleAchievements({
      achievements: nextStats.achievements || currentStats.achievements || [],
      sourceStats: nextStats
    });
    nextStats.achievements = unlocked.achievements;

    transaction.set(userRef, {
      stats: nextStats,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastActiveAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    const publicProfileData = publicProfileSnap.exists ? publicProfileSnap.data() || {} : {};
    transaction.set(
      publicProfileRef,
      {
        ...buildPublicProfilePayload({ userId, userData, nextStats, publicProfileData: publicProfileData }),
        createdAt: publicProfileSnap.exists
          ? (publicProfileData.createdAt || admin.firestore.FieldValue.serverTimestamp())
          : admin.firestore.FieldValue.serverTimestamp()
      },
      { merge: true }
    );

    transaction.set(gameRef, {
      leaderboardStatsAppliedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    return {
      applied: true,
      statsSnapshot: nextStats,
      unlockedAchievementIds: unlocked.newlyUnlockedIds
    };
  });
};

const finalizeGameSession = functions.https.onCall(async (data, context) => {
  const userId = context.auth?.uid;
  if (!userId) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required.');
  }

  const session = normalizeSessionPayload(data?.session || data, userId);
  const userRef = db.collection('users').doc(userId);
  const publicProfileRef = db.collection('publicProfiles').doc(userId);
  const gameDocId = getGameDocumentId(userId, session.gameId);
  const gameRef = db.collection('games').doc(gameDocId);

  const transactionResult = await db.runTransaction(async (transaction) => {
    const [userSnap, publicProfileSnap, gameSnap] = await Promise.all([
      transaction.get(userRef),
      transaction.get(publicProfileRef),
      transaction.get(gameRef)
    ]);

    if (!userSnap.exists) {
      throw new functions.https.HttpsError('failed-precondition', 'User profile is missing.');
    }

    const userData = userSnap.data() || {};
    const publicProfileData = publicProfileSnap.exists ? publicProfileSnap.data() || {} : {};
    if (userData.banned === true) {
      throw new functions.https.HttpsError('permission-denied', 'Banned users cannot finalize game sessions.');
    }

    if (gameSnap.exists) {
      return {
        alreadyFinalized: true,
        gameDocId,
        statsSnapshot: userData.stats || {},
        leaderboardEligible: (Number(gameSnap.data()?.score) || 0) > 0
      };
    }

    const { nextStats, xpGain } = buildStatUpdatesFromSession({
      sessionData: {
        ...session,
        startedAt: toMillis(session.startedAt),
        endedAt: toMillis(session.endedAt)
      },
      previousStats: userData.stats || {},
      now: toMillis(session.endedAt)
    });
    const unlocked = unlockEligibleAchievements({
      achievements: (userData.stats || {}).achievements || [],
      sourceStats: nextStats,
      now: toMillis(session.endedAt)
    });
    nextStats.achievements = unlocked.achievements;

    const gameDocument = {
      ...session,
      userId,
      username: sanitizeText(userData.username || userData.displayName || 'player', 64) || 'player',
      xpGained: xpGain,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      finalizedAt: admin.firestore.FieldValue.serverTimestamp(),
      sourceGameId: session.gameId
    };

    transaction.set(gameRef, gameDocument, { merge: false });
    transaction.set(userRef, {
      stats: nextStats,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastActiveAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLoginAt: userData.lastLoginAt || admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    transaction.set(
      publicProfileRef,
      {
        ...buildPublicProfilePayload({ userId, userData, nextStats, publicProfileData: publicProfileData }),
        createdAt: publicProfileSnap.exists
          ? (publicProfileSnap.data()?.createdAt || admin.firestore.FieldValue.serverTimestamp())
          : admin.firestore.FieldValue.serverTimestamp()
      },
      { merge: true }
    );

    return {
      alreadyFinalized: false,
      gameDocId,
      statsSnapshot: nextStats,
      leaderboardEligible: session.score > 0,
      unlockedAchievementIds: unlocked.newlyUnlockedIds
    };
  });

  let leaderboard = {
    updated: false,
    boardId: null,
    modeRank: null
  };
  let unlockedAchievementIds = transactionResult.unlockedAchievementIds || [];
  let statsSnapshot = transactionResult.statsSnapshot;
  if (transactionResult.leaderboardEligible) {
    try {
      const response = await upsertLeaderboardEntryCore({
        userId,
        gameDocId: transactionResult.gameDocId
      });
      leaderboard = {
        updated: response?.success === true,
        boardId: response?.leaderboardId || null,
        modeRank: Number.isFinite(response?.modeRank) ? response.modeRank : null
      };
      if (leaderboard.updated && leaderboard.modeRank) {
        const rankResult = await applyLeaderboardRankProgress({
          gameDocId: transactionResult.gameDocId,
          modeRank: leaderboard.modeRank,
          userId
        });
        if (rankResult?.statsSnapshot) {
          statsSnapshot = rankResult.statsSnapshot;
        }
        if (rankResult?.unlockedAchievementIds?.length) {
          unlockedAchievementIds = [...new Set([
            ...unlockedAchievementIds,
            ...rankResult.unlockedAchievementIds
          ])];
        }
      }
    } catch (error) {
      functions.logger.warn('finalizeGameSession leaderboard update failed', {
        userId,
        gameDocId: transactionResult.gameDocId,
        message: error?.message || 'unknown'
      });
    }
  }

  return {
    success: true,
    alreadyFinalized: transactionResult.alreadyFinalized,
    gameId: transactionResult.gameDocId,
    statsSnapshot,
    unlockedAchievementIds,
    leaderboard
  };
});

const getPublicRecentGames = functions.https.onCall(async (data) => {
  const userId = sanitizeText(data?.userId || '', 128);
  const limitCount = clampLimit(data?.limit);

  if (!userId) {
    throw new functions.https.HttpsError('invalid-argument', 'User id is required.');
  }

  const profileSnap = await db.collection('publicProfiles').doc(userId).get();
  if (!profileSnap.exists) {
    return { games: [] };
  }

  const profileData = profileSnap.data() || {};
  if (profileData?.preferences?.hideMatchHistory === true) {
    return { games: [] };
  }

  const snapshot = await db.collection('games')
    .where('userId', '==', userId)
    .orderBy('endedAt', 'desc')
    .limit(limitCount)
    .get();

  return {
    games: snapshot.docs.map(mapPublicGame)
  };
});

const __private__ = {
  clampLimit,
  getGameDocumentId,
  normalizeSessionPayload,
  mapPublicGame
};

module.exports = {
  finalizeGameSession,
  getPublicRecentGames,
  __private__
};




