import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  User, 
  Trophy, 
  Settings, 
  LogOut, 
  Shield, 
  HelpCircle,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useAuth, useAuthOperations } from '../../hooks/useAuth.js';
import { useAchievements } from '../../hooks/useAchievements.js';
import Button from '../ui/Button.jsx';
import { playClick } from '../../utils/sound.js';
import { getMuted, toggleMute } from '../../utils/sound.js';

/**
 * App Header Component
 * Contains navigation, user menu, and app controls
 */
const Header = ({ onToggleSidebar, sidebarOpen }) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [soundMuted, setSoundMuted] = useState(getMuted());
  const { userProfile } = useAuth();
  const { logout } = useAuthOperations();
  const { uncollectedAchievements = [] } = useAchievements();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/landing');
  };

  const handleToggleSound = () => {
    const newMutedState = toggleMute();
    setSoundMuted(newMutedState);
    if (!newMutedState) {
      playClick(); // Play sound to confirm unmuting
    }
  };

  const isAdmin = userProfile?.role === 'admin' || userProfile?.username === 'admin';

  return (
    <header className="sticky top-0 z-50 bg-dark-surface/80 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left Section - Logo and Menu Toggle */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Toggle */}
            <Button
              variant="minimal"
              size="icon"
              onClick={onToggleSidebar}
              icon={sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              className="lg:hidden"
              aria-label="Toggle menu"
            />

            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center space-x-3 group"
              onClick={() => playClick()}
            >
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="text-2xl"
              >
                🐍
              </motion.div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-sunset bg-clip-text text-transparent">
                  SnakrX
                </h1>
                <p className="text-xs text-white/50 leading-none">
                  Gaming Experience
                </p>
              </div>
            </Link>
          </div>

          {/* Center Section - Navigation (Desktop) */}
          <nav className="hidden lg:flex items-center space-x-1">
            <NavLink to="/" label="Home" />
            <NavLink to="/leaderboard" label="Leaderboard" />
            <NavLink 
              to="/achievements" 
              label="Achievements" 
              hasNotification={uncollectedAchievements.length > 0}
              notificationCount={uncollectedAchievements.length}
            />
            {isAdmin && <NavLink to="/admin" label="Admin" />}
          </nav>

          {/* Right Section - User Menu and Controls */}
          <div className="flex items-center space-x-3">
            {/* Sound Toggle */}
            <Button
              variant="minimal"
              size="icon"
              onClick={handleToggleSound}
              icon={soundMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              className={`${soundMuted ? 'text-red-400' : 'text-white/70'} hover:text-white`}
              aria-label={soundMuted ? "Unmute sound" : "Mute sound"}
            />

            {/* User Menu */}
            <div className="relative">
              <Button
                variant="minimal"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2"
              >
                <div className="w-8 h-8 bg-gradient-sunset rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {userProfile?.displayName?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="hidden sm:block text-white">
                  {userProfile?.displayName || 'User'}
                </span>
              </Button>

              {/* User Dropdown Menu */}
              <AnimatePresence>
                {userMenuOpen && (
                  <>
                    {/* Backdrop for mobile */}
                    <div 
                      className="fixed inset-0 z-40 lg:hidden"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    
                    {/* Menu */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-2 w-64 bg-gradient-card backdrop-blur-md border border-white/20 rounded-xl shadow-2xl z-50"
                    >
                      {/* User Info Header */}
                      <div className="p-4 border-b border-white/10">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-sunset rounded-full flex items-center justify-center">
                            <span className="text-white text-lg font-bold">
                              {userProfile?.displayName?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-white">
                              {userProfile?.displayName || 'User'}
                            </p>
                            <p className="text-sm text-white/70">
                              {userProfile?.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="p-2">
                        <UserMenuItem
                          icon={<User size={16} />}
                          label="Profile"
                          onClick={() => {
                            navigate('/profile');
                            setUserMenuOpen(false);
                          }}
                        />
                        <UserMenuItem
                          icon={<Trophy size={16} />}
                          label="Achievements"
                          hasNotification={uncollectedAchievements.length > 0}
                          notificationCount={uncollectedAchievements.length}
                          onClick={() => {
                            navigate('/achievements');
                            setUserMenuOpen(false);
                          }}
                        />
                        <UserMenuItem
                          icon={<Settings size={16} />}
                          label="Settings"
                          onClick={() => {
                            navigate('/profile?tab=settings');
                            setUserMenuOpen(false);
                          }}
                        />
                        {isAdmin && (
                          <UserMenuItem
                            icon={<Shield size={16} />}
                            label="Admin Panel"
                            onClick={() => {
                              navigate('/admin');
                              setUserMenuOpen(false);
                            }}
                          />
                        )}
                        <UserMenuItem
                          icon={<HelpCircle size={16} />}
                          label="Help & Support"
                          onClick={() => {
                            navigate('/help');
                            setUserMenuOpen(false);
                          }}
                        />
                        
                        <div className="border-t border-white/10 my-2" />
                        
                        <UserMenuItem
                          icon={<LogOut size={16} />}
                          label="Sign Out"
                          onClick={() => {
                            handleLogout();
                            setUserMenuOpen(false);
                          }}
                          variant="danger"
                        />
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

/**
 * Navigation Link Component
 */
const NavLink = ({ to, label, className = '', hasNotification = false, notificationCount = 0 }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={() => playClick()}
      className={`
        relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
        ${isActive 
          ? 'bg-white/10 text-white shadow-inner' 
          : 'text-white/70 hover:text-white hover:bg-white/5'
        }
        ${className}
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

/**
 * User Menu Item Component
 */
const UserMenuItem = ({ icon, label, onClick, variant = 'default', hasNotification = false, notificationCount = 0 }) => {
  const baseClasses = "flex items-center space-x-3 w-full px-3 py-2 rounded-lg text-sm transition-all duration-200 relative";
  const variantClasses = {
    default: "text-white/80 hover:text-white hover:bg-white/10",
    danger: "text-red-400 hover:text-red-300 hover:bg-red-500/10"
  };

  return (
    <button
      onClick={() => {
        playClick();
        onClick();
      }}
      className={`${baseClasses} ${variantClasses[variant]}`}
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

export default Header;