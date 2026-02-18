import { motion } from 'framer-motion';
import { Home, RotateCcw, Skull, Trophy } from 'lucide-react';
import Button from '@/components/ui/Button.jsx';
import Card from '@/components/ui/Card.jsx';
import { formatScore, formatTime } from '@/utils/gameUtils.js';

const GameOverOverlay = ({
  isVisible = false,
  score = 0,
  gameTime = 0,
  isVictory = false,
  onRestart = () => {},
  onQuit = () => {}
}) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center rounded-xl z-30"
    >
      <Card variant="glass" padding="lg" className="text-center max-w-sm mx-4">
        <div className="flex justify-center mb-4">
          {isVictory ? (
            <Trophy size={48} className="text-yellow-400" />
          ) : (
            <Skull size={48} className="text-red-400" />
          )}
        </div>

        <h3 className="text-2xl font-bold text-white mb-2">
          {isVictory ? 'Victory!' : 'Game Over'}
        </h3>

        <div className="text-3xl font-bold bg-gradient-sunset bg-clip-text text-transparent mb-4">
          {formatScore(score)}
        </div>

        <p className="text-white/70 mb-6">
          Survived for {formatTime(Math.floor(gameTime))}
        </p>

        <div className="flex space-x-3">
          <Button
            variant="ghost"
            onClick={onRestart}
            icon={<RotateCcw size={18} />}
            fullWidth
          >
            Play Again
          </Button>
          <Button
            variant="primary"
            onClick={onQuit}
            icon={<Home size={18} />}
            fullWidth
          >
            Menu
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default GameOverOverlay;
