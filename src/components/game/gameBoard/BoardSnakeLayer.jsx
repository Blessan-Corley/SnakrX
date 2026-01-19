import { memo } from 'react';
import { positionsEqual } from '@/utils/gameUtils';
import { SNAKE_COLORS } from './constants.js';

const getSnakeColorKey = (snake, snakeIndex) => {
  if (snake?.isAI) {
    return 'ai';
  }

  return `player${snakeIndex === 0 ? '' : snakeIndex + 1}`;
};

const BoardSnakeLayer = memo(({
  snakes = [],
  deadPlayers = new Set(),
  highlightCollision = null,
  safeCellSize
}) => (
  <>
    {snakes.map((snake, snakeIndex) => {
      if (!snake?.body?.length) {
        return null;
      }

      const isDead = deadPlayers.has(snakeIndex);
      const colorKey = getSnakeColorKey(snake, snakeIndex);
      const baseColor = SNAKE_COLORS[colorKey] || SNAKE_COLORS.player;
      const displayColor = isDead ? SNAKE_COLORS.dead : baseColor;

      return (
        <g key={`snake-container-${snakeIndex}`}>
          {snake.body.map((segment, segmentIndex) => {
            if (typeof segment?.x !== 'number' || typeof segment?.y !== 'number') {
              return null;
            }

            const isHead = segmentIndex === 0;
            const x = segment.x * safeCellSize;
            const y = segment.y * safeCellSize;
            const segmentSize = isHead ? safeCellSize - 2 : safeCellSize - 4;
            const offset = (safeCellSize - segmentSize) / 2;

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
                    <circle
                      cx={x + safeCellSize * 0.35}
                      cy={y + safeCellSize * 0.3}
                      r={Math.max(1, safeCellSize * 0.08)}
                      fill="#ffffff"
                    />
                    <circle
                      cx={x + safeCellSize * 0.65}
                      cy={y + safeCellSize * 0.3}
                      r={Math.max(1, safeCellSize * 0.08)}
                      fill="#ffffff"
                    />
                    {snake.isAI && (
                      <rect
                        x={x + safeCellSize * 0.35}
                        y={y + safeCellSize * 0.7}
                        width={safeCellSize * 0.3}
                        height={safeCellSize * 0.1}
                        fill="#ffffff"
                        rx={1}
                      />
                    )}
                  </>
                )}

                {highlightCollision && positionsEqual(segment, highlightCollision) && isHead && (
                  <circle
                    cx={x + safeCellSize / 2}
                    cy={y + safeCellSize / 2}
                    r={safeCellSize * 0.6}
                    fill="none"
                    stroke="#ff0000"
                    strokeWidth="3"
                    opacity="0.8"
                    className="animate-ping"
                  />
                )}
              </g>
            );
          })}
        </g>
      );
    })}
  </>
));

BoardSnakeLayer.displayName = 'BoardSnakeLayer';

export default BoardSnakeLayer;
