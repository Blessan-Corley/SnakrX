import { Gamepad2, Keyboard, Smartphone } from 'lucide-react';
import Card from '@/components/ui/Card';

const multiplayerControls = [
  { player: 1, keys: 'WASD', color: 'text-green-400' },
  { player: 2, keys: 'Arrow Keys', color: 'text-blue-400' },
  { player: 3, keys: 'IJKL', color: 'text-yellow-400' },
  { player: 4, keys: 'Numpad', color: 'text-red-400' }
];

const ControlsHelpSection = ({ mobile }) => (
  <div className="space-y-6">
    <Card variant="glass" padding="lg">
      <h2 className="text-2xl font-bold text-white mb-6">Game Controls</h2>

      <div className="mb-8">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Keyboard className="mr-3 text-purple-400" size={24} />
          Keyboard Controls
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/5 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-3">Single Player</h4>
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-white/70">Move Up:</span><span className="text-white font-mono bg-white/10 px-2 py-1 rounded text-sm">W or </span></div>
              <div className="flex justify-between"><span className="text-white/70">Move Down:</span><span className="text-white font-mono bg-white/10 px-2 py-1 rounded text-sm">S or </span></div>
              <div className="flex justify-between"><span className="text-white/70">Move Left:</span><span className="text-white font-mono bg-white/10 px-2 py-1 rounded text-sm">A or </span></div>
              <div className="flex justify-between"><span className="text-white/70">Move Right:</span><span className="text-white font-mono bg-white/10 px-2 py-1 rounded text-sm">D or </span></div>
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-3">Game Controls</h4>
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-white/70">Pause/Resume:</span><span className="text-white font-mono bg-white/10 px-2 py-1 rounded text-sm">Space</span></div>
              <div className="flex justify-between"><span className="text-white/70">Restart:</span><span className="text-white font-mono bg-white/10 px-2 py-1 rounded text-sm">R</span></div>
              <div className="flex justify-between"><span className="text-white/70">Quit to Menu:</span><span className="text-white font-mono bg-white/10 px-2 py-1 rounded text-sm">Esc</span></div>
            </div>
          </div>
        </div>

        {!mobile && (
          <div className="mt-6">
            <h4 className="font-semibold text-white mb-3">Multiplayer Controls</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {multiplayerControls.map((control) => (
                <div key={control.player} className="bg-white/5 rounded-lg p-3 text-center">
                  <div className={`font-semibold ${control.color} mb-2`}>
                    Player {control.player}
                  </div>
                  <div className="text-white font-mono text-sm">
                    {control.keys}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {mobile && (
        <div>
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Smartphone className="mr-3 text-cyan-400" size={24} />
            Mobile Controls
          </h3>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-white/70 mb-4">
              On mobile devices, you can use the on-screen directional buttons that appear during gameplay.
            </p>
            <div className="space-y-2">
              <div> Tap the directional buttons to move your snake</div>
              <div> Tap the pause button to pause the game</div>
              <div> Use the game menu for restart and quit options</div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white/5 rounded-lg p-4">
        <h4 className="font-semibold text-white mb-2 flex items-center">
          <Gamepad2 className="mr-2 text-green-400" size={16} />
          Ready State Tip
        </h4>
        <p className="text-white/70">
          Most game modes start after your first movement input, so keep the board focused and press a direction key when you are ready.
        </p>
      </div>
    </Card>
  </div>
);

export default ControlsHelpSection;
