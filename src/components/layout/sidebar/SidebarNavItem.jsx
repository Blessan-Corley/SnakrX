import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { playClick } from '@/utils/sound.js';
import { buildNavItemVariants } from './sidebarMotion.js';

const SidebarNavItem = ({
  color,
  delay = 0,
  hasNotification = false,
  icon: Icon,
  isActive,
  label,
  notificationCount = 0,
  onClick,
  path
}) => (
  <motion.div variants={buildNavItemVariants(delay)}>
    <Link
      to={path}
      onClick={() => {
        playClick();
        onClick();
      }}
      className={`
        flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 group relative
        ${isActive
          ? 'bg-white/10 text-white shadow-inner'
          : 'text-white/70 hover:text-white hover:bg-white/5'
        }
      `}
    >
      <div className="relative">
        <Icon
          size={20}
          className={`
            ${isActive ? 'text-white' : color}
            group-hover:scale-110 transition-transform duration-200
          `}
        />
        {hasNotification && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[16px] h-[16px] flex items-center justify-center font-bold animate-pulse">
            {notificationCount > 9 ? '9+' : notificationCount}
          </div>
        )}
      </div>
      <span className="font-medium">{label}</span>

      {isActive && (
        <motion.div
          layoutId="activeIndicator"
          className="ml-auto w-2 h-2 bg-primary-500 rounded-full"
          initial={false}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 40
          }}
        />
      )}
    </Link>
  </motion.div>
);

export default SidebarNavItem;
