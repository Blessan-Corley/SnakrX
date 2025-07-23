import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Trophy, 
  Award, 
  Calendar,
  Clock,
  Target,
  Zap,
  TrendingUp,
  Settings,
  Edit3,
  Save,
  X,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Gamepad2,
  Star,
  Crown,
  Medal,
  BarChart3,
  History,
  Mail,
  Shield
} from 'lucide-react';
import { useAuth, useAuthOperations } from '@/hooks/useAuth';
import { useAchievementOperations } from '@/hooks/useAchievements';
import Button from '@/components/ui/Button';
import Card, { StatsCard } from '@/components/ui/Card';
import LoadingSpinner, { CardSkeleton } from '@/components/ui/LoadingSpinner';
import { playClick } from '@/utils/sound';
import { formatScore, formatTime } from '@/utils/gameUtils';
import { getMuted, getVolume, setVolume, toggleMute } from '@/utils/sound';

/**
 * Profile Page Component
 * Shows user statistics, achievements, settings, and match history
 */
const ProfilePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { userProfile } = useAuth();
  const { updateProfile, updateUserStats } = useAuthOperations();
  const { 
    getAchievementStats, 
    getUnlockedAchievementsByCategory, 
    getTotalPointsEarned,
    achievements 
  } = useAchievementOperations();

  // State
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: '',
    favoriteGameMode: ''
  });
  
  // Settings state
  const [soundEnabled, setSoundEnabled] = useState(!getMuted());
  const [soundVolume, setSoundVolume] = useState(getVolume());
  const [showStats, setShowStats] = useState(true);

  // Initialize form data
  useEffect(() => {
    if (userProfile) {
      setEditForm({
        displayName: userProfile.displayName || '',
        favoriteGameMode: userProfile.preferences?.favoriteGameMode || 'classic'
      });
    }
  }, [userProfile]);

  // Update URL when tab changes
  useEffect(() => {
    setSearchParams(prev => {
      if (activeTab === 'overview') {
        prev.delete('tab');
      } else {
        prev.set('tab', activeTab);
      }
      return prev;
    });
  }, [activeTab, setSearchParams]);

  // Get user stats
  const userStats = userProfile?.stats || {};
  const achievementStats = getAchievementStats();
  const totalAchievementPoints = getTotalPointsEarned();

  // Tab configuration
  const tabs = [
    { id: 'overview', name: 'Overview', icon: <User size={18} /> },
    { id: 'statistics', name: 'Statistics', icon: <BarChart3 size={18} /> },
    { id: 'achievements', name: 'Achievements', icon: <Award size={18} /> },
    { id: 'history', name: 'Match History', icon: <History size={18} /> },
    { id: 'settings', name: 'Settings', icon: <Settings size={18} /> }
  ];

  // Handle profile editing
  const handleStartEdit = () => {
    setEditing(true);
    playClick();
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setEditForm({
      displayName: userProfile.displayName || '',
      favoriteGameMode: userProfile.preferences?.favoriteGameMode || 'classic'
    });
    playClick();
  };

  const handleSaveEdit = async () => {
    setLoading(true);
    try {
      await updateProfile({
        displayName: editForm.displayName,
        preferences: {
          ...userProfile.preferences,
          favoriteGameMode: editForm.favoriteGameMode
        }
      });
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle sound settings
  const handleSoundToggle = () => {
    const newMuted = toggleMute();
    setSoundEnabled(!newMuted);
    if (!newMuted) playClick();
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    setSoundVolume(newVolume);
  };

  // Calculate player level based on total score
  const calculateLevel = (totalScore) => {
    return Math.floor(Math.sqrt(totalScore / 100)) + 1;
  };

  const playerLevel = calculateLevel(userStats.totalScore || 0);
  const nextLevelScore = Math.pow(playerLevel, 2) * 100;
  const currentLevelScore = Math.pow(playerLevel - 1, 2) * 100;
  const levelProgress = ((userStats.totalScore || 0) - currentLevelScore) / (nextLevelScore - currentLevelScore) * 100;

  // Mock match history (in a real app, this would come from Firebase)
  const mockMatchHistory = [
    {
      id: 1,
      mode: 'Classic',
      score: 1250,
      time: 425,
      result: 'completed',
      date: new Date(Date.now() - 1000 * 60 * 60 * 2),
      achievements: ['Speed Demon']
    },
    {
      id: 2,
      mode: 'VS AI (Medium)',
      score: 890,
      time: 315,
      result: 'victory',
      date: new Date(Date.now() - 1000 * 60 * 60 * 6),
      achievements: []
    },
    {
      id: 3,
      mode: 'Classic',
      score: 2150,
      time: 680,
      result: 'completed',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24),
      achievements: ['High Roller', 'Survivor']
    },
    {
      id: 4,
      mode: 'VS AI (Impossible)',
      score: 450,
      time: 180,
      result: 'defeat',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      achievements: []
    }
  ];

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner fullScreen text="Loading profile..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.08) 0%, transparent 60%)',
              'radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.08) 0%, transparent 60%)',
              'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.08) 0%, transparent 60%)'
            ]
          }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card variant="glass" padding="lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              {/* User Info */}
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gradient-sunset rounded-full flex items-center justify-center text-3xl font-bold text-white">
                  {userProfile.displayName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  {editing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editForm.displayName}
                        onChange={(e) => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
                        className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                        placeholder="Display Name"
                      />
                      <div className="flex space-x-2">
                        <Button size="sm" onClick={handleSaveEdit} loading={loading} disabled={loading}>
                          <Save size={14} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                          <X size={14} />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center space-x-3">
                        <h1 className="text-2xl font-bold text-white">
                          {userProfile.displayName || 'Player'}
                        </h1>
                        <Button variant="minimal" size="icon" onClick={handleStartEdit}>
                          <Edit3 size={16} />
                        </Button>
                      </div>
                      <p className="text-white/70">@{userProfile.username}</p>
                      <p className="text-white/50 text-sm">
                        Member since {new Date(userProfile.createdAt?.toDate?.() || Date.now()).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Player Level */}
              <div className="text-center md:text-right">
                <div className="flex items-center justify-center md:justify-end space-x-2 mb-2">
                  <Crown size={20} className="text-amber-400" />
                  <span className="text-xl font-bold text-white">Level {playerLevel}</span>
                </div>
                <div className="w-48 bg-white/10 rounded-full h-2">
                  <div 
                    className="bg-gradient-sunset h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, levelProgress)}%` }}
                  />
                </div>
                <p className="text-white/60 text-sm mt-1">
                  {Math.max(0, nextLevelScore - (userStats.totalScore || 0))} points to level {playerLevel + 1}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card variant="glass" padding="sm">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "primary" : "ghost"}
                  size="sm"
                  icon={tab.icon}
                  onClick={() => {
                    setActiveTab(tab.id);
                    playClick();
                  }}
                >
                  {tab.name}
                </Button>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Stats Overview */}
                <div className="lg:col-span-2 space-y-6">
                  <h2 className="text-2xl font-bold text-white">Gaming Overview</h2>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatsCard
                      title="Total Score"
                      value={formatScore(userStats.totalScore || 0)}
                      icon={<Trophy size={20} />}
                      subtitle="All time"
                    />
                    <StatsCard
                      title="Best Game"
                      value={formatScore(userStats.bestScore || 0)}
                      icon={<Star size={20} />}
                      subtitle="Personal record"
                    />
                    <StatsCard
                      title="Games Played"
                      value={userStats.totalGames || 0}
                      icon={<Gamepad2 size={20} />}
                      subtitle="Total matches"
                    />
                    <StatsCard
                      title="Win Rate"
                      value={`${userStats.totalGames > 0 ? Math.round((userStats.totalWins || 0) / userStats.totalGames * 100) : 0}%`}
                      icon={<TrendingUp size={20} />}
                      subtitle="Success rate"
                    />
                  </div>

                  {/* Recent Activity */}
                  <Card variant="glass" padding="md">
                    <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      {mockMatchHistory.slice(0, 3).map((match) => (
                        <div key={match.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div>
                            <div className="font-medium text-white">{match.mode}</div>
                            <div className="text-sm text-white/60">
                              {formatScore(match.score)} • {formatTime(match.time)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-sm font-medium ${
                              match.result === 'victory' ? 'text-green-400' :
                              match.result === 'defeat' ? 'text-red-400' :
                              'text-white'
                            }`}>
                              {match.result === 'victory' ? 'Victory' :
                               match.result === 'defeat' ? 'Defeat' :
                               'Completed'}
                            </div>
                            <div className="text-xs text-white/60">
                              {match.date.toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* Achievements & Quick Stats */}
                <div className="space-y-6">
                  {/* Achievement Summary */}
                  <Card variant="glass" padding="md">
                    <h3 className="text-lg font-semibold text-white mb-4">Achievements</h3>
                    <div className="text-center mb-4">
                      <div className="text-3xl font-bold text-white mb-1">
                        {achievementStats.unlocked}
                      </div>
                      <div className="text-white/60">
                        of {achievementStats.total} unlocked
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                        <div 
                          className="bg-gradient-sunset h-2 rounded-full transition-all duration-500"
                          style={{ width: `${achievementStats.completionPercentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-primary-400 font-bold">
                        {totalAchievementPoints} points
                      </div>
                      <div className="text-white/60 text-sm">earned</div>
                    </div>
                  </Card>

                  {/* Quick Game Stats */}
                  <Card variant="glass" padding="md">
                    <h3 className="text-lg font-semibold text-white mb-4">Game Modes</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-white/70">Classic</span>
                        <span className="text-white font-medium">{userStats.classicGames || 0} games</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/70">VS AI</span>
                        <span className="text-white font-medium">{userStats.vsAIGames || 0} games</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/70">Multiplayer</span>
                        <span className="text-white font-medium">{userStats.multiplayerGames || 0} games</span>
                      </div>
                    </div>
                  </Card>

                  {/* Fun Stats */}
                  <Card variant="glass" padding="md">
                    <h3 className="text-lg font-semibold text-white mb-4">Fun Stats</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/70">Food Eaten:</span>
                        <span className="text-white">{userStats.foodEaten || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Wall Hits:</span>
                        <span className="text-white">{userStats.wallHits || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Max Speed:</span>
                        <span className="text-white">{(userStats.maxSpeed || 1).toFixed(1)}x</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Play Time:</span>
                        <span className="text-white">{formatTime(Math.floor((userStats.totalPlayTime || 0) / 60))}</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* Statistics Tab */}
            {activeTab === 'statistics' && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-white">Detailed Statistics</h2>
                
                {/* Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatsCard
                    title="Total Score"
                    value={formatScore(userStats.totalScore || 0)}
                    icon={<Trophy size={20} />}
                    trend={userStats.totalScore > 1000 ? 15 : 0}
                    subtitle="All time points"
                  />
                  <StatsCard
                    title="Best Score"
                    value={formatScore(userStats.bestScore || 0)}
                    icon={<Crown size={20} />}
                    subtitle="Personal record"
                  />
                  <StatsCard
                    title="Average Score"
                    value={formatScore(userStats.totalGames > 0 ? Math.round((userStats.totalScore || 0) / userStats.totalGames) : 0)}
                    icon={<Target size={20} />}
                    subtitle="Per game"
                  />
                  <StatsCard
                    title="Win Rate"
                    value={`${userStats.totalGames > 0 ? Math.round((userStats.totalWins || 0) / userStats.totalGames * 100) : 0}%`}
                    icon={<Medal size={20} />}
                    trend={userStats.totalWins > userStats.totalGames * 0.5 ? 8 : 0}
                    subtitle="Success rate"
                  />
                </div>

                {/* Game Mode Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card variant="glass" padding="md">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <Target className="mr-2 text-green-400" size={20} />
                      Classic Mode
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-white/70">Games Played:</span>
                        <span className="text-white font-medium">{userStats.classicGames || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Games Won:</span>
                        <span className="text-white font-medium">{userStats.classicWins || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Best Score:</span>
                        <span className="text-white font-medium">{formatScore(userStats.classicBestScore || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Win Rate:</span>
                        <span className="text-white font-medium">
                          {userStats.classicGames > 0 ? Math.round((userStats.classicWins || 0) / userStats.classicGames * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  </Card>

                  <Card variant="glass" padding="md">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <Zap className="mr-2 text-blue-400" size={20} />
                      VS AI Mode
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-white/70">Games Played:</span>
                        <span className="text-white font-medium">{userStats.vsAIGames || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Games Won:</span>
                        <span className="text-white font-medium">{userStats.vsAIWins || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Easy Wins:</span>
                        <span className="text-white font-medium">{userStats.aiEasyWins || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Impossible Wins:</span>
                        <span className="text-white font-medium">{userStats.aiImpossibleWins || 0}</span>
                      </div>
                    </div>
                  </Card>

                  <Card variant="glass" padding="md">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <Gamepad2 className="mr-2 text-purple-400" size={20} />
                      General Stats
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-white/70">Play Time:</span>
                        <span className="text-white font-medium">{formatTime(Math.floor((userStats.totalPlayTime || 0) / 60))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Food Eaten:</span>
                        <span className="text-white font-medium">{userStats.foodEaten || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Best Streak:</span>
                        <span className="text-white font-medium">{userStats.bestWinStreak || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Max Speed:</span>
                        <span className="text-white font-medium">{(userStats.maxSpeed || 1).toFixed(1)}x</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* Achievements Tab */}
            {activeTab === 'achievements' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Achievements</h2>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary-400">
                      {achievementStats.unlocked}/{achievementStats.total}
                    </div>
                    <div className="text-white/60 text-sm">Unlocked</div>
                  </div>
                </div>

                {/* Achievement Categories */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(achievementStats.byCategory).map(([category, stats]) => {
                    const categoryData = achievements.find(a => a.category === category);
                    const categoryInfo = {
                      gameplay: { name: 'Gameplay', icon: '🎮', color: 'text-orange-400' },
                      score: { name: 'High Scores', icon: '🏆', color: 'text-yellow-400' },
                      survival: { name: 'Survival', icon: '⏰', color: 'text-green-400' },
                      speed: { name: 'Speed', icon: '⚡', color: 'text-blue-400' },
                      funny: { name: 'Oops!', icon: '😅', color: 'text-red-400' },
                      vsai: { name: 'AI Destroyer', icon: '🤖', color: 'text-purple-400' },
                      multiplayer: { name: 'Social', icon: '👥', color: 'text-cyan-400' },
                      special: { name: 'Special', icon: '✨', color: 'text-pink-400' }
                    }[category] || { name: category, icon: '🏅', color: 'text-white' };

                    return (
                      <Card key={category} variant="glass" padding="md">
                        <div className="text-center">
                          <div className="text-3xl mb-2">{categoryInfo.icon}</div>
                          <h3 className={`font-semibold ${categoryInfo.color} mb-2`}>
                            {categoryInfo.name}
                          </h3>
                          <div className="text-2xl font-bold text-white mb-1">
                            {stats.unlocked}/{stats.total}
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                            <div 
                              className="bg-gradient-sunset h-2 rounded-full transition-all duration-500"
                              style={{ width: `${stats.percentage}%` }}
                            />
                          </div>
                          <div className="text-white/60 text-sm">
                            {stats.percentage}% complete
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Match History Tab */}
            {activeTab === 'history' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Match History</h2>
                
                <div className="space-y-4">
                  {mockMatchHistory.map((match) => (
                    <Card key={match.id} variant="glass" padding="md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-3 h-3 rounded-full ${
                            match.result === 'victory' ? 'bg-green-400' :
                            match.result === 'defeat' ? 'bg-red-400' :
                            'bg-blue-400'
                          }`} />
                          <div>
                            <div className="font-semibold text-white">{match.mode}</div>
                            <div className="text-sm text-white/60">
                              {match.date.toLocaleDateString()} • {match.date.toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-6">
                          <div className="text-right">
                            <div className="font-bold text-white">{formatScore(match.score)}</div>
                            <div className="text-sm text-white/60">Score</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-white">{formatTime(match.time)}</div>
                            <div className="text-sm text-white/60">Time</div>
                          </div>
                          <div className={`text-right font-medium ${
                            match.result === 'victory' ? 'text-green-400' :
                            match.result === 'defeat' ? 'text-red-400' :
                            'text-white'
                          }`}>
                            {match.result === 'victory' ? 'Victory' :
                             match.result === 'defeat' ? 'Defeat' :
                             'Completed'}
                          </div>
                        </div>
                      </div>
                      
                      {match.achievements.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <div className="flex items-center space-x-2">
                            <Award size={14} className="text-primary-400" />
                            <span className="text-sm text-white/70">Achievements:</span>
                            <div className="flex flex-wrap gap-1">
                              {match.achievements.map((achievement, index) => (
                                <span key={index} className="text-xs bg-primary-500/20 text-primary-400 px-2 py-1 rounded-full">
                                  {achievement}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-white">Settings</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Account Settings */}
                  <div className="space-y-6">
                    <Card variant="glass" padding="md">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <User className="mr-2" size={20} />
                        Account Information
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm text-white/70 mb-2">Display Name</label>
                          <input
                            type="text"
                            value={editForm.displayName}
                            onChange={(e) => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-white/70 mb-2">Username</label>
                          <input
                            type="text"
                            value={userProfile.username}
                            disabled
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white/50 cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-white/70 mb-2">Email</label>
                          <input
                            type="email"
                            value={userProfile.email}
                            disabled
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white/50 cursor-not-allowed"
                          />
                        </div>
                        <Button onClick={handleSaveEdit} loading={loading} disabled={loading}>
                          Save Changes
                        </Button>
                      </div>
                    </Card>

                    <Card variant="glass" padding="md">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <Shield className="mr-2" size={20} />
                        Privacy
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white font-medium">Show Statistics</div>
                            <div className="text-white/60 text-sm">Allow others to see your game statistics</div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowStats(!showStats)}
                            icon={showStats ? <Eye size={18} /> : <EyeOff size={18} />}
                          />
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Game Settings */}
                  <div className="space-y-6">
                    <Card variant="glass" padding="md">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <Volume2 className="mr-2" size={20} />
                        Audio Settings
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white font-medium">Sound Effects</div>
                            <div className="text-white/60 text-sm">Game sounds and music</div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleSoundToggle}
                            icon={soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                          />
                        </div>
                        
                        {soundEnabled && (
                          <div>
                            <label className="block text-sm text-white/70 mb-2">Volume</label>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.1"
                              value={soundVolume}
                              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                            />
                            <div className="text-right text-sm text-white/60 mt-1">
                              {Math.round(soundVolume * 100)}%
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>

                    <Card variant="glass" padding="md">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <Gamepad2 className="mr-2" size={20} />
                        Game Preferences
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm text-white/70 mb-2">Favorite Game Mode</label>
                          <select
                            value={editForm.favoriteGameMode}
                            onChange={(e) => setEditForm(prev => ({ ...prev, favoriteGameMode: e.target.value }))}
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                          >
                            <option value="classic" className="bg-dark-surface">Classic Mode</option>
                            <option value="vsai" className="bg-dark-surface">VS AI</option>
                            <option value="multiplayer" className="bg-dark-surface">Multiplayer</option>
                          </select>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProfilePage;