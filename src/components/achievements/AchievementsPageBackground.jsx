import { motion } from 'framer-motion';

const AchievementsPageBackground = () => (
  <div className="absolute inset-0 z-0">
    <motion.div
      className="absolute inset-0"
      animate={{
        background: [
          'radial-gradient(circle at 25% 25%, rgba(147, 51, 234, 0.08) 0%, transparent 60%)',
          'radial-gradient(circle at 75% 75%, rgba(219, 39, 119, 0.08) 0%, transparent 60%)',
          'radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.08) 0%, transparent 60%)'
        ]
      }}
      transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
    />
  </div>
);

export default AchievementsPageBackground;
