import { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react';
import { positionsEqual } from '@/utils/gameUtils';

/**
 * Enhanced Game Board Component - OPTIMIZED PERFORMANCE
 */
const GameBoard = memo(({
  boardSize,
  snakes = [],
  food,
  deadPlayers = new Set(),
  showGrid = true,
  highlightCollision = null,
  className = ''
}) => {
  const boardRef = useRef(null);

  // Validate boardSize to prevent runtime crash
  const cellSize = useMemo(() => {
    if (typeof window === 'undefined' || !boardSize?.width || !boardSize?.height) return 24;

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const pixelRatio = window.devicePixelRatio || 1;

    const maxBoardWidth = Math.min(screenWidth * 0.85, 1200);
    const maxBoardHeight = Math.min(screenHeight * 0.8, 900);

    const cellWidthLimit = Math.floor(maxBoardWidth / boardSize.width);
    const cellHeightLimit = Math.floor(maxBoardHeight / boardSize.height);
    const optimalSize = Math.min(cellWidthLimit, cellHeightLimit);

    return Math.max(20, Math.min(48, optimalSize));
  }, [boardSize?.width, boardSize?.height]);

  const boardWidth = boardSize?.width * cellSize;
  const boardHeight = boardSize?.height * cellSize;

  const SNAKE_COLORS = useMemo(() => ({
    player: '#00ff00',
    ai: '#ff6b00',
    player2: '#0099ff',
    player3: '#ff3366',
    player4: '#9933ff',
    dead: '#666666'
  }), []);

  const renderSnake = useCallback((snake, snakeIndex) => {
    if (!snake?.body?.length) return null;

    const isDead = deadPlayers.has(snakeIndex);
    const colorKey = snake.isAI ? 'ai' : `player${snakeIndex === 0 ? '' : snakeIndex + 1}`;
    const baseColor = SNAKE_COLORS[colorKey] || SNAKE_COLORS.player;
    const displayColor = isDead ? SNAKE_COLORS.dead : baseColor;

    return snake.body.map((segment, segmentIndex) => {
      if (typeof segment?.x !== 'number' || typeof segment?.y !== 'number') return null;

      const isHead = segmentIndex === 0;
      const x = segment.x * cellSize;
      const y = segment.y * cellSize;
      const segmentSize = isHead ? cellSize - 2 : cellSize - 4;
      const offset = (cellSize - segmentSize) / 2;

      return (
        <g key={`snake-${snakeIndex}-${segmentIndex}`}>
          <rect
            x={x + offset}
            y={y + offset}
            width={segmentSize}
            height={segmentSize}
            fill={displayColor}
            rx={isHead ? segmentSize * 0.3 : segmentSize * 0.2}
            ry={isHead ? segmentSize * 0.3 : segmentSize * 0.2}
            opacity={isDead ? 0.5 : 1}
            stroke={isHead ? '#ffffff' : 'none'}
            strokeWidth={isHead ? 1 : 0}
          />

          {isHead && !isDead && (
            <>
              {/* Eyes */}
              <circle
                cx={x + cellSize * 0.35}
                cy={y + cellSize * 0.3}
                r={Math.max(1, cellSize * 0.08)}
                fill="#ffffff"
              />
              <circle
                cx={x + cellSize * 0.65}
                cy={y + cellSize * 0.3}
                r={Math.max(1, cellSize * 0.08)}
                fill="#ffffff"
              />

              {/* AI indicator */}
              {snake.isAI && (
                <rect
                  x={x + cellSize * 0.35}
                  y={y + cellSize * 0.7}
                  width={cellSize * 0.3}
                  height={cellSize * 0.1}
                  fill="#ffffff"
                  rx={1}
                />
              )}
            </>
          )}

          {highlightCollision && positionsEqual(segment, highlightCollision) && isHead && (
            <circle
              cx={x + cellSize / 2}
              cy={y + cellSize / 2}
              r={cellSize * 0.6}
              fill="none"
              stroke="#ff0000"
              strokeWidth="3"
              opacity="0.8"
            />
          )}
        </g>
      );
    }).filter(Boolean);
  }, [cellSize, deadPlayers, SNAKE_COLORS, highlightCollision]);

  const renderFood = useCallback(() => {
    if (!food || typeof food.x !== 'number' || typeof food.y !== 'number') return null;

    const x = food.x * cellSize;
    const y = food.y * cellSize;
    const foodSize = cellSize - 4;
    const offset = 2;

    return (
      <g key={`food-${food.x}-${food.y}`}>
        <circle
          cx={x + cellSize / 2}
          cy={y + cellSize / 2}
          r={cellSize * 0.6}
          fill="none"
          stroke="#ff4444"
          strokeWidth="2"
          opacity="0.4"
        />
        <rect
          x={x + offset}
          y={y + offset}
          width={foodSize}
          height={foodSize}
          fill="#ff0000"
          rx={foodSize * 0.3}
          ry={foodSize * 0.3}
        />
        <circle
          cx={x + cellSize * 0.6}
          cy={y + cellSize * 0.4}
          r={Math.max(1, cellSize * 0.1)}
          fill="#ffffff"
          opacity="0.8"
        />
      </g>
    );
  }, [food, cellSize]);

  return (
    <div
      ref={boardRef}
      className={`relative mx-auto rounded-lg overflow-hidden ${className}`}
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
        style={{
          display: 'block',
          background: '#0f0f23'
        }}
      >
        <defs>
          {showGrid && (
            <pattern
              id="gameGrid"
              width={cellSize}
              height={cellSize}
              patternUnits="userSpaceOnUse"
            >
              <path
                d={`M ${cellSize} 0 L 0 0 0 ${cellSize}`}
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

        {renderFood()}
        {snakes.map((snake, index) => (
          <g key={`snake-container-${index}`}>{renderSnake(snake, index)}</g>
        ))}
      </svg>
    </div>
  );
});

GameBoard.displayName = 'GameBoard';

/**
 * Responsive wrapper that scales GameBoard to container
 */
export const ResponsiveGameBoard = memo((props) => {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const container = containerRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      const maxWidth = containerWidth - 40;
      const maxHeight = containerHeight - 40;

      const boardWidth = props.boardSize?.width * 24 + 8;
      const boardHeight = props.boardSize?.height * 24 + 8;

      const scaleX = maxWidth / boardWidth;
      const scaleY = maxHeight / boardHeight;
      const newScale = Math.min(scaleX, scaleY, 1.2);

      setScale(Math.max(newScale, 0.6));
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [props.boardSize]);

  return (
    <div
      ref={containerRef}
      className="flex items-center justify-center w-full h-full min-h-[400px] p-4"
    >
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'center'
        }}
      >
        <GameBoard {...props} />
      </div>
    </div>
  );
});

ResponsiveGameBoard.displayName = 'ResponsiveGameBoard';

/**
 * Game board with overlays (pause/game over)
 */
export const GameBoardWithOverlay = memo(({ isPaused, isGameOver, children, ...props }) => (
  <div className="relative">
    <ResponsiveGameBoard {...props} />
    {isPaused && !isGameOver && (
      <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg z-30">
        <div className="text-center">
          <div className="text-6xl mb-6">⏸️</div>
          <h3 className="text-3xl font-bold text-white mb-4">Game Paused</h3>
          <p className="text-white/80 text-lg">Press Space to continue</p>
        </div>
      </div>
    )}
    {children}
  </div>
));

GameBoardWithOverlay.displayName = 'GameBoardWithOverlay';

export default GameBoard;
