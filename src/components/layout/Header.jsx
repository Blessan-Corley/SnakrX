import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Gamepad2,
  Menu,
  Volume2,
  VolumeX,
  X
} from 'lucide-react';
import { useAuth, useAuthOperations } from '../../hooks/useAuth.js';
import { useFriends } from '../../hooks/useFriends.js';
import { useAchievements } from '../../hooks/useAchievements.js';
import Button from '../ui/Button.jsx';
import UserAvatar from '../ui/UserAvatar.jsx';
import * as sound from '@/utils/sound';
import HeaderNavItem from './header/HeaderNavItem.jsx';
import HeaderUserMenuPanel from './header/HeaderUserMenuPanel.jsx';
import { useHeaderController } from './header/useHeaderController.js';

const Header = ({ onToggleSidebar, sidebarOpen }) => {
  const { userProfile } = useAuth();
  const { logout } = useAuthOperations();
  const { uncollectedAchievements = [] } = useAchievements();
  const { pendingRequests = [] } = useFriends();
  const navigate = useNavigate();
  const isAdmin = userProfile?.role === 'admin';
  const {
    closeUserMenu,
    handleLogout,
    handleToggleSound,
    soundMuted,
    toggleUserMenu,
    userMenuOpen,
    userMenuRef
  } = useHeaderController({ logout, navigate });

  return (
    <header className="sticky top-0 z-50 bg-dark-surface/80 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Button
              variant="minimal"
              size="icon"
              onClick={onToggleSidebar}
              icon={sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              className="lg:hidden"
              aria-label="Toggle menu"
            />

            <Link
              to="/"
              className="flex items-center space-x-3 group"
              onClick={() => sound.playClick()}
            >
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="flex items-center justify-center text-2xl text-white"
              >
                <Gamepad2 size={24} />
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

          <nav className="hidden lg:flex items-center space-x-1">
            <HeaderNavItem to="/" label="Home" />
            <HeaderNavItem to="/leaderboard" label="Leaderboard" />
            <HeaderNavItem
              to="/achievements"
              label="Achievements"
              hasNotification={uncollectedAchievements.length > 0}
              notificationCount={uncollectedAchievements.length}
            />
            <HeaderNavItem
              to="/friends"
              label="Friends"
              hasNotification={pendingRequests.length > 0}
              notificationCount={pendingRequests.length}
            />
            {isAdmin && <HeaderNavItem to="/admin" label="Admin" />}
          </nav>

          <div className="flex items-center space-x-3">
            <Button
              variant="minimal"
              size="icon"
              onClick={handleToggleSound}
              icon={soundMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              soundEnabled={false}
              className={`${soundMuted ? 'text-red-400' : 'text-white/70'} hover:text-white`}
              aria-label={soundMuted ? 'Unmute sound' : 'Mute sound'}
            />

            <div className="relative" ref={userMenuRef}>
              <Button
                variant="minimal"
                onClick={toggleUserMenu}
                className="flex items-center space-x-2"
              >
                <UserAvatar profile={userProfile} size="xs" className="border border-white/20" />
                <span className="hidden sm:block text-white">
                  {userProfile?.displayName || 'User'}
                </span>
              </Button>

              <AnimatePresence>
                {userMenuOpen && (
                  <HeaderUserMenuPanel
                    isAdmin={isAdmin}
                    onClose={closeUserMenu}
                    onLogout={async () => {
                      await handleLogout();
                      closeUserMenu();
                    }}
                    uncollectedAchievements={uncollectedAchievements}
                    userProfile={userProfile}
                    navigate={navigate}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
