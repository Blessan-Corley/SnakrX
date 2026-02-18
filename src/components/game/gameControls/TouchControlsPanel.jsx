import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react';
import Button from '@/components/ui/Button.jsx';
import Card from '@/components/ui/Card.jsx';
import logger from '@/utils/logger.js';
import { DIRECTIONS } from '@/utils/gameUtils.js';
import { playClick } from '@/utils/sound.js';

const invokeMobileControl = (direction, onMobileControl) => {
  try {
    onMobileControl(direction);
    playClick();
  } catch (error) {
    logger.error('Touch control button failed:', error);
  }
};

const TouchControlsPanel = ({
  isPaused,
  isPlaying,
  onMobileControl
}) => (
  <Card variant="glass" padding="md" role="region" aria-label="Touch controls">
    <h3 className="text-lg font-semibold text-white mb-4">Touch Controls</h3>

    <div className="grid grid-cols-3 gap-2 max-w-48 mx-auto" role="group" aria-label="Directional controls">
      <div />
      <Button
        variant="ghost"
        size="icon"
        onClick={() => invokeMobileControl(DIRECTIONS.UP, onMobileControl)}
        disabled={!isPlaying || isPaused}
        icon={<ArrowUp size={20} />}
        className="aspect-square"
        soundEnabled={false}
        aria-label="Move up"
      />
      <div />

      <Button
        variant="ghost"
        size="icon"
        onClick={() => invokeMobileControl(DIRECTIONS.LEFT, onMobileControl)}
        disabled={!isPlaying || isPaused}
        icon={<ArrowLeft size={20} />}
        className="aspect-square"
        soundEnabled={false}
        aria-label="Move left"
      />
      <div />
      <Button
        variant="ghost"
        size="icon"
        onClick={() => invokeMobileControl(DIRECTIONS.RIGHT, onMobileControl)}
        disabled={!isPlaying || isPaused}
        icon={<ArrowRight size={20} />}
        aria-label="Move right"
        className="aspect-square"
        soundEnabled={false}
      />

      <div />
      <Button
        variant="ghost"
        size="icon"
        onClick={() => invokeMobileControl(DIRECTIONS.DOWN, onMobileControl)}
        disabled={!isPlaying || isPaused}
        icon={<ArrowDown size={20} />}
        aria-label="Move down"
        className="aspect-square"
        soundEnabled={false}
      />
      <div />
    </div>
  </Card>
);

export default TouchControlsPanel;
