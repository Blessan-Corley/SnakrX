import logger from '../logger.js';

const rateLimitStore = new Map();

/**
 * Generic in-memory rate limiter.
 */
export class RateLimiter {
  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(key) {
    const now = Date.now();
    const userRequests = rateLimitStore.get(key) || [];
    const validRequests = userRequests.filter(time => now - time < this.windowMs);

    if (validRequests.length >= this.maxRequests) {
      logger.warn(`Rate limit exceeded for key: ${key}`);
      return false;
    }

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

export const clearRateLimitStore = () => {
  rateLimitStore.clear();
};
