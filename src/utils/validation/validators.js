/**
 * Input validation functions.
 */
export const validators = {
  /**
   * Validate username.
   */
  username: (username) => {
    if (!username || typeof username !== 'string') {
      return { valid: false, error: 'Username is required' };
    }

    const trimmed = username.trim();
    if (trimmed.length < 3) {
      return { valid: false, error: 'Username must be at least 3 characters long' };
    }

    if (trimmed.length > 20) {
      return { valid: false, error: 'Username must be less than 20 characters' };
    }

    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      return { valid: false, error: 'Username can only contain letters, numbers, and underscores' };
    }

    return { valid: true, value: trimmed };
  },

  /**
   * Validate email.
   */
  email: (email) => {
    if (!email || typeof email !== 'string') {
      return { valid: false, error: 'Email is required' };
    }

    const trimmed = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmed)) {
      return { valid: false, error: 'Please enter a valid email address' };
    }

    return { valid: true, value: trimmed };
  },

  /**
   * Validate password.
   */
  password: (password) => {
    if (!password || typeof password !== 'string') {
      return { valid: false, error: 'Password is required' };
    }

    if (password.length < 6) {
      return { valid: false, error: 'Password must be at least 6 characters long' };
    }

    if (password.length > 128) {
      return { valid: false, error: 'Password must be less than 128 characters' };
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      return {
        valid: false,
        error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      };
    }

    return { valid: true, value: password };
  },

  /**
   * Validate game score.
   */
  score: (score) => {
    if (typeof score !== 'number' || isNaN(score)) {
      return { valid: false, error: 'Score must be a valid number' };
    }

    if (score < 0) {
      return { valid: false, error: 'Score cannot be negative' };
    }

    if (score > 999999) {
      return { valid: false, error: 'Score seems unreasonably high' };
    }

    return { valid: true, value: Math.floor(score) };
  },

  /**
   * Validate game mode.
   */
  gameMode: (mode) => {
    const validModes = ['classic', 'classic_transparent', 'vsai', 'multiplayer'];

    if (!mode || typeof mode !== 'string') {
      return { valid: false, error: 'Game mode is required' };
    }

    if (!validModes.includes(mode)) {
      return { valid: false, error: 'Invalid game mode' };
    }

    return { valid: true, value: mode };
  },

  /**
   * Validate AI difficulty.
   */
  difficulty: (difficulty) => {
    const validDifficulties = ['easy', 'medium', 'impossible'];

    if (!difficulty) {
      return { valid: true, value: null };
    }

    if (typeof difficulty !== 'string') {
      return { valid: false, error: 'Difficulty must be a string' };
    }

    if (!validDifficulties.includes(difficulty)) {
      return { valid: false, error: 'Invalid difficulty level' };
    }

    return { valid: true, value: difficulty };
  },

  /**
   * Validate player count.
   */
  playerCount: (count) => {
    if (typeof count !== 'number' || !Number.isInteger(count)) {
      return { valid: false, error: 'Player count must be a whole number' };
    }

    if (count < 1 || count > 4) {
      return { valid: false, error: 'Player count must be between 1 and 4' };
    }

    return { valid: true, value: count };
  },

  /**
   * Sanitize and validate text input.
   */
  text: (text, options = {}) => {
    const { maxLength = 1000, required = false, allowHtml = false } = options;

    if (required && (!text || typeof text !== 'string')) {
      return { valid: false, error: 'This field is required' };
    }

    if (!text) {
      return { valid: true, value: '' };
    }

    if (typeof text !== 'string') {
      return { valid: false, error: 'Input must be text' };
    }

    if (text.length > maxLength) {
      return { valid: false, error: `Text must be less than ${maxLength} characters` };
    }

    let sanitized = text;
    if (!allowHtml) {
      sanitized = text
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
    }

    return { valid: true, value: sanitized.trim() };
  }
};
