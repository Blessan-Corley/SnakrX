/**
 * Rate Limiting Module
 * Prevents brute force attacks on authentication
 */

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { RATE_LIMIT } from './constants.js';

/**
 * Custom hook for rate limiting
 */
export const useRateLimit = () => {
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lastAttemptTime, setLastAttemptTime] = useState(0);

  /**
   * Check if rate limit is exceeded
   */
  const checkRateLimit = useCallback(() => {
    const now = Date.now();
    const timeSinceLastAttempt = now - lastAttemptTime;

    // Reset attempts if outside the attempt window
    if (timeSinceLastAttempt > RATE_LIMIT.ATTEMPT_WINDOW) {
      setLoginAttempts(0);
      return true;
    }

    // Check if locked out
    if (loginAttempts >= RATE_LIMIT.MAX_ATTEMPTS) {
      const remainingTime = Math.ceil((RATE_LIMIT.LOCKOUT_DURATION - timeSinceLastAttempt) / 1000);
      if (timeSinceLastAttempt < RATE_LIMIT.LOCKOUT_DURATION) {
        toast.error(`Too many login attempts. Please wait ${remainingTime} seconds.`);
        return false;
      } else {
        // Lockout expired, reset
        setLoginAttempts(0);
        return true;
      }
    }

    return true;
  }, [loginAttempts, lastAttemptTime]);

  /**
   * Record a failed login attempt
   */
  const recordFailedAttempt = useCallback(() => {
    setLoginAttempts(prev => prev + 1);
    setLastAttemptTime(Date.now());
  }, []);

  /**
   * Reset login attempts on success
   */
  const resetAttempts = useCallback(() => {
    setLoginAttempts(0);
    setLastAttemptTime(0);
  }, []);

  return {
    checkRateLimit,
    recordFailedAttempt,
    resetAttempts
  };
};
