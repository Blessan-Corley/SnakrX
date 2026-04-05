const { functions, admin, db } = require('./runtime');
const {
  WEEKLY_LEADERBOARD_COLLECTION,
  WEEKLY_LEADERBOARD_JOB_COLLECTION,
  WEEKLY_LEADERBOARD_META_DOC,
  WEEKLY_LEADERBOARD_LIMIT,
  WEEKLY_ACHIEVEMENT_RULES,
  sanitizeText,
  toMillis,
  getPreviousWeekWindow,
  isPreviousIsoWeekKey,
  getModeDifficulty,
  getLeaderboardBoardId,
  getWeeklyLeaderboardDocId,
  compareLeaderboardEntries,
  compareOverallEntries,
  normalizeAchievementRecord,
  createWeeklyAchievementUnlock,
  assertAdminUser,
} = require('./shared/utils');
const {
  createLeaderboardEntryCore,
  sanitizePersistedGameForLeaderboard
} = require('./shared/leaderboardCore');
const { logCallableError } = require('./shared/observability');

const aggregateWeeklyLeaderboards = (games = []) => {
  const boardMap = new Map();
  const overallMap = new Map();

  for (const game of games) {
    const userId = sanitizeText(game.userId || '', 128);
    if (!userId) continue;

    const mode = sanitizeText(game.mode || '', 64).toLowerCase();
    if (!['classic', 'classic_transparent', 'vsai', 'multiplayer'].includes(mode)) continue;

    const score = Number(game.score) || 0;
    if (score <= 0) continue;

    const difficulty = getModeDifficulty(mode, game.difficulty);
    const boardId = getLeaderboardBoardId(mode, difficulty);
    const endedAtMs = toMillis(game.endedAt) || Date.now();
    const username =
      sanitizeText(game.username || '', 64).toLowerCase() ||
      'player';

    const candidateEntry = {
      userId,
      username,
      score,
      duration: Number(game.duration) || 0,
      foodEaten: Number(game.foodEaten) || 0,
      speedReached: Number(game.speedReached) || 1,
      timestamp: endedAtMs,
      rank: 0
    };

    if (!boardMap.has(boardId)) {
      boardMap.set(boardId, {
        boardId,
        mode,
        difficulty,
        totalGames: 0,
        entriesByUser: new Map()
      });
    }

    const board = boardMap.get(boardId);
    board.totalGames += 1;

    const currentBest = board.entriesByUser.get(userId);
    if (!currentBest || compareLeaderboardEntries(candidateEntry, currentBest) < 0) {
      board.entriesByUser.set(userId, candidateEntry);
    }

    const overallCurrent = overallMap.get(userId);
    if (!overallCurrent) {
      overallMap.set(userId, {
        userId,
        username,
        score,
        duration: Number(game.duration) || 0,
        foodEaten: Number(game.foodEaten) || 0,
        speedReached: Number(game.speedReached) || 1,
        gamesPlayed: 1,
        timestamp: endedAtMs,
        rank: 0
      });
      continue;
    }

    overallCurrent.score += score;
    overallCurrent.duration += Number(game.duration) || 0;
    overallCurrent.foodEaten += Number(game.foodEaten) || 0;
    overallCurrent.speedReached = Math.max(overallCurrent.speedReached || 1, Number(game.speedReached) || 1);
    overallCurrent.gamesPlayed += 1;
    overallCurrent.timestamp = Math.min(overallCurrent.timestamp || endedAtMs, endedAtMs);
    if (!overallCurrent.username && username) {
      overallCurrent.username = username;
    }
  }

  const boards = Array.from(boardMap.values()).map((board) => {
    const entries = Array.from(board.entriesByUser.values())
      .sort(compareLeaderboardEntries)
      .slice(0, WEEKLY_LEADERBOARD_LIMIT)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));

    const highestScore = entries[0]?.score || 0;
    const averageScore = entries.length
      ? Math.round(entries.reduce((sum, entry) => sum + (entry.score || 0), 0) / entries.length)
      : 0;

    return {
      ...board,
      entries,
      stats: {
        highestScore,
        averageScore,
        uniquePlayers: entries.length,
        totalGames: board.totalGames
      }
    };
  });

  const overallEntries = Array.from(overallMap.values())
    .sort(compareOverallEntries)
    .slice(0, WEEKLY_LEADERBOARD_LIMIT)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));

  const overallStats = {
    highestScore: overallEntries[0]?.score || 0,
    averageScore: overallEntries.length
      ? Math.round(overallEntries.reduce((sum, entry) => sum + (entry.score || 0), 0) / overallEntries.length)
      : 0,
    uniquePlayers: overallEntries.length,
    totalGames: games.length
  };

  return {
    boards,
    overallEntries,
    overallStats
  };
};

