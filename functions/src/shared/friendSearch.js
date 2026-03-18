const MIN_INDEX_PREFIX_LENGTH = 2;

const normalizeWhitespace = (value = '') => String(value || '')
  .trim()
  .replace(/^@+/, '')
  .replace(/\s+/g, ' ');

const normalizeFriendSearchTerm = (value = '') =>
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

const buildFriendSearchFields = ({
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

module.exports = {
  buildFriendSearchFields,
  normalizeFriendSearchTerm
};
