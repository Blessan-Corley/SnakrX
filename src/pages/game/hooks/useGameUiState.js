import { useCallback, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { playClick } from '@/utils/sound.js';
import { formatScore } from '@/utils/gameUtils.js';

export const useGameUiState = ({
  restartGame,
  resolvedMode,
  score
}) => {
  const [loading, setLoading] = useState(true);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [showCollisionHighlight, setShowCollisionHighlight] = useState(false);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [newAchievement, setNewAchievement] = useState(null);
  const [inputWarning, setInputWarning] = useState(null);
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false);
  const lastShownAchievementRef = useRef('');

  const clearExitUi = useCallback(() => {
    setShowCollisionHighlight(false);
  }, []);

  const handleRestart = useCallback(() => {
    playClick();
    setShowGameOverModal(false);
    clearExitUi();
    restartGame();
  }, [clearExitUi, restartGame]);

  const handleShareScore = useCallback(async () => {
    const shareText = `I scored ${formatScore(score)} in SnakrX (${resolvedMode} mode)!`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'SnakrX Score',
          text: shareText
        });
        return;
      }

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
        toast.success('Score copied to clipboard');
      } else {
        toast.error('Sharing not supported on this device');
      }
    } catch (error) {
      toast.error('Unable to share score');
    }
  }, [resolvedMode, score]);

  return {
    clearExitUi,
    handleRestart,
    handleShareScore,
    inputWarning,
    lastShownAchievementRef,
    loading,
    newAchievement,
    setInputWarning,
    setLoading,
    setNewAchievement,
    setShowAchievementModal,
    setShowCollisionHighlight,
    setShowGameOverModal,
    setShowPerformanceMonitor,
    showAchievementModal,
    showCollisionHighlight,
    showGameOverModal,
    showPerformanceMonitor
  };
};
