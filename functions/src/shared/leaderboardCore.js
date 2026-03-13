const {
  sanitizeText,
  toMillis,
  getModeDifficulty,
  getLeaderboardBoardId,
  compareLeaderboardEntries,
  WEEKLY_LEADERBOARD_LIMIT
} = require('./utils');

const sanitizePersistedGameForLeaderboard = (functions, game = {}) => {
  const mode = sanitizeText(game.mode || '', 64).toLowerCase();
  if (!['classic', 'classic_transparent', 'vsai', 'multiplayer'].includes(mode)) {
    throw new functions.https.HttpsError('failed-precondition', 'Game session cannot be ranked.');
  }

  const startedAt = toMillis(game.startedAt);
  const endedAt = toMillis(game.endedAt);
  if (!startedAt || !endedAt || endedAt < startedAt) {
    throw new functions.https.HttpsError('failed-precondition', 'Game session timestamps are invalid.');
  }

  return {
    mode,
    difficulty: getModeDifficulty(mode, game.difficulty),
    score: Math.max(0, Math.floor(Number(game.score) || 0)),
    duration: Math.max(0, Math.floor(Number(game.duration) || 0)),
    foodEaten: Math.max(0, Math.floor(Number(game.foodEaten) || 0)),
    speedReached: Math.max(1, Number(game.speedReached) || 1),
    startedAt,
    endedAt
  };
};

const createLeaderboardEntryCore = ({
  functions,
  admin,
  db
}) => async ({ gameDocId, userId }) => {
  const gameRef = db.collection('games').doc(gameDocId);
  const userRef = db.collection('users').doc(userId);
  const publicProfileRef = db.collection('publicProfiles').doc(userId);

  return db.runTransaction(async (transaction) => {
    const gameSnap = await transaction.get(gameRef);
    if (!gameSnap.exists) {
      throw new functions.https.HttpsError('not-found', 'Game session was not found.');
    }

    const gameData = gameSnap.data() || {};
    if ((gameData.userId || null) !== userId) {
      throw new functions.https.HttpsError('permission-denied', 'Cannot rank another user session.');
    }

    const submission = sanitizePersistedGameForLeaderboard(functions, gameData);
    const leaderboardId = getLeaderboardBoardId(submission.mode, submission.difficulty);
    const leaderboardRef = db.collection('leaderboards').doc(leaderboardId);

    const [userSnap, leaderboardSnap, publicProfileSnap] = await Promise.all([
      transaction.get(userRef),
      transaction.get(leaderboardRef),
      transaction.get(publicProfileRef)
    ]);

    const userData = userSnap.exists ? userSnap.data() || {} : {};
    if (userData?.banned === true) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Banned accounts cannot submit leaderboard scores.'
      );
    }

    const currentBoardId = sanitizeText(gameData.leaderboardProcessedBoardId || '', 128);
    const alreadyProcessed = currentBoardId === leaderboardId;
    const profileData = publicProfileSnap.exists ? publicProfileSnap.data() || {} : {};
    const username =
      sanitizeText(
        profileData.username ||
        profileData.displayName ||
        gameData.username ||
        'player',
        64
      ).toLowerCase() || 'player';

    const currentData = leaderboardSnap.exists ? leaderboardSnap.data() || {} : {};
    const currentEntries = Array.isArray(currentData.entries) ? currentData.entries : [];
    const normalizedEntries = currentEntries
      .filter((entry) => entry && typeof entry === 'object')
      .map((entry) => ({
        userId: sanitizeText(entry.userId || '', 128),
        username: sanitizeText(entry.username || '', 64) || 'player',
        score: Math.max(0, Number(entry.score) || 0),
        duration: Math.max(0, Number(entry.duration) || 0),
        foodEaten: Math.max(0, Number(entry.foodEaten) || 0),
        mode: entry.mode || submission.mode,
        difficulty: entry.difficulty ?? submission.difficulty,
        speedReached: Math.max(1, Number(entry.speedReached) || 1),
        timestamp: Math.max(0, Number(entry.timestamp) || Date.now()),
        rank: Math.max(0, Number(entry.rank) || 0)
      }))
      .filter((entry) => entry.userId && entry.username);

    const newEntry = {
      userId,
      username,
      score: submission.score,
      duration: submission.duration,
      foodEaten: submission.foodEaten,
      mode: submission.mode,
      difficulty: submission.difficulty,
      speedReached: submission.speedReached,
      timestamp: submission.endedAt,
      rank: 0
    };

    const existingEntryIndex = normalizedEntries.findIndex((entry) => entry.userId === userId);
    if (existingEntryIndex >= 0) {
      const existingEntry = normalizedEntries[existingEntryIndex];
      const shouldReplace = compareLeaderboardEntries(newEntry, existingEntry) < 0;

      normalizedEntries[existingEntryIndex] = shouldReplace
        ? newEntry
        : {
            ...existingEntry,
            username
          };
    } else {
      normalizedEntries.push(newEntry);
    }

    const topEntries = normalizedEntries
      .sort(compareLeaderboardEntries)
      .slice(0, WEEKLY_LEADERBOARD_LIMIT)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));

    const totalGames = (Number(currentData?.stats?.totalGames) || 0) + (alreadyProcessed ? 0 : 1);

    transaction.set(leaderboardRef, {
      mode: submission.mode,
      difficulty: submission.difficulty,
      entries: topEntries,
      totalEntries: topEntries.length,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      stats: {
        highestScore: topEntries[0]?.score || 0,
        averageScore: topEntries.length
          ? Math.round(topEntries.reduce((sum, entry) => sum + entry.score, 0) / topEntries.length)
          : 0,
        uniquePlayers: topEntries.length,
        totalGames,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      }
    }, { merge: true });

    if (!alreadyProcessed) {
      transaction.set(gameRef, {
        leaderboardProcessedAt: admin.firestore.FieldValue.serverTimestamp(),
        leaderboardProcessedBoardId: leaderboardId
      }, { merge: true });
    }

    return {
      success: true,
      leaderboardId,
      modeRank: topEntries.find((entry) => entry.userId === userId)?.rank || null
    };
  });
};

module.exports = {
  sanitizePersistedGameForLeaderboard,
  createLeaderboardEntryCore
};
