import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Select from '@/components/ui/Select';
import { formatScore, formatTime } from '@/utils/gameUtils';
import AdminFilterBar from './AdminFilterBar.jsx';
import AdminPagination from './AdminPagination.jsx';

const MODE_OPTIONS = [
  { value: 'all', label: 'All modes' },
  { value: 'classic', label: 'Classic' },
  { value: 'classic_transparent', label: 'Classic Transparent' },
  { value: 'vsai', label: 'VS AI' },
  { value: 'multiplayer', label: 'Multiplayer' }
];

const RESULT_OPTIONS = [
  { value: 'all', label: 'All results' },
  { value: 'completed', label: 'Completed' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
  { value: 'victory', label: 'Victory' },
  { value: 'defeat', label: 'Defeat' }
];

const PERIOD_OPTIONS = [
  { value: 'all', label: 'Any time' },
  { value: '24h', label: 'Past 24 hours' },
  { value: '7d', label: 'Past 7 days' },
  { value: '30d', label: 'Past 30 days' },
  { value: '90d', label: 'Past 90 days' }
];

const SORT_OPTIONS = [
  { value: 'createdAt_desc', label: 'Newest first' },
  { value: 'score_desc', label: 'Highest score first' },
  { value: 'xp_desc', label: 'Highest XP first' },
  { value: 'duration_desc', label: 'Longest sessions first' }
];

const inputClassName = 'w-full rounded-xl border border-white/15 bg-slate-950/45 px-4 py-2.5 text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-primary-500/40';

/**
 * Admin Match History Tab Component
 */
export const MatchHistoryTab = ({
  matchHistory,
  loading,
  filters,
  onFilterChange,
  onApplyFilters,
  onResetFilters,
  pagination,
  onPrevPage = () => {},
  onNextPage = () => {},
  onRefresh = () => {}
}) => {
  return (
    <div className="space-y-6">
      <AdminFilterBar
        title="Match Filters"
        description="Search by player, narrow to the exact mode and result, and page through the filtered history."
        onApply={onApplyFilters}
        onReset={onResetFilters}
        onRefresh={onRefresh}
        loading={loading}
      >
        <input
          type="text"
          placeholder="Search username or user id"
          value={filters.draft.search}
          onChange={(event) => onFilterChange('search', event.target.value)}
          className={inputClassName}
        />
        <Select
          value={filters.draft.mode}
          onChange={(event) => onFilterChange('mode', event.target.value)}
          options={MODE_OPTIONS}
        />
        <Select
          value={filters.draft.result}
          onChange={(event) => onFilterChange('result', event.target.value)}
          options={RESULT_OPTIONS}
        />
        <Select
          value={filters.draft.period}
          onChange={(event) => onFilterChange('period', event.target.value)}
          options={PERIOD_OPTIONS}
        />
        <input
          type="number"
          min="0"
          placeholder="Minimum score"
          value={filters.draft.minScore}
          onChange={(event) => onFilterChange('minScore', event.target.value)}
          className={inputClassName}
        />
        <input
          type="number"
          min="0"
          placeholder="Maximum score"
          value={filters.draft.maxScore}
          onChange={(event) => onFilterChange('maxScore', event.target.value)}
          className={inputClassName}
        />
        <div className="md:col-span-2 xl:col-span-2">
          <Select
            value={filters.draft.sortBy}
            onChange={(event) => onFilterChange('sortBy', event.target.value)}
            options={SORT_OPTIONS}
          />
        </div>
      </AdminFilterBar>

      <Card variant="glass" padding="lg">
        <h2 className="mb-6 text-xl font-bold text-white">Match History</h2>

        {loading ? (
          <div className="py-8 text-center">
            <LoadingSpinner />
          </div>
        ) : matchHistory.length === 0 ? (
          <div className="py-10 text-center text-white/70">
            No matches found for the current filters.
          </div>
        ) : (
          <div className="space-y-3">
            {matchHistory.map((match, index) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-lg border border-white/10 bg-white/5 p-4 transition-all duration-200 hover:bg-white/10"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`h-3 w-3 rounded-full ${
                      match.result === 'victory' || match.result === 'won'
                        ? 'bg-green-400'
                        : match.result === 'defeat' || match.result === 'lost'
                          ? 'bg-red-400'
                          : 'bg-blue-400'
                    }`}
                    />

                    <div>
                      <div className="font-semibold text-white">{match.username || 'Unknown Player'}</div>
                      <div className="text-sm text-white/60">
                        {match.mode} {match.difficulty && `(${match.difficulty})`}
                      </div>
                      <div className="text-xs uppercase tracking-[0.22em] text-white/45">{match.result}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:min-w-[32rem]">
                    <div className="rounded-lg border border-white/10 bg-black/10 p-3 text-right">
                      <div className="font-bold text-white">{formatScore(match.score)}</div>
                      <div className="text-xs text-white/60">Score</div>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-black/10 p-3 text-right">
                      <div className="font-bold text-white">{formatTime(match.duration)}</div>
                      <div className="text-xs text-white/60">Duration</div>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-black/10 p-3 text-right">
                      <div className="font-bold text-amber-300">+{match.xpGained || 0} XP</div>
                      <div className="text-xs text-white/60">XP Gained</div>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-black/10 p-3 text-right">
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
                  <div className="mt-3 border-t border-white/10 pt-3">
                    <div className="grid grid-cols-2 gap-4 text-xs md:grid-cols-4">
                      <div>
                        <span className="text-white/60">Food Eaten:</span>
                        <span className="ml-1 text-white">{match.foodEaten || 0}</span>
                      </div>
                      <div>
                        <span className="text-white/60">Max Speed:</span>
                        <span className="ml-1 text-white">{match.speedReached || 0}</span>
                      </div>
                      <div>
                        <span className="text-white/60">Moves:</span>
                        <span className="ml-1 text-white">{match.stats?.moves || 0}</span>
                      </div>
                      <div>
                        <span className="text-white/60">Efficiency:</span>
                        <span className="ml-1 text-white">{match.stats?.efficiency?.toFixed(1) || '0.0'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        <AdminPagination
          pagination={pagination}
          label="Games"
          onPrev={onPrevPage}
          onNext={onNextPage}
          prevAriaLabel="Previous games page"
          nextAriaLabel="Next games page"
          disabled={loading}
        />
      </Card>
    </div>
  );
};
