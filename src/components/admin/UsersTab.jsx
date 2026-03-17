import { motion } from 'framer-motion';
import { Users, Ban, UnlockKeyhole, ExternalLink } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Select from '@/components/ui/Select';
import { formatScore } from '@/utils/gameUtils';
import AdminFilterBar from './AdminFilterBar.jsx';
import AdminPagination from './AdminPagination.jsx';

const ROLE_OPTIONS = [
  { value: 'all', label: 'All roles' },
  { value: 'player', label: 'Players' },
  { value: 'admin', label: 'Admins' }
];

const BANNED_OPTIONS = [
  { value: 'all', label: 'All user states' },
  { value: 'active', label: 'Active only' },
  { value: 'banned', label: 'Banned only' }
];

const ACTIVITY_OPTIONS = [
  { value: 'all', label: 'Any activity' },
  { value: '24h', label: 'Active in 24 hours' },
  { value: '7d', label: 'Active in 7 days' },
  { value: '30d', label: 'Active in 30 days' },
  { value: '90d', label: 'Active in 90 days' }
];

const SORT_OPTIONS = [
  { value: 'createdAt_desc', label: 'Newest first' },
  { value: 'lastActive_desc', label: 'Most recently active' },
  { value: 'bestScore_desc', label: 'Highest score first' },
  { value: 'totalGames_desc', label: 'Most games played' }
];

const inputClassName = 'w-full rounded-xl border border-white/15 bg-slate-950/45 px-4 py-2.5 text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-primary-500/40';

/**
 * Admin Users Management Tab Component
 */
export const UsersTab = ({
  users,
  loading,
  filters,
  onFilterChange,
  onApplyFilters,
  onResetFilters,
  onRefresh,
  onBanUser,
  pagination,
  onPrevPage = () => {},
  onNextPage = () => {},
  moderatingUserId = null
}) => {
  const formatLastSeen = (date) => {
    const safeDate = date instanceof Date ? date : new Date(date);
    const diff = Date.now() - safeDate.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="space-y-6">
      <AdminFilterBar
        title="User Filters"
        description="Search by identity, narrow by admin state, and sort the current admin page intentionally."
        onApply={onApplyFilters}
        onReset={onResetFilters}
        onRefresh={onRefresh}
        loading={loading}
      >
        <input
          type="text"
          placeholder="Search username, name, or email"
          value={filters.draft.search}
          onChange={(event) => onFilterChange('search', event.target.value)}
          className={inputClassName}
        />
        <Select
          value={filters.draft.role}
          onChange={(event) => onFilterChange('role', event.target.value)}
          options={ROLE_OPTIONS}
        />
        <Select
          value={filters.draft.bannedState}
          onChange={(event) => onFilterChange('bannedState', event.target.value)}
          options={BANNED_OPTIONS}
        />
        <Select
          value={filters.draft.activityWindow}
          onChange={(event) => onFilterChange('activityWindow', event.target.value)}
          options={ACTIVITY_OPTIONS}
        />
        <div className="md:col-span-2 xl:col-span-1">
          <Select
            value={filters.draft.sortBy}
            onChange={(event) => onFilterChange('sortBy', event.target.value)}
            options={SORT_OPTIONS}
          />
        </div>
      </AdminFilterBar>

      <Card variant="glass" padding="lg">
        <h2 className="mb-6 text-xl font-bold text-white">User Management</h2>

        {loading ? (
          <div className="py-8 text-center">
            <LoadingSpinner />
          </div>
        ) : users.length === 0 ? (
          <div className="py-8 text-center">
            <Users className="mx-auto mb-4 text-white/40" size={48} />
            <p className="text-white/70">No users found for the current filters.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`rounded-lg border p-4 transition-all duration-200 ${
                  user.banned
                    ? 'border-red-500/30 bg-red-500/10'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold ${
                      user.banned ? 'bg-red-500/20 text-red-400' : 'bg-primary-500/20 text-primary-400'
                    }`}>
                      {user.displayName?.charAt(0).toUpperCase() || 'U'}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-white">{user.displayName || 'Unknown'}</span>
                        <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] uppercase tracking-[0.22em] text-white/55">
                          {user.role || 'player'}
                        </span>
                        {user.banned && (
                          <span className="rounded-full bg-red-500/20 px-2 py-1 text-xs text-red-400">
                            BANNED
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-white/60">@{user.username}</div>
                      <div className="text-xs text-white/50">{user.email}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-white/80 md:grid-cols-4 xl:min-w-[28rem]">
                    <div className="rounded-lg border border-white/10 bg-black/10 p-3 text-right">
                      <div className="font-semibold text-white">{formatScore(user.stats?.bestScore || 0)}</div>
                      <div className="text-xs text-white/50">High Score</div>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-black/10 p-3 text-right">
                      <div className="font-semibold text-white">{user.stats?.totalGames || 0}</div>
                      <div className="text-xs text-white/50">Games</div>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-black/10 p-3 text-right">
                      <div className="font-semibold text-white">{user.stats?.achievementsCompleted || 0}</div>
                      <div className="text-xs text-white/50">Achievements</div>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-black/10 p-3 text-right">
                      <div className="font-semibold text-white">{formatLastSeen(user.lastActive)}</div>
                      <div className="text-xs text-white/50">Last Active</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 xl:justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<ExternalLink size={14} />}
                      onClick={() => window.open(`/player/${user.id}`, '_blank', 'noopener,noreferrer')}
                    >
                      View
                    </Button>
                    <Button
                      variant={user.banned ? 'ghost' : 'danger'}
                      size="sm"
                      loading={moderatingUserId === user.id}
                      icon={user.banned ? <UnlockKeyhole size={14} /> : <Ban size={14} />}
                      onClick={() => onBanUser(user.id, user.banned)}
                    >
                      {user.banned ? 'Unban' : 'Ban'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <AdminPagination
          pagination={pagination}
          label="Users"
          onPrev={onPrevPage}
          onNext={onNextPage}
          prevAriaLabel="Previous users page"
          nextAriaLabel="Next users page"
          disabled={loading}
        />
      </Card>
    </div>
  );
};
