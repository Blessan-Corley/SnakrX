import { motion } from 'framer-motion';
import { Gamepad2, Star, Trophy, Award } from 'lucide-react';
import { StatsCard } from '@/components/ui/Card';
import SnakrXLogo from '@/components/ui/SnakrXLogo.jsx';
import TypewriterText from './TypewriterText.jsx';

const getQuickStatIcon = (title) => {
  if (title === 'Total Score') return <Trophy size={24} />;
  if (title === 'Best Game') return <Star size={24} />;
  if (title === 'Achievement Points') return <Award size={24} />;
  return <Gamepad2 size={24} />;
};

const HomeHeroSection = ({
  typingComplete,
  userDisplayName,
  quickStats,
  onTypingComplete,
}) => (
  <motion.section
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="text-center mb-12"
  >
    <div className="mb-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 200 }}
        className="flex justify-center mb-5"
      >
        <SnakrXLogo
          size="xl"
          showSubtitle={false}
          showTitle={false}
          rotateOnHover
          className="justify-center"
          markClassName="mx-auto"
        />
      </motion.div>

      <h1 className="text-4xl md:text-6xl font-bold mb-5 text-center">
        <span className="bg-gradient-sunset bg-clip-text text-transparent">
          SnakrX
        </span>
      </h1>

      <div className="text-xl md:text-2xl text-white/80 h-8 flex items-center justify-center text-center">
        <TypewriterText
          text={`Welcome back, ${userDisplayName}!`}
          onComplete={onTypingComplete}
        />
      </div>
    </div>

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: typingComplete ? 1 : 0, y: typingComplete ? 0 : 20 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
    >
      {quickStats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
        >
          <StatsCard {...stat} icon={getQuickStatIcon(stat.title)} />
        </motion.div>
      ))}
    </motion.div>
  </motion.section>
);

export default HomeHeroSection;
