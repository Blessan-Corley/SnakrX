import Button from '@/components/ui/Button.jsx';
import GameControls from '@/components/game/GameControls.jsx';
import { playClick } from '@/utils/sound.js';

const GameSidebar = ({
  navigate,
  mobile,
  numPlayers,
  gameStatus,
  gameStates,
  currentKeyMappings,
  resolvedMode,
  resolvedDifficulty,
  isGameActive,
  isPaused,
  isGameOver,
  score,
  gameTime,
  speedMultiplier,
  foodEaten,
  snakes,
  onTouchControl,
  onTogglePause,
  onRestart,
  onQuit,
}) => (
  <div>
    <div className="mb-4">
      <Button
        variant="ghost-primary"
        fullWidth
        onClick={() => {
          playClick();
          navigate('/help');
        }}
      >
        How to Play
      </Button>
    </div>
    <GameControls
      isPlaying={isGameActive}
      isPaused={isPaused}
      isGameOver={isGameOver}
      score={score}
      gameTime={gameTime}
      speedMultiplier={speedMultiplier}
      foodEaten={foodEaten}
      gameMode={resolvedMode}
      difficulty={resolvedDifficulty}
      snakes={snakes}
      showMobileControls={mobile}
      onMobileControl={onTouchControl}
      onPause={onTogglePause}
      onResume={onTogglePause}
      onRestart={onRestart}
      onQuit={onQuit}
      disabled={gameStatus !== gameStates.PLAYING}
    />

    {!mobile && (
      <div className="mt-4 p-4 bg-black/20 rounded-lg">
        <h4 className="text-sm font-semibold text-white mb-2">Controls</h4>
        <div className="space-y-1 text-xs text-white/70">
          {numPlayers === 1 ? (
            <div>
              <span className="text-white">Player:</span> WASD or Arrow Keys
            </div>
          ) : (
            currentKeyMappings.map((mapping) => (
              <div key={mapping.playerId}>
                <span className="text-white">{mapping.playerName}:</span>
                {mapping.playerId === 0 ? ' WASD' :
                  mapping.playerId === 1 ? ' Arrow Keys' :
                    mapping.playerId === 2 ? ' IJKL' :
                      ' Numpad 8456'}
              </div>
            ))
          )}
          <div className="pt-1 border-t border-white/10 mt-2">
            <span className="text-white/50">Space:</span> Pause | <span className="text-white/50">R:</span> Restart | <span className="text-white/50">Esc:</span> Quit
          </div>
        </div>
      </div>
    )}
  </div>
);

export default GameSidebar;
