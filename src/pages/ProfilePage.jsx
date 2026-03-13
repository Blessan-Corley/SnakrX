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
import { gameOperations } from '@/services/firebase';
import { getXpProgress } from '@/utils/experience';

/**
 * Profile Page Component
 * Shows user statistics, achievements, settings, and match history
 */
const ProfilePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { userProfile, user } = useAuth();
  const { updateProfile } = useAuthOperations();
  const {
    getAchievementStats,
    getTotalPointsEarned,
    achievements
  } = useAchievementOperations();

  // State
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');

  useEffect(() => {
    const nextTab = searchParams.get('tab') || 'overview';
    setActiveTab((currentTab) => (currentTab === nextTab ? currentTab : nextTab));
  }, [searchParams]);

  // Update URL when tab changes
  useEffect(() => {
    const currentTab = searchParams.get('tab') || 'overview';
    if (currentTab === activeTab) return;

    const nextParams = new URLSearchParams(searchParams);
    if (activeTab === 'overview') {
      nextParams.delete('tab');
    } else {
      nextParams.set('tab', activeTab);
    }
    setSearchParams(nextParams, { replace: true });
  }, [activeTab, searchParams, setSearchParams]);

  // Get user stats
  const userStats = userProfile?.stats || {};

  // Memoize expensive calculations
  const achievementStats = useMemo(() => getAchievementStats(), [getAchievementStats]);
  const totalAchievementPoints = useMemo(() => getTotalPointsEarned(), [getTotalPointsEarned]);

  // Memoize player level calculations
  const levelData = useMemo(() => {
    const fallbackXp = Math.max(0, Math.floor((userStats.totalScore || 0) / 5));
    return getXpProgress(typeof userStats.xp === 'number' ? userStats.xp : fallbackXp);
  }, [userStats.totalScore, userStats.xp]);

  const [matchHistory, setMatchHistory] = useState([]);

  useEffect(() => {
    if (!user?.uid) return;
    const loadHistory = async () => {
      const games = await gameOperations.getUserGames(user.uid, 10);
      const mapped = games.map(game => {
        const endedAt =
          game.endedAt?.seconds ? new Date(game.endedAt.seconds * 1000) :
          typeof game.endedAt === 'number' ? new Date(game.endedAt) :
          new Date();
        const modeLabel = game.mode === 'vsai'
          ? `VS AI (${game.difficulty || 'Medium'})`
          : game.mode === 'multiplayer'
          ? 'Multiplayer'
          : game.mode === 'classic_transparent'
          ? 'Classic Transparent'
          : 'Classic';
        const isClassicSession = game.mode === 'classic' || game.mode === 'classic_transparent';
        const normalizedResult = isClassicSession
          ? 'completed'
          : game.result === 'won'
            ? 'victory'
            : game.result === 'lost'
              ? 'defeat'
              : 'completed';

        return {
          id: game.id,
          mode: modeLabel,
          score: game.score || 0,
          time: game.duration || 0,
          result: normalizedResult,
          date: endedAt,
          achievements: []
        };
      });
      setMatchHistory(mapped);
    };
    loadHistory();
  }, [user]);

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
          playerLevel={levelData.level}
          levelProgress={levelData.progressPercent}
          nextLevelScore={levelData.nextLevelXp}
          currentLevelScore={levelData.currentLevelXp}
          xpNeededForNext={levelData.xpNeededForNext}
          totalXp={levelData.xp}
          isMaxLevel={levelData.isMaxLevel}
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
                mockMatchHistory={matchHistory}
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
              <MatchHistoryTab mockMatchHistory={matchHistory} />
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
