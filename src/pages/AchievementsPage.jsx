import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  Trophy,
  Star,
  Search,
  Share2,
  Lock,
  CheckCircle,
  Zap,
  Gamepad2,
  Sparkles,
  Clock,
  Users
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { useAchievementOperations } from '../hooks/useAchievements.js';
import Button from '../components/ui/Button.jsx';
import Card, { AchievementCard, StatsCard } from '../components/ui/Card.jsx';
import Modal from '../components/ui/Modal.jsx';
import { CardSkeleton } from '../components/ui/LoadingSpinner.jsx';
import { playClick } from '../utils/sound.js';
import { ACHIEVEMENT_CATEGORIES, ACHIEVEMENT_TIERS } from '../data/achievements.js';

/**
 * Achievements Page Component
 * Gallery view of all achievements with filtering and progress tracking
 */
const AchievementsPage = () => {
  const { userProfile } = useAuth();
  const {
    achievements,
    achievementTiers,
    recentUnlocks,
    getAchievementStats,
    isAchievementUnlocked,
    calculateAchievementProgress,
    shareAchievement,
    getTotalPointsEarned,
    getCompletionPercentage,
    collectAchievement,
    collectAllAchievements,
    uncollectedAchievements
  } = useAchievementOperations();

  // State
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTier, setSelectedTier] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [loading] = useState(false);

  // Get achievement stats
  const achievementStats = getAchievementStats();
  const totalPoints = getTotalPointsEarned();
  const completionPercentage = getCompletionPercentage();

  // Filter achievements
  const filteredAchievements = achievements.filter(achievement => {
    // Category filter
    if (selectedCategory !== 'all' && achievement.category !== selectedCategory) {
      return false;
    }

    // Tier filter
    if (selectedTier !== 'all' && achievement.tier !== selectedTier) {
      return false;
    }

    // Search filter
    if (searchTerm && !achievement.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !achievement.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Unlocked only filter
    if (showUnlockedOnly && !isAchievementUnlocked(achievement.id)) {
      return false;
    }

    return true;
  });

  // Handle achievement click
  const handleAchievementClick = (achievement) => {
    setSelectedAchievement(achievement);
    setShowAchievementModal(true);
    playClick();
  };

  // Handle share achievement
  const handleShareAchievement = (achievementId) => {
    shareAchievement(achievementId);
    playClick();
  };

  // Get tier color and styling
  const getTierStyling = (tier) => {
    const tierConfig = achievementTiers[tier];
    return {
      color: tierConfig?.color || '#9ca3af',
      bgGradient: tierConfig?.bgGradient || 'from-gray-400 to-gray-600',
      glow: tierConfig?.glow || 'shadow-gray-500/20'
    };
  };

  // Category icons
  const categoryIcons = {
    gameplay: <Gamepad2 size={16} />,
    score: <Trophy size={16} />,
    survival: <Clock size={16} />,
    speed: <Zap size={16} />,
    funny: '😅',
    vsai: '🤖',
    multiplayer: <Users size={16} />,
    special: <Sparkles size={16} />,
    streak: '🔥',
    food: '🍎'
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 25% 25%, rgba(147, 51, 234, 0.08) 0%, transparent 60%)',
              'radial-gradient(circle at 75% 75%, rgba(219, 39, 119, 0.08) 0%, transparent 60%)',
              'radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.08) 0%, transparent 60%)'
            ]
          }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <Award className="inline mr-3" size={48} />
            Achievements
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Track your progress and unlock rewards as you master SnakrX
          </p>
        </motion.div>

        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card variant="gradient" padding="lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Total Progress */}
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">
                  {achievementStats.unlocked}/{achievementStats.total}
                </div>
                <div className="text-white/80 mb-3">Achievements</div>
                <div className="w-full bg-white/20 rounded-full h-3">
                  <div 
                    className="bg-white h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
                <div className="text-white/70 text-sm mt-2">{completionPercentage}% Complete</div>
              </div>

              {/* Points Earned */}
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-300 mb-2">
                  {totalPoints}
                </div>
                <div className="text-white/80">Points Earned</div>
                <div className="text-white/60 text-sm mt-2">
                  Achievement Score
                </div>
              </div>

              {/* Recent Unlocks */}
              <div className="text-center">
                <div className="text-3xl font-bold text-green-300 mb-2">
                  {recentUnlocks.length}
                </div>
                <div className="text-white/80">Recent Unlocks</div>
                <div className="text-white/60 text-sm mt-2">
                  This Session
                </div>
              </div>

              {/* Rarest Achievement */}
              <div className="text-center">
                <div className="text-3xl mb-2">👑</div>
                <div className="text-white/80">Legendary</div>
                <div className="text-white/60 text-sm mt-2">
                  {achievementStats.byTier?.legendary?.unlocked || 0}/{achievementStats.byTier?.legendary?.total || 0} Unlocked
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Uncollected Achievements Banner */}
        {uncollectedAchievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-8"
          >
            <Card variant="gradient" padding="lg" className="border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-4xl animate-bounce">🎁</div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      {uncollectedAchievements.length} Achievement{uncollectedAchievements.length > 1 ? 's' : ''} Ready to Collect!
                    </h3>
                    <p className="text-white/80">
                      Earn {uncollectedAchievements.reduce((sum, ach) => sum + ach.points, 0)} achievement points
                    </p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => collectAllAchievements()}
                    icon={<Sparkles size={20} />}
                    className="animate-pulse"
                  >
                    Collect All
                  </Button>
                </div>
              </div>
              
              {/* Preview of uncollected achievements */}
              <div className="mt-4 flex flex-wrap gap-2">
                {uncollectedAchievements.slice(0, 5).map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-center space-x-2 bg-white/10 rounded-full px-3 py-1 text-sm"
                  >
                    <span className="text-lg">{achievement.icon}</span>
                    <span className="text-white font-medium">{achievement.title}</span>
                    <span className="text-yellow-300 font-bold">+{achievement.points}</span>
                  </div>
                ))}
                {uncollectedAchievements.length > 5 && (
                  <div className="flex items-center justify-center bg-white/10 rounded-full px-3 py-1 text-sm text-white/70">
                    +{uncollectedAchievements.length - 5} more
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card variant="glass" padding="md">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === 'all' ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => {
                    setSelectedCategory('all');
                    playClick();
                  }}
                >
                  All Categories
                </Button>
                {Object.entries(ACHIEVEMENT_CATEGORIES).map(([key, category]) => (
                  <Button
                    key={key}
                    variant={selectedCategory === key ? "primary" : "ghost"}
                    size="sm"
                    icon={categoryIcons[key]}
                    onClick={() => {
                      setSelectedCategory(key);
                      playClick();
                    }}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>

              {/* Search and Options */}
              <div className="flex items-center space-x-3">
                {/* Search */}
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search achievements..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500/50 w-48"
                  />
                </div>

                {/* Tier Filter */}
                <select
                  value={selectedTier}
                  onChange={(e) => setSelectedTier(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                >
                  <option value="all" className="bg-dark-surface">All Tiers</option>
                  {Object.keys(ACHIEVEMENT_TIERS).map((tier) => (
                    <option key={tier} value={tier} className="bg-dark-surface">
                      {tier.charAt(0).toUpperCase() + tier.slice(1)}
                    </option>
                  ))}
                </select>

                {/* Show Unlocked Only */}
                <Button
                  variant={showUnlockedOnly ? "primary" : "ghost"}
                  size="sm"
                  icon={<CheckCircle size={16} />}
                  onClick={() => {
                    setShowUnlockedOnly(!showUnlockedOnly);
                    playClick();
                  }}
                >
                  Unlocked Only
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Achievement Stats by Tier */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(achievementStats.byTier || {}).map(([tier, stats]) => {
              const tierStyling = getTierStyling(tier);
              return (
                <StatsCard
                  key={tier}
                  title={tier.charAt(0).toUpperCase() + tier.slice(1)}
                  value={`${stats.unlocked}/${stats.total}`}
                  icon={
                    <div 
                      className="w-5 h-5 rounded-full"
                      style={{ backgroundColor: tierStyling.color }}
                    />
                  }
                  subtitle={`${stats.percentage}% unlocked`}
                />
              );
            })}
          </div>
        </motion.div>

        {/* Achievements Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 12 }).map((_, index) => (
                <CardSkeleton key={index} />
              ))}
            </div>
          ) : filteredAchievements.length === 0 ? (
            <Card variant="glass" padding="lg">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏆</div>
                <h3 className="text-xl font-semibold text-white mb-2">No Achievements Found</h3>
                <p className="text-white/70 mb-4">
                  {searchTerm 
                    ? `No achievements match "${searchTerm}"`
                    : showUnlockedOnly
                      ? "You haven't unlocked any achievements in this category yet"
                      : "No achievements in this category"
                  }
                </p>
                {(searchTerm || showUnlockedOnly) && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSearchTerm('');
                      setShowUnlockedOnly(false);
                      setSelectedCategory('all');
                      setSelectedTier('all');
                      playClick();
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence>
                {filteredAchievements.map((achievement, index) => {
                  const isUnlocked = isAchievementUnlocked(achievement.id);
                  const progress = isUnlocked ? 100 : (userProfile?.stats ? calculateAchievementProgress(achievement, userProfile.stats) : 0);
                  const tierStyling = getTierStyling(achievement.tier);

                  return (
                    <motion.div
                      key={achievement.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ 
                        duration: 0.3, 
                        delay: index * 0.05,
                        layout: { duration: 0.3 }
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        variant={isUnlocked ? "achievement" : "glass"}
                        clickable
                        onClick={() => handleAchievementClick(achievement)}
                        className={`h-full transition-all duration-300 ${
                          isUnlocked 
                            ? `shadow-lg ${tierStyling.glow}` 
                            : 'opacity-75 hover:opacity-90'
                        }`}
                      >
                        <div className="relative p-4">
                          {/* Achievement Icon */}
                          <div className="text-center mb-4">
                            <div className="text-4xl mb-2 relative">
                              {achievement.icon}
                              {!isUnlocked && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Lock size={20} className="text-white/60" />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Achievement Info */}
                          <div className="text-center mb-4">
                            <h3 className={`font-bold mb-2 ${isUnlocked ? 'text-white' : 'text-white/70'}`}>
                              {achievement.title}
                            </h3>
                            <p className={`text-sm leading-relaxed ${isUnlocked ? 'text-white/80' : 'text-white/60'}`}>
                              {achievement.description}
                            </p>
                          </div>

                          {/* Tier and Points */}
                          <div className="flex items-center justify-between mb-3">
                            <span 
                              className={`text-xs px-2 py-1 rounded-full font-medium`}
                              style={{ 
                                backgroundColor: `${tierStyling.color}20`,
                                color: tierStyling.color 
                              }}
                            >
                              {achievement.tier}
                            </span>
                            <span className="text-primary-400 font-bold text-sm">
                              +{achievement.points}
                            </span>
                          </div>

                          {/* Progress Bar for Locked Achievements */}
                          {!isUnlocked && progress > 0 && (
                            <div className="mb-3">
                              <div className="flex justify-between text-xs text-white/60 mb-1">
                                <span>Progress</span>
                                <span>{progress}%</span>
                              </div>
                              <div className="w-full bg-white/10 rounded-full h-2">
                                <div 
                                  className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Collection/Status Indicators */}
                          {(() => {
                            const isUncollected = uncollectedAchievements.some(ach => ach.id === achievement.id);
                            const isCollected = isUnlocked && !isUncollected;

                            if (isUncollected) {
                              return (
                                <div className="absolute top-2 right-2">
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      collectAchievement(achievement.id);
                                    }}
                                    icon={<Sparkles size={16} />}
                                    className="animate-pulse"
                                  >
                                    Collect
                                  </Button>
                                </div>
                              );
                            } else if (isCollected) {
                              return (
                                <div className="absolute top-2 right-2">
                                  <CheckCircle size={20} className="text-green-400" />
                                </div>
                              );
                            }
                            return null;
                          })()}

                          {/* Share Button for Collected Achievements */}
                          {isUnlocked && !uncollectedAchievements.some(ach => ach.id === achievement.id) && (
                            <div className="absolute bottom-2 right-2">
                              <Button
                                variant="minimal"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleShareAchievement(achievement.id);
                                }}
                                icon={<Share2 size={14} />}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              />
                            </div>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* Recent Unlocks Section */}
        {recentUnlocks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12"
          >
            <Card variant="glass" padding="lg">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Star className="mr-2 text-amber-400" size={24} />
                Recently Unlocked
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentUnlocks.slice(0, 6).map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <AchievementCard 
                      achievement={achievement} 
                      unlocked={true}
                      onClick={() => handleAchievementClick(achievement)}
                    />
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Achievement Detail Modal */}
      <Modal
        isOpen={showAchievementModal}
        onClose={() => setShowAchievementModal(false)}
        title="Achievement Details"
        size="sm"
      >
        {selectedAchievement && (
          <div className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="text-6xl mb-4"
            >
              {selectedAchievement.icon}
            </motion.div>
            
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                {selectedAchievement.title}
              </h3>
              <p className="text-white/70 mb-4 leading-relaxed">
                {selectedAchievement.description}
              </p>
              
              <div className="flex items-center justify-center space-x-4 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedAchievement.tier === 'legendary' ? 'bg-amber-500/20 text-amber-300' :
                  selectedAchievement.tier === 'epic' ? 'bg-purple-500/20 text-purple-300' :
                  selectedAchievement.tier === 'rare' ? 'bg-blue-500/20 text-blue-300' :
                  selectedAchievement.tier === 'uncommon' ? 'bg-emerald-500/20 text-emerald-300' :
                  'bg-gray-500/20 text-gray-300'
                }`}>
                  {selectedAchievement.tier}
                </span>
                <span className="text-primary-400 font-bold">
                  +{selectedAchievement.points} points
                </span>
              </div>

              {/* Requirements */}
              <div className="bg-white/5 rounded-lg p-3 mb-4">
                <h4 className="text-sm font-medium text-white/80 mb-2">Requirements:</h4>
                <div className="text-sm text-white/70">
                  {Object.entries(selectedAchievement.requirements).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span>{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress or Unlock Status */}
              {isAchievementUnlocked(selectedAchievement.id) ? (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-4">
                  <CheckCircle size={20} className="mx-auto mb-2 text-green-400" />
                  <p className="text-green-400 font-medium">Achievement Unlocked!</p>
                </div>
              ) : (
                <div className="bg-white/5 rounded-lg p-3 mb-4">
                  <div className="flex justify-between text-sm text-white/70 mb-2">
                    <span>Progress</span>
                    <span>{userProfile?.stats ? calculateAchievementProgress(selectedAchievement, userProfile.stats) : 0}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${userProfile?.stats ? calculateAchievementProgress(selectedAchievement, userProfile.stats) : 0}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="ghost"
                onClick={() => setShowAchievementModal(false)}
                fullWidth
              >
                Close
              </Button>
              {isAchievementUnlocked(selectedAchievement.id) && (
                <Button
                  variant="primary"
                  icon={<Share2 size={16} />}
                  onClick={() => {
                    handleShareAchievement(selectedAchievement.id);
                    setShowAchievementModal(false);
                  }}
                  fullWidth
                >
                  Share
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AchievementsPage;