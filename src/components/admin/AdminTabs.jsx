import { motion } from 'framer-motion';
import { Users, History, BarChart3 } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { playClick } from '@/utils/sound';

/**
 * Admin Navigation Tabs Component
 */
export const AdminTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'users', name: 'User Management', icon: <Users size={18} /> },
    { id: 'history', name: 'Match History', icon: <History size={18} /> },
    { id: 'analytics', name: 'Analytics', icon: <BarChart3 size={18} /> }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
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
