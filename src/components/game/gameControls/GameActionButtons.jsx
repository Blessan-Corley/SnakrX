import { Home, Pause, Play, RotateCcw } from 'lucide-react';
import Button from '@/components/ui/Button.jsx';
import Card from '@/components/ui/Card.jsx';
import logger from '@/utils/logger.js';

const invokeSafely = (actionName, callback) => {
  try {
    callback();
  } catch (error) {
    logger.error(`${actionName} control failed:`, error);
  }
};

const GameActionButtons = ({
  isGameOver,
  isPaused,
  onPause,
  onQuit,
  onRestart,
  onResume
}) => (
  <Card variant="glass" padding="md" role="region" aria-label="Game controls">
    <h3 className="text-lg font-semibold text-white mb-4">Controls</h3>

    <div className="space-y-3" role="group" aria-label="Game action buttons">
      <Button
        variant="primary"
        fullWidth
        onClick={() => invokeSafely('Pause/Resume', isPaused ? onResume : onPause)}
        disabled={isGameOver}
        icon={isPaused ? <Play size={18} /> : <Pause size={18} />}
        aria-label={isPaused ? 'Resume game' : 'Pause game'}
      >
        {isPaused ? 'Resume' : 'Pause'}
      </Button>

      <Button
        variant="ghost"
        fullWidth
        onClick={() => invokeSafely('Restart', onRestart)}
        icon={<RotateCcw size={18} />}
        aria-label="Restart game"
      >
        Restart
      </Button>

      <Button
        variant="ghost"
        fullWidth
        onClick={() => invokeSafely('Quit', onQuit)}
        icon={<Home size={18} />}
        aria-label="Return to main menu"
      >
        Main Menu
      </Button>
    </div>
  </Card>
);

export default GameActionButtons;
