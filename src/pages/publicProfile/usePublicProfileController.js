import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useFriends } from '@/hooks/useFriends';
import { db, doc, COLLECTIONS } from '@/services/firebase/config.js';
import { firestoreOperations } from '@/services/firebase/firestore.js';
import { gameOperations } from '@/services/firebase';
import { FRIENDSHIP_STATUSES } from '@/hooks/friends/relationshipState.js';
import { getMostPlayedMode } from '@/utils/gamePreferences';
import { getXpProgress } from '@/utils/experience';
import {
  buildMembershipSummary,
  mapGamesToHistory,
  toDate
} from './publicProfileUtils.js';

export const usePublicProfileController = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const {
    acceptRequest,
    activeTargetId,
    getRelationshipStatus,
    sendRequest
  } = useFriends();

  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const stats = profile?.stats || {};
  const mostPlayedMode = getMostPlayedMode(stats);
  const xpProgress = getXpProgress(stats.xp || 0);

  const createdAtDate = toDate(profile?.createdAt);
  const lastActiveDate = toDate(profile?.lastActiveAt);
  const bestScoreDate = toDate(stats?.bestScoreAt);
  const membershipSummary = useMemo(() => buildMembershipSummary(createdAtDate), [createdAtDate]);
  const isOwnProfile = Boolean(user?.uid && user?.uid === userId);
  const relationshipStatus = isOwnProfile
    ? FRIENDSHIP_STATUSES.SELF
    : getRelationshipStatus(userId);
  const relationshipLoading = activeTargetId === userId;

  const friendAction = useMemo(() => {
    switch (relationshipStatus) {
      case FRIENDSHIP_STATUSES.ACCEPTED:
        return {
          label: 'Friends',
          variant: 'ghost',
          disabled: true
        };
      case FRIENDSHIP_STATUSES.PENDING_SENT:
        return {
          label: 'Request Sent',
          variant: 'ghost',
          disabled: true
        };
      case FRIENDSHIP_STATUSES.PENDING_RECEIVED:
        return {
          label: 'Accept Request',
          variant: 'success',
          disabled: false
        };
      case FRIENDSHIP_STATUSES.SELF:
        return null;
      default:
        return {
          label: 'Send Invite',
          variant: 'ghost-primary',
          disabled: false
        };
    }
  }, [relationshipStatus]);

  const handleSendInvite = useCallback(async () => {
    if (!user?.uid || !userId || isOwnProfile) return;

    try {
      if (relationshipStatus === FRIENDSHIP_STATUSES.PENDING_RECEIVED) {
        await acceptRequest(userId);
        return;
      }

      if (relationshipStatus === FRIENDSHIP_STATUSES.NONE) {
        await sendRequest(userId);
      }
    } catch (error) {
      toast.error(error?.message || 'Could not send friend request.');
    }
  }, [acceptRequest, isOwnProfile, relationshipStatus, sendRequest, user?.uid, userId]);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const profileRef = doc(db, COLLECTIONS.PUBLIC_PROFILES, userId);
        const profileSnap = await firestoreOperations.getDocument(profileRef);
        if (!profileSnap.exists()) {
          setProfile(null);
          setHistory([]);
          return;
        }

        setProfile(profileSnap.data());

        try {
          const games = isOwnProfile
            ? await gameOperations.getUserGames(userId, 8)
            : await gameOperations.getPublicRecentGames(userId, 8);
          setHistory(mapGamesToHistory(games));
        } catch (historyError) {
          setHistory([]);
        }
      } catch (error) {
        setProfile(null);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadProfile();
    }
  }, [isOwnProfile, userId]);

  return {
    profile,
    history,
    loading,
    relationshipLoading,
    isOwnProfile,
    friendAction,
    relationshipStatus,
    stats,
    mostPlayedMode,
    xpProgress,
    createdAtDate,
    lastActiveDate,
    bestScoreDate,
    membershipSummary,
    handleSendInvite
  };
};
