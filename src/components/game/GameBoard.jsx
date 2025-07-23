import React, { useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { positionsEqual } from '@/utils/gameUtils';

/**
 * Core Game Board Component
 * Renders the game board with snakes, food, and visual effects
 */
const GameBoard = ({
  boardSize,
  snakes = [],
  food,
  deadPlayers = new Set(),
  showGrid = true,
  highlightCollision = null,
  className = ''
}) => {
  const boardRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Calculate cell size based on container size
  const cellSize = 20; // Fixed cell size for consistency
  const boardWidth = boardSize.width * cellSize;
  const boardHeight = boardSize.height * cellSize;

  // Memoize grid lines for performance
  const gridLines = useMemo(() => {
    if (!showGrid) return null;

    const lines = [];
    
    // Vertical lines
    for (let x = 0; x <= boardSize.width; x++) {
      lines.push(
        <line
          key={`v-${x}`}
          x1={x * cellSize}
          y1={0}
          x2={x * cellSize}
          y2={boardHeight}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="1"
        />
      );
    }
    
    // Horizontal lines
    for (let y = 0; y <= boardSize.height; y++) {
      lines.push(
        <line
          key={`h-${y}`}
          x1={0}
          y1={y * cellSize}
          x2={boardWidth}
          y2={y * cellSize}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="1"
        />
      );
    }
    
    return lines;
  }, [boardSize, cellSize, boardWidth, boardHeight, showGrid]);

  // Render snake segments
  const renderSnake = (snake, snakeIndex) => {
    if (!snake.body || snake.body.length === 0) return null;

    const isDead = deadPlayers.has(snakeIndex);
    const opacity = isDead ? 0.3 : 1;
    const color = isDead ? '#6b7280' : snake.color;

    return snake.body.map((segment, segmentIndex) => {
      const isHead = segmentIndex === 0;
      const x = segment.x * cellSize;
      const y = segment.y * cellSize;
      
      // Collision highlight
      const isCollisionPoint = highlightCollision && 
        positionsEqual(segment, highlightCollision) && 
        isHead;

      return (
        <motion.g key={`snake-${snakeIndex}-${segmentIndex}`}>
          {/* Main segment */}
          <motion.rect
            x={x + 1}
            y={y + 1}
            width={cellSize - 2}
            height={cellSize - 2}
            fill={color}
            opacity={opacity}
            rx={isHead ? cellSize * 0.3 : cellSize * 0.2}
            ry={isHead ? cellSize * 0.3 : cellSize * 0.2}
            initial={{ scale: 0 }}
            animate={{ 
              scale: 1,
              boxShadow: isHead ? `0 0 10px ${color}` : 'none'
            }}
            transition={{ 
              type: "spring", 
              stiffness: 500, 
              damping: 30,
              duration: 0.1 
            }}
          />
          
          {/* Head details */}
          {isHead && !isDead && (
            <>
              {/* Eyes */}
              <motion.circle
                cx={x + cellSize * 0.3}
                cy={y + cellSize * 0.3}
                r={cellSize * 0.08}
                fill="white"
                opacity={0.9}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.circle
                cx={x + cellSize * 0.7}
                cy={y + cellSize * 0.3}
                r={cellSize * 0.08}
                fill="white"
                opacity={0.9}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.1 }}
              />
            </>
          )}
          
          {/* Collision effect */}
          {isCollisionPoint && (
            <motion.circle
              cx={x + cellSize / 2}
              cy={y + cellSize / 2}
              r={cellSize}
              fill="none"
              stroke="#ef4444"
              strokeWidth="3"
              opacity={0.8}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.5 }}
            />
          )}
        </motion.g>
      );
    });
  };

  // Render food
  const renderFood = () => {
    if (!food) return null;

    const x = food.x * cellSize;
    const y = food.y * cellSize;

    return (
      <motion.g key={`food-${food.x}-${food.y}`}>
        {/* Food glow effect */}
        <motion.circle
          cx={x + cellSize / 2}
          cy={y + cellSize / 2}
          r={cellSize * 0.6}
          fill="none"
          stroke="#dc2626"
          strokeWidth="2"
          opacity={0.3}
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Main food */}
        <motion.rect
          x={x + 2}
          y={y + 2}
          width={cellSize - 4}
          height={cellSize - 4}
          fill="#dc2626"
          rx={cellSize * 0.25}
          ry={cellSize * 0.25}
          initial={{ scale: 0, rotate: 0 }}
          animate={{ 
            scale: 1,
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            scale: { type: "spring", stiffness: 500, damping: 30 },
            rotate: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
        />
        
        {/* Food sparkle effect */}
        <motion.circle
          cx={x + cellSize * 0.7}
          cy={y + cellSize * 0.3}
          r={2}
          fill="white"
          opacity={0.8}
          animate={{ 
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5]
          }}
          transition={{ 
            duration: 1, 
            repeat: Infinity,
            delay: 0.5
          }}
        />
      </motion.g>
    );
  };

  return (
    <motion.div
      ref={boardRef}
      className={`relative mx-auto bg-dark-surface/50 border border-white/20 rounded-xl overflow-hidden ${className}`}
      style={{
        width: boardWidth + 4, // +4 for border
        height: boardHeight + 4
      }}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
    >
      {/* Board background */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-dark-bg to-dark-surface"
        style={{
          backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(249, 115, 22, 0.05) 0%, transparent 50%)'
        }}
      />
      
      {/* Main game SVG */}
      <svg
        width={boardWidth}
        height={boardHeight}
        className="relative z-10"
        style={{ display: 'block' }}
      >
        {/* Grid lines */}
        {gridLines}
        
        {/* Food */}
        {renderFood()}
        
        {/* Snakes */}
        {snakes.map((snake, index) => (
          <g key={`snake-${index}`}>
            {renderSnake(snake, index)}
          </g>
        ))}
      </svg>
      
      {/* Overlay effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Ambient glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary-500/5 to-transparent animate-pulse" />
        
        {/* Corner decorations */}
        <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-primary-500/30 rounded-tl" />
        <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-primary-500/30 rounded-tr" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-primary-500/30 rounded-bl" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-primary-500/30 rounded-br" />
      </div>
    </motion.div>
  );
};

