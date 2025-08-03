/**
 * Leaderboard Page Component - V3 (Fully Functional)
 * Shows top players fetched from Firebase with working filters and live stats.
 *
 * @version 3.0.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Crown, Users, Target, RefreshCw, Gamepad2, Zap, Search, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Card, { StatsCard } from '@/components/ui/Card';
import LoadingSpinner, { ListSkeleton } from '@/components/ui/LoadingSpinner';
import { playClick } from '@/utils/sound';
import { formatScore } from '@/utils/gameUtils';
import { collection, query, orderBy, limit, where, getDocs, db } from '@/services/firebase';

const LeaderboardPage = () => {
  const { userProfile } = useAuth();
  
  // State for data, loading, and filters
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for filters
  const [selectedMode, setSelectedMode] = useState('bestScore'); // 'bestScore', 'classicBestScore', etc.
  const [searchTerm, setSearchTerm] = useState('');

  // Memoized filter options to prevent re-renders
  const gameModes = useMemo(() => [
    { id: 'bestScore', name: 'All Modes', icon: <Gamepad2 size={16} /> },
    { id: 'classicBestScore', name: 'Classic', icon: <Target size={16} /> },
    { id: 'vsAIGames', name: 'VS AI Wins', icon: <Zap size={16} /> },
    { id: 'multiplayerGames', name: 'Multiplayer Wins', icon: <Users size={16} /> }
  ], []);

  // Fetch all user data once
  const fetchAllUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const usersRef = collection(db, 'users');
      // Query for users who have played at least one game
      const q = query(usersRef, where('stats.totalGames', '>', 0), limit(200));
      const querySnapshot = await getDocs(q);

      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      setAllUsers(data);
    } catch (err) {
      console.error('Error loading leaderboard:', err);
      setError('Failed to load leaderboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect to fetch data on component mount
  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  // Effect to filter and sort data when filters or data change
  useEffect(() => {
    let usersToFilter = [...allUsers];

    // Filter by search term (case-insensitive)
    if (searchTerm) {
      usersToFilter = usersToFilter.filter(user =>
        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by the selected mode/stat
    const sorted = usersToFilter.sort((a, b) => {
      const scoreA = a.stats?.[selectedMode] || 0;
      const scoreB = b.stats?.[selectedMode] || 0;
      return scoreB - scoreA;
    });

    // Add rank and identify current user
    const ranked = sorted.map((user, index) => ({
      ...user,
      rank: index + 1,
      isCurrentUser: userProfile?.uid === user.id,
    }));

    setFilteredUsers(ranked);
  }, [allUsers, selectedMode, searchTerm, userProfile]);

  // Memoized stats to prevent recalculation on every render
  const stats = useMemo(() => {
    const userEntry = filteredUsers.find(entry => entry.isCurrentUser);
    return {
      totalPlayers: allUsers.length,
      topScore: allUsers.length > 0 
        ? Math.max(...allUsers.map(u => u.stats?.bestScore || 0)) 
        : 0,
      yourRank: userEntry ? userEntry.rank : null,
    };
  }, [allUsers, filteredUsers]);

  const getRankBadge = (rank) => {
    if (rank === 1) return { icon: '👑', color: 'text-amber-400', bg: 'bg-amber-500/20' };
    if (rank === 2) return { icon: '🥈', color: 'text-gray-300', bg: 'bg-gray-500/20' };
    if (rank === 3) return { icon: '🥉', color: 'text-amber-600', bg: 'bg-amber-700/20' };
    return { icon: `#${rank}`, color: 'text-white/70', bg: 'bg-white/10' };
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 z-0 bg-gradient-dark" />
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <Trophy className="inline mr-3" size={48} /> Leaderboards
          </h1>
          <p className="text-xl text-white/70">See how you stack up against the best players.</p>
        </motion.div>

        {/* REAL STATS, NOT PLACEHOLDERS */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatsCard title="Ranked Players" value={stats.totalPlayers} icon={<Users size={20} />} subtitle="Who have played" />
          <StatsCard title="Top Score" value={formatScore(stats.topScore)} icon={<Crown size={20} />} subtitle="All Time High" />
          <StatsCard title="Your Rank" value={stats.yourRank ? `#${stats.yourRank}` : 'N/A'} icon={<Target size={20} />} subtitle={stats.yourRank ? 'In current filter' : 'Play to get ranked!'} />
        </motion.div>

        {/* FILTERS ARE BACK */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
          <Card variant="glass" padding="md">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {gameModes.map((mode) => (
                  <Button
                    key={mode.id}
                    variant={selectedMode === mode.id ? "primary" : "ghost"}
                    size="sm"
                    icon={mode.icon}
                    onClick={() => { playClick(); setSelectedMode(mode.id); }}
                  >
                    {mode.name}
                  </Button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search player..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white text-sm w-full md:w-48"
                  />
                </div>
                <Button variant="ghost" size="icon" onClick={fetchAllUsers} disabled={loading} aria-label="Refresh">
                  <RefreshCw size={16} />
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card variant="glass" padding="lg">
            <h2 className="text-2xl font-bold text-white mb-6">Top Players</h2>
            {loading ? (
              <ListSkeleton items={10} />
            ) : error ? (
              <div className="text-center py-12 text-red-400">{error}</div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {filteredUsers.slice(0, 100).map((entry, index) => {
                    const badge = getRankBadge(entry.rank);
                    return (
                      <motion.div
                        key={entry.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-3 rounded-xl border transition-all duration-200 ${entry.isCurrentUser ? 'bg-primary-500/20 border-primary-500/40' : 'bg-white/5 border-white/10'}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${badge.bg} ${badge.color}`}>
                              {badge.icon}
                            </div>
                            <div>
                              <p className={`font-bold truncate ${entry.isCurrentUser ? 'text-primary-300' : 'text-white'}`}>{entry.displayName}</p>
                              <p className="text-xs text-white/60">Best Score</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-white text-lg">{formatScore(entry.stats?.[selectedMode] || 0)}</p>
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
      </div>
    </div>
  );
};

export default LeaderboardPage;
