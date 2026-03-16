import { useCallback, useEffect, useMemo, useState } from 'react';
import { playClick } from '@/utils/sound.js';
import {
  getPreferredChainTierIndex,
  isTextInputElement
} from '@/components/achievements/achievementPageUtils.js';

const useAchievementSelectionState = ({
  achievements,
  filteredAchievements,
  unlockedAchievements
}) => {
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [activeChainTierIndex, setActiveChainTierIndex] = useState(0);
  const [chainTransitionDirection, setChainTransitionDirection] = useState(1);

  const selectedCard = useMemo(() => {
    if (!selectedAchievement) return null;

    if (selectedAchievement.type === 'chain') {
      return filteredAchievements.find((item) => (
        item.type === 'chain' && item.chainId === selectedAchievement.chainId
      )) || selectedAchievement;
    }

    const selectedId = selectedAchievement.achievement?.id || selectedAchievement.id;
    if (!selectedId) return null;

    const liveAchievement = achievements.find((achievement) => achievement.id === selectedId)
      || unlockedAchievements.find((achievement) => achievement.id === selectedId)
      || selectedAchievement.achievement
      || selectedAchievement;

    return {
      type: 'single',
      id: liveAchievement.id,
      achievement: liveAchievement
    };
  }, [achievements, filteredAchievements, selectedAchievement, unlockedAchievements]);

  const selectedIsChain = selectedCard?.type === 'chain';
  const selectedSingleAchievement = selectedIsChain ? null : selectedCard?.achievement;
  const selectedChain = selectedIsChain ? selectedCard : null;
  const selectedChainTierIndex = selectedChain && selectedChain.tiers.length
    ? Math.min(activeChainTierIndex, selectedChain.tiers.length - 1)
    : 0;
  const selectedChainTier = selectedChain?.tiers?.[
    Math.min(activeChainTierIndex, Math.max((selectedChain?.tiers?.length || 1) - 1, 0))
  ] || null;

  const navigateChainTier = useCallback((nextIndex) => {
    if (!selectedChain?.tiers?.length) return;

    const boundedIndex = Math.max(0, Math.min(nextIndex, selectedChain.tiers.length - 1));
    if (boundedIndex === selectedChainTierIndex) return;

    setChainTransitionDirection(boundedIndex > selectedChainTierIndex ? 1 : -1);
    setActiveChainTierIndex(boundedIndex);
  }, [selectedChain, selectedChainTierIndex]);

  useEffect(() => {
    if (!showAchievementModal || !selectedIsChain || !selectedChain?.tiers?.length) return undefined;

    const handleChainTierKeydown = (event) => {
      if (isTextInputElement(event.target)) return;

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        navigateChainTier(selectedChainTierIndex - 1);
        return;
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        navigateChainTier(selectedChainTierIndex + 1);
        return;
      }

      if (event.key === 'Home') {
        event.preventDefault();
        navigateChainTier(0);
        return;
      }

      if (event.key === 'End') {
        event.preventDefault();
        navigateChainTier(selectedChain.tiers.length - 1);
      }
    };

    document.addEventListener('keydown', handleChainTierKeydown);
    return () => {
      document.removeEventListener('keydown', handleChainTierKeydown);
    };
  }, [navigateChainTier, selectedChain, selectedChainTierIndex, selectedIsChain, showAchievementModal]);

  const handleAchievementClick = useCallback((achievementOrChain) => {
    if (!achievementOrChain) return;

    if (achievementOrChain.type === 'chain' || achievementOrChain.type === 'single') {
      setSelectedAchievement(achievementOrChain);
      if (achievementOrChain.type === 'chain') {
        setChainTransitionDirection(1);
        const preferredTierIndex = Number.isInteger(achievementOrChain.displayTierIndex)
          ? achievementOrChain.displayTierIndex
          : getPreferredChainTierIndex(achievementOrChain);
        setActiveChainTierIndex(preferredTierIndex);
      }
    } else {
      setSelectedAchievement({
        type: 'single',
        id: achievementOrChain.id,
        achievement: achievementOrChain
      });
    }

    if (achievementOrChain.type !== 'chain') {
      setChainTransitionDirection(1);
      setActiveChainTierIndex(0);
    }

    setShowAchievementModal(true);
    playClick();
  }, []);

  return {
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
  };
};

export default useAchievementSelectionState;
