import { memo } from 'react';
import { Pause } from 'lucide-react';

const PauseOverlay = memo(() => (
  <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg z-30">
    <div className="text-center">
      <div className="flex items-center justify-center text-6xl mb-6 text-white">
        <Pause size={48} />
      </div>
      <h3 className="text-3xl font-bold text-white mb-4">Game Paused</h3>
      <p className="text-white/80 text-lg">Press Space to continue</p>
    </div>
  </div>
));

PauseOverlay.displayName = 'PauseOverlay';

export default PauseOverlay;
