/**
 * Auth Module - Main Export
 * Central export point for all auth functionality
 */

export { AuthContext, useAuth } from './context.js';
export { createDefaultUserProfile, createBasicProfile, RATE_LIMIT } from './constants.js';
export { useRateLimit } from './rateLimit.js';
export { useAuthOperations } from './authOperations.js';
export { useUserStats } from './userStats.js';

// Re-export AuthProvider from the main useAuth file
export { AuthProvider, refreshUserProfile } from '../useAuth.js';