const buildWeeklyUserUpdateMap = (boards, overallEntries) => {
  const updates = new Map();
  const overallPodiumUsers = new Set();

  const ensureUser = (userId) => {
    if (!updates.has(userId)) {
      updates.set(userId, {
        weeklyLeaderboardTop100Finishes: 0,
        weeklyLeaderboardTop10Finishes: 0,
        weeklyLeaderboardTop3Finishes: 0,
        weeklyLeaderboardRank1Finishes: 0,
        weeklyOverallTop10Finishes: 0
      });
    }
    return updates.get(userId);
  };

  for (const board of boards) {
    for (const entry of board.entries || []) {
      const bucket = ensureUser(entry.userId);
      if (entry.rank <= 100) bucket.weeklyLeaderboardTop100Finishes += 1;
      if (entry.rank <= 10) bucket.weeklyLeaderboardTop10Finishes += 1;
      if (entry.rank <= 3) bucket.weeklyLeaderboardTop3Finishes += 1;
      if (entry.rank === 1) bucket.weeklyLeaderboardRank1Finishes += 1;
    }
  }

  for (const entry of overallEntries || []) {
    const bucket = ensureUser(entry.userId);
    if (entry.rank <= 10) bucket.weeklyOverallTop10Finishes += 1;
    if (entry.rank <= 3) overallPodiumUsers.add(entry.userId);
  }

  return { updates, overallPodiumUsers };
};

