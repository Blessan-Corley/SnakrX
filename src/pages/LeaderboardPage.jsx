import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Medal, 
  Crown, 
  Star, 
  Filter,
  Calendar,
  Gamepad2,
  Target,
  Zap,
  Users,
  TrendingUp,
  Clock,
  ChevronDown,
  Search,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Card, { LeaderboardCard, StatsCard } from '@/components/ui/Card';
import LoadingSpinner, { ListSkeleton } from '@/components/ui/LoadingSpinner';
import { playClick } from '@/utils/sound';
import { formatScore, formatTime } from '@/utils/gameUtils';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  where, 
  getDocs,
  db 
} from '@/services/firebase';

/**
 * Leaderboard Page Component
 * Shows top players across different game modes with filtering
 */
const LeaderboardPage = () => {
  const { userProfile } = useAuth();
  
  // State
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMode, setSelectedMode] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('all-time');
  const [searchTerm, setSearchTerm] = useState('');
  const [userRank, setUserRank] = useState(null);
  const [stats, setStats] = useState({});

  // Filter options
  const gameModes = [
    { id: 'all', name: 'All Modes', icon: <Gamepad2 size={16} />, color: 'text-white' },
    { id: 'classic', name: 'Classic', icon: <Target size={16} />, color: 'text-green-400' },
    { id: 'vsai', name: 'VS AI', icon: <Zap size={16} />, color: 'text-blue-400' },
    { id: 'multiplayer', name: 'Multiplayer', icon: <Users size={16} />, color: 'text-purple-400' }
  ];

  const timePeriods = [
    { id: 'all-time', name: 'All Time', icon: <Crown size={16} /> },
    { id: 'monthly', name: 'This Month', icon: <Calendar size={16} /> },
    { id: 'weekly', name: 'This Week', icon: <TrendingUp size={16} /> },
    { id: 'daily', name: 'Today', icon: <Clock size={16} /> }
  ];

  // Mock leaderboard data (in a real app, this would come from Firebase)
  const mockLeaderboardData = [
    {
      rank: 1,
      username: 'SnakeGod',
      displayName: 'SnakeGod',
      score: 2450,
      mode: 'Classic',
      time: 720,
      achievements: 45,
      gamesPlayed: 156,
      winRate: 78,
      lastActive: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      avatar: '👑'
    },
    {
      rank: 2,
      username: 'AISlayer',
      displayName: 'AISlayer',
      score: 2380,
      mode: 'VS AI',
      time: 650,
      achievements: 42,
      gamesPlayed: 134,
      winRate: 65,
      lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      avatar: '🤖'
    },
    {
      rank: 3,
      username: userProfile?.username || 'Player',
      displayName: userProfile?.displayName || 'You',
      score: userProfile?.stats?.bestScore || 1950,
      mode: 'Classic',
      time: 580,
      achievements: userProfile?.stats?.achievements?.length || 28,
      gamesPlayed: userProfile?.stats?.totalGames || 89,
      winRate: userProfile?.stats?.totalGames > 0 ? Math.round((userProfile?.stats?.totalWins || 0) / userProfile.stats.totalGames * 100) : 0,
      lastActive: new Date(),
      avatar: '🐍',
      isCurrentUser: true
    },
    {
      rank: 4,
      username: 'SpeedDemon',
      displayName: 'SpeedDemon',
      score: 1890,
      mode: 'Classic',
      time: 420,
      achievements: 35,
      gamesPlayed: 201,
      winRate: 45,
      lastActive: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
      avatar: '⚡'
    },
    {
      rank: 5,
      username: 'MultiMaster',
      displayName: 'MultiMaster',
      score: 1750,
      mode: 'Multiplayer',
      time: 380,
      achievements: 31,
      gamesPlayed: 78,
      winRate: 89,
      lastActive: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
      avatar: '👥'
    },
    {
      rank: 6,
      username: 'SnakeNewbie',
      displayName: 'SnakeNewbie',
      score: 1650,
      mode: 'Classic',
      time: 290,
      achievements: 18,
      gamesPlayed: 45,
      winRate: 33,
      lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      avatar: '🌱'
    },
    {
      rank: 7,
      username: 'ProGamer',
      displayName: 'ProGamer',
      score: 1580,
      mode: 'VS AI',
      time: 340,
      achievements: 29,
      gamesPlayed: 112,
      winRate: 58,
      lastActive: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
      avatar: '🎮'
    },
    {
      rank: 8,
      username: 'FoodHunter',
      displayName: 'FoodHunter',
      score: 1420,
      mode: 'Classic',
      time: 310,
      achievements: 25,
      gamesPlayed: 67,
      winRate: 41,
      lastActive: new Date(Date.now() - 1000 * 60 * 60 * 18), // 18 hours ago
      avatar: '🍎'
    },
    {
      rank: 9,
      username: 'QuickStrike',
      displayName: 'QuickStrike',
      score: 1350,
      mode: 'Multiplayer',
      time: 280,
      achievements: 22,
      gamesPlayed: 55,
      winRate: 72,
      lastActive: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
      avatar: '⚔️'
    },
    {
      rank: 10,
      username: 'ChillPlayer',
      displayName: 'ChillPlayer',
      score: 1280,
      mode: 'Classic',
      time: 250,
      achievements: 20,
      gamesPlayed: 38,
      winRate: 39,
      lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      avatar: '😎'
    }
  ];

  // Load leaderboard data
  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      // In a real app, this would fetch from Firebase
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading
      
      let filteredData = [...mockLeaderboardData];
      
      // Filter by game mode
      if (selectedMode !== 'all') {
        filteredData = filteredData.filter(entry => 
          entry.mode.toLowerCase().includes(selectedMode) ||
          (selectedMode === 'vsai' && entry.mode.toLowerCase().includes('vs ai'))
        );
      }
      
      // Filter by search term
      if (searchTerm) {
        filteredData = filteredData.filter(entry =>
          entry.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.username.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      // Re-rank after filtering
      filteredData.forEach((entry, index) => {
        entry.rank = index + 1;
      });
      
      setLeaderboardData(filteredData);
      
      // Find user's rank
      const userEntry = filteredData.find(entry => entry.isCurrentUser);
      setUserRank(userEntry?.rank || null);
      
      // Calculate stats
      const totalPlayers = mockLeaderboardData.length;
      const avgScore = Math.round(mockLeaderboardData.reduce((sum, entry) => sum + entry.score, 0) / totalPlayers);
      const topScore = Math.max(...mockLeaderboardData.map(entry => entry.score));
      
      setStats({
        totalPlayers,
        avgScore,
        topScore,
        yourRank: userRank
      });
      
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount and when filters change
  useEffect(() => {
    loadLeaderboard();
  }, [selectedMode, selectedPeriod, searchTerm]);

  // Handle filter changes
  const handleModeChange = (mode) => {
    setSelectedMode(mode);
    playClick();
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    playClick();
  };

  const handleRefresh = () => {
    playClick();
    loadLeaderboard();
  };

  // Get rank badge color and icon
  const getRankBadge = (rank) => {
    if (rank === 1) return { icon: '👑', color: 'text-amber-400', bg: 'bg-amber-500/20' };
    if (rank === 2) return { icon: '🥈', color: 'text-gray-300', bg: 'bg-gray-500/20' };
    if (rank === 3) return { icon: '🥉', color: 'text-amber-600', bg: 'bg-amber-700/20' };
    if (rank <= 10) return { icon: '⭐', color: 'text-blue-400', bg: 'bg-blue-500/20' };
    return { icon: '#' + rank, color: 'text-white/70', bg: 'bg-white/10' };
  };

  // Format last active time
  const formatLastActive = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 25% 25%, rgba(249, 115, 22, 0.08) 0%, transparent 60%)',
              'radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.08) 0%, transparent 60%)',
              'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.08) 0%, transparent 60%)'
            ]
          }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <Trophy className="inline mr-3" size={48} />
            Leaderboards
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Compete with players worldwide and climb the ranks
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <StatsCard
            title="Total Players"
            value={stats.totalPlayers || 0}
            icon={<Users size={20} />}
            subtitle="Registered"
          />
          <StatsCard
            title="Top Score"
            value={formatScore(stats.topScore || 0)}
            icon={<Crown size={20} />}
            subtitle="All time"
          />
          <StatsCard
            title="Average Score"
            value={formatScore(stats.avgScore || 0)}
            icon={<Target size={20} />}
            subtitle="Global avg"
          />
          <StatsCard
            title="Your Rank"
            value={userRank ? `#${userRank}` : '--'}
            icon={<Medal size={20} />}
            subtitle={userRank ? `Top ${Math.round(userRank / stats.totalPlayers * 100)}%` : 'Play to rank'}
          />
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card variant="glass" padding="md">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              {/* Game Mode Filter */}
              <div className="flex flex-wrap gap-2">
                {gameModes.map((mode) => (
                  <Button
                    key={mode.id}
                    variant={selectedMode === mode.id ? "primary" : "ghost"}
                    size="sm"
                    icon={mode.icon}
                    onClick={() => handleModeChange(mode.id)}
                    className={selectedMode !== mode.id ? mode.color : ''}
                  >
                    {mode.name}
                  </Button>
                ))}
              </div>

              {/* Period Filter & Search */}
              <div className="flex items-center space-x-3">
                {/* Period Dropdown */}
                <div className="relative">
                  <select
                    value={selectedPeriod}
                    onChange={(e) => handlePeriodChange(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 appearance-none pr-8"
                  >
                    {timePeriods.map((period) => (
                      <option key={period.id} value={period.id} className="bg-dark-surface text-white">
                        {period.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none" />
                </div>

                {/* Search */}
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search players..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500/50 w-48"
                  />
                </div>

                {/* Refresh Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRefresh}
                  icon={<RefreshCw size={16} />}
                  disabled={loading}
                />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card variant="glass" padding="lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <Trophy className="mr-2" size={24} />
                Top Players
              </h2>
              <div className="text-white/60 text-sm">
                Showing {selectedMode === 'all' ? 'all modes' : gameModes.find(m => m.id === selectedMode)?.name}
                {searchTerm && ` • "${searchTerm}"`}
              </div>
            </div>

            {loading ? (
              <ListSkeleton items={10} />
            ) : leaderboardData.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🏆</div>
                <h3 className="text-xl font-semibold text-white mb-2">No Results Found</h3>
                <p className="text-white/70">
                  {searchTerm 
                    ? `No players found matching "${searchTerm}"`
                    : 'No players in this category yet'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {leaderboardData.map((entry, index) => {
                    const badge = getRankBadge(entry.rank);
                    
                    return (
                      <motion.div
                        key={entry.username}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className={`
                          p-4 rounded-xl border transition-all duration-200 hover:shadow-card-hover
                          ${entry.isCurrentUser 
                            ? 'bg-primary-500/10 border-primary-500/30 shadow-glow' 
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                          }
                        `}
                      >
                        <div className="flex items-center justify-between">
                          {/* Left: Rank, Avatar, Player Info */}
                          <div className="flex items-center space-x-4">
                            {/* Rank Badge */}
                            <div className={`
                              w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm
                              ${badge.bg} ${badge.color}
                            `}>
                              {badge.icon}
                            </div>

                            {/* Avatar & Name */}
                            <div className="flex items-center space-x-3">
                              <div className="text-2xl">{entry.avatar}</div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className={`font-bold ${entry.isCurrentUser ? 'text-primary-400' : 'text-white'}`}>
                                    {entry.displayName}
                                  </span>
                                  {entry.isCurrentUser && (
                                    <span className="text-xs bg-primary-500/20 text-primary-400 px-2 py-1 rounded-full">
                                      You
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-white/60">
                                  {entry.mode} • {formatLastActive(entry.lastActive)}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Right: Stats */}
                          <div className="flex items-center space-x-6 text-right">
                            <div>
                              <div className="font-bold text-white text-lg">
                                {formatScore(entry.score)}
                              </div>
                              <div className="text-xs text-white/60">Score</div>
                            </div>
                            
                            <div className="hidden md:block">
                              <div className="font-bold text-white">
                                {entry.winRate}%
                              </div>
                              <div className="text-xs text-white/60">Win Rate</div>
                            </div>
                            
                            <div className="hidden lg:block">
                              <div className="font-bold text-white">
                                {entry.achievements}
                              </div>
                              <div className="text-xs text-white/60">Achievements</div>
                            </div>
                            
                            <div className="hidden lg:block">
                              <div className="font-bold text-white">
                                {entry.gamesPlayed}
                              </div>
                              <div className="text-xs text-white/60">Games</div>
                            </div>
                          </div>
                        </div>

                        {/* Mobile Stats */}
                        <div className="md:hidden mt-3 pt-3 border-t border-white/10">
                          <div className="grid grid-cols-3 gap-4 text-center text-xs">
                            <div>
                              <div className="font-bold text-white">{entry.winRate}%</div>
                              <div className="text-white/60">Win Rate</div>
                            </div>
                            <div>
                              <div className="font-bold text-white">{entry.achievements}</div>
                              <div className="text-white/60">Achievements</div>
                            </div>
                            <div>
                              <div className="font-bold text-white">{entry.gamesPlayed}</div>
                              <div className="text-white/60">Games</div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Call to Action */}
        {!userRank && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-8"
          >
            <Card variant="gradient" padding="lg" className="max-w-md mx-auto">
              <div className="text-4xl mb-4">🎮</div>
              <h3 className="text-xl font-bold text-white mb-2">Ready to Compete?</h3>
              <p className="text-white/80 mb-4">
                Play games to earn your spot on the leaderboard!
              </p>
              <Button variant="secondary" onClick={() => window.location.href = '/game'}>
                Start Playing
              </Button>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;