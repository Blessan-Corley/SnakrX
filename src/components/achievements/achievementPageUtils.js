import { ACHIEVEMENT_TIERS } from '@/data/achievements.js';

export const defaultProgressSnapshot = {
  percentage: 0,
  current: 0,
  target: 1,
  label: 'Progress'
};

export const getPreferredChainTierIndex = (chain) => {
  if (!chain?.tiers?.length) return 0;

  const readyToCollectIndex = chain.tiers.findIndex((tier) => tier.isUncollected);
  if (readyToCollectIndex >= 0) return readyToCollectIndex;

  const nextLockedIndex = chain.tiers.findIndex((tier) => !tier.isUnlocked);
  if (nextLockedIndex >= 0) return nextLockedIndex;

  const lastUnlockedIndex = chain.tiers.reduce(
    (currentIndex, tier, index) => (tier.isUnlocked ? index : currentIndex),
    -1
  );

  return lastUnlockedIndex >= 0 ? lastUnlockedIndex : 0;
};

export const formatRequirementValue = (detail) => {
  if (detail.type === 'condition') return detail.displayValue;
  return `${Math.min(detail.actualCurrent ?? detail.current, detail.target)}/${detail.target}`;
};

export const getTierStatusCopy = (tierAchievement) => {
  if (tierAchievement.isCollected) {
    return {
      label: 'Collected',
      className: 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
    };
  }

  if (tierAchievement.isUncollected || tierAchievement.isUnlocked) {
    return {
      label: tierAchievement.isUncollected ? 'Reward Ready' : 'Unlocked',
      className: tierAchievement.isUncollected
        ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
        : 'bg-sky-500/20 text-sky-200 border border-sky-400/30'
    };
  }

  return {
    label: 'In progress',
    className: 'bg-white/10 text-white/65 border border-white/15'
  };
};

export const isTextInputElement = (element) => {
  if (!element) return false;
  const tagName = element.tagName?.toLowerCase();
  return tagName === 'input' || tagName === 'textarea' || tagName === 'select' || element.isContentEditable;
};

export const resolveTierStyling = (tier, source = ACHIEVEMENT_TIERS) => {
  const tierConfig = source[tier];
  return {
    color: tierConfig?.color || '#9ca3af',
    bgGradient: tierConfig?.bgGradient || 'from-gray-400 to-gray-600',
    glow: tierConfig?.glow || 'shadow-gray-500/20'
  };
};

export const collectBurstOffsets = [
  { x: -42, y: -12, rotate: -18, scale: 0.8 },
  { x: -28, y: -28, rotate: -42, scale: 1 },
  { x: -10, y: -38, rotate: -8, scale: 0.72 },
  { x: 12, y: -34, rotate: 18, scale: 0.86 },
  { x: 30, y: -24, rotate: 42, scale: 0.94 },
  { x: 42, y: -8, rotate: 24, scale: 0.76 },
  { x: -30, y: 18, rotate: -24, scale: 0.72 },
  { x: 28, y: 20, rotate: 28, scale: 0.74 }
];