const applyWeeklyUserStats = async ({ weekKey, updates, overallPodiumUsers, generatedAtMs }) => {
  const userIds = [...new Set([...updates.keys(), ...overallPodiumUsers])];
  if (!userIds.length) {
    return { updatedUsers: 0, unlockedAchievements: 0 };
  }

  let updatedUsers = 0;
  let unlockedAchievements = 0;
  const chunkSize = 350;

  for (let index = 0; index < userIds.length; index += chunkSize) {
    const batchIds = userIds.slice(index, index + chunkSize);
    const snapshots = await Promise.all(
      batchIds.map((userId) => db.collection('users').doc(userId).get())
    );

    const batch = db.batch();
    let chunkWrites = 0;

    for (const userSnap of snapshots) {
      if (!userSnap.exists) continue;

      const userId = userSnap.id;
      const data = userSnap.data() || {};
      const stats = data.stats || {};

      if (stats.weeklyLastProcessedWeekKey === weekKey) {
        continue;
      }

      const rankUpdate = updates.get(userId) || {
        weeklyLeaderboardTop100Finishes: 0,
        weeklyLeaderboardTop10Finishes: 0,
        weeklyLeaderboardTop3Finishes: 0,
        weeklyLeaderboardRank1Finishes: 0,
        weeklyOverallTop10Finishes: 0
      };

      const nextStats = {
        weeklyLeaderboardTop100Finishes: (Number(stats.weeklyLeaderboardTop100Finishes) || 0) + rankUpdate.weeklyLeaderboardTop100Finishes,
        weeklyLeaderboardTop10Finishes: (Number(stats.weeklyLeaderboardTop10Finishes) || 0) + rankUpdate.weeklyLeaderboardTop10Finishes,
        weeklyLeaderboardTop3Finishes: (Number(stats.weeklyLeaderboardTop3Finishes) || 0) + rankUpdate.weeklyLeaderboardTop3Finishes,
        weeklyLeaderboardRank1Finishes: (Number(stats.weeklyLeaderboardRank1Finishes) || 0) + rankUpdate.weeklyLeaderboardRank1Finishes,
        weeklyOverallTop10Finishes: (Number(stats.weeklyOverallTop10Finishes) || 0) + rankUpdate.weeklyOverallTop10Finishes,
        weeklyTop3WeekStreak: Number(stats.weeklyTop3WeekStreak) || 0,
        weeklyTop3BestWeekStreak: Number(stats.weeklyTop3BestWeekStreak) || 0,
        weeklyTop3LastWeekKey: stats.weeklyTop3LastWeekKey || null
      };

      if (overallPodiumUsers.has(userId)) {
        const previousTop3WeekKey = stats.weeklyTop3LastWeekKey || null;
        const nextStreak = isPreviousIsoWeekKey(previousTop3WeekKey, weekKey)
          ? (Number(stats.weeklyTop3WeekStreak) || 0) + 1
          : 1;
        nextStats.weeklyTop3WeekStreak = nextStreak;
        nextStats.weeklyTop3BestWeekStreak = Math.max(
          Number(stats.weeklyTop3BestWeekStreak) || 0,
          nextStreak
        );
        nextStats.weeklyTop3LastWeekKey = weekKey;
      }

      const normalizedAchievements = (Array.isArray(stats.achievements) ? stats.achievements : [])
        .map(normalizeAchievementRecord)
        .filter(Boolean);
      const existingAchievementIds = new Set(normalizedAchievements.map((achievement) => achievement.id));

      for (const rule of WEEKLY_ACHIEVEMENT_RULES) {
        const currentValue = Number(nextStats[rule.statKey]) || 0;
        if (currentValue >= rule.target && !existingAchievementIds.has(rule.id)) {
          normalizedAchievements.push(createWeeklyAchievementUnlock(rule.id, rule.points, generatedAtMs));
          existingAchievementIds.add(rule.id);
          unlockedAchievements += 1;
        }
      }

      const updatePayload = {
        'stats.weeklyLeaderboardTop100Finishes': nextStats.weeklyLeaderboardTop100Finishes,
        'stats.weeklyLeaderboardTop10Finishes': nextStats.weeklyLeaderboardTop10Finishes,
        'stats.weeklyLeaderboardTop3Finishes': nextStats.weeklyLeaderboardTop3Finishes,
        'stats.weeklyLeaderboardRank1Finishes': nextStats.weeklyLeaderboardRank1Finishes,
        'stats.weeklyOverallTop10Finishes': nextStats.weeklyOverallTop10Finishes,
        'stats.weeklyTop3WeekStreak': nextStats.weeklyTop3WeekStreak,
        'stats.weeklyTop3BestWeekStreak': nextStats.weeklyTop3BestWeekStreak,
        'stats.weeklyTop3LastWeekKey': nextStats.weeklyTop3LastWeekKey,
        'stats.weeklyLastProcessedWeekKey': weekKey,
        'stats.achievements': normalizedAchievements,
        'stats.achievementsCompleted': normalizedAchievements.length,
        'stats.updatedAt': admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      batch.update(userSnap.ref, updatePayload);
      updatedUsers += 1;
      chunkWrites += 1;
    }

    if (chunkWrites > 0) {
      await batch.commit();
    }
  }

  return { updatedUsers, unlockedAchievements };
};

const writeWeeklyLeaderboards = async ({
  weekKey,
  startTimestamp,
  endTimestamp,
  boards,
  overallEntries,
  overallStats,
  summary
}) => {
  const batch = db.batch();
  const generatedAt = admin.firestore.FieldValue.serverTimestamp();

  for (const board of boards) {
    const docId = getWeeklyLeaderboardDocId(board.mode, board.difficulty, weekKey);
    const ref = db.collection(WEEKLY_LEADERBOARD_COLLECTION).doc(docId);
    batch.set(ref, {
      boardId: board.boardId,
      mode: board.mode,
      difficulty: board.difficulty || null,
      weekKey,
      weekStart: startTimestamp,
      weekEnd: endTimestamp,
      entries: board.entries,
      totalEntries: board.entries.length,
      stats: board.stats,
      generatedAt,
      source: 'weekly-aggregator-v1'
    }, { merge: true });
  }

  const overallRef = db.collection(WEEKLY_LEADERBOARD_COLLECTION)
    .doc(getWeeklyLeaderboardDocId('overall', null, weekKey));
  batch.set(overallRef, {
    boardId: getLeaderboardBoardId('overall', null),
    mode: 'overall',
    difficulty: null,
    weekKey,
    weekStart: startTimestamp,
    weekEnd: endTimestamp,
    entries: overallEntries,
    totalEntries: overallEntries.length,
    stats: overallStats,
    generatedAt,
    source: 'weekly-aggregator-v1'
  }, { merge: true });

  const metaRef = db.collection(WEEKLY_LEADERBOARD_COLLECTION).doc(WEEKLY_LEADERBOARD_META_DOC);
  batch.set(metaRef, {
    latestCompletedWeekKey: weekKey,
    latestUpdatedAt: generatedAt,
    latestSummary: summary
  }, { merge: true });

  await batch.commit();
};

const processPreviousWeeklyLeaderboards = async ({ force = false } = {}) => {
  const previousWeek = getPreviousWeekWindow(new Date());
  const { weekKey, startTimestamp, endTimestamp } = previousWeek;
  const jobRef = db.collection(WEEKLY_LEADERBOARD_JOB_COLLECTION).doc(weekKey);

  const canProcess = await db.runTransaction(async (transaction) => {
    const jobSnap = await transaction.get(jobRef);
    const existingStatus = jobSnap.exists ? jobSnap.data()?.status : null;
    if (!force && existingStatus === 'completed') {
      return false;
    }

    transaction.set(jobRef, {
      weekKey,
      status: 'running',
      startedAt: admin.firestore.FieldValue.serverTimestamp(),
      force: !!force
    }, { merge: true });
    return true;
  });

  if (!canProcess) {
    return { skipped: true, reason: 'already-completed', weekKey };
  }

  try {
    const gamesSnap = await db.collection('games')
      .where('endedAt', '>=', startTimestamp)
      .where('endedAt', '<', endTimestamp)
      .get();

    const games = gamesSnap.docs.map((docSnap) => docSnap.data() || {});
    const { boards, overallEntries, overallStats } = aggregateWeeklyLeaderboards(games);
    const { updates, overallPodiumUsers } = buildWeeklyUserUpdateMap(boards, overallEntries);

    const generatedAtMs = Date.now();
    const userUpdateResult = await applyWeeklyUserStats({
      weekKey,
      updates,
      overallPodiumUsers,
      generatedAtMs
    });

    const summary = {
      weekKey,
      boardCount: boards.length + 1,
      totalGames: games.length,
      totalUsersRanked: updates.size,
      updatedUsers: userUpdateResult.updatedUsers,
      unlockedAchievements: userUpdateResult.unlockedAchievements
    };

    await writeWeeklyLeaderboards({
      weekKey,
      startTimestamp,
      endTimestamp,
      boards,
      overallEntries,
      overallStats,
      summary
    });

    await jobRef.set({
      status: 'completed',
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
      summary
    }, { merge: true });

    return summary;
  } catch (error) {
    await jobRef.set({
      status: 'failed',
      failedAt: admin.firestore.FieldValue.serverTimestamp(),
      error: sanitizeText(error?.message || 'unknown-error', 800)
    }, { merge: true });
    throw error;
  }
};

const assertLeaderboardUpsertPreconditions = (runtimeFunctions, preflightGameSnap, userId) => {
  if (!preflightGameSnap?.exists) {
    throw new runtimeFunctions.https.HttpsError('not-found', 'Game session was not found.');
  }

  const preflightGameData = preflightGameSnap.data() || {};
  if ((preflightGameData.userId || null) !== userId) {
    throw new runtimeFunctions.https.HttpsError('permission-denied', 'Cannot rank another user session.');
  }

  return preflightGameData;
};

const upsertLeaderboardEntryCore = createLeaderboardEntryCore({
  functions,
  admin,
  db
});

const upsertLeaderboardEntryForGame = async ({ userId, gameDocId }) => {
  if (!gameDocId) {
    throw new functions.https.HttpsError('invalid-argument', 'Game id is required.');
  }

  const gameRef = db.collection('games').doc(gameDocId);

  try {
    const preflightGameSnap = await gameRef.get();
    const preflightGameData = assertLeaderboardUpsertPreconditions(
      functions,
      preflightGameSnap,
      userId
    );

    sanitizePersistedGameForLeaderboard(functions, preflightGameData);
    return upsertLeaderboardEntryCore({ userId, gameDocId });
  } catch (error) {
    logCallableError('upsertLeaderboardEntry', error, {
      gameId: gameDocId,
      uid: userId
    });
    throw error;
  }
};

const upsertLeaderboardEntry = functions.https.onCall(async (data, context) => {
  if (!context.auth?.uid) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required.');
  }

  const userId = context.auth.uid;
  const gameDocId = sanitizeText(data?.gameId || '', 128);
  return upsertLeaderboardEntryForGame({ userId, gameDocId });
});

const generatePreviousWeeklyLeaderboards = functions.https.onCall(async (data, context) => {
  await assertAdminUser(context);
  const force = Boolean(data?.force);
  return processPreviousWeeklyLeaderboards({ force });
});

const generateWeeklyLeaderboards = functions.pubsub
  .schedule('every monday 00:20')
  .timeZone('UTC')
  .onRun(async () => {
    try {
      const result = await processPreviousWeeklyLeaderboards({ force: false });
      functions.logger.info('Weekly leaderboard generation completed', result);
    } catch (error) {
      functions.logger.error('Weekly leaderboard generation failed', error);
      throw error;
    }
    return null;
  });

module.exports = {
  upsertLeaderboardEntry,
  generatePreviousWeeklyLeaderboards,
  generateWeeklyLeaderboards,
  __private__: {
    aggregateWeeklyLeaderboards,
    buildWeeklyUserUpdateMap,
    applyWeeklyUserStats,
    writeWeeklyLeaderboards,
    processPreviousWeeklyLeaderboards,
    assertLeaderboardUpsertPreconditions,
    sanitizePersistedGameForLeaderboard,
    upsertLeaderboardEntryForGame
  }
};
