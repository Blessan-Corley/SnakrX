import { AnimatePresence, motion } from 'framer-motion';
import { Check, Crown, Eye, Medal, UserPlus } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import { ListSkeleton } from '../../components/ui/LoadingSpinner.jsx';
import { FRIENDSHIP_STATUSES } from '../../hooks/friends/relationshipState.js';
import { formatScore } from '../../utils/gameUtils.js';
import { GAME_MODES_FILTERS, formatEntryTimestamp } from './leaderboardConfig.js';

const getRankBadge = (rank) => {
  if (rank === 1) return { icon: <Crown size={20} />, color: 'text-amber-400', bg: 'bg-amber-500/20' };
  if (rank === 2) return { icon: <Medal size={20} />, color: 'text-gray-300', bg: 'bg-gray-500/20' };
  if (rank === 3) return { icon: <Medal size={20} />, color: 'text-amber-600', bg: 'bg-amber-700/20' };
  return { icon: <span className="font-mono text-sm">#{rank}</span>, color: 'text-white/70', bg: 'bg-white/10' };
};

const LeaderboardEntriesSection = ({
  loading,
  error,
  entries,
  selectedMode,
  isAchievementMode,
  isOverallMode,
  activeTargetId,
  getDisplayName,
  onOpenProfile,
  onSendInvite
}) => (
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
            {entries.slice(0, 100).map((entry, index) => {
              const badge = getRankBadge(entry.rank);
              const canViewProfile = !entry.isPrivateLeaderboard || entry.isCurrentUser;
              const isRelationshipActionActive = activeTargetId === entry.userId;
              const relationshipAction = (() => {
                switch (entry.friendshipStatus) {
                  case FRIENDSHIP_STATUSES.ACCEPTED:
                    return {
                      label: 'Friends',
                      variant: 'ghost',
                      disabled: true,
                      icon: <Check size={14} />
                    };
                  case FRIENDSHIP_STATUSES.PENDING_SENT:
                    return {
                      label: 'Request Sent',
                      variant: 'ghost',
                      disabled: true,
                      icon: <UserPlus size={14} />
                    };
                  case FRIENDSHIP_STATUSES.PENDING_RECEIVED:
                    return {
                      label: 'Accept Request',
                      variant: 'success',
                      disabled: false,
                      icon: <Check size={14} />
                    };
                  default:
                    return {
                      label: 'Invite',
                      variant: 'ghost-primary',
                      disabled: false,
                      icon: <UserPlus size={14} />
                    };
                }
              })();
              return (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-3 rounded-xl border transition-all duration-200 ${canViewProfile ? 'cursor-pointer hover:border-primary-400/40' : 'cursor-default'} ${entry.isCurrentUser ? 'bg-primary-500/20 border-primary-500/40' : 'bg-white/5 border-white/10'}`}
                  onClick={() => {
                    if (canViewProfile) {
                      onOpenProfile(entry.userId);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${badge.bg} ${badge.color}`}>
                        {badge.icon}
                      </div>
                      <div>
                        <p className={`font-bold truncate ${entry.isCurrentUser ? 'text-primary-300' : 'text-white'}`}>{getDisplayName(entry)}</p>
                        <p className="text-xs text-white/60">
                          {isAchievementMode
                            ? `${entry.achievementsCompleted || 0} achievements completed`
                            : formatEntryTimestamp(entry.timestamp)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <div>
                        <p className="font-bold text-white text-lg">{formatScore(entry.score || 0)}</p>
                        <p className="text-xs text-white/55">
                          {isAchievementMode
                            ? 'Achievement Points'
                            : isOverallMode
                              ? 'Total Score'
                              : (GAME_MODES_FILTERS.find((mode) => mode.id === selectedMode)?.name || 'Score')}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {canViewProfile && (
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="View profile"
                            onClick={(event) => {
                              event.stopPropagation();
                              onOpenProfile(entry.userId);
                            }}
                            icon={<Eye size={14} />}
                          />
                        )}
                        {!entry.isCurrentUser && !entry.isPrivateLeaderboard && (
                          <Button
                            size="sm"
                            variant={relationshipAction.variant}
                            aria-label={relationshipAction.label}
                            onClick={(event) => onSendInvite(event, entry.userId)}
                            icon={relationshipAction.icon}
                            disabled={relationshipAction.disabled || isRelationshipActionActive}
                            loading={isRelationshipActionActive}
                          >
                            {relationshipAction.label}
                          </Button>
                        )}
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
);

export default LeaderboardEntriesSection;
