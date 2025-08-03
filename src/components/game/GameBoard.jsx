import React, { useRef, useEffect, useMemo, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { positionsEqual } from '@/utils/gameUtils';

/**
 * Enhanced Game Board Component - OPTIMIZED PERFORMANCE
 * Better sizing, optimized rendering, improved visibility
 */
const GameBoard = memo(({
  boardSize,
  snakes = [],
  food,
  deadPlayers = new Set(),
  showGrid = true,
  highlightCollision = null,
  className = '',
  onSwipe = () => {}
}) => {
  const boardRef = useRef(null);

  // OPTIMIZED: Responsive cell size calculation
  const cellSize = useMemo(() => {
    if (typeof window === 'undefined') return 24;
    
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // Dynamic cell size based on device pixel ratio for sharper rendering
    const pixelRatio = window.devicePixelRatio || 1;
    const timestamp = performance.now();
    
    // Optimize size for different screen densities
    const baseSize = Math.floor(Math.min(
      screenWidth / (boardSize.width * pixelRatio),
      screenHeight / (boardSize.height * pixelRatio)
    ) * pixelRatio);
    
    // Calculate optimal cell size based on screen and board dimensions
    const maxBoardWidth = Math.min(screenWidth * 0.85, 1200); // Increased max width
    const maxBoardHeight = Math.min(screenHeight * 0.8, 900); // Increased max height
    
    const cellWidthLimit = Math.floor(maxBoardWidth / boardSize.width);
    const cellHeightLimit = Math.floor(maxBoardHeight / boardSize.height);
    
    const optimalSize = Math.min(cellWidthLimit, cellHeightLimit);
    
    // Adjusted clamp bounds for larger cells while maintaining grid
    return Math.max(20, Math.min(48, optimalSize));
  }, [boardSize.width, boardSize.height]);

  const boardWidth = boardSize.width * cellSize;
  const boardHeight = boardSize.height * cellSize;

  // OPTIMIZED: High-contrast snake colors for better visibility
  const SNAKE_COLORS = useMemo(() => ({
    player: '#00ff00',      // Bright green - highly visible
    ai: '#ff6b00',          // Orange - distinct from player
    player2: '#0099ff',     // Bright blue - good contrast
    player3: '#ff3366',     // Pink-red - vibrant
    player4: '#9933ff',     // Purple - distinct
    dead: '#666666'         // Medium gray for dead snakes
  }), []);

  // OPTIMIZED: Simplified grid with better performance
  const gridPattern = useMemo(() => {
    if (!showGrid) return null;

    return (
      <defs>
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
      </defs>
    );
  }, [cellSize, showGrid]);

  const gridOverlay = useMemo(() => {
    if (!showGrid) return null;

    return (
      <rect 
        width={boardWidth} 
        height={boardHeight} 
        fill="url(#gameGrid)"
        opacity="0.6"
      />
    );
  }, [boardWidth, boardHeight, showGrid]);

  // OPTIMIZED: Simplified snake rendering for better performance
  const renderSnake = useCallback((snake, snakeIndex) => {
    if (!snake || !Array.isArray(snake.body) || snake.body.length === 0) {
      console.warn('Invalid snake data:', snake);
      return null;
    }

    const isDead = deadPlayers.has(snakeIndex);
    const isAI = snake.isAI;
    
    // Use snake color or default based on player index
    const colorKey = snake.isAI ? 'ai' : `player${snakeIndex === 0 ? '' : snakeIndex + 1}`;
    const baseColor = SNAKE_COLORS[colorKey] || SNAKE_COLORS.player;
    const displayColor = isDead ? SNAKE_COLORS.dead : baseColor;

    return snake.body.map((segment, segmentIndex) => {
      if (!segment || typeof segment.x !== 'number' || typeof segment.y !== 'number') {
        return null;
      }

      const isHead = segmentIndex === 0;
      const x = segment.x * cellSize;
      const y = segment.y * cellSize;
      
      // Simpler size calculation
      const segmentSize = isHead ? cellSize - 2 : cellSize - 4;
      const offset = (cellSize - segmentSize) / 2;

      return (
        <g key={`snake-${snakeIndex}-${segmentIndex}`}>
          {/* Main segment */}
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
          
          {/* Simple head indicator */}
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
              {isAI && (
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
          
          {/* Collision effect */}
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

  // OPTIMIZED: Simplified food rendering
  const renderFood = useCallback(() => {
    if (!food || typeof food.x !== 'number' || typeof food.y !== 'number') {
      console.warn('Invalid food data:', food);
      return null;
    }

    const x = food.x * cellSize;
    const y = food.y * cellSize;
    const foodSize = cellSize - 4;
    const offset = 2;

    return (
      <g key={`food-${food.x}-${food.y}`}>
        {/* Simple glow effect */}
        <circle
          cx={x + cellSize / 2}
          cy={y + cellSize / 2}
          r={cellSize * 0.6}
          fill="none"
          stroke="#ff4444"
          strokeWidth="2"
          opacity="0.4"
        />
        
        {/* Main food */}
        <rect
          x={x + offset}
          y={y + offset}
          width={foodSize}
          height={foodSize}
          fill="#ff0000"
          rx={foodSize * 0.3}
          ry={foodSize * 0.3}
        />
        
        {/* Simple shine */}
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
      {/* Main game SVG */}
      <svg
        width={boardWidth}
        height={boardHeight}
        className="mx-auto mt-1"
        style={{ 
          display: 'block', 
          background: '#0f0f23'
        }}
      >
        {/* Simplified definitions */}
        <defs>
          {gridPattern}
        </defs>
        
        {/* Grid */}
        {gridOverlay}
        
        {/* Food */}
        {renderFood()}
        
        {/* Snakes */}
        {Array.isArray(snakes) && snakes.map((snake, index) => (
          <g key={`snake-container-${index}`}>{renderSnake(snake, index)}</g>
        ))}
      </svg>
    </div>
  );
});

/**
 * Responsive Game Board
 */
export const ResponsiveGameBoard = memo((props) => {
  const containerRef = useRef(null);
  const [scale, setScale] = React.useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      
      // Simple scaling calculation
      const maxWidth = containerWidth - 40;
      const maxHeight = containerHeight - 40;
      
      // Calculate based on current board dimensions
      const boardWidth = props.boardSize.width * 24 + 8; // Base cell size
      const boardHeight = props.boardSize.height * 24 + 8;
      
      const scaleX = maxWidth / boardWidth;
      const scaleY = maxHeight / boardHeight;
      const newScale = Math.min(scaleX, scaleY, 1.2);
      
      setScale(Math.max(newScale, 0.6));
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    
    return () => {
      window.removeEventListener('resize', updateScale);
    };
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

/**
 * Game Board with overlays
 */
export const GameBoardWithOverlay = memo(({ isPaused, isGameOver, children, ...props }) => {
  return (
    <div className="relative">
      <ResponsiveGameBoard {...props} />
      
      {/* Pause overlay */}
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
  );
});

export default GameBoard;