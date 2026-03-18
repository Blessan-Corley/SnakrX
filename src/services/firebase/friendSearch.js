export const MIN_FRIEND_SEARCH_LENGTH = 3;
const MIN_INDEX_PREFIX_LENGTH = 2;

const normalizeWhitespace = (value = '') => String(value || '')
  .trim()
  .replace(/^@+/, '')
  .replace(/\s+/g, ' ');

export const normalizeFriendSearchTerm = (value = '') =>
  normalizeWhitespace(value).toLowerCase();

const tokenizeSearchValue = (value = '') => normalizeFriendSearchTerm(value)
  .replace(/[^\p{L}\p{N}_]+/gu, ' ')
  .split(/\s+/)
  .filter(Boolean);

const addPrefixes = (prefixes, value = '') => {
  const normalizedValue = normalizeFriendSearchTerm(value);

  if (!normalizedValue) return;

  for (let length = MIN_INDEX_PREFIX_LENGTH; length <= normalizedValue.length; length += 1) {
    prefixes.add(normalizedValue.slice(0, length));
  }
};

export const buildFriendSearchFields = ({
  username,
  displayName
} = {}) => {
  const searchableUsername = normalizeFriendSearchTerm(username);
  const searchableDisplayName = normalizeFriendSearchTerm(displayName);
  const searchPrefixes = new Set();

  addPrefixes(searchPrefixes, searchableUsername);
  addPrefixes(searchPrefixes, searchableDisplayName);

  for (const token of tokenizeSearchValue(displayName)) {
    addPrefixes(searchPrefixes, token);
  }

  return {
    searchableUsername,
    searchableDisplayName,
    searchPrefixes: Array.from(searchPrefixes)
  };
};

export const matchesFriendSearch = (profile = {}, searchTerm = '') => {
  const normalizedTerm = normalizeFriendSearchTerm(searchTerm);

  if (normalizedTerm.length < MIN_FRIEND_SEARCH_LENGTH) {
    return false;
  }

  const searchableUsername =
    normalizeFriendSearchTerm(profile.searchableUsername || profile.username);
  const searchableDisplayName =
    normalizeFriendSearchTerm(profile.searchableDisplayName || profile.displayName);
  const searchPrefixes = Array.isArray(profile.searchPrefixes)
    ? profile.searchPrefixes
    : buildFriendSearchFields(profile).searchPrefixes;

  return searchableUsername.includes(normalizedTerm) ||
    searchableDisplayName.includes(normalizedTerm) ||
    searchPrefixes.includes(normalizedTerm);
};

const getFriendSearchScore = (profile = {}, searchTerm = '') => {
  const normalizedTerm = normalizeFriendSearchTerm(searchTerm);
  const searchableUsername =
    normalizeFriendSearchTerm(profile.searchableUsername || profile.username);
  const searchableDisplayName =
    normalizeFriendSearchTerm(profile.searchableDisplayName || profile.displayName);
  const searchTokens = tokenizeSearchValue(profile.displayName);

  if (searchableUsername === normalizedTerm) return 600;
  if (searchableUsername.startsWith(normalizedTerm)) return 500;
  if (searchTokens.some((token) => token === normalizedTerm)) return 450;
  if (searchTokens.some((token) => token.startsWith(normalizedTerm))) return 400;
  if (searchableDisplayName.startsWith(normalizedTerm)) return 350;
  if (searchableUsername.includes(normalizedTerm)) return 300;
  if (searchableDisplayName.includes(normalizedTerm)) return 250;
  return 0;
};

export const sortFriendSearchResults = (profiles = [], searchTerm = '') => (
  [...profiles].sort((left, right) => {
    const scoreDifference =
      getFriendSearchScore(right, searchTerm) - getFriendSearchScore(left, searchTerm);

    if (scoreDifference !== 0) {
      return scoreDifference;
    }

    const usernameDifference = String(left.username || '')
      .localeCompare(String(right.username || ''));
    if (usernameDifference !== 0) {
      return usernameDifference;
    }

    return String(left.displayName || '')
      .localeCompare(String(right.displayName || ''));
  })
);

export const toDisplayNameSearchVariants = (value = '') => {
  const trimmedValue = normalizeWhitespace(value);

  if (!trimmedValue) {
    return [];
  }

  const titleCasedValue = trimmedValue
    .toLowerCase()
    .replace(/\b\p{L}/gu, (character) => character.toUpperCase());

  return Array.from(new Set([
    trimmedValue,
    titleCasedValue
  ])).filter((variant) => variant.length >= MIN_FRIEND_SEARCH_LENGTH);
};
