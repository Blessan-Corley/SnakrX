import { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Card from '@/components/ui/Card';
import { removeUserAvatar, uploadUserAvatar } from '@/services/firebase/profileAvatar';
import logger from '@/utils/logger.js';
import { playClick } from '@/utils/sound';
import ProfileHeaderIdentity from './profileHeader/ProfileHeaderIdentity.jsx';
import ProfileHeaderLevelSummary from './profileHeader/ProfileHeaderLevelSummary.jsx';
import { formatMembershipSummary, resolveProfileDate } from './profileHeader/profileDateUtils.js';

/**
 * Profile Header Component.
 */
export const ProfileHeader = ({
  userProfile,
  playerLevel,
  levelProgress,
  nextLevelScore,
  currentLevelScore = 0,
  xpNeededForNext = 0,
  totalXp = 0,
  isMaxLevel = false,
  userStats: _userStats,
  onUpdate
}) => {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef(null);
  const [editForm, setEditForm] = useState({
    displayName: userProfile.displayName || '',
    favoriteGameMode: userProfile.preferences?.favoriteGameMode || 'classic'
  });

  const handleStartEdit = () => {
    setEditing(true);
    playClick();
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setEditForm({
      displayName: userProfile.displayName || '',
      favoriteGameMode: userProfile.preferences?.favoriteGameMode || 'classic'
    });
    playClick();
  };

  const handleSaveEdit = async () => {
    setLoading(true);
    try {
      await onUpdate({
        displayName: editForm.displayName,
        preferences: {
          ...userProfile.preferences,
          favoriteGameMode: editForm.favoriteGameMode
        }
      });
      setEditing(false);
    } catch (error) {
      logger.error('Failed to update profile header settings:', error);
      toast.error(error.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadAvatarClick = () => {
    avatarInputRef.current?.click();
  };

  const handleAvatarSelected = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !userProfile?.uid) return;

    setUploadingAvatar(true);
    let uploadedAvatarPath = null;
    try {
      const { avatar, avatarPath } = await uploadUserAvatar({
        uid: userProfile.uid,
        file,
        previousAvatarPath: userProfile.avatarPath || null
      });
      uploadedAvatarPath = avatarPath;
      const result = await onUpdate({ avatar, avatarPath });
      if (!result?.success) {
        throw new Error(result?.error || 'Failed to save avatar in profile.');
      }
      toast.success('Profile photo updated.');
    } catch (error) {
      logger.error('Failed to upload profile avatar:', error);
      if (uploadedAvatarPath) {
        await removeUserAvatar(uploadedAvatarPath).catch((cleanupError) => {
          logger.warn('Failed to roll back uploaded avatar after profile update error:', cleanupError);
        });
      }
      toast.error(error.message || 'Failed to upload profile photo.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!userProfile?.uid) return;
    setUploadingAvatar(true);
    try {
      const result = await onUpdate({ avatar: null, avatarPath: null });
      if (!result?.success) {
        throw new Error(result?.error || 'Failed to remove profile photo.');
      }
      if (userProfile.avatarPath) {
        await removeUserAvatar(userProfile.avatarPath);
      }
      toast.success('Profile photo removed.');
    } catch (error) {
      logger.error('Failed to remove profile avatar:', error);
      toast.error(error.message || 'Failed to remove profile photo.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const createdAtDate = useMemo(
    () => resolveProfileDate(userProfile.createdAt),
    [userProfile.createdAt]
  );

  const joinedDate = createdAtDate ? formatMembershipSummary(createdAtDate) : 'New player';

  return (
    <Card variant="glass" padding="lg" className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-secondary-500/5" />

      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
          <ProfileHeaderIdentity
            avatarInputRef={avatarInputRef}
            editing={editing}
            editForm={editForm}
            onAvatarSelected={handleAvatarSelected}
            onChangeDisplayName={(displayName) => setEditForm((prev) => ({ ...prev, displayName }))}
            onRemoveAvatar={handleRemoveAvatar}
            onStartEdit={handleStartEdit}
            onUploadAvatarClick={handleUploadAvatarClick}
            uploadingAvatar={uploadingAvatar}
            userProfile={userProfile}
          />

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 min-w-0"
          >
            <ProfileHeaderLevelSummary
              currentLevelScore={currentLevelScore}
              editing={editing}
              editForm={editForm}
              isMaxLevel={isMaxLevel}
              joinedDate={joinedDate}
              levelProgress={levelProgress}
              loading={loading}
              nextLevelScore={nextLevelScore}
              onCancelEdit={handleCancelEdit}
              onChangeFavoriteMode={(favoriteGameMode) => setEditForm((prev) => ({ ...prev, favoriteGameMode }))}
              onSaveEdit={handleSaveEdit}
              playerLevel={playerLevel}
              totalXp={totalXp}
              userProfile={userProfile}
              xpNeededForNext={xpNeededForNext}
            />
          </motion.div>
        </div>
      </div>
    </Card>
  );
};

export default ProfileHeader;
