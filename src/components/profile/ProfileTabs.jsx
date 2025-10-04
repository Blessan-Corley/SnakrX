import { motion } from 'framer-motion';
import { User, BarChart3, Award, History, Settings } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { playClick } from '@/utils/sound';

/**
 * Profile Navigation Tabs Component
 */
export const ProfileTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'overview', name: 'Overview', icon: <User size={18} /> },
    { id: 'statistics', name: 'Statistics', icon: <BarChart3 size={18} /> },
    { id: 'achievements', name: 'Achievements', icon: <Award size={18} /> },
    { id: 'history', name: 'Match History', icon: <History size={18} /> },
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
            <Button
              key={tab.id}
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
          ))}
        </div>
      </Card>
    </motion.div>
  );
};
