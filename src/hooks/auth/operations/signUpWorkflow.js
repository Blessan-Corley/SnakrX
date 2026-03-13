import {
  normalizeRegistrationInput
} from '../authOperationHelpers.js';
import { completeEmailRegistration } from '../../../services/firebase/emailRegistration.js';

export const registerUserAccount = async ({
  checkUsernameAvailability,
  userData,
  validators
}) => {
  const {
    password,
    normalizedUsername,
    normalizedEmail,
    displayName
  } = normalizeRegistrationInput(userData, validators);

  const isUsernameAvailable = await checkUsernameAvailability(normalizedUsername);
  if (!isUsernameAvailable) {
    throw new Error('This username is already taken. Please choose another.');
  }

  return completeEmailRegistration({
    email: normalizedEmail,
    password,
    username: normalizedUsername,
    displayName
  });
};

export default registerUserAccount;
