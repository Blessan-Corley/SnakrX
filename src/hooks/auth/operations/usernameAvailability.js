import { doc, getDoc } from '../../../services/firebase/index.js';
import logger from '../../../utils/logger.js';

export const checkUsernameAvailabilityRequest = async ({
  COLLECTIONS,
  db,
  username,
  validators
}) => {
  const usernameValidation = validators.username(username);
  if (!usernameValidation.valid) return false;

  try {
    const usernameRef = doc(db, COLLECTIONS.USERNAMES, usernameValidation.value.toLowerCase());
    const usernameDoc = await getDoc(usernameRef);
    return !usernameDoc.exists();
  } catch (error) {
    logger.error('Error checking username:', error);
    throw error;
  }
};

export default checkUsernameAvailabilityRequest;
