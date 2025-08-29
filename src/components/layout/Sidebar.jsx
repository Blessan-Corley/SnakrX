import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  Gamepad2, 
  Trophy, 
  Award, 
  BarChart3, 
  Settings, 
  HelpCircle, 
  Shield,
  User,
  LogOut,
  X
} from 'lucide-react';
import { useAuth, useAuthOperations } from '../../hooks/useAuth.js';
import { useAchievementOperations } from '../../hooks/useAchievements.js';
import Button from '../ui/Button.jsx';
import { playClick } from '../../utils/sound.js';

/**
 * Navigation Sidebar Component
 * Provides easy access to all app features
 */
const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { logout } = useAuthOperations();
  const { uncollectedAchievements } = useAchievementOperations();

  const isAdmin = userProfile?.role === 'admin' || userProfile?.username === 'admin';

  const handleLogout = async () => {
    await logout();
    navigate('/landing');
    onClose();
  };

  // Navigation items configuration
  const navigationItems = [
    {
      section: 'Main',
      items: [
        { icon: Home, label: 'Home', path: '/', color: 'text-blue-400' },
        { icon: Gamepad2, label: 'Play Game', path: '/game', color: 'text-green-400' },
        { icon: Trophy, label: 'Leaderboard', path: '/leaderboard', color: 'text-yellow-400' },
        { 
          icon: Award, 
          label: 'Achievements', 
          path: '/achievements', 
          color: 'text-purple-400',
          hasNotification: uncollectedAchievements.length > 0,
          notificationCount: uncollectedAchievements.length
        },
      ]
    },
    {
      section: 'Account',
      items: [
        { icon: User, label: 'Profile', path: '/profile', color: 'text-cyan-400' },
        { icon: Settings, label: 'Settings', path: '/profile?tab=settings', color: 'text-gray-400' },
        { icon: HelpCircle, label: 'Help & Support', path: '/help', color: 'text-orange-400' },
      ]
    }
  ];

  // Add admin section if user is admin
  if (isAdmin) {
    navigationItems.push({
      section: 'Admin',
      items: [
        { icon: Shield, label: 'Admin Panel', path: '/admin', color: 'text-red-400' },
        { icon: BarChart3, label: 'Analytics', path: '/admin?tab=analytics', color: 'text-pink-400' },
      ]
    });
  }

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 40
      }
    },
    closed: {
      x: "-100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 40
      }
    }
  };

  const itemVariants = {
    open: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 40
      }
    },
    closed: {
      opacity: 0,
      x: -20
    }
  };

  return (
    <motion.aside
      initial="closed"
      animate={isOpen ? "open" : "closed"}
      variants={sidebarVariants}
      className="fixed left-0 top-0 h-full w-64 bg-gradient-card backdrop-blur-md border-r border-white/20 z-50 lg:relative lg:translate-x-0"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
            className="text-2xl"
          >
            🐍
          </motion.div>
          <div>
            <h2 className="font-bold text-white">Navigation</h2>
            <p className="text-xs text-white/60">Quick access</p>
          </div>
        </div>
        
        <Button
          variant="minimal"
          size="icon"
          onClick={onClose}
          icon={<X size={18} />}
          className="lg:hidden text-white/70 hover:text-white"
        />
      </div>

      {/* Navigation Content */}
      <div className="flex flex-col h-full">
        {/* User Info */}
        <motion.div
          variants={itemVariants}
          className="p-4 border-b border-white/10"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-sunset rounded-full flex items-center justify-center">
              <span className="text-white font-bold">
                {userProfile?.displayName?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white truncate">
                {userProfile?.displayName || 'User'}
              </p>
              <p className="text-xs text-white/60 truncate">
                {userProfile?.stats?.achievementPoints || 0} achievement points
              </p>
            </div>
          </div>
        </motion.div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto py-4">
          {navigationItems.map((section, sectionIndex) => (
            <motion.div
              key={section.section}
              variants={itemVariants}
              transition={{ delay: sectionIndex * 0.1 }}
              className="mb-6"
            >
              <h3 className="px-4 mb-2 text-xs font-semibold text-white/50 uppercase tracking-wider">
                {section.section}
              </h3>
              <nav className="space-y-1 px-2">
                {section.items.map((item, itemIndex) => (
                  <SidebarItem
                    key={item.path}
                    {...item}
                    isActive={location.pathname === item.path}
                    onClick={onClose}
                    delay={(sectionIndex * 0.1) + (itemIndex * 0.05)}
                  />
                ))}
              </nav>
            </motion.div>
          ))}
        </div>

        {/* Bottom Actions */}
        <motion.div
          variants={itemVariants}
          transition={{ delay: 0.3 }}
          className="p-4 border-t border-white/10"
        >
          <Button
            variant="ghost"
            fullWidth
            onClick={handleLogout}
            icon={<LogOut size={18} />}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            Sign Out
          </Button>
        </motion.div>
      </div>
    </motion.aside>
  );
};

/**
 * Sidebar Navigation Item Component
 */
const SidebarItem = ({ icon: Icon, label, path, color, isActive, onClick, delay = 0, hasNotification = false, notificationCount = 0 }) => {
  const handleClick = () => {
    playClick();
    onClick();
  };

  return (
    <motion.div
      variants={{
        open: {
          opacity: 1,
          x: 0,
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 40,
            delay
          }
        },
        closed: {
          opacity: 0,
          x: -20
        }
      }}
    >
      <Link
        to={path}
        onClick={handleClick}
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
        
        {/* Active indicator */}
        {isActive && (
          <motion.div
            layoutId="activeIndicator"
            className="ml-auto w-2 h-2 bg-primary-500 rounded-full"
            initial={false}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 40
            }}
          />
        )}
      </Link>
    </motion.div>
  );
};

export default Sidebar;