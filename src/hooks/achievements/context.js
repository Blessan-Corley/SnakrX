/**
 * Achievement Context
 */

import { createContext, useContext } from 'react';

export const AchievementContext = createContext(null);

/**
 * Custom hook to use achievement context
 */
export const useAchievements = () => {
  const context = useContext(AchievementContext);
  if (!context) {
    throw new Error('useAchievements must be used within an AchievementProvider');
  }
  return context;
};
