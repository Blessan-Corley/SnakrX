import { RateLimiter } from './rateLimiter.js';

const apiRateLimiter = new RateLimiter(50, 60000);
const gameActionRateLimiter = new RateLimiter(100, 10000);

export const rateLimiters = {
  /**
   * Check API rate limit.
   */
  checkApiLimit: (userId) => {
    return apiRateLimiter.isAllowed(`api_${userId}`);
  },

  /**
   * Check game action rate limit.
   */
  checkGameActionLimit: (userId) => {
    return gameActionRateLimiter.isAllowed(`game_${userId}`);
  },

  /**
   * Get remaining API requests.
   */
  getRemainingApiRequests: (userId) => {
    return apiRateLimiter.getRemainingRequests(`api_${userId}`);
  },

  /**
   * Get remaining game actions.
   */
  getRemainingGameActions: (userId) => {
    return gameActionRateLimiter.getRemainingRequests(`game_${userId}`);
  }
};
