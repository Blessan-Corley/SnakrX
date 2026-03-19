import { useEffect } from 'react';
import { GAME_STATES, isMobile } from '../../../utils/gameUtils.js';
import { acquireBodyScrollLock, releaseBodyScrollLock } from '../../../utils/bodyScrollLock.js';
import {
  buildAchievementStorageKey,
  getLatestPendingAchievement,
  recordShownAchievement
} from '../gameSessionUtils.js';

export const useGameUiEffects = ({
  gameStatus,
  getSuccessRate,
  isHighLatency,
  lastShownAchievementRef,
  recentUnlocks,
  setInputWarning,
  setNewAchievement,
  setShowAchievementModal,
  setShowCollisionHighlight,
  setShowGameOverModal,
  setShowPerformanceMonitor,
  showPerformanceMonitor
}) => {
  const shouldLockBodyScroll = isMobile();

  useEffect(() => {
    if (gameStatus === GAME_STATES.GAME_OVER || gameStatus === GAME_STATES.VICTORY) {
      setShowCollisionHighlight(true);
      const timer = setTimeout(() => {
        setShowGameOverModal(true);
        setShowCollisionHighlight(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [gameStatus, setShowCollisionHighlight, setShowGameOverModal]);

  useEffect(() => {
    if (!shouldLockBodyScroll) {
      return undefined;
    }

    const scrollLockOwner = 'game-ui-effects';
    acquireBodyScrollLock(scrollLockOwner, { touchAction: 'none' });

    const preventTouch = (event) => {
      if (event.cancelable) {
        event.preventDefault();
      }
    };
    document.addEventListener('touchmove', preventTouch, { passive: false });

    return () => {
      releaseBodyScrollLock(scrollLockOwner);
      document.removeEventListener('touchmove', preventTouch);
    };
  }, [shouldLockBodyScroll]);

  useEffect(() => {
    if (!recentUnlocks?.length) return;
    const latest = getLatestPendingAchievement(recentUnlocks);
    if (!latest) return;

    const achievementKey = buildAchievementStorageKey(latest);
    if (lastShownAchievementRef.current === achievementKey) return;

    if (!recordShownAchievement(localStorage, achievementKey)) {
      lastShownAchievementRef.current = achievementKey;
      return;
    }

    lastShownAchievementRef.current = achievementKey;
    setNewAchievement(latest);
    setShowAchievementModal(true);
  }, [
    lastShownAchievementRef,
    recentUnlocks,
    setNewAchievement,
    setShowAchievementModal
  ]);

  useEffect(() => {
    if (!import.meta.env.DEV || !showPerformanceMonitor) {
      setInputWarning(null);
      return undefined;
    }

    const interval = setInterval(() => {
      if (isHighLatency()) {
        setInputWarning('High input latency detected');
        return;
      }
      if (getSuccessRate() < 0.9) {
        setInputWarning('Input drops detected');
        return;
      }
      setInputWarning(null);
    }, 2000);
    return () => clearInterval(interval);
  }, [getSuccessRate, isHighLatency, setInputWarning, showPerformanceMonitor]);

  useEffect(() => {
    if (!import.meta.env.DEV) return undefined;
    const handleToggle = (event) => {
      if (event.code === 'KeyP' && event.shiftKey) {
        setShowPerformanceMonitor((previous) => !previous);
      }
    };

    window.addEventListener('keydown', handleToggle);
    return () => window.removeEventListener('keydown', handleToggle);
  }, [setShowPerformanceMonitor]);
};
