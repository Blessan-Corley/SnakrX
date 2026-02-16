import { motion } from 'framer-motion';
import { Search, RefreshCw, Users, Ban, UnlockKeyhole, ExternalLink } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { formatScore } from '@/utils/gameUtils';

/**
 * Admin Users Management Tab Component
 */
export const UsersTab = ({
  users,
  loading,
  searchTerm,
  onSearchChange,
  onRefresh,
  onBanUser
}) => {
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

  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
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
                onChange={(e) => onSearchChange(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500/50 w-64"
              />
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            icon={<RefreshCw size={16} />}
            onClick={onRefresh}
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
                        {formatScore(user.stats?.bestScore || 0)}
                      </div>
                      <div className="text-xs text-white/60">High Score</div>
                    </div>

                    <div className="hidden md:block text-right">
                      <div className="text-sm text-white">
                        {user.stats?.totalGames || 0}
                      </div>
                      <div className="text-xs text-white/60">Games</div>
                    </div>

                    <div className="hidden md:block text-right">
                      <div className="text-sm text-white">
                        {user.stats?.achievementsCompleted || 0}
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
                        variant="ghost"
                        size="sm"
                        icon={<ExternalLink size={14} />}
                        onClick={() => window.open(`/player/${user.id}`, '_blank', 'noopener,noreferrer')}
                      >
                        View
                      </Button>
                      <Button
                        variant={user.banned ? "ghost" : "danger"}
                        size="sm"
                        icon={user.banned ? <UnlockKeyhole size={14} /> : <Ban size={14} />}
                        onClick={() => onBanUser(user.id, user.banned)}
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
                      <div className="text-white font-medium">{formatScore(user.stats?.bestScore || 0)}</div>
                      <div className="text-white/60">High Score</div>
                    </div>
                    <div>
                      <div className="text-white font-medium">{user.stats?.totalGames || 0}</div>
                      <div className="text-white/60">Games</div>
                    </div>
                    <div>
                      <div className="text-white font-medium">{user.stats?.achievementsCompleted || 0}</div>
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
  );
};
