import GameReadyOverlay from './GameReadyOverlay.jsx';
import GameSidebar from './GameSidebar.jsx';
import { GameBoardWithOverlay } from './GameBoard.jsx';

const GameStage = ({
  boardSize,
  currentKeyMappings,
  deadPlayers,
  food,
  foodEaten,
  gameState,
  gameStates,
  gameTime,
  highlightCollision,
  isGameActive,
  isGameOver,
  isMultiplayerMode,
  isPaused,
  mobile,
  modeDescriptions,
  multiplayerReadyPlayers,
  navigate,
  numPlayers,
  onQuit,
  onRestart,
  onTogglePause,
  onTouchControl,
  onTouchEnd,
  onTouchMove,
  onTouchStart,
  readyPlayersCount,
  resolvedDifficulty,
  resolvedMode,
  score,
  showCollisionHighlight,
  snakes,
  speedMultiplier
}) => (
  <div className="relative z-10 max-w-[1520px] mx-auto px-4 py-3">
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,4fr)_minmax(320px,1fr)] gap-5 h-full items-start">
      <div className="relative">
        <div
          className="h-full flex items-start justify-center pt-1"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="relative">
            <GameBoardWithOverlay
              boardSize={boardSize}
              snakes={snakes}
              food={food}
              isPaused={isPaused}
              isGameOver={isGameOver}
              deadPlayers={deadPlayers}
              highlightCollision={showCollisionHighlight ? highlightCollision : null}
              showGrid={true}
              className="shadow-2xl"
            />
            <GameReadyOverlay
              gameStatus={gameState}
              gameStates={gameStates}
              isMultiplayerMode={isMultiplayerMode}
              numPlayers={numPlayers}
              multiplayerReadyPlayers={multiplayerReadyPlayers}
              readyPlayersCount={readyPlayersCount}
              resolvedMode={resolvedMode}
              modeDescriptions={modeDescriptions}
            />
          </div>
        </div>
      </div>
      <GameSidebar
        navigate={navigate}
        mobile={mobile}
        numPlayers={numPlayers}
        gameStatus={gameState}
        gameStates={gameStates}
        currentKeyMappings={currentKeyMappings}
        resolvedMode={resolvedMode}
        resolvedDifficulty={resolvedDifficulty}
        isGameActive={isGameActive}
        isPaused={isPaused}
        isGameOver={isGameOver}
        score={score}
        gameTime={gameTime}
        speedMultiplier={speedMultiplier}
        foodEaten={foodEaten}
        snakes={snakes}
        onTouchControl={onTouchControl}
        onTogglePause={onTogglePause}
        onRestart={onRestart}
        onQuit={onQuit}
      />
    </div>
  </div>
);

export default GameStage;
