/**
 * Achievement Progress Component
 * Shows real-time achievement progress during and after games
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Target, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { useAchievementOperations } from '../hooks/useAchievements.js';
import { ACHIEVEMENT_TIERS } from '../data/achievements.js';

const AchievementProgress = ({ gameStats, isVisible = true, maxDisplay = 3 }) => {
  const { userProfile } = useAuth();
  const {
    getNextAchievements,
    calculateAchievementProgress
  } = useAchievementOperations();

  const [nearestAchievements, setNearestAchievements] = useState([]);
  const [showProgress, setShowProgress] = useState(isVisible);

  // Update nearest achievements when stats change
  useEffect(() => {
    if (userProfile?.stats && gameStats) {
      const updatedStats = { ...userProfile.stats, ...gameStats };
      const nearest = getNextAchievements(5)
        .map(achievement => ({
          ...achievement,
          progress: calculateAchievementProgress(achievement, updatedStats),
          isClose: calculateAchievementProgress(achievement, updatedStats) >= 70
        }))
        .filter(ach => ach.progress > 0)
        .sort((a, b) => b.progress - a.progress)
        .slice(0, maxDisplay);
        
      setNearestAchievements(nearest);
    }
  }, [userProfile, gameStats, getNextAchievements, calculateAchievementProgress, maxDisplay]);

  // Auto-hide after delay if not persistent
  useEffect(() => {
    if (isVisible && nearestAchievements.length === 0) {
      const timer = setTimeout(() => setShowProgress(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, nearestAchievements.length]);

  if (!showProgress || nearestAchievements.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-4 right-4 z-50 space-y-2"
    >
      <AnimatePresence>
        {nearestAchievements.map((achievement, index) => {
          const tierConfig = ACHIEVEMENT_TIERS[achievement.tier] || ACHIEVEMENT_TIERS.common;
          
          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ delay: index * 0.1 }}
              className={`
                bg-gradient-to-r from-black/80 to-black/60 backdrop-blur-md 
                border border-white/20 rounded-lg p-3 max-w-xs
                ${achievement.isClose ? 'border-yellow-400/50 shadow-lg shadow-yellow-400/20' : ''}
              `}
            >
              <div className="flex items-start space-x-3">
                {/* Achievement Icon */}
                <div className="text-2xl relative">
                  {achievement.icon}
                  {achievement.isClose && (
                    <div className="absolute -top-1 -right-1">
                      <Sparkles size={12} className="text-yellow-400 animate-pulse" />
                    </div>
                  )}
                </div>

                {/* Achievement Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-white text-sm truncate">
                      {achievement.title}
                    </h4>
                    <span 
                      className="text-xs px-1 py-0.5 rounded font-medium"
                      style={{ 
                        backgroundColor: `${tierConfig.color}20`,
                        color: tierConfig.color 
                      }}
                    >
                      +{achievement.points}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-white/70 mb-1">
                      <span>Progress</span>
                      <span>{achievement.progress}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5">
                      <motion.div 
                        className={`h-1.5 rounded-full ${
                          achievement.isClose 
                            ? 'bg-gradient-to-r from-yellow-400 to-orange-400' 
                            : 'bg-gradient-to-r from-blue-400 to-purple-400'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${achievement.progress}%` }}
                        transition={{ duration: 1, delay: index * 0.2 }}
                      />
                    </div>
                  </div>

                  {/* Requirements hint */}
                  <p className="text-xs text-white/60 leading-tight">
                    {achievement.description}
                  </p>

                  {/* Close indicator */}
                  {achievement.isClose && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center text-yellow-400 text-xs mt-1"
                    >
                      <Target size={10} className="mr-1" />
                      <span>Almost there!</span>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Recent Unlocks Indicator */}
      {recentUnlocks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 
                     border border-green-400/30 rounded-lg p-2 text-center"
        >
          <div className="flex items-center justify-center space-x-2 text-green-400">
            <Trophy size={16} />
            <span className="text-sm font-medium">
              {recentUnlocks.length} New Achievement{recentUnlocks.length > 1 ? 's' : ''}!
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AchievementProgress;