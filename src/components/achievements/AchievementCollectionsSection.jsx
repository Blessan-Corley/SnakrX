import { motion } from 'framer-motion';
import Card, { AchievementCard } from '@/components/ui/Card.jsx';

const AchievementCollectionsSection = ({
  achievements,
  animateEach,
  countLabel,
  delay,
  onAchievementClick,
  title,
  titleIcon,
}) => {
  if (!achievements.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="mt-12"
    >
      <Card variant="glass" padding="lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            {titleIcon}
            {title}
          </h2>
          {countLabel && (
            <span className="text-sm text-white/70">{countLabel}</span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement, index) => {
            const card = (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                unlocked
                onClick={() => onAchievementClick(achievement)}
              />
            );

            if (!animateEach) {
              return card;
            }

            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {card}
              </motion.div>
            );
          })}
        </div>
      </Card>
    </motion.div>
  );
};

export default AchievementCollectionsSection;
