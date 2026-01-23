import { motion } from 'framer-motion';
import { User, BarChart3, Award, History, Settings, Users } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { playClick } from '@/utils/sound';
import { useAchievements } from '@/hooks/useAchievements';
import { useFriends } from '@/hooks/useFriends';

/**
 * Profile Navigation Tabs Component
 */
export const ProfileTabs = ({ activeTab, onTabChange }) => {
  const { uncollectedAchievements } = useAchievements();
  const { pendingRequests } = useFriends();

  const tabs = [
    { id: 'overview', name: 'Overview', icon: <User size={18} /> },
    { id: 'statistics', name: 'Statistics', icon: <BarChart3 size={18} /> },
    { 
      id: 'achievements', 
      name: 'Achievements', 
      icon: <Award size={18} />,
      badge: uncollectedAchievements?.length > 0 ? uncollectedAchievements.length : null
    },
    { id: 'history', name: 'Match History', icon: <History size={18} /> },
    { 
      id: 'friends', 
      name: 'Friends', 
      icon: <Users size={18} />,
      badge: pendingRequests?.length > 0 ? pendingRequests.length : null
    },
    { id: 'settings', name: 'Settings', icon: <Settings size={18} /> }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="mb-8"
    >
      <Card variant="glass" padding="sm">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <div key={tab.id} className="relative">
              <Button
                variant={activeTab === tab.id ? "primary" : "ghost"}
                size="sm"
                icon={tab.icon}
                onClick={() => {
                  onTabChange(tab.id);
                  playClick();
                }}
              >
                {tab.name}
              </Button>
              {tab.badge && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                  {tab.badge > 9 ? '9+' : tab.badge}
                </span>
              )}
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
};
