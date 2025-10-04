import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, XCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { COLLECTIONS, db } from '@/services/firebase';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { playClick } from '@/utils/sound';
import {
  AdminAuth,
  AdminStats,
  AdminTabs,
  UsersTab,
  MatchHistoryTab,
  AnalyticsTab
} from '@/components/admin';

/**
 * Admin Page Component
 * Provides user management, analytics, and system administration
 */
const AdminPage = () => {
  const { userProfile } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [matchHistory, setMatchHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({});
  const [error, setError] = useState('');

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

  // Password protection screen
  if (!isAuthenticated) {
    return <AdminAuth onAuthenticate={setIsAuthenticated} />;
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
        <AdminStats stats={stats} />

        {/* Navigation Tabs */}
        <AdminTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'users' && (
              <UsersTab
                users={users}
                loading={loading}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onRefresh={fetchUsers}
                onBanUser={handleUserBan}
              />
            )}

            {activeTab === 'history' && (
              <MatchHistoryTab matchHistory={matchHistory} loading={loading} />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsTab stats={stats} />
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