/**
 * Game Board Container with responsive sizing
 */
export const ResponsiveGameBoard = (props) => {
  const containerRef = useRef(null);
  const [scale, setScale] = React.useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      
      const boardWidth = props.boardSize.width * 20; // 20px cell size
      const boardHeight = props.boardSize.height * 20;
      
      const scaleX = (containerWidth - 40) / boardWidth; // 40px padding
      const scaleY = (containerHeight - 40) / boardHeight;
      const newScale = Math.min(scaleX, scaleY, 1); // Don't scale up
      
      setScale(newScale);
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [props.boardSize]);

  return (
    <div 
      ref={containerRef}
      className="flex items-center justify-center w-full h-full min-h-[400px]"
    >
      <div style={{ transform: `scale(${scale})` }}>
        <GameBoard {...props} />
      </div>
    </div>
  );
};

/**
 * Game Board with pause overlay
 */
export const GameBoardWithOverlay = ({ isPaused, isGameOver, children, ...props }) => {
  return (
    <div className="relative">
      <ResponsiveGameBoard {...props} />
      
      {/* Pause Overlay */}
      {isPaused && !isGameOver && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center rounded-xl"
        >
          <div className="text-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              ⏸️
            </motion.div>
            <h3 className="text-2xl font-bold text-white mb-2">Game Paused</h3>
            <p className="text-white/70">Press Space to continue</p>
          </div>
        </motion.div>
      )}
      
      {/* Additional overlays */}
      {children}
    </div>
  );
};

export default GameBoard;