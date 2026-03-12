import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAchievementOperations } from '@/hooks/useAchievements';
import { useFriends } from '@/hooks/useFriends';
import useLeaderboard from '@/hooks/useLeaderboard';
import {
  buildQuickStats,
  buildRecentLeaderboard,
  getMemberSinceLabel
} from '@/components/home/homeUtils.js';
import logger from '@/utils/logger.js';
import { playClick } from '@/utils/sound';
import { isMobile } from '@/utils/gameUtils';
import { getGameRouteFromSelection, getLastPlayedMode } from '@/utils/gamePreferences';
import { MODE_LABEL_MAP } from './homeConstants.js';

const useHomePageController = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { recentUnlocks, getNextAchievements, getAchievementStats, getTotalPointsEarned } = useAchievementOperations();
  const {
    pendingRequests,
    outgoingRequests,
    acceptRequest,
    cancelRequest,
    getRelationshipStatus,
    rejectRequest,
    searchUsers,
    searchResults,
    sendRequest,
    searching
  } = useFriends();
  const { getLeaderboardSummary } = useLeaderboard();

  const [typingComplete, setTypingComplete] = useState(false);
  const [showGameModes, setShowGameModes] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [leaderboardSummary, setLeaderboardSummary] = useState(null);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [friendSearch, setFriendSearch] = useState('');
  const [lastPlayedSelection, setLastPlayedSelection] = useState(() => getLastPlayedMode());

  const isAdmin = userProfile?.role === 'admin';
  const mobile = isMobile();
  const userStats = userProfile?.stats || {};
  const achievementStats = getAchievementStats();
  const totalAchievementPoints = getTotalPointsEarned();
  const nextAchievements = getNextAchievements(3);
  const quickStats = buildQuickStats({
    userStats,
    achievementStats,
    totalAchievementPoints,
    modeLabelMap: MODE_LABEL_MAP
  });
  const memberSinceLabel = getMemberSinceLabel(userProfile?.createdAt);

  useEffect(() => {
    const handleMouseMove = (event) => {
      setMousePosition({
        x: (event.clientX / window.innerWidth) * 100,
        y: (event.clientY / window.innerHeight) * 100
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const timer1 = setTimeout(() => setTypingComplete(true), 2000);
    const timer2 = setTimeout(() => setShowGameModes(true), 2500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  useEffect(() => {
    const loadLeaderboard = async () => {
      setLoadingLeaderboard(true);
      try {
        const summary = await getLeaderboardSummary();
        setLeaderboardSummary(summary);
      } catch (error) {
        logger.error('Error loading leaderboard summary:', error);
        setLeaderboardSummary({ topThree: [], userBestRank: null, hasData: false });
      } finally {
        setLoadingLeaderboard(false);
      }
    };

    loadLeaderboard();
  }, [getLeaderboardSummary]);

  useEffect(() => {
    if (userProfile?.stats?.totalGames <= 0) return;

    const refreshLeaderboard = async () => {
      try {
        const summary = await getLeaderboardSummary();
        setLeaderboardSummary(summary);
      } catch (error) {
        logger.error('Error refreshing leaderboard summary:', error);
      }
    };

    refreshLeaderboard();
  }, [getLeaderboardSummary, userProfile]);

  const recentLeaderboard = useMemo(() => buildRecentLeaderboard({
    leaderboardSummary,
    loadingLeaderboard,
    userProfile
  }), [leaderboardSummary, loadingLeaderboard, userProfile]);

  const handleNavigate = (path) => {
    playClick();
    navigate(path);
  };

  const handleGameMode = (mode, _difficulty = null, _playerCount = 1) => {
    playClick();

    if (mode === 'multiplayer' && mobile) return;

    if (mode === 'classic') {
      navigate('/game?mode=classic');
      return;
    }

    navigate('/game');
  };

  const handlePlayLastMode = () => {
    const selection = getLastPlayedMode();
    if (!selection) {
      navigate('/game?mode=classic');
      return;
    }

    setLastPlayedSelection(selection);
    playClick();
    navigate(getGameRouteFromSelection(selection));
  };

  const handleFriendSearch = async (event) => {
    event.preventDefault();
    await searchUsers(friendSearch);
  };

  const handleOpenHelp = () => {
    playClick();
    navigate('/help');
  };

  const handleManageFriends = () => {
    playClick();
    navigate('/friends');
  };

  const markTypingComplete = () => {
    setTypingComplete(true);
  };

  return {
    acceptRequest,
    cancelRequest,
    friendSearch,
    getRelationshipStatus,
    handleFriendSearch,
    handleGameMode,
    handleManageFriends,
    handleNavigate,
    handleOpenHelp,
    handlePlayLastMode,
    isAdmin,
    lastPlayedSelection,
    loadingLeaderboard,
    markTypingComplete,
    memberSinceLabel,
    mobile,
    mousePosition,
    nextAchievements,
    outgoingRequests,
    pendingRequests,
    quickStats,
    recentLeaderboard,
    recentUnlocks,
    rejectRequest,
    searchResults,
    searching,
    sendRequest,
    setFriendSearch,
    showGameModes,
    totalGames: userStats.totalGames || 0,
    typingComplete,
    userDisplayName: userProfile?.displayName || 'Player',
    userStats
  };
};

export default useHomePageController;
