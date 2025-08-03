import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Trophy, 
  Award, 
  Target, 
  Users, 
  Shield, 
  BarChart3,
  Clock,
  Star,
  Zap,
  Crown,
  TrendingUp,
  Calendar,
  Gamepad2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAchievementOperations } from '@/hooks/useAchievements';
import useLeaderboard from '@/hooks/useLeaderboard';
import Button from '@/components/ui/Button';
import { GameModeCard, StatsCard, AchievementCard, LeaderboardCard } from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { playClick } from '@/utils/sound';
import { formatScore, formatTime, isMobile } from '@/utils/gameUtils';

/**
 * Home Page - Main Dashboard
 * Features welcome message, game modes, stats, and recent activity
 */
const HomePage = () => {
  const { userProfile } = useAuth();
  const { recentUnlocks, getNextAchievements, getAchievementStats } = useAchievementOperations();
  const { getLeaderboardSummary, topPlayers } = useLeaderboard();
  const navigate = useNavigate();
  
  const [typingComplete, setTypingComplete] = useState(false);
  const [showGameModes, setShowGameModes] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [leaderboardSummary, setLeaderboardSummary] = useState(null);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

  const isAdmin = userProfile?.role === 'admin' || userProfile?.username === 'admin';
  const mobile = isMobile();

  // Mouse position for dynamic background
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Typing animation sequence
  useEffect(() => {
    const timer1 = setTimeout(() => setTypingComplete(true), 2000);
    const timer2 = setTimeout(() => setShowGameModes(true), 2500);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // Load leaderboard data
  useEffect(() => {
    const loadLeaderboard = async () => {
      setLoadingLeaderboard(true);
      try {
        const summary = await getLeaderboardSummary();
        setLeaderboardSummary(summary);
      } catch (error) {
        console.error('Error loading leaderboard summary:', error);
        setLeaderboardSummary({ topThree: [], userBestRank: null, hasData: false });
      } finally {
        setLoadingLeaderboard(false);
      }
    };

    loadLeaderboard();
  }, [getLeaderboardSummary]);

  // Handle game mode selection
  const handleGameMode = (mode, difficulty = null, playerCount = 1) => {
    playClick();
    
    if (mode === 'multiplayer' && mobile) {
      // Show mobile restriction message
      return;
    }
    
    // Navigate to game selection page to allow user to choose difficulty/players
    navigate('/game');
  };

  // Get user stats
  const userStats = userProfile?.stats || {};
  const achievementStats = getAchievementStats();
  const nextAchievements = getNextAchievements(3);

  // Quick stats for cards
  const quickStats = [
    {
      title: "Total Score",
      value: formatScore(userStats.totalScore || 0),
      icon: <Trophy size={24} />,
      trend: userStats.totalScore > 0 ? 15 : 0,
      subtitle: "All time points"
    },
    {
      title: "Best Game",
      value: formatScore(userStats.bestScore || 0),
      icon: <Star size={24} />,
      subtitle: "Personal record"
    },
    {
      title: "Games Played",
      value: userStats.totalGames || 0,
      icon: <Gamepad2 size={24} />,
      trend: userStats.totalGames > 10 ? 8 : 0,
      subtitle: "Total matches"
    },
    {
      title: "Achievement Points",
      value: userStats.achievementPoints || 0,
      icon: <Award size={24} />,
      subtitle: `${achievementStats.unlocked}/${achievementStats.total} unlocked`
    }
  ];

  // Build leaderboard display data from real Firebase data
  const recentLeaderboard = React.useMemo(() => {
    if (loadingLeaderboard || !leaderboardSummary?.hasData) {
      return [];
    }

    const { topThree, userBestRank } = leaderboardSummary;
    const leaderboardEntries = [];

    // Add top 3 players
    topThree.forEach((entry, index) => {
      leaderboardEntries.push({
        rank: index + 1,
        player: entry.username || 'Anonymous',
        score: formatScore(entry.score),
        mode: entry.mode === 'classic' ? 'Classic' : 
              entry.mode === 'vsai' ? `VS AI ${entry.difficulty || ''}` : 
              entry.mode === 'multiplayer' ? 'Multiplayer' : 'Classic',
        date: entry.timestamp ? new Date(entry.timestamp.seconds * 1000).toLocaleDateString() : 'Recently',
        highlighted: entry.userId === userProfile?.uid
      });
    });

    // Add user's best rank if not in top 3
    if (userBestRank && !topThree.some(entry => entry.userId === userProfile?.uid)) {
      leaderboardEntries.push({
        rank: userBestRank.rank,
        player: userProfile?.displayName || userProfile?.username || 'You',
        score: formatScore(userBestRank.score),
        mode: 'Your Best',
        date: 'Personal Record',
        highlighted: true
      });
    }

    return leaderboardEntries.slice(0, 3); // Limit to 3 entries for home page
  }, [leaderboardSummary, loadingLeaderboard, userProfile]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
        <motion.div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(249, 115, 22, 0.1) 0%, transparent 50%)`
          }}
        />
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 20% 80%, rgba(139, 92, 246, 0.08) 0%, transparent 60%)',
              'radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.08) 0%, transparent 60%)',
              'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.08) 0%, transparent 60%)'
            ]
          }}
          transition={{ duration: 15, repeat: Infinity, repeatType: "reverse" }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section with Typing Animation */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
              className="text-6xl mb-4"
            >
              🐍
            </motion.div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-sunset bg-clip-text text-transparent">
                SnakrX
              </span>
            </h1>
            
            <div className="text-xl md:text-2xl text-white/80 h-8 flex items-center justify-center">
              <TypewriterText
                text={`Welcome back, ${userProfile?.displayName || 'Player'}!`}
                onComplete={() => setTypingComplete(true)}
              />
            </div>
          </div>

          {/* Quick Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: typingComplete ? 1 : 0, y: typingComplete ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
          >
            {quickStats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
              >
                <StatsCard {...stat} />
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* Game Modes Section */}
        <AnimatePresence>
          {showGameModes && (
            <motion.section
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.8 }}
              className="mb-12"
            >
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-bold text-white text-center mb-8"
              >
                Choose Your Game Mode
              </motion.h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {/* Classic Mode */}
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <GameModeCard
                    title="Classic Mode"
                    description="Endless snake gameplay with increasing speed and challenge"
                    icon="🎮"
                    onClick={() => handleGameMode('classic')}
                  />
                </motion.div>

                {/* VS AI Mode */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <GameModeCard
                    title="VS AI Mode"
                    description="Battle intelligent AI opponents with multiple difficulty levels"
                    icon="🤖"
                    onClick={() => handleGameMode('vsai', 'medium')}
                  />
                </motion.div>

                {/* Multiplayer Mode */}
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <GameModeCard
                    title="Multiplayer Mode"
                    description={mobile ? "Play on PC/Laptop to unlock full experience" : "Local multiplayer battles with up to 4 players"}
                    icon="👥"
                    disabled={mobile}
                    onClick={() => !mobile && handleGameMode('multiplayer', null, 2)}
                    className={mobile ? 'opacity-50 cursor-not-allowed' : ''}
                  />
                </motion.div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Dashboard Grid */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: showGameModes ? 1 : 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Recent Achievements */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Award className="mr-2" size={20} />
              Recent Achievements
            </h3>
            <div className="space-y-4">
              {recentUnlocks.length > 0 ? (
                recentUnlocks.slice(0, 3).map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <AchievementCard 
                      achievement={achievement} 
                      unlocked={true} 
                      userStats={userStats}
                    />
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">🏆</div>
                  <p className="text-white/70">No achievements yet!</p>
                  <p className="text-white/50 text-sm mt-1">Start playing to unlock rewards</p>
                </div>
              )}
              
              {nextAchievements.length > 0 && (
                <div className="pt-4 border-t border-white/10">
                  <h4 className="text-sm font-medium text-white/80 mb-3">Next to Unlock:</h4>
                  {nextAchievements.slice(0, 2).map((achievement, index) => (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="mb-3"
                    >
                      <AchievementCard 
                        achievement={achievement} 
                        unlocked={false}
                        progress={achievement.progress}
                        userStats={userStats}
                        showRequirements={true}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
              
              <Link to="/achievements">
                <Button variant="ghost" fullWidth onClick={() => playClick()}>
                  View All Achievements
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Actions & Leaderboard */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Zap className="mr-2" size={20} />
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link to="/leaderboard">
                  <Button variant="ghost-primary" fullWidth onClick={() => playClick()}>
                    <Trophy size={18} className="mr-2" />
                    Leaderboard
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button variant="ghost-primary" fullWidth onClick={() => playClick()}>
                    <BarChart3 size={18} className="mr-2" />
                    Profile
                  </Button>
                </Link>
                <Link to="/achievements">
                  <Button variant="ghost-primary" fullWidth onClick={() => playClick()}>
                    <Award size={18} className="mr-2" />
                    Achievements
                  </Button>
                </Link>
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="ghost-primary" fullWidth onClick={() => playClick()}>
                      <Shield size={18} className="mr-2" />
                      Admin
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Recent Leaderboard */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Crown className="mr-2" size={20} />
                Top Players
              </h3>
              <div className="space-y-3">
                {loadingLeaderboard ? (
                  <div className="text-center py-8">
                    <LoadingSpinner size="sm" />
                    <p className="text-white/70 text-sm mt-2">Loading leaderboard...</p>
                  </div>
                ) : recentLeaderboard.length > 0 ? (
                  recentLeaderboard.map((entry, index) => (
                    <motion.div
                      key={`${entry.rank}-${entry.player}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <LeaderboardCard {...entry} />
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">🏆</div>
                    <p className="text-white/70">No leaderboard data yet!</p>
                    <p className="text-white/50 text-sm mt-1">Be the first to set a record</p>
                  </div>
                )}
              </div>
              <Link to="/leaderboard" className="block mt-4">
                <Button variant="ghost" fullWidth onClick={() => playClick()}>
                  View Full Leaderboard
                </Button>
              </Link>
            </div>

            {/* Player Insights */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <TrendingUp className="mr-2" size={20} />
                Your Gaming Journey
              </h3>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {Math.max(0, Math.floor((userStats.totalPlayTime || 0) / 60))}
                    </div>
                    <div className="text-white/70 text-sm">Minutes Played</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {userStats.bestWinStreak || 0}
                    </div>
                    <div className="text-white/70 text-sm">Best Win Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {userStats.foodEaten || 0}
                    </div>
                    <div className="text-white/70 text-sm">Food Consumed</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10 text-center">
                  <p className="text-white/60 text-sm">
                    Member since {(() => {
                      if (userProfile?.createdAt) {
                        // Handle Firebase Timestamp
                        if (typeof userProfile.createdAt.toDate === 'function') {
                          return userProfile.createdAt.toDate().toLocaleDateString();
                        }
                        // Handle seconds-based timestamp
                        if (userProfile.createdAt.seconds) {
                          return new Date(userProfile.createdAt.seconds * 1000).toLocaleDateString();
                        }
                        // Handle regular Date or timestamp
                        return new Date(userProfile.createdAt).toLocaleDateString();
                      }
                      return new Date().toLocaleDateString();
                    })()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Call to Action */}
        {userStats.totalGames === 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="text-center mt-12 py-12 bg-gradient-sunset/10 rounded-2xl border border-primary-500/20"
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              Ready for Your First Game? 🎮
            </h2>
            <p className="text-white/70 mb-6 max-w-md mx-auto">
              Jump into the action and start your SnakrX journey. Choose a game mode and let the fun begin!
            </p>
            <Button 
              variant="primary" 
              size="lg"
              icon={<Play size={20} />}
              onClick={() => handleGameMode('classic')}
            >
              Start with Classic Mode
            </Button>
          </motion.section>
        )}
      </div>
    </div>
  );
};

/**
 * Typewriter Text Component
 */
const TypewriterText = ({ text, onComplete }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(text.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 100);
      return () => clearTimeout(timer);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, onComplete]);

  return (
    <span className="font-mono">
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity }}
        className="text-primary-500"
      >
        |
      </motion.span>
    </span>
  );
};

export default HomePage;