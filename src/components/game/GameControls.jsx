import GameActionButtons from './gameControls/GameActionButtons.jsx';
import FloatingGameHUD from './gameControls/FloatingGameHUD.jsx';
import GameOverOverlay from './gameControls/GameOverOverlay.jsx';
import GameStatsPanel from './gameControls/GameStatsPanel.jsx';
import KeyboardHelpCard from './gameControls/KeyboardHelpCard.jsx';
import TouchControlsPanel from './gameControls/TouchControlsPanel.jsx';

const GameControls = ({
  isPlaying = false,
  isPaused = false,
  isGameOver = false,
  score = 0,
  gameTime = 0,
  speedMultiplier = 1.0,
  foodEaten = 0,
  gameMode = 'classic',
  difficulty = null,
  snakes = [],
  showMobileControls = true,
  onMobileControl = () => {},
  onPause = () => {},
  onResume = () => {},
  onRestart = () => {},
  onQuit = () => {}
}) => (
  <div className="space-y-6">
    <GameStatsPanel
      difficulty={difficulty}
      foodEaten={foodEaten}
      gameMode={gameMode}
      gameTime={gameTime}
      score={score}
      snakes={snakes}
      speedMultiplier={speedMultiplier}
    />

    <GameActionButtons
      isGameOver={isGameOver}
      isPaused={isPaused}
      onPause={onPause}
      onQuit={onQuit}
      onRestart={onRestart}
      onResume={onResume}
    />

    {showMobileControls && (
      <TouchControlsPanel
        isPaused={isPaused}
        isPlaying={isPlaying}
        onMobileControl={onMobileControl}
      />
    )}

    <KeyboardHelpCard />
  </div>
);

export { FloatingGameHUD, GameOverOverlay };
export default GameControls;
