import { getAchievementProgressSnapshot } from '@/hooks/achievements/progress.js';
import { getIconComponent } from '@/utils/iconMap.js';

const defaultProgressSnapshot = {
  percentage: 0,
  current: 0,
  target: 1,
  label: 'Progress'
};

export const buildAchievementGridCardState = ({
  calculateAchievementProgress,
  getTierStyling,
  isAchievementUnlocked,
  item,
  uncollectedIds,
  userStats
}) => {
  const isChain = item.type === 'chain';
  const achievement = isChain
    ? (item.activeTier || item.tiers?.[0] || null)
    : item.achievement;
  const visualTier = isChain
    ? (item.activeTier?.tier || item.tier)
    : achievement?.tier;
  const isUnlocked = isChain
    ? item.unlockedCount > 0
    : isAchievementUnlocked(achievement?.id);
  const tierStyling = getTierStyling(visualTier);
  const isUncollected = isChain
    ? item.hasUncollected
    : uncollectedIds.has(achievement?.id);
  const isCollected = isChain
    ? item.isFullyCollected
    : isUnlocked && !isUncollected;
  const progressSnapshot = userStats && achievement
    ? getAchievementProgressSnapshot(achievement, userStats)
    : defaultProgressSnapshot;
  const progress = isChain
    ? (
      item.activeTierState === 'ready_to_collect'
        ? 100
        : progressSnapshot.percentage
    )
    : (
      isUnlocked
        ? 100
        : calculateAchievementProgress(achievement, userStats || {})
    );
  const Icon = getIconComponent(isChain ? item.icon : achievement?.icon);
  const statusLabel = isChain
    ? (
      item.activeTierState === 'ready_to_collect'
        ? 'Reward Ready'
        : (item.unlockedCount > 0 ? 'Chain In Progress' : 'Locked')
    )
    : (isUncollected ? 'Completed' : (isCollected ? 'Collected' : null));
  const statusClassName = isChain
    ? (
      item.activeTierState === 'ready_to_collect'
        ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
        : item.unlockedCount > 0
          ? 'bg-sky-500/20 text-sky-200 border border-sky-400/30'
          : 'bg-white/10 text-white/65 border border-white/15'
    )
    : (
      isUncollected
        ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
        : isCollected
          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
          : ''
    );

  return {
    Icon,
    achievement,
    isChain,
    isCollected,
    isUncollected,
    isUnlocked,
    progress,
    progressSnapshot,
    statusClassName,
    statusLabel,
    tierStyling,
    visualTier
  };
};
