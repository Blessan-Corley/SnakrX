import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, Trophy } from 'lucide-react';
import Button from '@/components/ui/Button';
import { AchievementCard } from '@/components/ui/Card';

const HomeAchievementsPanel = ({
  nextAchievements,
  recentUnlocks,
  userStats,
  onViewAchievements,
}) => (
  <div className="lg:col-span-1">
    <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
      <Award className="mr-2" size={20} />
      Achievement Highlights
    </h3>
    <div className="space-y-4">
      {nextAchievements.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-white/80 mb-3">Next to Unlock</h4>
          <div className="space-y-3">
            {nextAchievements.slice(0, 2).map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 + index * 0.1 }}
              >
                <AchievementCard
                  achievement={achievement}
                  unlocked={false}
                  progress={achievement.progress}
                  userStats={userStats}
                />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className={nextAchievements.length > 0 ? 'pt-4 border-t border-white/10' : ''}>
        <h4 className="text-sm font-medium text-white/80 mb-3">Recent Achievements</h4>
        {recentUnlocks.length > 0 ? (
          recentUnlocks.slice(0, 3).map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="mb-4 last:mb-0"
            >
              <AchievementCard
                achievement={achievement}
                unlocked
                userStats={userStats}
              />
            </motion.div>
          ))
        ) : (
          <div className="text-center py-8">
            <div className="flex items-center justify-center text-4xl mb-3 text-amber-300">
              <Trophy size={32} />
            </div>
            <p className="text-white/70">No achievements yet!</p>
            <p className="text-white/50 text-sm mt-1">Start playing to unlock rewards</p>
          </div>
        )}
      </div>

      <Link to="/achievements">
        <Button variant="ghost" fullWidth onClick={onViewAchievements}>
          View All Achievements
        </Button>
      </Link>
    </div>
  </div>
);

export default HomeAchievementsPanel;
