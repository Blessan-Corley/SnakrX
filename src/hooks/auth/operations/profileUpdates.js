import {
  auth,
  db,
  doc,
  serverTimestamp
} from '../../../services/firebase/index.js';
import { firestoreOperations } from '../../../services/firebase/index.js';
import { buildFriendSearchFields } from '../../../services/firebase/friendSearch.js';
import { createProfileUpdatePayloads } from '../authOperationHelpers.js';

export const updateUserProfileData = async ({
  COLLECTIONS,
  updateAuthProfile,
  updates
}) => {
  if (!auth.currentUser) {
    throw new Error('You must be signed in to update your profile.');
  }

  const {
    safeUpdates,
    authProfileUpdates,
    publicUpdates
  } = createProfileUpdatePayloads(updates);

  if (Object.keys(authProfileUpdates).length > 0) {
    await updateAuthProfile(auth.currentUser, authProfileUpdates);
  }

  const userDocRef = doc(db, COLLECTIONS.USERS, auth.currentUser.uid);
  await firestoreOperations.updateDocument(userDocRef, {
    ...safeUpdates,
    updatedAt: serverTimestamp()
  });

  if (Object.keys(publicUpdates).length > 0) {
    const publicProfileRef = doc(db, COLLECTIONS.PUBLIC_PROFILES, auth.currentUser.uid);
    const publicProfileSnap = await firestoreOperations.getDocument(publicProfileRef);
    const currentPublicProfile = publicProfileSnap.exists()
      ? publicProfileSnap.data() || {}
      : {};
    const nextDisplayName = publicUpdates.displayName ||
      currentPublicProfile.displayName ||
      auth.currentUser.displayName ||
      auth.currentUser.email?.split('@')[0] ||
      'player';
    const nextUsername = currentPublicProfile.username ||
      auth.currentUser.email?.split('@')[0] ||
      'player';

    await firestoreOperations.updateDocument(publicProfileRef, {
      ...publicUpdates,
      ...buildFriendSearchFields({
        username: nextUsername,
        displayName: nextDisplayName
      }),
      updatedAt: serverTimestamp()
    });
  }
};

export default updateUserProfileData;
