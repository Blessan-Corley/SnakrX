import { memo, useRef } from 'react';
import BoardFoodLayer from './gameBoard/BoardFoodLayer.jsx';
import BoardSnakeLayer from './gameBoard/BoardSnakeLayer.jsx';
import PauseOverlay from './gameBoard/PauseOverlay.jsx';
import { BASE_CELL_SIZE } from './gameBoard/constants.js';
import { normalizeBoardSize } from './gameBoard/boardSizing.js';
import { useResponsiveBoardScale } from './gameBoard/useResponsiveBoardScale.js';

const GameBoard = memo(({
  boardSize,
  snakes = [],
  food,
  deadPlayers = new Set(),
  showGrid = true,
  highlightCollision = null,
  className = ''
}) => {
  const normalizedBoardSize = normalizeBoardSize(boardSize);
  const boardWidth = normalizedBoardSize.width * BASE_CELL_SIZE;
  const boardHeight = normalizedBoardSize.height * BASE_CELL_SIZE;

  return (
    <div
      className={`relative mx-auto rounded-lg overflow-hidden ${className}`}
      role="img"
      aria-label="Snake game board"
      style={{
        width: boardWidth + 8,
        height: boardHeight + 8,
        background: '#1a1a2e',
        border: '3px solid rgba(255, 255, 255, 0.8)',
        boxShadow: '0 0 20px rgba(255, 255, 255, 0.4), 0 4px 20px rgba(0, 0, 0, 0.3)'
      }}
    >
      <svg
        width={boardWidth}
        height={boardHeight}
        className="mx-auto mt-1"
        role="presentation"
        aria-hidden="true"
        style={{
          display: 'block',
          background: '#0f0f23'
        }}
      >
        <defs>
          {showGrid && (
            <pattern
              id="gameGrid"
              width={BASE_CELL_SIZE}
              height={BASE_CELL_SIZE}
              patternUnits="userSpaceOnUse"
            >
              <path
                d={`M ${BASE_CELL_SIZE} 0 L 0 0 0 ${BASE_CELL_SIZE}`}
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="1"
              />
            </pattern>
          )}
        </defs>

        {showGrid && (
          <rect
            width={boardWidth}
            height={boardHeight}
            fill="url(#gameGrid)"
            opacity="0.6"
          />
        )}

        <BoardFoodLayer food={food} safeCellSize={BASE_CELL_SIZE} />
        <BoardSnakeLayer
          snakes={snakes}
          deadPlayers={deadPlayers}
          highlightCollision={highlightCollision}
          safeCellSize={BASE_CELL_SIZE}
        />
      </svg>
    </div>
  );
});

GameBoard.displayName = 'GameBoard';

export const ResponsiveGameBoard = memo((props) => {
  const containerRef = useRef(null);
  const normalizedBoardSize = normalizeBoardSize(props.boardSize);
  const scale = useResponsiveBoardScale({
    containerRef,
    boardSize: normalizedBoardSize
  });

  return (
    <div
      ref={containerRef}
      className="flex items-start justify-center w-full h-full min-h-[36vh] sm:min-h-[48vh] p-1"
    >
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'center'
        }}
      >
        <GameBoard {...props} boardSize={normalizedBoardSize} />
      </div>
    </div>
  );
});

ResponsiveGameBoard.displayName = 'ResponsiveGameBoard';

export const GameBoardWithOverlay = memo(({ isPaused, isGameOver, children, ...props }) => (
  <div className="relative">
    <ResponsiveGameBoard {...props} />
    {isPaused && !isGameOver && <PauseOverlay />}
    {children}
  </div>
));

GameBoardWithOverlay.displayName = 'GameBoardWithOverlay';

export default GameBoard;
