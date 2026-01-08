import {
  buildPublicProfilePreferences,
  buildPublicProfileIdentity,
  projectPublicProfileStats
} from '../../services/firebase/publicProfileStats.js';

export const normalizeRegistrationInput = (userData, validators) => {
  const { username, email, password } = userData;

  const usernameVal = validators.username(username);
  const emailVal = validators.email(email);
  const passwordVal = validators.password(password);

  if (!usernameVal.valid) throw new Error(usernameVal.error);
  if (!emailVal.valid) throw new Error(emailVal.error);
  if (!passwordVal.valid) throw new Error(passwordVal.error);

  return {
    password: passwordVal.value,
    normalizedUsername: usernameVal.value.toLowerCase(),
    normalizedEmail: emailVal.value.toLowerCase(),
    displayName: usernameVal.value
  };
};

export const buildUserProfileData = ({
  createDefaultUserProfile,
  user,
  normalizedUsername,
  displayName,
  normalizedEmail,
  serverTimestamp
}) => ({
  ...createDefaultUserProfile(user),
  username: normalizedUsername,
  displayName,
  email: normalizedEmail,
  createdAt: serverTimestamp(),
  lastLoginAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
  lastActiveAt: serverTimestamp()
});

export const buildPublicProfileData = ({
  user,
  normalizedUsername,
  displayName,
  serverTimestamp
}) => ({
  ...buildPublicProfileIdentity(user, {
    uid: user.uid,
    username: normalizedUsername,
    displayName,
    avatar: user.photoURL || null,
    avatarPath: null,
    isPrivateLeaderboard: false
  }),
  preferences: buildPublicProfilePreferences(),
  lastActiveAt: serverTimestamp(),
  stats: projectPublicProfileStats(),
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
});

export const createProfileUpdatePayloads = (updates = {}) => {
  const safeUpdates = { ...updates };
  delete safeUpdates.username;

  const authProfileUpdates = {};
  if (typeof safeUpdates.displayName === 'string') {
    authProfileUpdates.displayName = safeUpdates.displayName;
  }
  if (typeof safeUpdates.avatar !== 'undefined') {
    authProfileUpdates.photoURL = safeUpdates.avatar || null;
  }

  const publicUpdates = {};
  if (typeof safeUpdates.displayName === 'string') publicUpdates.displayName = safeUpdates.displayName;
  if (typeof safeUpdates.avatar !== 'undefined') publicUpdates.avatar = safeUpdates.avatar;
  if (typeof safeUpdates.avatarPath !== 'undefined') publicUpdates.avatarPath = safeUpdates.avatarPath;
  if (typeof safeUpdates?.preferences?.privateLeaderboard === 'boolean') {
    publicUpdates.isPrivateLeaderboard = safeUpdates.preferences.privateLeaderboard;
  }

  return {
    safeUpdates,
    authProfileUpdates,
    publicUpdates
  };
};
