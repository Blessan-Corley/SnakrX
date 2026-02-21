import { Link, useLocation } from 'react-router-dom';
import * as sound from '@/utils/sound';

const HeaderNavItem = ({
  hasNotification = false,
  label,
  notificationCount = 0,
  to
}) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={() => sound.playClick()}
      className={`
        relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
        ${isActive
          ? 'bg-white/10 text-white shadow-inner'
          : 'text-white/70 hover:text-white hover:bg-white/5'
        }
      `}
    >
      {label}
      {hasNotification && (
        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-bold animate-pulse">
          {notificationCount > 9 ? '9+' : notificationCount}
        </div>
      )}
    </Link>
  );
};

export default HeaderNavItem;
