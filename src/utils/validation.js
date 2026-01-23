/**
 * Input Validation and Rate Limiting Utilities
 * Provides comprehensive validation and security measures
 */

import logger from './logger.js';

// Rate limiting storage
const rateLimitStore = new Map();

/**
 * Rate limiting class
 */
class RateLimiter {
  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(key) {
    const now = Date.now();
    const userRequests = rateLimitStore.get(key) || [];

    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => now - time < this.windowMs);

    if (validRequests.length >= this.maxRequests) {
      logger.warn(`Rate limit exceeded for key: ${key}`);
      return false;
    }

    // Add current request
    validRequests.push(now);
    rateLimitStore.set(key, validRequests);

    return true;
  }

  getRemainingRequests(key) {
    const now = Date.now();
    const userRequests = rateLimitStore.get(key) || [];
    const validRequests = userRequests.filter(time => now - time < this.windowMs);
    return Math.max(0, this.maxRequests - validRequests.length);
  }
}

// Global rate limiters
const apiRateLimiter = new RateLimiter(50, 60000); // 50 requests per minute
const gameActionRateLimiter = new RateLimiter(100, 10000); // 100 actions per 10 seconds

/**
 * Input validation functions
 */
export const validators = {
  /**
   * Validate username
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
   * Validate email
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

    // Check for allowed domains (basic spam protection)
    const allowedDomains = ['gmail.com', 'outlook.com', 'yahoo.com', 'mail.com', 'icloud.com', 'protonmail.com'];
    const domain = trimmed.split('@')[1];

    if (!allowedDomains.includes(domain)) {
      return { valid: false, error: 'Email domain not supported. Please use a common email provider.' };
    }

    return { valid: true, value: trimmed };
  },

  /**
   * Validate password
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

    // Check for basic security requirements
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
   * Validate game score
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
   * Validate game mode
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
   * Validate AI difficulty
   */
  difficulty: (difficulty) => {
    const validDifficulties = ['easy', 'medium', 'impossible'];

    if (!difficulty) {
      return { valid: true, value: null }; // Difficulty is optional
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
   * Validate player count
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
   * Sanitize and validate text input
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

    // Basic XSS protection
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

/**
 * Rate limiting functions
 */
export const rateLimiters = {
  /**
   * Check API rate limit
   */
  checkApiLimit: (userId) => {
    return apiRateLimiter.isAllowed(`api_${userId}`);
  },

  /**
   * Check game action rate limit
   */
  checkGameActionLimit: (userId) => {
    return gameActionRateLimiter.isAllowed(`game_${userId}`);
  },

  /**
   * Get remaining API requests
   */
  getRemainingApiRequests: (userId) => {
    return apiRateLimiter.getRemainingRequests(`api_${userId}`);
  },

  /**
   * Get remaining game actions
   */
  getRemainingGameActions: (userId) => {
    return gameActionRateLimiter.getRemainingRequests(`game_${userId}`);
  }
};

/**
 * Comprehensive input validation with rate limiting
 */
export const validateInput = {
  /**
   * Validate user registration data
   */
  registration: (data) => {
    const errors = [];

    const usernameValidation = validators.username(data.username);
    if (!usernameValidation.valid) {
      errors.push(usernameValidation.error);
    }

    const emailValidation = validators.email(data.email);
    if (!emailValidation.valid) {
      errors.push(emailValidation.error);
    }

    const passwordValidation = validators.password(data.password);
    if (!passwordValidation.valid) {
      errors.push(passwordValidation.error);
    }

    return {
      valid: errors.length === 0,
      errors,
      data: {
        username: usernameValidation.value,
        email: emailValidation.value,
        password: passwordValidation.value
      }
    };
  },

  /**
   * Validate game session data
   */
  gameSession: (data) => {
    const errors = [];

    const scoreValidation = validators.score(data.score);
    if (!scoreValidation.valid) {
      errors.push(scoreValidation.error);
    }

    const modeValidation = validators.gameMode(data.mode);
    if (!modeValidation.valid) {
      errors.push(modeValidation.error);
    }

    const difficultyValidation = validators.difficulty(data.difficulty);
    if (!difficultyValidation.valid) {
      errors.push(difficultyValidation.error);
    }

    return {
      valid: errors.length === 0,
      errors,
      data: {
        score: scoreValidation.value,
        mode: modeValidation.value,
        difficulty: difficultyValidation.value
      }
    };
  },

  /**
   * Validate leaderboard submission
   */
  leaderboardEntry: (data, userId) => {
    // Check rate limit first
    if (!rateLimiters.checkApiLimit(userId)) {
      return {
        valid: false,
        errors: ['Too many requests. Please wait before submitting again.']
      };
    }

    const gameSessionValidation = validateInput.gameSession(data);
    return gameSessionValidation;
  }
};

/**
 * Security utilities
 */
export const security = {
  /**
   * Sanitize object for logging (remove sensitive data)
   */
  sanitizeForLogging: (obj) => {
    if (!obj || typeof obj !== 'object') return obj;

    const sanitized = { ...obj };

    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'apiKey', 'secret'];
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  },

  /**
   * Check if request is from a reasonable user agent
   */
  isValidUserAgent: (userAgent) => {
    if (!userAgent) return false;

    // Basic bot detection
    const botPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /headless/i
    ];

    return !botPatterns.some(pattern => pattern.test(userAgent));
  }
};

export default {
  validators,
  rateLimiters,
  validateInput,
  security
};