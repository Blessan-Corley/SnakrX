import * as sound from '@/utils/sound';

const HeaderUserMenuItem = ({
  hasNotification = false,
  icon,
  label,
  notificationCount = 0,
  onClick,
  variant = 'default'
}) => {
  const variantClasses = {
    default: 'text-white/80 hover:text-white hover:bg-white/10',
    danger: 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
  };

  return (
    <button
      onClick={() => {
        sound.playClick();
        onClick();
      }}
      className={`flex items-center space-x-3 w-full px-3 py-2 rounded-lg text-sm transition-all duration-200 relative ${variantClasses[variant]}`}
    >
      <div className="relative">
        {icon}
        {hasNotification && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[14px] h-[14px] flex items-center justify-center font-bold animate-pulse">
            {notificationCount > 9 ? '9+' : notificationCount}
          </div>
        )}
      </div>
      <span>{label}</span>
    </button>
  );
};

export default HeaderUserMenuItem;
