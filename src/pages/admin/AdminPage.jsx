import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Users, 
  Ban, 
  UnlockKeyhole, 
  Eye, 
  Calendar,
  Trophy,
  Clock,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Gamepad2,
  BarChart3,
  History,
  Lock
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { playClick } from '@/utils/sound';
import { formatScore, formatTime } from '@/utils/gameUtils';
import { 
  COLLECTIONS,
  firestoreOperations,
  createAnalyticsDocument,
  USER_SCHEMA,
  db
} from '@/services/firebase';
import {
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  query, 
  orderBy, 
  limit,
  where,
  serverTimestamp
} from 'firebase/firestore';

const AdminPage = () => {
  const { userProfile } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [matchHistory, setMatchHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({});
  const [error, setError] = useState('');

  const ADMIN_PASSWORD = 'Blessan@26';

  // Handle password authentication
  const handlePasswordSubmit = (e) => {
    if (e) e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
      playClick();
    } else {
      setError('Invalid password');
      setPassword('');
    }
  };

  // Fetch users data with enhanced analytics
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersRef = collection(db, COLLECTIONS.USERS);
      const usersSnapshot = await getDocs(query(usersRef, orderBy('createdAt', 'desc')));
      
      const usersData = usersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          lastActive: data.lastActive?.toDate?.() || new Date(),
          createdAt: data.createdAt?.toDate?.() || new Date(),
          banned: data.banned || false
        };
      });
      
      setUsers(usersData);
      
      // Calculate comprehensive stats
      const totalUsers = usersData.length;
      const now = new Date();
      const dayAgo = new Date(now - 24 * 60 * 60 * 1000);
      const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
      
      const activeUsers = usersData.filter(user => 
        !user.banned && user.lastActive > dayAgo
      ).length;
      
      const weeklyActiveUsers = usersData.filter(user => 
        !user.banned && user.lastActive > weekAgo
      ).length;
      
      const bannedUsers = usersData.filter(user => user.banned).length;
      
      const totalGames = usersData.reduce((sum, user) => 
        sum + (user.stats?.totalGamesPlayed || 0), 0
      );
      
      const totalScore = usersData.reduce((sum, user) => 
        sum + (user.stats?.totalScore || 0), 0
      );
      
      const totalAchievements = usersData.reduce((sum, user) => 
        sum + (user.stats?.achievements?.length || 0), 0
      );
      
      const newUsersToday = usersData.filter(user => 
        user.createdAt > dayAgo
      ).length;
      
      setStats({
        totalUsers,
        activeUsers,
        weeklyActiveUsers,
        bannedUsers,
        totalGames,
        totalScore,
        totalAchievements,
        newUsersToday,
        averageScore: totalGames > 0 ? Math.round(totalScore / totalGames) : 0,
        retentionRate: totalUsers > 0 ? Math.round((weeklyActiveUsers / totalUsers) * 100) : 0
      });
      
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch real match history from Firebase
  const fetchMatchHistory = async () => {
    setLoading(true);
    try {
      const gamesRef = collection(db, COLLECTIONS.GAMES);
      const gamesQuery = query(
        gamesRef, 
        orderBy('createdAt', 'desc'), 
        limit(50)
      );
      const gamesSnapshot = await getDocs(gamesQuery);
      
      const gamesData = gamesSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data.createdAt?.toDate?.() || new Date(),
          startedAt: data.startedAt?.toDate?.() || new Date(),
          endedAt: data.endedAt?.toDate?.() || new Date()
        };
      });
      
      setMatchHistory(gamesData);
    } catch (error) {
      console.error('Error fetching match history:', error);
      setError('Failed to fetch match history');
    } finally {
      setLoading(false);
    }
  };

  // Ban/Unban user with audit trail
  const handleUserBan = async (userId, isBanned) => {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      const updateData = {
        banned: !isBanned,
        updatedAt: serverTimestamp()
      };
      
      if (!isBanned) {
        // Banning user
        updateData.bannedAt = serverTimestamp();
        updateData.bannedBy = userProfile?.uid || 'admin';
        updateData.banReason = 'Administrative action';
      } else {
        // Unbanning user
        updateData.bannedAt = null;
        updateData.bannedBy = null;
        updateData.banReason = null;
        updateData.unbannedAt = serverTimestamp();
        updateData.unbannedBy = userProfile?.uid || 'admin';
      }
      
      await updateDoc(userRef, updateData);
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, banned: !isBanned, ...updateData }
          : user
      ));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        bannedUsers: !isBanned ? prev.bannedUsers + 1 : prev.bannedUsers - 1,
        activeUsers: !isBanned ? prev.activeUsers - 1 : prev.activeUsers + 1
      }));
      
      playClick();
    } catch (error) {
      console.error('Error updating user ban status:', error);
      setError('Failed to update user status');
    }
  };

  // Load data when tab changes
  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === 'users') {
        fetchUsers();
      } else if (activeTab === 'history') {
        fetchMatchHistory();
      }
    }
  }, [activeTab, isAuthenticated]);

  // Filter users based on search
  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Admin tabs
  const tabs = [
    { id: 'users', name: 'User Management', icon: <Users size={18} /> },
    { id: 'history', name: 'Match History', icon: <History size={18} /> },
    { id: 'analytics', name: 'Analytics', icon: <BarChart3 size={18} /> }
  ];

  // Format last seen time
  const formatLastSeen = (date) => {
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

  // Password protection screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                'radial-gradient(circle at 25% 25%, rgba(239, 68, 68, 0.1) 0%, transparent 60%)',
                'radial-gradient(circle at 75% 75%, rgba(249, 115, 22, 0.1) 0%, transparent 60%)',
                'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 60%)'
              ]
            }}
            transition={{ duration: 15, repeat: Infinity, repeatType: "reverse" }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full max-w-md mx-4"
        >
          <Card variant="glass" padding="lg">
            <div className="text-center mb-6">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-6xl mb-4"
              >
                🛡️
              </motion.div>
              <h1 className="text-2xl font-bold text-white mb-2">Admin Access</h1>
              <p className="text-white/70">Enter password to continue</p>
            </div>

            <div className="space-y-4">
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit(e)}
                  placeholder="Enter admin password"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  autoFocus
                />
              </div>
              
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-red-400 text-sm text-center"
                >
                  {error}
                </motion.div>
              )}

              <Button
                variant="primary"
                fullWidth
                icon={<Shield size={18} />}
                disabled={!password}
                onClick={handlePasswordSubmit}
              >
                Access Admin Panel
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Main admin interface
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 25% 25%, rgba(239, 68, 68, 0.08) 0%, transparent 60%)',
              'radial-gradient(circle at 75% 75%, rgba(249, 115, 22, 0.08) 0%, transparent 60%)',
              'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.08) 0%, transparent 60%)'
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
            <Shield className="inline mr-3 text-red-400" size={48} />
            Admin Panel
          </h1>
          <p className="text-xl text-white/70">
            System management and user administration
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <Card variant="glass" padding="md">
            <div className="text-center">
              <Users className="mx-auto mb-2 text-blue-400" size={24} />
              <div className="text-2xl font-bold text-white">{stats.totalUsers || 0}</div>
              <div className="text-white/60 text-sm">Total Users</div>
            </div>
          </Card>
          
          <Card variant="glass" padding="md">
            <div className="text-center">
              <CheckCircle className="mx-auto mb-2 text-green-400" size={24} />
              <div className="text-2xl font-bold text-white">{stats.activeUsers || 0}</div>
              <div className="text-white/60 text-sm">Active Users</div>
            </div>
          </Card>
          
          <Card variant="glass" padding="md">
            <div className="text-center">
              <Ban className="mx-auto mb-2 text-red-400" size={24} />
              <div className="text-2xl font-bold text-white">{stats.bannedUsers || 0}</div>
              <div className="text-white/60 text-sm">Banned Users</div>
            </div>
          </Card>
          
          <Card variant="glass" padding="md">
            <div className="text-center">
              <Gamepad2 className="mx-auto mb-2 text-purple-400" size={24} />
              <div className="text-2xl font-bold text-white">{stats.totalGames || 0}</div>
              <div className="text-white/60 text-sm">Total Games</div>
            </div>
          </Card>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
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
            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                {/* Search and Controls */}
                <Card variant="glass" padding="md">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                        <input
                          type="text"
                          placeholder="Search users..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500/50 w-64"
                        />
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<RefreshCw size={16} />}
                      onClick={fetchUsers}
                      disabled={loading}
                    >
                      Refresh
                    </Button>
                  </div>
                </Card>

                {/* Users List */}
                <Card variant="glass" padding="lg">
                  <h2 className="text-xl font-bold text-white mb-6">User Management</h2>
                  
                  {loading ? (
                    <div className="text-center py-8">
                      <LoadingSpinner />
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="mx-auto mb-4 text-white/40" size={48} />
                      <p className="text-white/70">No users found</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredUsers.map((user, index) => (
                        <motion.div
                          key={user.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`p-4 rounded-lg border transition-all duration-200 ${
                            user.banned 
                              ? 'bg-red-500/10 border-red-500/30' 
                              : 'bg-white/5 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                                user.banned ? 'bg-red-500/20 text-red-400' : 'bg-primary-500/20 text-primary-400'
                              }`}>
                                {user.displayName?.charAt(0).toUpperCase() || 'U'}
                              </div>
                              
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="font-bold text-white">{user.displayName || 'Unknown'}</span>
                                  {user.banned && (
                                    <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full">
                                      BANNED
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-white/60">@{user.username}</div>
                                <div className="text-xs text-white/50">{user.email}</div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-6">
                              {/* Stats */}
                              <div className="hidden md:block text-right">
                                <div className="text-sm text-white">
                                  {formatScore(user.stats?.highestScore || 0)}
                                </div>
                                <div className="text-xs text-white/60">High Score</div>
                              </div>
                              
                              <div className="hidden md:block text-right">
                                <div className="text-sm text-white">
                                  {user.stats?.totalGamesPlayed || 0}
                                </div>
                                <div className="text-xs text-white/60">Games</div>
                              </div>
                              
                              <div className="hidden md:block text-right">
                                <div className="text-sm text-white">
                                  {user.stats?.achievements?.length || 0}
                                </div>
                                <div className="text-xs text-white/60">Achievements</div>
                              </div>
                              
                              <div className="text-right">
                                <div className="text-sm text-white">
                                  {formatLastSeen(user.lastActive)}
                                </div>
                                <div className="text-xs text-white/60">Last Active</div>
                              </div>
                              
                              {/* Actions */}
                              <div className="flex space-x-2">
                                <Button
                                  variant={user.banned ? "ghost" : "danger"}
                                  size="sm"
                                  icon={user.banned ? <UnlockKeyhole size={14} /> : <Ban size={14} />}
                                  onClick={() => handleUserBan(user.id, user.banned)}
                                >
                                  {user.banned ? 'Unban' : 'Ban'}
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          {/* Mobile Stats */}
                          <div className="md:hidden mt-3 pt-3 border-t border-white/10">
                            <div className="grid grid-cols-3 gap-4 text-center text-xs">
                              <div>
                                <div className="text-white font-medium">{formatScore(user.stats?.highestScore || 0)}</div>
                                <div className="text-white/60">High Score</div>
                              </div>
                              <div>
                                <div className="text-white font-medium">{user.stats?.totalGamesPlayed || 0}</div>
                                <div className="text-white/60">Games</div>
                              </div>
                              <div>
                                <div className="text-white font-medium">{user.stats?.achievements?.length || 0}</div>
                                <div className="text-white/60">Achievements</div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            )}

            {/* Match History Tab */}
            {activeTab === 'history' && (
              <div className="space-y-6">
                <Card variant="glass" padding="lg">
                  <h2 className="text-xl font-bold text-white mb-6">Recent Match History</h2>
                  
                  {loading ? (
                    <div className="text-center py-8">
                      <LoadingSpinner />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {matchHistory.map((match, index) => (
                        <motion.div
                          key={match.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all duration-200"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className={`w-3 h-3 rounded-full ${
                                match.result === 'victory' ? 'bg-green-400' :
                                match.result === 'defeat' ? 'bg-red-400' :
                                'bg-blue-400'
                              }`} />
                              
                              <div>
                                <div className="font-semibold text-white">{match.username || 'Unknown Player'}</div>
                                <div className="text-sm text-white/60">
                                  {match.mode} {match.difficulty && `(${match.difficulty})`}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-6">
                              <div className="text-right">
                                <div className="font-bold text-white">{formatScore(match.score)}</div>
                                <div className="text-xs text-white/60">Score</div>
                              </div>
                              
                              <div className="text-right">
                                <div className="font-bold text-white">{formatTime(match.duration)}</div>
                                <div className="text-xs text-white/60">Duration</div>
                              </div>
                              
                              <div className="text-right">
                                <div className="text-sm text-white/60">
                                  {match.timestamp.toLocaleDateString()}
                                </div>
                                <div className="text-xs text-white/50">
                                  {match.timestamp.toLocaleTimeString()}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {match.stats && (
                            <div className="mt-3 pt-3 border-t border-white/10">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                                <div>
                                  <span className="text-white/60">Food Eaten:</span>
                                  <span className="text-white ml-1">{match.foodEaten || 0}</span>
                                </div>
                                <div>
                                  <span className="text-white/60">Max Speed:</span>
                                  <span className="text-white ml-1">{match.speedReached || 0}</span>
                                </div>
                                <div>
                                  <span className="text-white/60">Moves:</span>
                                  <span className="text-white ml-1">{match.stats?.moves || 0}</span>
                                </div>
                                <div>
                                  <span className="text-white/60">Efficiency:</span>
                                  <span className="text-white ml-1">{match.stats?.efficiency?.toFixed(1) || '0.0'}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <Card variant="glass" padding="lg">
                  <h2 className="text-xl font-bold text-white mb-6">System Analytics</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white/5 rounded-lg p-4">
                      <h3 className="font-semibold text-white mb-3">User Activity</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-white/70">New users today:</span>
                          <span className="text-white">{stats.newUsersToday || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/70">Daily active:</span>
                          <span className="text-white">{stats.activeUsers || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/70">Weekly active:</span>
                          <span className="text-white">{stats.weeklyActiveUsers || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/70">Retention rate:</span>
                          <span className="text-white">{stats.retentionRate || 0}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white/5 rounded-lg p-4">
                      <h3 className="font-semibold text-white mb-3">Game Statistics</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-white/70">Total games:</span>
                          <span className="text-white">{formatScore(stats.totalGames || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/70">Total score:</span>
                          <span className="text-white">{formatScore(stats.totalScore || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/70">Avg score:</span>
                          <span className="text-white">{formatScore(stats.averageScore || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/70">Total achievements:</span>
                          <span className="text-white">{stats.totalAchievements || 0}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white/5 rounded-lg p-4">
                      <h3 className="font-semibold text-white mb-3">System Health</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-white/70">Active users:</span>
                          <span className="text-green-400">{stats.activeUsers || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/70">Banned users:</span>
                          <span className="text-red-400">{stats.bannedUsers || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/70">Server status:</span>
                          <span className="text-green-400">Online</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/70">Last updated:</span>
                          <span className="text-white">{new Date().toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 right-4 bg-red-500/90 text-white px-4 py-2 rounded-lg shadow-lg"
          >
            <div className="flex items-center space-x-2">
              <AlertTriangle size={16} />
              <span>{error}</span>
              <button onClick={() => setError('')} className="ml-2">
                <XCircle size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;