import { documentId } from 'firebase/firestore';
import {
  COLLECTIONS,
  collection,
  db,
  getDocs,
  query,
  where
} from './config.js';
import logger from '../../utils/logger.js';

export const normalizeTimestampValue = (value) => {
  if (!value) return Date.now();

  if (typeof value?.toDate === 'function') {
    const date = value.toDate();
    return Number.isNaN(date.getTime()) ? Date.now() : date.getTime();
  }

  if (typeof value?.seconds === 'number') {
    return value.seconds * 1000;
  }

  if (typeof value === 'number') return value;

  if (typeof value === 'string') {
    const parsed = new Date(value).getTime();
    return Number.isNaN(parsed) ? Date.now() : parsed;
  }

  return Date.now();
};

export const getIsoWeekParts = (date = new Date()) => {
  const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNumber = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayNumber);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((utcDate - yearStart) / 86400000) + 1) / 7);

  return {
    year: utcDate.getUTCFullYear(),
    week
  };
};

export const getIsoWeekKey = (date = new Date()) => {
  const { year, week } = getIsoWeekParts(date);
  return `${year}-W${String(week).padStart(2, '0')}`;
};

export const getPreviousWeekKey = (referenceDate = new Date()) => {
  const previousWeekDate = new Date(Date.UTC(
    referenceDate.getUTCFullYear(),
    referenceDate.getUTCMonth(),
    referenceDate.getUTCDate()
  ));
  previousWeekDate.setUTCDate(previousWeekDate.getUTCDate() - 7);
  return getIsoWeekKey(previousWeekDate);
};

export const getWeeklyLeaderboardId = (mode, difficulty, weekKey) =>
  `${mode}_${difficulty || 'default'}_${weekKey}`;

export const sortAchievementEntries = (entries) =>
  entries.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.achievementsCompleted !== a.achievementsCompleted) {
      return b.achievementsCompleted - a.achievementsCompleted;
    }
    if (a.timestamp !== b.timestamp) return a.timestamp - b.timestamp;
    return a.username.localeCompare(b.username);
  });

const chunkArray = (items, chunkSize) => {
  const chunks = [];
  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize));
  }
  return chunks;
};

export const attachPublicProfileMetadata = async (entries = []) => {
  if (!Array.isArray(entries) || entries.length === 0) {
    return [];
  }

  try {
    const uniqueUserIds = [...new Set(entries.map((entry) => entry?.userId).filter(Boolean))];
    if (!uniqueUserIds.length) return entries;

    const profileMap = new Map();
    const idChunks = chunkArray(uniqueUserIds, 10);

    for (const ids of idChunks) {
      const profileQuery = query(
        collection(db, COLLECTIONS.PUBLIC_PROFILES),
        where(documentId(), 'in', ids)
      );
      const snapshot = await getDocs(profileQuery);
      snapshot.forEach((docSnap) => {
        profileMap.set(docSnap.id, docSnap.data() || {});
      });
    }

    return entries.map((entry) => {
      const profile = profileMap.get(entry.userId) || {};
      return {
        ...entry,
        displayName: profile.displayName || entry.displayName || entry.username || 'Unknown Player',
        username: profile.username || entry.username || 'unknown',
        avatar: profile.avatar || null,
        isPrivateLeaderboard: profile.isPrivateLeaderboard === true
      };
    });
  } catch (error) {
    logger.warn('Unable to attach public profile metadata to leaderboard entries:', error);
    return entries;
  }
};
