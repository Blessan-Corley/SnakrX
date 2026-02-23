import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import Button from '@/components/ui/Button';
import { getSelectionLabel } from '@/utils/gamePreferences';

const HomeFirstGameCta = ({
  totalGames,
  lastPlayedSelection,
  onPlay,
}) => {
  if (totalGames !== 0) {
    return null;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 1 }}
      className="text-center mt-12 py-12 bg-gradient-sunset/10 rounded-2xl border border-primary-500/20"
    >
      <h2 className="text-2xl font-bold text-white mb-4">
        Ready for Your First Game?
      </h2>
      <p className="text-white/70 mb-6 max-w-md mx-auto">
        Jump into the action and start your SnakrX journey. Choose a game mode and let the fun begin!
      </p>
      <Button variant="primary" size="lg" icon={<Play size={20} />} onClick={onPlay}>
        {lastPlayedSelection ? `Continue ${getSelectionLabel(lastPlayedSelection)}` : 'Start with Classic Mode'}
      </Button>
    </motion.section>
  );
};

export default HomeFirstGameCta;
