import {
  COLLECTIONS,
  db,
  doc
} from '../../services/firebase/config.js';
import { firestoreOperations } from '../../services/firebase/firestore.js';
import logger from '../../utils/logger.js';

export const buildHydratedUserProfile = (firebaseUser, userData) => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email,
  ...userData,
  avatar: userData.avatar || firebaseUser.photoURL || null
});

export const refreshUserProfile = async (user, setUserProfile) => {
  if (!user) return null;

  try {
    const userDocRef = doc(db, COLLECTIONS.USERS, user.uid);
    const userDoc = await firestoreOperations.getDocument(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      logger.log('User profile refreshed:', userData?.stats);
      setUserProfile(buildHydratedUserProfile(user, userData));
      return userData;
    }
  } catch (error) {
    logger.warn('Error refreshing user profile:', error);
  }

  return null;
};
