import { AnimatePresence, motion } from 'framer-motion';
import { Cpu, Gamepad2, Play, Users } from 'lucide-react';
import Button from '@/components/ui/Button';
import { GameModeCard } from '@/components/ui/Card';
import { getSelectionLabel } from '@/utils/gamePreferences';

const HomeGameModesSection = ({
  showGameModes,
  lastPlayedSelection,
  mobile,
  onOpenHelp,
  onPlayLastMode,
  onSelectMode,
}) => (
  <AnimatePresence>
    {showGameModes && (
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.8 }}
        className="mb-12"
      >
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-white text-center mb-8"
        >
          Choose Your Game Mode
        </motion.h2>

        <div className="flex justify-center mb-8">
          <Button variant="ghost-primary" onClick={onOpenHelp}>
            How to Play
          </Button>
        </div>

        {lastPlayedSelection && (
          <div className="flex justify-center mb-6">
            <Button variant="primary" icon={<Play size={16} />} onClick={onPlayLastMode}>
              Continue Last Played: {getSelectionLabel(lastPlayedSelection)}
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <GameModeCard
              title="Classic Mode"
              description="Endless snake gameplay with increasing speed and challenge"
              icon={<Gamepad2 size={32} />}
              onClick={() => onSelectMode('classic')}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <GameModeCard
              title="VS AI Mode"
              description="Battle intelligent AI opponents with multiple difficulty levels"
              icon={<Cpu size={32} />}
              onClick={() => onSelectMode('vsai', 'medium')}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <GameModeCard
              title="Multiplayer Mode"
              description={mobile ? 'Play on PC/Laptop to unlock full experience' : 'Local multiplayer battles with up to 4 players'}
              icon={<Users size={32} />}
              disabled={mobile}
              onClick={() => !mobile && onSelectMode('multiplayer', null, 2)}
              className={mobile ? 'opacity-50 cursor-not-allowed' : ''}
            />
          </motion.div>
        </div>
      </motion.section>
    )}
  </AnimatePresence>
);

export default HomeGameModesSection;
