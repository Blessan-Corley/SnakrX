import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import Button from '@/components/ui/Button';
import { LANDING_STATS } from './landingPageData';

const LandingHeroSection = ({ opacity, onAction }) => {
  return (
    <motion.section
      style={{ opacity }}
      className="relative z-10 px-6 py-20 text-center"
    >
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-sunset bg-clip-text text-transparent">
              Snake Game
            </span>
            <br />
            <span className="text-white">
              Reimagined
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-2xl mx-auto">
            Experience the classic snake game like never before.
            Challenge AI, compete with friends, and unlock achievements
            in this gaming experience.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16"
        >
          <Link to="/register">
            <Button
              variant="primary"
              size="lg"
              icon={<Play size={20} />}
              onClick={onAction}
              className="text-lg px-8 py-4"
            >
              Start Playing
            </Button>
          </Link>
          <Link to="/login">
            <Button
              variant="ghost-primary"
              size="lg"
              onClick={onAction}
              className="text-lg px-8 py-4"
            >
              Sign In to Continue
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto"
        >
          {LANDING_STATS.map((stat) => {
            const StatIcon = stat.Icon;
            return (
              <motion.div
                key={stat.label}
                whileHover={{ scale: 1.05 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="flex items-center justify-center space-x-1 text-white/70">
                  <StatIcon size={20} />
                  <span className="text-sm">{stat.label}</span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </motion.section>
  );
};

export default LandingHeroSection;
