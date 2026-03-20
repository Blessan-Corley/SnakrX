import {
  COLLECTIONS,
  collection,
  db,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where
} from '../config.js';
import logger from '../../../utils/logger.js';
import { getRelationshipProfilesByStatus } from './helpers.js';
import {
  MIN_FRIEND_SEARCH_LENGTH,
  matchesFriendSearch,
  normalizeFriendSearchTerm,
  sortFriendSearchResults,
  toDisplayNameSearchVariants
} from '../friendSearch.js';

const SEARCH_QUERY_LIMIT = 20;
const SEARCH_RESULT_LIMIT = 10;

const buildPrefixSearchQuery = (usersRef, field, term) => query(
  usersRef,
  where(field, '>=', term),
  where(field, '<=', `${term}\uf8ff`),
  orderBy(field),
  limit(SEARCH_QUERY_LIMIT)
);

const getExactUsernameProfile = async (normalizedTerm) => {
  if (!normalizedTerm || normalizedTerm.includes(' ')) {
    return null;
  }

  const usernameRef = doc(db, COLLECTIONS.USERNAMES, normalizedTerm);
  const usernameSnap = await getDoc(usernameRef);

  if (!usernameSnap.exists()) {
    return null;
  }

  const userId = usernameSnap.data()?.userId;
  if (!userId) {
    return null;
  }

  const publicProfileRef = doc(db, COLLECTIONS.PUBLIC_PROFILES, userId);
  const publicProfileSnap = await getDoc(publicProfileRef);

  if (!publicProfileSnap.exists()) {
    return null;
  }

  return {
    id: publicProfileSnap.id,
    ...publicProfileSnap.data()
  };
};

const mergeSnapshotProfiles = (resultsById, snapshot) => {
  for (const docSnap of snapshot.docs) {
    const previousProfile = resultsById.get(docSnap.id) || {};
    resultsById.set(docSnap.id, {
      ...previousProfile,
      id: docSnap.id,
      ...docSnap.data()
    });
  }
};

export const getFriends = async (userId) => {
  try {
    return await getRelationshipProfilesByStatus(userId, 'accepted', ({
      targetUserId,
      friendData,
      profileData
    }) => ({
      id: targetUserId,
      username: profileData.username,
      displayName: profileData.displayName,
      avatar: profileData.avatar || null,
      ...friendData
    }));
  } catch (error) {
    logger.error('Error fetching friends:', error);
    return [];
  }
};

export const getFriendRequests = async (userId) => {
  try {
    return await getRelationshipProfilesByStatus(userId, 'pending_received', ({
      targetUserId,
      friendData,
      profileData
    }) => ({
      id: targetUserId,
      username: profileData.username,
      displayName: profileData.displayName,
      avatar: profileData.avatar || null,
      timestamp: friendData.timestamp
    }));
  } catch (error) {
    logger.error('Error fetching requests:', error);
    return [];
  }
};

export const getOutgoingRequests = async (userId) => {
  try {
    return await getRelationshipProfilesByStatus(userId, 'pending_sent', ({
      targetUserId,
      friendData,
      profileData
    }) => ({
      id: targetUserId,
      username: profileData.username,
      displayName: profileData.displayName,
      avatar: profileData.avatar || null,
      timestamp: friendData.timestamp
    }));
  } catch (error) {
    logger.error('Error fetching outgoing requests:', error);
    return [];
  }
};

export const searchUsers = async (searchTerm) => {
  try {
    const normalizedTerm = normalizeFriendSearchTerm(searchTerm);
    if (normalizedTerm.length < MIN_FRIEND_SEARCH_LENGTH) return [];

    const usersRef = collection(db, COLLECTIONS.PUBLIC_PROFILES);
    const queries = [
      query(
        usersRef,
        where('searchPrefixes', 'array-contains', normalizedTerm),
        limit(SEARCH_QUERY_LIMIT)
      ),
      buildPrefixSearchQuery(usersRef, 'username', normalizedTerm)
    ];

    for (const displayNameVariant of toDisplayNameSearchVariants(searchTerm)) {
      queries.push(buildPrefixSearchQuery(usersRef, 'displayName', displayNameVariant));
    }

    const [exactProfile, snapshots] = await Promise.all([
      getExactUsernameProfile(normalizedTerm),
      Promise.all(queries.map((queryRef) => getDocs(queryRef)))
    ]);

    const resultsById = new Map();

    if (exactProfile) {
      resultsById.set(exactProfile.id, exactProfile);
    }

    for (const snapshot of snapshots) {
      mergeSnapshotProfiles(resultsById, snapshot);
    }

    let matchedProfiles = [...resultsById.values()]
      .filter((profile) => matchesFriendSearch(profile, normalizedTerm));

    if (matchedProfiles.length === 0) {
      mergeSnapshotProfiles(resultsById, await getDocs(usersRef));
      matchedProfiles = [...resultsById.values()]
        .filter((profile) => matchesFriendSearch(profile, normalizedTerm));
    }

    return sortFriendSearchResults(matchedProfiles, normalizedTerm)
      .slice(0, SEARCH_RESULT_LIMIT);
  } catch (error) {
    logger.error('Error searching users:', error);
    return [];
  }
};
