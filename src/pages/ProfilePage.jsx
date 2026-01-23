import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, useAuthOperations } from '@/hooks/useAuth';
import { useAchievementOperations } from '@/hooks/useAchievements';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  ProfileHeader,
  ProfileTabs,
  OverviewTab,
  StatisticsTab,
  AchievementsTab,
  MatchHistoryTab,
  SettingsTab,
  FriendsTab
} from '@/components/profile';

/**
 * Profile Page Component
 * Shows user statistics, achievements, settings, and match history
 */
const ProfilePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { userProfile } = useAuth();
  const { updateProfile } = useAuthOperations();
  const {
    getAchievementStats,
    getTotalPointsEarned,
    achievements
  } = useAchievementOperations();

  // State
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');

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

  // Memoize expensive calculations
  const achievementStats = useMemo(() => getAchievementStats(), [getAchievementStats]);
  const totalAchievementPoints = useMemo(() => getTotalPointsEarned(), [getTotalPointsEarned]);

  // Memoize player level calculations
  const levelData = useMemo(() => {
    const totalScore = userStats.totalScore || 0;
    const playerLevel = Math.floor(Math.sqrt(totalScore / 100)) + 1;
    const nextLevelScore = Math.pow(playerLevel, 2) * 100;
    const currentLevelScore = Math.pow(playerLevel - 1, 2) * 100;
    const levelProgress = ((totalScore - currentLevelScore) / (nextLevelScore - currentLevelScore)) * 100;

    return {
      playerLevel,
      nextLevelScore,
      currentLevelScore,
      levelProgress: Math.min(100, Math.max(0, levelProgress))
    };
  }, [userStats.totalScore]);

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
        <ProfileHeader
          userProfile={userProfile}
          playerLevel={levelData.playerLevel}
          levelProgress={levelData.levelProgress}
          nextLevelScore={levelData.nextLevelScore}
          userStats={userStats}
          onUpdate={updateProfile}
        />

        {/* Navigation Tabs */}
        <ProfileTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'overview' && (
              <OverviewTab
                userStats={userStats}
                achievementStats={achievementStats}
                totalAchievementPoints={totalAchievementPoints}
                mockMatchHistory={mockMatchHistory}
              />
            )}

            {activeTab === 'statistics' && (
              <StatisticsTab userStats={userStats} />
            )}

            {activeTab === 'achievements' && (
              <AchievementsTab
                achievementStats={achievementStats}
                achievements={achievements}
              />
            )}

            {activeTab === 'history' && (
              <MatchHistoryTab mockMatchHistory={mockMatchHistory} />
            )}

            {activeTab === 'friends' && (
              <FriendsTab />
            )}

            {activeTab === 'settings' && (
              <SettingsTab
                userProfile={userProfile}
                onSaveProfile={updateProfile}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProfilePage;
