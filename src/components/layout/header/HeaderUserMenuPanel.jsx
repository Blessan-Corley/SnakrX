import { motion } from 'framer-motion';
import { HelpCircle, LogOut, Settings, Shield, Trophy, User } from 'lucide-react';
import UserAvatar from '@/components/ui/UserAvatar.jsx';
import HeaderUserMenuItem from './HeaderUserMenuItem.jsx';

const HeaderUserMenuPanel = ({
  isAdmin,
  onClose,
  onLogout,
  uncollectedAchievements,
  userProfile,
  navigate
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95, y: -10 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95, y: -10 }}
    transition={{ duration: 0.2 }}
    className="absolute right-0 top-full mt-2 w-64 rounded-xl shadow-2xl ring-1 ring-black/30 z-50 overflow-hidden"
  >
    <div className="absolute inset-0 bg-slate-900/68 backdrop-blur-2xl border border-white/15 rounded-xl" />

    <div className="relative">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <UserAvatar profile={userProfile} size="md" enablePreview className="border border-white/20" />
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

      <div className="p-2">
        <HeaderUserMenuItem
          icon={<User size={16} />}
          label="Profile"
          onClick={() => {
            navigate('/profile');
            onClose();
          }}
        />
        <HeaderUserMenuItem
          icon={<Trophy size={16} />}
          label="Achievements"
          hasNotification={uncollectedAchievements.length > 0}
          notificationCount={uncollectedAchievements.length}
          onClick={() => {
            navigate('/achievements');
            onClose();
          }}
        />
        <HeaderUserMenuItem
          icon={<Settings size={16} />}
          label="Settings"
          onClick={() => {
            navigate('/profile?tab=settings');
            onClose();
          }}
        />
        {isAdmin && (
          <HeaderUserMenuItem
            icon={<Shield size={16} />}
            label="Admin Panel"
            onClick={() => {
              navigate('/admin');
              onClose();
            }}
          />
        )}
        <HeaderUserMenuItem
          icon={<HelpCircle size={16} />}
          label="Help & Support"
          onClick={() => {
            navigate('/help');
            onClose();
          }}
        />

        <div className="border-t border-white/10 my-2" />

        <HeaderUserMenuItem
          icon={<LogOut size={16} />}
          label="Sign Out"
          onClick={onLogout}
          variant="danger"
        />
      </div>
    </div>
  </motion.div>
);

export default HeaderUserMenuPanel;
