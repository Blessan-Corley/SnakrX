import { motion } from 'framer-motion';
import { Award, Sparkles } from 'lucide-react';
import Button from '@/components/ui/Button.jsx';
import Card from '@/components/ui/Card.jsx';
import { getIconComponent } from '@/utils/iconMap.js';

const UncollectedAchievementsBanner = ({
  isCollectingAll = false,
  uncollectedAchievements,
  onCollectAll
}) => {
  if (!uncollectedAchievements.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="mb-8"
    >
      <Card variant="glass" padding="lg" className="border-yellow-500/30 bg-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center text-4xl animate-bounce text-amber-300">
              <Award size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">
                {uncollectedAchievements.length} Achievement{uncollectedAchievements.length > 1 ? 's' : ''} Ready to Collect!
              </h3>
              <p className="text-white/80">
                Earn {uncollectedAchievements.reduce((sum, achievement) => sum + achievement.points, 0)} achievement points
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="primary"
              size="lg"
              onClick={onCollectAll}
              icon={<Sparkles size={20} />}
              className="animate-pulse"
              loading={isCollectingAll}
            >
              Collect All
            </Button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {uncollectedAchievements.slice(0, 5).map((achievement) => {
            const Icon = getIconComponent(achievement.icon);
            return (
              <div
                key={achievement.id}
                className="flex items-center space-x-2 bg-white/10 rounded-full px-3 py-1 text-sm"
              >
                <span className="text-lg">
                  <Icon size={16} className="text-white" />
                </span>
                <span className="text-white font-medium">{achievement.title}</span>
                <span className="text-yellow-300 font-bold">+{achievement.points}</span>
              </div>
            );
          })}
          {uncollectedAchievements.length > 5 && (
            <div className="flex items-center justify-center bg-white/10 rounded-full px-3 py-1 text-sm text-white/70">
              +{uncollectedAchievements.length - 5} more
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default UncollectedAchievementsBanner;
