import { rateLimiters } from './rateLimiters.js';
import { validators } from './validators.js';

/**
 * Composite input validation helpers.
 */
export const validateInput = {
  /**
   * Validate user registration data.
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
   * Validate game session data.
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
   * Validate leaderboard submission.
   */
  leaderboardEntry: (data, userId) => {
    if (!rateLimiters.checkApiLimit(userId)) {
      return {
        valid: false,
        errors: ['Too many requests. Please wait before submitting again.']
      };
    }

    return validateInput.gameSession(data);
  }
};
