import { useCallback, useEffect, useRef, useState } from 'react';

const useAchievementCollectionState = ({ collectAchievement }) => {
  const [collectingAchievementId, setCollectingAchievementId] = useState('');
  const [pendingCollectedTierId, setPendingCollectedTierId] = useState('');
  const [collectBurst, setCollectBurst] = useState(null);
  const collectingAchievementIdRef = useRef('');

  useEffect(() => {
    collectingAchievementIdRef.current = collectingAchievementId;
  }, [collectingAchievementId]);

  useEffect(() => {
    if (!collectBurst) return undefined;

    const timeoutId = window.setTimeout(() => {
      setCollectBurst(null);
    }, 520);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [collectBurst]);

  const handleCollectAction = useCallback(async ({
    achievementId,
    accentColor,
    advanceChain = false
  }) => {
    if (!achievementId || collectingAchievementIdRef.current === achievementId) return;

    setCollectingAchievementId(achievementId);
    setCollectBurst({
      key: `${achievementId}-${Date.now()}`,
      color: accentColor || '#38bdf8'
    });

    try {
      const collected = await collectAchievement(achievementId);
      if (collected && advanceChain) {
        setPendingCollectedTierId(achievementId);
      }
    } finally {
      setCollectingAchievementId((current) => (current === achievementId ? '' : current));
    }
  }, [collectAchievement]);

  return {
    collectBurst,
    collectingAchievementId,
    handleCollectAction,
    pendingCollectedTierId,
    setPendingCollectedTierId
  };
};

export default useAchievementCollectionState;
