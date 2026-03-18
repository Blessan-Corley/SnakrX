import { useCallback, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth.js';
import { useAchievementOperations } from '@/hooks/useAchievements.js';
import { getAchievementProgressSnapshot } from '@/hooks/achievements/progress.js';
import { playClick } from '@/utils/sound.js';
import {
  defaultProgressSnapshot,
  getPreferredChainTierIndex,
  resolveTierStyling
} from '@/components/achievements/achievementPageUtils.js';
import { buildAchievementViewState } from '@/components/achievements/achievementViewState.js';
import achievementCategoryIcons from './achievementCategoryIcons.jsx';
import useAchievementCollectionState from './controller/useAchievementCollectionState.js';
import useAchievementFilters from './controller/useAchievementFilters.js';
import useAchievementSelectionState from './controller/useAchievementSelectionState.js';

const useAchievementsPageController = () => {
  const { userProfile } = useAuth();
  const {
    achievements,
    unlockedAchievements,
    achievementTiers,
    loading,
    recentUnlocks,
    getAchievementStats,
    isAchievementUnlocked,
    calculateAchievementProgress,
    shareAchievement,
    getTotalPointsEarned,
    getCompletionPercentage,
    collectAchievement,
    collectAllAchievements,
    uncollectedAchievements
  } = useAchievementOperations();

  const {
    handleCategoryChange,
    handleClearFilters,
    handleToggleUnlockedOnly,
    searchTerm,
    selectedCategory,
    selectedTier,
    setSearchTerm,
    setSelectedTier,
    showUnlockedOnly
  } = useAchievementFilters();

  const achievementStats = getAchievementStats();
  const totalPoints = getTotalPointsEarned();
  const completionPercentage = getCompletionPercentage();

  const {
    collectedAchievements,
    filteredAchievements,
    recentUncollectedUnlocks,
    uncollectedIds
  } = useMemo(() => buildAchievementViewState({
    achievements,
    recentUnlocks,
    searchTerm,
    selectedCategory,
    selectedTier,
    showUnlockedOnly,
    unlockedAchievements,
    uncollectedAchievements
  }), [
    achievements,
    recentUnlocks,
    searchTerm,
    selectedCategory,
    selectedTier,
    showUnlockedOnly,
    unlockedAchievements,
    uncollectedAchievements
  ]);

  const {
    chainTransitionDirection,
    handleAchievementClick,
    navigateChainTier,
    selectedCard,
    selectedChain,
    selectedChainTier,
    selectedChainTierIndex,
    selectedIsChain,
    selectedSingleAchievement,
    setActiveChainTierIndex,
    setChainTransitionDirection,
    setShowAchievementModal,
    showAchievementModal
  } = useAchievementSelectionState({
    achievements,
    filteredAchievements,
    unlockedAchievements
  });
  const {
    collectBurst,
    collectingAchievementId,
    handleCollectAction,
    handleCollectAllAction,
    isCollectingAll,
    pendingCollectedTierId,
    setPendingCollectedTierId
  } = useAchievementCollectionState({ collectAchievement, collectAllAchievements });
  const selectedChainTierStyling = resolveTierStyling(
    selectedChainTier?.tier || selectedChain?.tier || 'common',
    achievementTiers
  );
  const selectedChainTierProgress = selectedChainTier && userProfile?.stats
    ? getAchievementProgressSnapshot(selectedChainTier, userProfile.stats)
    : defaultProgressSnapshot;
  const selectedSingleIsUncollected = selectedSingleAchievement
    ? uncollectedIds.has(selectedSingleAchievement.id)
    : false;
  const selectedCollectableAchievement = selectedIsChain ? selectedChainTier : selectedSingleAchievement;
  const selectedCollectableId = selectedCollectableAchievement?.isUncollected || selectedSingleIsUncollected
    ? selectedCollectableAchievement?.id
    : '';
  const selectedCollectButtonLabel = selectedIsChain ? 'Collect Tier Reward' : 'Collect Achievement';

  useEffect(() => {
    if (!selectedIsChain || !pendingCollectedTierId || !selectedChain?.tiers?.length) return;

    const collectedTier = selectedChain.tiers.find((tier) => tier.id === pendingCollectedTierId);
    if (!collectedTier || !collectedTier.isCollected) return;

    const nextIndex = getPreferredChainTierIndex(selectedChain);
    setPendingCollectedTierId('');

    if (nextIndex !== selectedChainTierIndex) {
      setChainTransitionDirection(nextIndex > selectedChainTierIndex ? 1 : -1);
      setActiveChainTierIndex(nextIndex);
    }
  }, [
    pendingCollectedTierId,
    selectedChain,
    selectedChainTierIndex,
    selectedIsChain,
    setActiveChainTierIndex,
    setChainTransitionDirection,
    setPendingCollectedTierId
  ]);

  const handleShareAchievement = useCallback((achievementId) => {
    shareAchievement(achievementId);
    playClick();
  }, [shareAchievement]);

  const getTierStyling = useCallback((tier) => resolveTierStyling(tier, achievementTiers), [achievementTiers]);

  return {
    achievementStats,
    categoryIcons: achievementCategoryIcons,
    chainTransitionDirection,
    collectedAchievements,
    collectingAchievementId,
    collectBurst,
    completionPercentage,
    handleCollectAllAction,
    filteredAchievements,
    getTierStyling,
    handleAchievementClick,
    handleCategoryChange,
    handleClearFilters,
    handleCollectAction,
    handleShareAchievement,
    handleToggleUnlockedOnly,
    isAchievementUnlocked,
    isCollectingAll,
    loading,
    navigateChainTier,
    recentUnlockCount: recentUnlocks.length,
    recentUncollectedUnlocks,
    searchTerm,
    selectedCard,
    selectedCategory,
    selectedChain,
    selectedChainTier,
    selectedChainTierIndex,
    selectedChainTierProgress,
    selectedChainTierStyling,
    selectedCollectButtonLabel,
    selectedCollectableId,
    selectedIsChain,
    selectedSingleAchievement,
    selectedTier,
    setSearchTerm,
    setSelectedTier,
    setShowAchievementModal,
    showAchievementModal,
    showUnlockedOnly,
    totalPoints,
    uncollectedAchievements,
    uncollectedIds,
    userStats: userProfile?.stats,
    calculateAchievementProgress
  };
};

export default useAchievementsPageController;
