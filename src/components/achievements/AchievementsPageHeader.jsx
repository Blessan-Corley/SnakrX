import { motion } from 'framer-motion';
import { Award } from 'lucide-react';

const AchievementsPageHeader = () => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center mb-8"
  >
    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
      <Award className="inline mr-3" size={48} />
      Achievements
    </h1>
    <p className="text-xl text-white/70 max-w-2xl mx-auto">
      Track your progress and unlock rewards as you master SnakrX
    </p>
  </motion.div>
);

export default AchievementsPageHeader;
