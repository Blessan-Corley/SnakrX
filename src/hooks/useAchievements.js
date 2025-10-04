/**
 * SnakrX Achievements Hook - V2 (Refactored & Modular)
 * Achievement provider and state management
 *
 * @version 2.0.0
 */

import { useState, useEffect } from 'react';
import { getAchievementById } from '../data/achievements.js';
import { useAuth } from './auth/context.js';
import { AchievementContext } from './achievements/context.js';

/**
 * Achievement Provider Component
 */
export const AchievementProvider = ({ children }) => {
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [uncollectedAchievements, setUncollectedAchievements] = useState([]);
  const [achievementProgress, setAchievementProgress] = useState({});
  const [recentUnlocks, setRecentUnlocks] = useState([]);
  const [loading, setLoading] = useState(false);

  const { userProfile } = useAuth();

  // Update unlocked achievements when user profile changes
  useEffect(() => {
    if (userProfile?.stats?.achievements) {
      const unlocked = userProfile.stats.achievements.map(ach => ({
        ...getAchievementById(ach.id),
        unlockedAt: ach.unlockedAt,
        timestamp: ach.timestamp,
        collected: ach.collected || false
      })).filter(Boolean);

      setUnlockedAchievements(unlocked);

      // Set uncollected achievements
      const uncollected = unlocked.filter(ach => !ach.collected);
      setUncollectedAchievements(uncollected);

      // Set recent unlocks
      const recent = unlocked
        .filter(ach => ach.collected)
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
        .slice(0, 5);
      setRecentUnlocks(recent);
    }
  }, [userProfile]);

  const value = {
    unlockedAchievements,
    uncollectedAchievements,
    achievementProgress,
    recentUnlocks,
    loading,
    setUnlockedAchievements,
    setUncollectedAchievements,
    setAchievementProgress,
    setRecentUnlocks,
    setLoading
  };

  return (
    <AchievementContext.Provider value={value}>
      {children}
    </AchievementContext.Provider>
  );
};

// Re-export from modular components
export { useAchievements } from './achievements/context.js';
export { useAchievementOperations } from './achievements/operations.js';
