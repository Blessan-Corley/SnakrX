import { useMemo, useState } from 'react';
import { User } from 'lucide-react';
import Modal from './Modal.jsx';

const SIZE_CLASSES = {
  xs: 'w-8 h-8 text-xs',
  sm: 'w-10 h-10 text-sm',
  md: 'w-12 h-12 text-base',
  lg: 'w-16 h-16 text-xl',
  xl: 'w-20 h-20 text-2xl'
};

const getAvatarUrl = (profile) => profile?.avatar || profile?.photoURL || null;

const getInitial = (profile) => {
  const source = profile?.displayName || profile?.username || profile?.email || '';
  return source ? source.charAt(0).toUpperCase() : null;
};

const UserAvatar = ({
  profile,
  size = 'md',
  className = '',
  enablePreview = false,
  onClick = null
}) => {
  const avatarUrl = useMemo(() => getAvatarUrl(profile), [profile]);
  const initial = useMemo(() => getInitial(profile), [profile]);
  const [previewOpen, setPreviewOpen] = useState(false);

  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  const interactive = enablePreview || typeof onClick === 'function';

  const handleClick = () => {
    if (typeof onClick === 'function') {
      onClick();
      return;
    }
    if (enablePreview && avatarUrl) {
      setPreviewOpen(true);
    }
  };

  const avatarClassName = `
    ${sizeClass} ${className}
    rounded-full overflow-hidden
    bg-gradient-to-br from-orange-500 to-amber-500
    flex items-center justify-center
    text-white font-bold
    ${interactive ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500/60' : 'cursor-default'}
  `;

  const avatarContent = avatarUrl ? (
    <img
      src={avatarUrl}
      alt={profile?.displayName || profile?.username || 'Profile'}
      className="w-full h-full object-cover"
      loading="lazy"
    />
  ) : initial ? (
    <span>{initial}</span>
  ) : (
    <User size={18} />
  );

  return (
    <>
      {interactive ? (
        <button
          type="button"
          className={avatarClassName}
          onClick={handleClick}
          aria-label="Open profile photo"
        >
          {avatarContent}
        </button>
      ) : (
        <div className={avatarClassName} aria-label="Profile photo">
          {avatarContent}
        </div>
      )}

      <Modal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={profile?.displayName || 'Profile photo'}
        size="sm"
      >
        <div className="flex items-center justify-center">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={profile?.displayName || 'Profile photo'}
              className="max-h-[60vh] w-auto rounded-xl border border-white/15"
            />
          ) : (
            <div className="text-white/70 text-sm">No profile photo uploaded.</div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default UserAvatar;
