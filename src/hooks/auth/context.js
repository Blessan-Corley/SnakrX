/**
 * Auth Context
 * React context for authentication state management
 */

import { createContext, useContext } from 'react';

// Create the context to hold authentication state
export const AuthContext = createContext(null);

/**
 * Custom hook to easily access the auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
