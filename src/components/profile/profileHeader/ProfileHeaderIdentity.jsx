import { Edit3, Save, Trash2, Upload, X } from 'lucide-react';
import Button from '@/components/ui/Button.jsx';
import UserAvatar from '@/components/ui/UserAvatar.jsx';
import { AVATAR_INPUT_ACCEPT } from './avatarCropUtils.js';

const formatProfileDate = (date, formatter) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return null;
  }

  return formatter(date);
};

const ProfileHeaderIdentity = ({
  avatarInputRef,
  createdAtDate,
  editForm,
  editing,
  handleAvatarSelected,
  handleCancelEdit,
  handleRemoveAvatar,
  handleSaveEdit,
  handleStartEdit,
  handleUploadAvatarClick,
  lastActiveDate,
  loading,
  membershipSummary,
  setEditForm,
  uploadingAvatar,
  userProfile
}) => {
  const memberSinceLabel = formatProfileDate(
    createdAtDate,
    (date) => `Member since ${date.toLocaleDateString()} (${membershipSummary})`
  ) || 'Member since recently';

  const lastActiveLabel = formatProfileDate(
    lastActiveDate,
    (date) => `Last active ${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })}`
  ) || 'Last active recently';

  return (
    <div className="flex items-center space-x-4">
      <div className="relative">
        <UserAvatar
          profile={userProfile}
          size="xl"
          enablePreview
          className="shadow-lg shadow-purple-500/20 border border-white/20"
        />
        <div className="absolute -bottom-2 -right-2 flex items-center gap-1">
          <button
            type="button"
            className="w-8 h-8 rounded-full bg-black/70 border border-white/20 text-white flex items-center justify-center hover:bg-black/85 transition-colors disabled:opacity-60"
            onClick={handleUploadAvatarClick}
            disabled={uploadingAvatar}
            aria-label="Upload profile photo"
          >
            <Upload size={14} />
          </button>
          {!!(userProfile?.avatar || userProfile?.photoURL) && (
            <button
              type="button"
              className="w-8 h-8 rounded-full bg-red-900/70 border border-red-300/30 text-white flex items-center justify-center hover:bg-red-800/80 transition-colors disabled:opacity-60"
              onClick={handleRemoveAvatar}
              disabled={uploadingAvatar}
              aria-label="Remove profile photo"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
        <input
          ref={avatarInputRef}
          type="file"
          accept={AVATAR_INPUT_ACCEPT}
          className="hidden"
          onChange={handleAvatarSelected}
        />
        {uploadingAvatar && (
          <div className="absolute inset-0 rounded-full bg-black/45 flex items-center justify-center text-white text-xs">
            Saving...
          </div>
        )}
      </div>

      <div>
        {editing ? (
          <div className="space-y-2">
            <input
              type="text"
              value={editForm.displayName}
              onChange={(event) => setEditForm((previous) => ({
                ...previous,
                displayName: event.target.value
              }))}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              placeholder="Display Name"
            />
            <div className="flex space-x-2">
              <Button size="sm" onClick={handleSaveEdit} loading={loading} disabled={loading}>
                <Save size={14} />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                <X size={14} />
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-white">
                {userProfile.displayName || 'Player'}
              </h1>
              <Button variant="minimal" size="icon" onClick={handleStartEdit}>
                <Edit3 size={16} />
              </Button>
            </div>
            <p className="text-white/70">@{userProfile.username}</p>
            <p className="text-white/50 text-sm">
              {memberSinceLabel}
            </p>
            <p className="text-white/50 text-sm">
              {lastActiveLabel}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileHeaderIdentity;
