import {
  COLLECTIONS,
  db,
  doc
} from '../../services/firebase/config.js';
import { firestoreOperations } from '../../services/firebase/firestore.js';
import { applyProfileSoundSettings } from '../../utils/sound.js';
import logger from '../../utils/logger.js';

export const buildHydratedUserProfile = (firebaseUser, userData) => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email,
  ...userData,
  avatar: userData.avatar || firebaseUser.photoURL || null
});

export const hydrateUserProfileState = (firebaseUser, userData, setUserProfile) => {
  const nextProfile = buildHydratedUserProfile(firebaseUser, userData);
  applyProfileSoundSettings(userData?.settings);
  setUserProfile(nextProfile);
  return nextProfile;
};

export const refreshUserProfile = async (user, setUserProfile) => {
  if (!user) return null;

  try {
    const userDocRef = doc(db, COLLECTIONS.USERS, user.uid);
    const userDoc = await firestoreOperations.getDocument(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      logger.log('User profile refreshed:', userData?.stats);
      hydrateUserProfileState(user, userData, setUserProfile);
      return userData;
    }
  } catch (error) {
    logger.warn('Error refreshing user profile:', error);
  }

  return null;
};
