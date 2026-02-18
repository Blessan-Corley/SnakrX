import { motion } from 'framer-motion';
import { Pause, Play } from 'lucide-react';
import Button from '@/components/ui/Button.jsx';
import Card from '@/components/ui/Card.jsx';
import { formatScore, formatTime } from '@/utils/gameUtils.js';

const FloatingGameHUD = ({
  score = 0,
  gameTime = 0,
  isPaused = false,
  onPause = () => {},
  onResume = () => {}
}) => {
  const formattedTime = Math.floor(gameTime);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-4 left-4 right-4 z-20"
    >
      <Card variant="glass" padding="sm" className="backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-lg font-bold text-white">{formatScore(score)}</div>
              <div className="text-xs text-white/60">Score</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white">{formatTime(formattedTime)}</div>
              <div className="text-xs text-white/60">Time</div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={isPaused ? onResume : onPause}
            icon={isPaused ? <Play size={16} /> : <Pause size={16} />}
          />
        </div>
      </Card>
    </motion.div>
  );
};

export default FloatingGameHUD;
