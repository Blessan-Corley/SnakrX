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
   * Load user achievements from profile
   */
  const loadUserAchievements = useCallback(() => {
    if (!userProfile) return;

    const userAchievements = userProfile.stats?.achievements || [];
    const unlockedIds = userAchievements.map(ach => ach.id);
    
    setUnlockedAchievements(unlockedIds);
    
    // Calculate progress for locked achievements
    const progress = {};
    const userStats = userProfile.stats || {};
    
    ACHIEVEMENTS.forEach(achievement => {
      if (!unlockedIds.includes(achievement.id)) {
        progress[achievement.id] = calculateAchievementProgress(achievement, userStats);
      }
    });
    
    setAchievementProgress(progress);
  }, [userProfile, setUnlockedAchievements, setAchievementProgress]);

  /**
   * Calculate progress percentage for an achievement
   */
  const calculateAchievementProgress = useCallback((achievement, userStats) => {
    const requirements = achievement.requirements;
    let totalProgress = 0;
    let completedRequirements = 0;
    
    Object.entries(requirements).forEach(([key, targetValue]) => {
      const currentValue = userStats[key] || 0;
      const progress = Math.min(100, (currentValue / targetValue) * 100);
      totalProgress += progress;
      
      if (currentValue >= targetValue) {
        completedRequirements++;
      }
    });
    
    return Math.floor(totalProgress / Object.keys(requirements).length);
  }, []);

  /**
   * Check and unlock achievements based on user stats
   */
  const checkAndUnlockAchievements = useCallback(async (gameStats) => {
    if (!userProfile) return [];

    setLoading(true);
    const newUnlocks = [];
    const userStats = { ...(userProfile.stats || {}), ...gameStats };
    
    try {
      for (const achievement of ACHIEVEMENTS) {
        // Skip if already unlocked
        if (unlockedAchievements.includes(achievement.id)) continue;
        
        // Check if requirements are met
        if (checkAchievementRequirements(achievement, userStats)) {
          // Unlock achievement
          const success = await unlockAchievement(achievement.id);
          
          if (success) {
            newUnlocks.push(achievement);
            setUnlockedAchievements(prev => [...prev, achievement.id]);
            
            // Play sound and show notification
            playAchievement(achievement.tier);
            showAchievementNotification(achievement);
            
            // Update achievement points
            await updateUserStats({
              achievementPoints: (userProfile.stats?.achievementPoints || 0) + achievement.points
            });
          }
        }
      }
      
      // Add to recent unlocks
      if (newUnlocks.length > 0) {
        setRecentUnlocks(prev => [...newUnlocks, ...prev].slice(0, 10));
      }
      
    } catch (error) {
      console.error('Error checking achievements:', error);
    } finally {
      setLoading(false);
    }
    
    return newUnlocks;
  }, [userProfile, unlockedAchievements, unlockAchievement, updateUserStats, setUnlockedAchievements, setRecentUnlocks, setLoading]);

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
   * Get achievements by category
   */
  const getAchievementsByCategory = useCallback((category) => {
    return ACHIEVEMENTS.filter(ach => ach.category === category);
  }, []);

  /**
   * Get unlocked achievements by category
   */
  const getUnlockedAchievementsByCategory = useCallback((category) => {
    return ACHIEVEMENTS.filter(ach => 
      ach.category === category && unlockedAchievements.includes(ach.id)
    );
  }, [unlockedAchievements]);

  /**
   * Get achievement completion percentage
   */
  const getCompletionPercentage = useCallback(() => {
    return Math.floor((unlockedAchievements.length / ACHIEVEMENTS.length) * 100);
  }, [unlockedAchievements]);

  /**
   * Get total achievement points earned
   */
  const getTotalPointsEarned = useCallback(() => {
    return ACHIEVEMENTS
      .filter(ach => unlockedAchievements.includes(ach.id))
      .reduce((total, ach) => total + ach.points, 0);
  }, [unlockedAchievements]);

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
    const stats = {
      total: ACHIEVEMENTS.length,
      unlocked: unlockedAchievements.length,
      locked: ACHIEVEMENTS.length - unlockedAchievements.length,
      completionPercentage: getCompletionPercentage(),
      totalPoints: getTotalPointsEarned(),
      byTier: {},
      byCategory: {}
    };

    // Count by tier
    Object.keys(ACHIEVEMENT_TIERS).forEach(tier => {
      const tierAchievements = getAchievementsByTier(tier);
      const unlockedTier = tierAchievements.filter(ach => 
        unlockedAchievements.includes(ach.id)
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
        unlockedAchievements.includes(ach.id)
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
  }, [unlockedAchievements, getCompletionPercentage, getTotalPointsEarned, getAchievementsByTier, getAchievementsByCategory]);

  /**
   * Check if achievement is unlocked
   */
  const isAchievementUnlocked = useCallback((achievementId) => {
    return unlockedAchievements.includes(achievementId);
  }, [unlockedAchievements]);

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
    const lockedAchievements = ACHIEVEMENTS.filter(ach => 
      !unlockedAchievements.includes(ach.id)
    );
    
    return lockedAchievements
      .map(ach => ({
        ...ach,
        progress: achievementProgress[ach.id] || 0
      }))
      .sort((a, b) => b.progress - a.progress)
      .slice(0, limit);
  }, [unlockedAchievements, achievementProgress]);

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
    unlockedCount: unlockedAchievements.length,
    completionPercentage: getCompletionPercentage(),
    totalPointsEarned: getTotalPointsEarned()
  };
};

export default useAchievements;