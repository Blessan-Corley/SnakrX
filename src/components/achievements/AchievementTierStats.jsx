import { motion } from 'framer-motion';
import { StatsCard } from '@/components/ui/Card.jsx';

const AchievementTierStats = ({ achievementStats, getTierStyling }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 }}
    className="mb-8"
  >
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {Object.entries(achievementStats.byTier || {}).map(([tier, stats]) => {
        const tierStyling = getTierStyling(tier);
        return (
          <StatsCard
            key={tier}
            title={tier.charAt(0).toUpperCase() + tier.slice(1)}
            value={`${stats.unlocked}/${stats.total}`}
            icon={(
              <div
                className="w-5 h-5 rounded-full"
                style={{ backgroundColor: tierStyling.color }}
              />
            )}
            subtitle={`${stats.percentage}% unlocked`}
          />
        );
      })}
    </div>
  </motion.div>
);

export default AchievementTierStats;
