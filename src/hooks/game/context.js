/**
 * Game Context
 * React context for game state management
 */

import { createContext, useContext } from 'react';

export const GameContext = createContext(null);

/**
 * Hook to access game context
 */
export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within GameProvider');
  }
  return context;
};
