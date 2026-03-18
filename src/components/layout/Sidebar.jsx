import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, X } from 'lucide-react';
import { useAuth, useAuthOperations } from '../../hooks/useAuth.js';
import { useAchievementOperations } from '../../hooks/useAchievements.js';
import { useFriends } from '../../hooks/useFriends.js';
import Button from '../ui/Button.jsx';
import SnakrXLogo from '../ui/SnakrXLogo.jsx';
import UserAvatar from '../ui/UserAvatar.jsx';
import { buildSidebarNavigation } from './sidebar/navigationConfig.js';
import SidebarNavItem from './sidebar/SidebarNavItem.jsx';
import { sectionItemVariants, sidebarVariants } from './sidebar/sidebarMotion.js';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { logout } = useAuthOperations();
  const { uncollectedAchievements, getTotalPointsEarned } = useAchievementOperations();
  const { pendingRequests = [] } = useFriends();
  const isAdmin = userProfile?.role === 'admin';
  const currentRoute = `${location.pathname}${location.search}`;
  const collectedAchievementPoints = getTotalPointsEarned();
  const navigationItems = buildSidebarNavigation({
    isAdmin,
    pendingRequestsCount: pendingRequests.length,
    uncollectedAchievementsCount: uncollectedAchievements.length
  });

  const handleLogout = async () => {
    await logout();
    navigate('/landing');
    onClose();
  };

  return (
    <motion.aside
      initial="closed"
      animate={isOpen ? 'open' : 'closed'}
      variants={sidebarVariants}
      className="fixed left-0 top-0 h-full w-64 bg-gradient-card backdrop-blur-md border-r border-white/20 z-50 lg:relative lg:translate-x-0"
    >
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <SnakrXLogo
          size="sm"
          subtitle="Navigation"
          subtitleClassName="text-white/60"
          titleClassName="text-base"
          useGradientTitle={false}
          rotateOnHover
        />

        <Button
          variant="minimal"
          size="icon"
          onClick={onClose}
          icon={<X size={18} />}
          className="lg:hidden text-white/70 hover:text-white"
        />
      </div>

      <div className="flex flex-col h-full">
        <motion.div
          variants={sectionItemVariants}
          className="p-4 border-b border-white/10"
        >
          <div className="flex items-center space-x-3">
            <UserAvatar profile={userProfile} size="sm" className="border border-white/20" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white truncate">
                {userProfile?.displayName || 'User'}
              </p>
              <p className="text-xs text-white/60 truncate">
                {collectedAchievementPoints} achievement points
              </p>
            </div>
          </div>
        </motion.div>

        <div className="flex-1 overflow-y-auto py-4">
          {navigationItems.map((section, sectionIndex) => (
            <motion.div
              key={section.section}
              variants={sectionItemVariants}
              transition={{ delay: sectionIndex * 0.1 }}
              className="mb-6"
            >
              <h3 className="px-4 mb-2 text-xs font-semibold text-white/50 uppercase tracking-wider">
                {section.section}
              </h3>
              <nav className="space-y-1 px-2">
                {section.items.map((item, itemIndex) => (
                  <SidebarNavItem
                    key={item.path}
                    {...item}
                    isActive={currentRoute === item.path}
                    onClick={onClose}
                    delay={(sectionIndex * 0.1) + (itemIndex * 0.05)}
                  />
                ))}
              </nav>
            </motion.div>
          ))}
        </div>

        <motion.div
          variants={sectionItemVariants}
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

export default Sidebar;
