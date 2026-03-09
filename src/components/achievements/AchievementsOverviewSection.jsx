import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';
import Card from '@/components/ui/Card.jsx';

const AchievementsOverviewSection = ({
  achievementStats,
  completionPercentage,
  totalPoints,
  recentUnlockCount,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
    className="mb-8"
  >
    <Card variant="default" padding="lg" className="bg-white/5">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-white mb-2">
            {achievementStats.unlocked}/{achievementStats.total}
          </div>
          <div className="text-white/80 mb-3">Achievements</div>
          <div className="w-full bg-white/20 rounded-full h-3">
            <div
              className="bg-white h-3 rounded-full transition-all duration-1000"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <div className="text-white/70 text-sm mt-2">{completionPercentage}% Complete</div>
        </div>

        <div className="text-center">
          <div className="text-3xl font-bold text-amber-300 mb-2">{totalPoints}</div>
          <div className="text-white/80">Points Earned</div>
          <div className="text-white/60 text-sm mt-2">Achievement Score</div>
        </div>

        <div className="text-center">
          <div className="text-3xl font-bold text-green-300 mb-2">{recentUnlockCount}</div>
          <div className="text-white/80">Latest Unlocks</div>
          <div className="text-white/60 text-sm mt-2">Most recent profile rewards</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center text-3xl mb-2 text-amber-300">
            <Crown size={28} />
          </div>
          <div className="text-white/80">Legendary</div>
          <div className="text-white/60 text-sm mt-2">
            {achievementStats.byTier?.legendary?.unlocked || 0}/{achievementStats.byTier?.legendary?.total || 0} Unlocked
          </div>
        </div>
      </div>
    </Card>
  </motion.div>
);

export default AchievementsOverviewSection;
