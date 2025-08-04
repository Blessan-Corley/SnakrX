/**
 * SnakrX Achievements Management Hook
 * Handles achievement checking, unlocking, and progress tracking
 */

import { useState, useEffect, useContext, createContext, useCallback } from 'react';
import { 
  ACHIEVEMENTS, 
  ACHIEVEMENT_TIERS, 
  ACHIEVEMENT_CATEGORIES,
  checkAchievementRequirements,
  getAchievementById 
} from '@/data/achievements';
import { useAuth, useAuthOperations } from './useAuth';
import { playAchievement } from '@/utils/sound';
import toast from 'react-hot-toast';

// Achievement Context
const AchievementContext = createContext({});

/**
 * Achievement Provider Component
 */
export const AchievementProvider = ({ children }) => {
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
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
        timestamp: ach.timestamp
      })).filter(Boolean);
      
      setUnlockedAchievements(unlocked);
      
      // Set recent unlocks (last 5)
      const recent = unlocked
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
        .slice(0, 5);
      setRecentUnlocks(recent);
    }
  }, [userProfile]);

  const value = {
    unlockedAchievements,
    achievementProgress,
    recentUnlocks,
    loading,
    setUnlockedAchievements,
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

/**
 * Custom hook for achievement operations
 */
export const useAchievementOperations = () => {
  const {
    unlockedAchievements,
    achievementProgress,
    recentUnlocks,
    loading,
    setUnlockedAchievements,
    setAchievementProgress,
    setRecentUnlocks,
    setLoading
  } = useAchievements();

  const { userProfile } = useAuth();
  const { unlockAchievement, updateUserStats } = useAuthOperations();

  /**
   * Check and unlock achievements based on current stats
   */
  const checkAchievements = useCallback(async (currentStats) => {
    if (!userProfile || !currentStats) return [];

    const userAchievements = userProfile.stats?.achievements || [];
    const unlockedIds = userAchievements.map(ach => ach.id);
    const newlyUnlocked = [];
    
    // Check each achievement
    for (const achievement of ACHIEVEMENTS) {
      if (unlockedIds.includes(achievement.id)) continue;
      
      const isUnlocked = checkAchievementRequirements(achievement, currentStats);
      
      if (isUnlocked) {
        try {
          const success = await unlockAchievement(achievement.id);
          if (success) {
            newlyUnlocked.push(achievement);
            
            // Show achievement notification
            toast.success(
              `🏆 Achievement Unlocked: ${achievement.title}`,
              { duration: 4000 }
            );
            
            // Play achievement sound if available
            try {
              playAchievement?.();
            } catch (e) {
              console.warn('Achievement sound not available');
            }
          }
        } catch (error) {
          console.error('Error unlocking achievement:', achievement.id, error);
        }
      }
    }
    
    if (newlyUnlocked.length > 0) {
      // Update recent unlocks
      setRecentUnlocks(prev => [...newlyUnlocked, ...prev].slice(0, 5));
      
      // Update achievement points
      const pointsEarned = newlyUnlocked.reduce((sum, ach) => sum + ach.points, 0);
      await updateUserStats({ achievementPoints: pointsEarned });
    }
    
    return newlyUnlocked;
  }, [userProfile, unlockAchievement, updateUserStats, setRecentUnlocks]);

  /**
   * Calculate progress percentage for an achievement with better mapping
   */
  const calculateAchievementProgress = useCallback((achievement, userStats) => {
    if (!achievement.requirements || !userStats) return 0;
    
    const requirements = achievement.requirements;
    const statMapping = {
      // Direct mappings
      games: 'totalGames',
      wins: 'totalWins',
      totalScore: 'totalScore',
      singleScore: 'bestScore', // Use best score as proxy for single game score
      foodEaten: 'foodEaten',
      wallHits: 'wallHits',
      selfHits: 'selfHits',
      survivalTime: 'maxSurvivalTime',
      maxSpeed: 'maxSpeed',
      winStreak: 'bestWinStreak',
      
      // AI specific
      aiWins: (stats) => {
        return (stats.vsAIStats?.easyWins || 0) + 
               (stats.vsAIStats?.mediumWins || 0) + 
               (stats.vsAIStats?.impossibleWins || 0);
      },
      
      // Multiplayer
      multiplayerWins: 'multiplayerStats.wins',
      multiplayerGames: 'multiplayerStats.gamesPlayed',
      
      // Special requirements
      quickDeaths: 'quickDeaths', // Would need to track this
      perfectGame: 'perfectGames', // Would need to track this
      transparentScore: 'transparentModeScore' // Would need to track this
    };
    
    let totalProgress = 0;
    let requirementCount = 0;
    
    Object.entries(requirements).forEach(([key, targetValue]) => {
      let currentValue = 0;
      
      if (typeof statMapping[key] === 'function') {
        currentValue = statMapping[key](userStats);
      } else if (statMapping[key]) {
        // Handle nested properties
        const statPath = statMapping[key];
        if (statPath.includes('.')) {
          const parts = statPath.split('.');
          let value = userStats;
          for (const part of parts) {
            value = value?.[part];
            if (value === undefined) break;
          }
          currentValue = value || 0;
        } else {
          currentValue = userStats[statPath] || 0;
        }
      } else {
        // Fallback to direct key lookup
        currentValue = userStats[key] || 0;
      }
      
      const progress = Math.min(100, (currentValue / targetValue) * 100);
      totalProgress += progress;
      requirementCount++;
    });
    
    return requirementCount > 0 ? Math.floor(totalProgress / requirementCount) : 0;
  }, []);

  /**
   * Show achievement unlock notification
   */
  const showAchievementNotification = useCallback((achievement) => {
    toast.custom((t) => (
      <div className={`
        ${t.visible ? 'animate-achievement' : 'animate-scale-in'} 
        bg-gradient-card backdrop-blur-md border border-white/20 rounded-xl p-4 shadow-2xl
        max-w-sm mx-auto transform transition-all duration-300
      `}>
        <div className="flex items-center space-x-3">
          <div className="text-3xl">{achievement.icon}</div>
          <div className="flex-1">
            <p className="text-sm font-medium text-primary-400 mb-1">
              Achievement Unlocked!
            </p>
            <p className="font-semibold text-white text-sm mb-1">
              {achievement.title}
            </p>
            <p className="text-xs text-white/70">
              +{achievement.points} points
            </p>
          </div>
          <div className={`
            w-2 h-2 rounded-full
            ${ACHIEVEMENT_TIERS[achievement.tier]?.color || 'bg-gray-500'}
          `} />
        </div>
      </div>
    ), {
      duration: 4000,
      position: 'top-center'
    });
  }, []);

  /**
   * Check and unlock achievements based on game stats
   */
  const checkAndUnlockAchievements = useCallback(async (gameStats = {}) => {
    if (!userProfile?.stats) return [];

    const userAchievements = userProfile.stats.achievements || [];
    const unlockedIds = userAchievements.map(ach => ach.id);
    const newUnlocks = [];
    const updatedStats = { ...userProfile.stats, ...gameStats };
    
    setLoading(true);
    
    try {
      for (const achievement of ACHIEVEMENTS) {
        // Skip if already unlocked
        if (unlockedIds.includes(achievement.id)) continue;
        
        // Check if requirements are met
        if (checkAchievementRequirements(achievement, updatedStats)) {
          const success = await unlockAchievement(achievement.id);
          
          if (success) {
            newUnlocks.push(achievement);
            
            // Show achievement notification
            showAchievementNotification(achievement);
            
            // Play achievement sound
            try {
              playAchievement?.(achievement.tier);
            } catch (e) {
              console.warn('Achievement sound not available');
            }
          }
        }
      }
      
      // Update recent unlocks if any new achievements
      if (newUnlocks.length > 0) {
        setRecentUnlocks(prev => [...newUnlocks, ...prev].slice(0, 5));
        
        // Update achievement points
        const pointsEarned = newUnlocks.reduce((sum, ach) => sum + ach.points, 0);
        if (pointsEarned > 0) {
          await updateUserStats({ achievementPoints: pointsEarned });
        }
      }
      
    } catch (error) {
      console.error('Error checking achievements:', error);
    } finally {
      setLoading(false);
    }
    
    return newUnlocks;
  }, [userProfile, unlockAchievement, updateUserStats, showAchievementNotification, setRecentUnlocks, setLoading]);

  /**
   * Get achievements by category
   */
  const getAchievementsByCategory = useCallback((category) => {
    return ACHIEVEMENTS.filter(ach => ach.category === category);
  }, []);

  /**
   * Get unlocked achievements by category
   */
  const getUnlockedAchievementsByCategory = useCallback((category) => {
    if (!userProfile?.stats?.achievements) return [];
    
    const unlockedIds = userProfile.stats.achievements.map(ach => ach.id);
    return ACHIEVEMENTS.filter(ach => 
      ach.category === category && unlockedIds.includes(ach.id)
    );
  }, [userProfile]);

  /**
   * Get achievement completion percentage
   */
  const getCompletionPercentage = useCallback(() => {
    if (!userProfile?.stats?.achievements) return 0;
    
    const unlockedCount = userProfile.stats.achievements.length;
    return Math.floor((unlockedCount / ACHIEVEMENTS.length) * 100);
  }, [userProfile]);

  /**
   * Get total achievement points earned
   */
  const getTotalPointsEarned = useCallback(() => {
    if (!userProfile?.stats?.achievements) return 0;
    
    const unlockedIds = userProfile.stats.achievements.map(ach => ach.id);
    return ACHIEVEMENTS
      .filter(ach => unlockedIds.includes(ach.id))
      .reduce((total, ach) => total + ach.points, 0);
  }, [userProfile]);

  /**
   * Get achievements by tier
   */
  const getAchievementsByTier = useCallback((tier) => {
    return ACHIEVEMENTS.filter(ach => ach.tier === tier);
  }, []);

  /**
   * Get rarest achievements (legendary and epic)
   */
  const getRareAchievements = useCallback(() => {
    return ACHIEVEMENTS.filter(ach => 
      ach.tier === 'legendary' || ach.tier === 'epic'
    );
  }, []);

  /**
   * Get achievement statistics
   */
  const getAchievementStats = useCallback(() => {
    const unlockedCount = userProfile?.stats?.achievements?.length || 0;
    const unlockedIds = userProfile?.stats?.achievements?.map(ach => ach.id) || [];
    
    const stats = {
      total: ACHIEVEMENTS.length,
      unlocked: unlockedCount,
      locked: ACHIEVEMENTS.length - unlockedCount,
      completionPercentage: getCompletionPercentage(),
      totalPoints: getTotalPointsEarned(),
      byTier: {},
      byCategory: {}
    };

    // Count by tier
    Object.keys(ACHIEVEMENT_TIERS).forEach(tier => {
      const tierAchievements = getAchievementsByTier(tier);
      const unlockedTier = tierAchievements.filter(ach => 
        unlockedIds.includes(ach.id)
      );
      
      stats.byTier[tier] = {
        total: tierAchievements.length,
        unlocked: unlockedTier.length,
        percentage: tierAchievements.length > 0 
          ? Math.floor((unlockedTier.length / tierAchievements.length) * 100) 
          : 0
      };
    });

    // Count by category
    Object.keys(ACHIEVEMENT_CATEGORIES).forEach(category => {
      const categoryAchievements = getAchievementsByCategory(category);
      const unlockedCategory = categoryAchievements.filter(ach => 
        unlockedIds.includes(ach.id)
      );
      
      stats.byCategory[category] = {
        total: categoryAchievements.length,
        unlocked: unlockedCategory.length,
        percentage: categoryAchievements.length > 0 
          ? Math.floor((unlockedCategory.length / categoryAchievements.length) * 100) 
          : 0
      };
    });

    return stats;
  }, [userProfile, getCompletionPercentage, getTotalPointsEarned, getAchievementsByTier, getAchievementsByCategory]);

  /**
   * Check if achievement is unlocked
   */
  const isAchievementUnlocked = useCallback((achievementId) => {
    if (!userProfile?.stats?.achievements) return false;
    
    const unlockedIds = userProfile.stats.achievements.map(ach => ach.id);
    return unlockedIds.includes(achievementId);
  }, [userProfile]);

  /**
   * Get achievement progress percentage
   */
  const getAchievementProgress = useCallback((achievementId) => {
    if (isAchievementUnlocked(achievementId)) return 100;
    return achievementProgress[achievementId] || 0;
  }, [isAchievementUnlocked, achievementProgress]);

  /**
   * Get next achievements to unlock (closest to completion)
   */
  const getNextAchievements = useCallback((limit = 5) => {
    if (!userProfile?.stats) return [];
    
    const unlockedIds = userProfile.stats.achievements?.map(ach => ach.id) || [];
    const lockedAchievements = ACHIEVEMENTS.filter(ach => 
      !unlockedIds.includes(ach.id)
    );
    
    return lockedAchievements
      .map(ach => ({
        ...ach,
        progress: calculateAchievementProgress(ach, userProfile.stats)
      }))
      .sort((a, b) => b.progress - a.progress)
      .slice(0, limit);
  }, [userProfile, calculateAchievementProgress]);

  /**
   * Share achievement
   */
  const shareAchievement = useCallback((achievementId) => {
    const achievement = getAchievementById(achievementId);
    if (!achievement) return;

    const shareText = `🎮 I just unlocked "${achievement.title}" in SnakrX! ${achievement.icon}\n\n${achievement.description}\n\n+${achievement.points} points earned!`;
    
    if (navigator.share) {
      navigator.share({
        title: `SnakrX Achievement: ${achievement.title}`,
        text: shareText,
        url: window.location.origin
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard?.writeText(shareText);
      toast.success('Achievement details copied to clipboard!');
    }
  }, []);

  /**
   * Load user achievements from profile
   */
  const loadUserAchievements = useCallback(async () => {
    if (!userProfile?.stats) return;

    try {
      const userAchievements = userProfile.stats.achievements || [];
      const unlockedData = userAchievements.map(ach => ({
        ...getAchievementById(ach.id),
        unlockedAt: ach.unlockedAt,
        timestamp: ach.timestamp
      })).filter(Boolean);
      
      if (setUnlockedAchievements) {
        setUnlockedAchievements(unlockedData);
      }
      
      // Calculate progress for locked achievements
      const progress = {};
      const achievementIds = userAchievements.map(ach => ach.id);
      ACHIEVEMENTS.forEach(achievement => {
        if (!achievementIds.includes(achievement.id)) {
          progress[achievement.id] = calculateAchievementProgress(achievement, userProfile.stats);
        } else {
          progress[achievement.id] = 100;
        }
      });
      
      if (setAchievementProgress) {
        setAchievementProgress(progress);
      }
      
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  }, [userProfile, calculateAchievementProgress, setUnlockedAchievements, setAchievementProgress]);

  /**
   * Clear recent unlocks
   */
  const clearRecentUnlocks = useCallback(() => {
    setRecentUnlocks([]);
  }, [setRecentUnlocks]);

  // Load achievements when user profile changes
  useEffect(() => {
    loadUserAchievements();
  }, [loadUserAchievements]);

  return {
    // Achievement Data
    achievements: ACHIEVEMENTS,
    achievementTiers: ACHIEVEMENT_TIERS,
    achievementCategories: ACHIEVEMENT_CATEGORIES,
    
    // User Progress
    unlockedAchievements,
    achievementProgress,
    recentUnlocks,
    loading,
    
    // Operations
    checkAndUnlockAchievements,
    loadUserAchievements,
    shareAchievement,
    clearRecentUnlocks,
    
    // Getters
    getAchievementsByCategory,
    getUnlockedAchievementsByCategory,
    getAchievementsByTier,
    getRareAchievements,
    getNextAchievements,
    getAchievementStats,
    isAchievementUnlocked,
    getAchievementProgress,
    getCompletionPercentage,
    getTotalPointsEarned,
    
    // Computed Values
    totalAchievements: ACHIEVEMENTS.length,
    unlockedCount: userProfile?.stats?.achievements?.length || 0,
    completionPercentage: getCompletionPercentage(),
    totalPointsEarned: getTotalPointsEarned()
  };
};

export default useAchievements;