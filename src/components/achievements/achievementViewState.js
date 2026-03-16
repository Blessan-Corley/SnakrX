export const buildAchievementViewState = ({
  achievements,
  recentUnlocks,
  searchTerm,
  selectedCategory,
  selectedTier,
  showUnlockedOnly,
  unlockedAchievements,
  uncollectedAchievements
}) => {
  const uncollectedIds = new Set(uncollectedAchievements.map((achievement) => achievement.id));
  const unlockedIds = new Set((unlockedAchievements || []).map((achievement) => achievement.id));
  const collectedIds = new Set(
    (unlockedAchievements || [])
      .map((achievement) => achievement.id)
      .filter((id) => !uncollectedIds.has(id))
  );
  const collectedAchievements = (unlockedAchievements || [])
    .filter((achievement) => !uncollectedIds.has(achievement.id))
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  const recentUncollectedUnlocks = recentUnlocks.filter((achievement) => uncollectedIds.has(achievement.id));
  const loweredSearch = searchTerm.trim().toLowerCase();

  const passesSearch = (...values) => {
    if (!loweredSearch) return true;

    const searchableText = values
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return searchableText.includes(loweredSearch);
  };

  const hasActiveFilters = selectedCategory !== 'all'
    || selectedTier !== 'all'
    || showUnlockedOnly
    || loweredSearch.length > 0;

  const matchesTierFilters = (tier) => {
    if (selectedCategory !== 'all' && tier.category !== selectedCategory) return false;
    if (selectedTier !== 'all' && tier.tier !== selectedTier) return false;
    if (showUnlockedOnly && !tier.isUnlocked) return false;
    if (loweredSearch && !passesSearch(
      tier.title,
      tier.description,
      tier.chainTitle,
      tier.chainDescription
    )) return false;

    return true;
  };

  const passesSingleFilters = (achievement) => {
    if (selectedCategory !== 'all' && achievement.category !== selectedCategory) return false;
    if (selectedTier !== 'all' && achievement.tier !== selectedTier) return false;
    if (showUnlockedOnly && !unlockedIds.has(achievement.id)) return false;

    return passesSearch(
      achievement.title,
      achievement.description,
      achievement.chainTitle,
      achievement.chainDescription
    );
  };

  const filteredRawAchievements = achievements.filter((achievement) => {
    if (!passesSingleFilters(achievement)) return false;
    if (!achievement.chainId && collectedIds.has(achievement.id)) return false;
    return true;
  });

  const chainSource = achievements.reduce((map, achievement) => {
    if (!achievement.chainId) return map;
    const existing = map.get(achievement.chainId) || [];
    existing.push(achievement);
    map.set(achievement.chainId, existing);
    return map;
  }, new Map());

  const chainCards = [];
  const standaloneAchievements = [];
  const tierOrder = {
    common: 1,
    uncommon: 2,
    rare: 3,
    epic: 4,
    legendary: 5
  };

  filteredRawAchievements.forEach((achievement) => {
    if (!achievement.chainId) {
      standaloneAchievements.push({
        type: 'single',
        id: achievement.id,
        achievement
      });
      return;
    }

    if (chainCards.some((card) => card.chainId === achievement.chainId)) return;

    const fullChain = (chainSource.get(achievement.chainId) || [])
      .slice()
      .sort((a, b) => (a.chainOrder || 999) - (b.chainOrder || 999));

    const tiers = fullChain.map((tier) => ({
      ...tier,
      isUnlocked: unlockedIds.has(tier.id),
      isCollected: collectedIds.has(tier.id),
      isUncollected: uncollectedIds.has(tier.id)
    }));

    const unlockedCount = tiers.filter((tier) => tier.isUnlocked).length;
    const collectedCount = tiers.filter((tier) => tier.isCollected).length;
    const totalTiers = tiers.length;
    const readyToCollectTiers = tiers.filter((tier) => tier.isUncollected);
    const nextTier = tiers.find((tier) => !tier.isUnlocked) || tiers[tiers.length - 1];
    const highestUnlockedTier = tiers
      .slice()
      .reverse()
      .find((tier) => tier.isUnlocked);
    const representative = tiers[0];
    const activeTier = readyToCollectTiers[0] || nextTier || highestUnlockedTier || tiers[0];
    const matchingTiers = tiers.filter(matchesTierFilters);
    const displayTier = (() => {
      if (!hasActiveFilters) return activeTier;
      if (!matchingTiers.length) return activeTier;
      if (matchingTiers.some((tier) => tier.id === activeTier?.id)) return activeTier;

      const readyMatchingTier = matchingTiers.find((tier) => tier.isUncollected);
      if (readyMatchingTier) return readyMatchingTier;

      if (showUnlockedOnly) {
        const unlockedMatchingTiers = matchingTiers.filter((tier) => tier.isUnlocked);
        if (unlockedMatchingTiers.length > 0) {
          return unlockedMatchingTiers[unlockedMatchingTiers.length - 1];
        }
      }

      return matchingTiers[0];
    })();
    const isFullyCollected = totalTiers > 0 && collectedCount === totalTiers;
    const activeTierState = readyToCollectTiers.length > 0
      ? 'ready_to_collect'
      : isFullyCollected
        ? 'collected_chain_complete'
        : 'in_progress';

    const chainCard = {
      type: 'chain',
      id: `chain-${achievement.chainId}`,
      chainId: achievement.chainId,
      title: displayTier?.title || activeTier?.title || representative?.title || 'Achievement Chain',
      description: displayTier?.description || activeTier?.description || representative?.description || '',
      chainTitle: representative?.chainTitle || representative?.title || 'Achievement Chain',
      chainDescription: representative?.chainDescription || representative?.description || '',
      icon: displayTier?.icon || activeTier?.icon || representative?.icon || 'award',
      category: displayTier?.category || activeTier?.category || representative?.category || 'gameplay',
      tier: displayTier?.tier || activeTier?.tier || representative?.tier || 'common',
      points: displayTier?.points || activeTier?.points || 0,
      tiers,
      totalTiers,
      unlockedCount,
      collectedCount,
      highestUnlockedTier,
      hasUncollected: readyToCollectTiers.length > 0,
      progressPercent: totalTiers > 0 ? Math.round((unlockedCount / totalTiers) * 100) : 0,
      progressLabel: `${unlockedCount}/${totalTiers}`,
      nextTier,
      activeTier,
      displayTier,
      activeTierState,
      activeTierIndex: Math.max(tiers.findIndex((tier) => tier.id === activeTier?.id), 0),
      displayTierIndex: Math.max(tiers.findIndex((tier) => tier.id === displayTier?.id), 0),
      readyToCollectCount: readyToCollectTiers.length,
      collectableId: readyToCollectTiers[0]?.id || '',
      isFullyCollected
    };

    if (chainCard.isFullyCollected) {
      return;
    }

    if (selectedCategory !== 'all' && !tiers.some((tier) => tier.category === selectedCategory)) {
      return;
    }

    if (selectedTier !== 'all' && !tiers.some((tier) => tier.tier === selectedTier)) {
      return;
    }

    if (showUnlockedOnly && !tiers.some((tier) => tier.isUnlocked)) {
      return;
    }

    if (!passesSearch(
      chainCard.title,
      chainCard.description,
      chainCard.chainTitle,
      chainCard.chainDescription,
      ...chainCard.tiers.flatMap((tier) => [tier.title, tier.description])
    )) {
      return;
    }

    chainCards.push(chainCard);
  });

  const filteredAchievements = [...chainCards, ...standaloneAchievements].sort((a, b) => {
    const getItemTier = (item) => {
      if (item.type === 'chain') {
        return item.activeTier?.tier || item.tier || 'common';
      }

      return item.achievement?.tier || 'common';
    };

    const getItemTitle = (item) => {
      if (item.type === 'chain') {
        return item.title || item.nextTier?.title || 'Achievement Chain';
      }

      return item.achievement?.title || '';
    };

    const statusRank = (item) => {
      if (item.type === 'chain') {
        if (item.activeTierState === 'ready_to_collect') return 0;
        if (item.unlockedCount > 0) return 1;
        return 3;
      }

      const itemUnlocked = unlockedIds.has(item.achievement.id);
      const itemUncollected = uncollectedIds.has(item.achievement.id);

      if (itemUncollected) return 0;
      if (itemUnlocked) return 2;
      return 3;
    };

    const statusDiff = statusRank(a) - statusRank(b);
    if (statusDiff !== 0) return statusDiff;

    const tierDiff = (tierOrder[getItemTier(a)] || 0) - (tierOrder[getItemTier(b)] || 0);
    if (tierDiff !== 0) return tierDiff;

    return getItemTitle(a).localeCompare(getItemTitle(b));
  });

  return {
    collectedAchievements,
    collectedIds,
    filteredAchievements,
    recentUncollectedUnlocks,
    uncollectedIds,
    unlockedIds
  };
};
