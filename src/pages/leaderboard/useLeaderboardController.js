import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { useFriends } from '../../hooks/useFriends.js';
import { FRIENDSHIP_STATUSES } from '../../hooks/friends/relationshipState.js';
import { playClick } from '../../utils/sound.js';
import { leaderboardOperations } from '../../services/firebase/leaderboard.js';
import { resolveLeaderboardMode } from './leaderboardConfig.js';

export const useLeaderboardController = () => {
  const { user, userProfile } = useAuth();
  const {
    acceptRequest,
    activeTargetId,
    getRelationshipStatus,
    sendRequest
  } = useFriends();
  const navigate = useNavigate();

  const [selectedMode, setSelectedMode] = useState('classic');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalPlayers: 0,
    topScore: 0,
    yourRank: null
  });
  const [activeWeekKey, setActiveWeekKey] = useState(null);

  const activeMode = useMemo(() => resolveLeaderboardMode(selectedMode), [selectedMode]);
  const currentUserId = userProfile?.userId || userProfile?.uid || user?.uid;
  const isAchievementMode = activeMode.source === 'achievement';
  const isOverallMode = activeMode.source === 'overall';
  const isWeeklyMode = activeMode.source === 'weekly';

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const result = activeMode.source === 'achievement'
        ? await leaderboardOperations.getAchievementLeaderboard({ page: 1, limit: 100, includeStats: true })
        : activeMode.source === 'overall'
          ? await leaderboardOperations.getOverallScoreLeaderboard({ page: 1, limit: 100, includeStats: true })
          : activeMode.source === 'weekly'
            ? await leaderboardOperations.getWeeklyLeaderboard(activeMode.mode, activeMode.difficulty, {
              page: 1,
              limit: 100,
              includeStats: true,
              weekKey: 'previous'
            })
            : await leaderboardOperations.getLeaderboard(activeMode.mode, activeMode.difficulty, { page: 1, limit: 100, includeStats: true });

      const entriesWithRank = result.entries.map((entry, index) => ({
        ...entry,
        rank: entry.rank || index + 1,
        id: entry.userId || entry.id
      }));

      const topScore = entriesWithRank[0]?.score || 0;
      const yourEntry = currentUserId ? entriesWithRank.find((entry) => entry.userId === currentUserId) : null;

      setEntries(entriesWithRank);
      setStats({
        totalPlayers: entriesWithRank.length,
        topScore,
        yourRank: yourEntry?.rank || null
      });
      setActiveWeekKey(result.weekKey || null);
    } catch (fetchError) {
      setError('Unable to load leaderboard. Please try again.');
      setActiveWeekKey(null);
    } finally {
      setLoading(false);
    }
  }, [activeMode, currentUserId]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const getDisplayName = useCallback((entry) => {
    if (entry.isPrivateLeaderboard && !entry.isCurrentUser) {
      return 'Private Player';
    }
    return entry.displayName || entry.username || 'Unknown Player';
  }, []);

  const filteredEntries = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    const withFlags = entries.map((entry) => ({
      ...entry,
      isCurrentUser: currentUserId ? entry.userId === currentUserId : false,
      friendshipStatus: getRelationshipStatus(entry.userId)
    }));

    if (!normalized) return withFlags;
    return withFlags.filter((entry) => {
      const visibleName = getDisplayName(entry).toLowerCase();
      return visibleName.includes(normalized);
    });
  }, [currentUserId, entries, getDisplayName, getRelationshipStatus, searchTerm]);

  const handleModeSelect = useCallback((modeId) => {
    playClick();
    setSelectedMode(modeId);
  }, []);

  const handleRefresh = useCallback(() => {
    playClick();
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const handleSendInvite = useCallback(async (event, targetUserId) => {
    event.stopPropagation();

    if (!targetUserId || targetUserId === user.uid) return;

    const relationshipStatus = getRelationshipStatus(targetUserId);
    if (relationshipStatus === FRIENDSHIP_STATUSES.PENDING_RECEIVED) {
      await acceptRequest(targetUserId);
      return;
    }

    if (relationshipStatus === FRIENDSHIP_STATUSES.NONE) {
      await sendRequest(targetUserId);
    }
  }, [acceptRequest, getRelationshipStatus, sendRequest, user?.uid]);

  const handleOpenProfile = useCallback((userId) => {
    if (!userId) return;
    navigate(`/player/${userId}`);
  }, [navigate]);

  return {
    selectedMode,
    searchTerm,
    entries: filteredEntries,
    loading,
    error,
    activeTargetId,
    stats,
    activeWeekKey,
    isAchievementMode,
    isOverallMode,
    isWeeklyMode,
    getDisplayName,
    handleModeSelect,
    handleRefresh,
    setSearchTerm,
    handleSendInvite,
    handleOpenProfile
  };
};
