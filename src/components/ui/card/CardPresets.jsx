import { motion } from 'framer-motion';
import { getIconComponent } from '@/utils/iconMap';
import * as achievementProgress from '@/hooks/achievements/progress.js';
import Card from './CardBase.jsx';
import { CardDescription, CardTitle } from './CardStructure.jsx';

export const GameModeCard = ({
  title,
  description,
  icon,
  disabled = false,
  onClick,
  className = '',
  ...props
}) => (
  <Card
    variant="glass"
    clickable={!disabled}
    hover={!disabled}
    onClick={!disabled ? onClick : undefined}
    className={`text-center ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    {...props}
  >
    <div className="text-4xl mb-3">{icon}</div>
    <CardTitle className="text-center">{title}</CardTitle>
    <CardDescription className="text-center">{description}</CardDescription>
  </Card>
);

const ACHIEVEMENT_TIER_COLORS = {
  common: '#9ca3af',
  uncommon: '#10b981',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b'
};

const getAchievementTierBadgeClass = (tier) => {
  if (tier === 'legendary') return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
  if (tier === 'epic') return 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
  if (tier === 'rare') return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
  if (tier === 'uncommon') return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
  return 'bg-gray-500/20 text-gray-300 border border-gray-500/30';
};

const getAchievementProgressBarClass = (displayProgress) => {
  if (displayProgress >= 100) return 'bg-emerald-500';
  if (displayProgress >= 75) return 'bg-blue-500';
  if (displayProgress >= 50) return 'bg-yellow-500';
  return 'bg-gray-500';
};

const getAchievementProgressTextClass = (displayProgress) => {
  if (displayProgress >= 100) return 'text-emerald-400';
  if (displayProgress >= 75) return 'text-blue-400';
  if (displayProgress >= 50) return 'text-yellow-400';
  return 'text-white/70';
};

const renderAchievementIcon = (icon) => {
  if (!icon) return null;
  if (typeof icon === 'string') {
    const Icon = getIconComponent(icon);
    return <Icon size={24} />;
  }
  return icon;
};

export const AchievementCard = ({
  achievement,
  unlocked = false,
  progress = null,
  userStats = null,
  onClick,
  className = '',
  ...props
}) => {
  const progressSnapshot = (!unlocked && achievement?.requirements && userStats)
    ? achievementProgress.getAchievementProgressSnapshot(achievement, userStats)
    : null;
  const displayProgress = progress !== null ? progress : progressSnapshot?.percentage || 0;
  const tierColor = ACHIEVEMENT_TIER_COLORS[achievement?.tier] || '#9ca3af';

  return (
    <Card
      variant="glass"
      clickable={!!onClick}
      glow={unlocked}
      className={`${unlocked ? '' : 'opacity-70'} ${className} transition-all duration-300`}
      onClick={onClick}
      style={{
        borderColor: unlocked ? `${tierColor}B3` : `${tierColor}66`,
        background: unlocked
          ? `linear-gradient(145deg, ${tierColor}1C, rgba(15, 23, 42, 0.7))`
          : `linear-gradient(145deg, ${tierColor}10, rgba(15, 23, 42, 0.62))`,
        boxShadow: unlocked
          ? `0 0 0 1px ${tierColor}66, 0 12px 28px ${tierColor}26`
          : `0 0 0 1px ${tierColor}35`
      }}
      {...props}
    >
      <div className="flex items-start space-x-3">
        <div className="text-2xl flex-shrink-0 relative">
          {renderAchievementIcon(achievement?.icon)}
          {unlocked && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <CardTitle className={`text-sm mb-1 ${unlocked ? 'text-emerald-300' : 'text-white'}`}>
            {achievement.title}
          </CardTitle>
          <CardDescription className="text-xs mb-2 line-clamp-2">
            {achievement.description}
          </CardDescription>

          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getAchievementTierBadgeClass(achievement.tier)}`}>
              {achievement.tier}
            </span>
            <span className="text-xs text-primary-400 font-medium">+{achievement.points}pts</span>
          </div>

          {!unlocked && progressSnapshot && (
            <div className="mt-2 space-y-2">
              <div className="relative">
                <div className="bg-white/10 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className={`h-2 rounded-full transition-all duration-500 ${getAchievementProgressBarClass(displayProgress)}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, displayProgress)}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-white/60">
                  {progressSnapshot.label || 'Progress'}
                </span>
                <span className={`font-medium ${getAchievementProgressTextClass(displayProgress)}`}>
                  {`${progressSnapshot.current}/${progressSnapshot.target}`}
                </span>
              </div>
            </div>
          )}

          {unlocked && (
            <div className="mt-2 flex items-center text-xs text-emerald-400">
              <span>Unlocked</span>
              {achievement.unlockedAt && (
                <span className="ml-2 text-white/50">
                  {new Date(achievement.unlockedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export const StatsCard = ({
  title,
  value,
  icon,
  trend = null,
  subtitle = null,
  className = '',
  ...props
}) => (
  <Card variant="glass" className={className} {...props}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-white/70 text-sm mb-1">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
        {subtitle && (
          <p className="text-white/50 text-xs mt-1">{subtitle}</p>
        )}
      </div>
      {icon && (
        <div className="text-primary-400 text-2xl">{icon}</div>
      )}
    </div>
    {typeof trend === 'number' && trend !== 0 && (
      <div className={`mt-2 text-xs flex items-center ${
        trend > 0 ? 'text-emerald-400' : trend < 0 ? 'text-red-400' : 'text-white/70'
      }`}>
        {trend > 0 ? 'Up' : trend < 0 ? 'Down' : 'Flat'} {Math.abs(trend)}%
      </div>
    )}
  </Card>
);

const getRankStyle = (rank) => {
  if (rank === 1) return 'text-amber-400 bg-amber-500/20';
  if (rank === 2) return 'text-gray-300 bg-gray-500/20';
  if (rank === 3) return 'text-amber-600 bg-amber-700/20';
  return 'text-white/70 bg-white/10';
};

export const LeaderboardCard = ({
  rank,
  player,
  score,
  mode,
  date,
  highlighted = false,
  className = '',
  ...props
}) => (
  <Card
    variant={highlighted ? 'gradient' : 'glass'}
    padding="sm"
    className={className}
    {...props}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankStyle(rank)}`}>
          {rank}
        </div>
        <div>
          <p className="font-medium text-white">{player}</p>
          <p className="text-xs text-white/70">{mode} - {date}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-white">{score}</p>
      </div>
    </div>
  </Card>
);
