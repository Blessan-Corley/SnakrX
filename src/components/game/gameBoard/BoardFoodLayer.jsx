import { memo } from 'react';
import { BONUS_FOOD_CONFIG, isBonusFood } from '@/utils/gameUtils';

const normalizeFoods = (food) => {
  if (!food) {
    return [];
  }

  return Array.isArray(food) ? food : [food];
};

const BoardFoodLayer = memo(({ food, safeCellSize }) => {
  const foods = normalizeFoods(food);

  return foods.map((item, index) => {
    if (!item || typeof item.x !== 'number' || typeof item.y !== 'number') {
      return null;
    }

    const x = item.x * safeCellSize;
    const y = item.y * safeCellSize;
    const isLargeBonus = isBonusFood(item);
    const timeRemaining = isLargeBonus ? Math.max(0, Number(item.expiresAt) - Date.now()) : 0;
    const isNearExpiry = isLargeBonus && timeRemaining <= BONUS_FOOD_CONFIG.LIFETIME_MS * 0.3;
    const blinkOn = !isNearExpiry || Math.floor(timeRemaining / 160) % 2 === 0;
    const foodSize = safeCellSize - 4;
    const offset = 2;

    if (isLargeBonus) {
      const size = (Number(item.size) || BONUS_FOOD_CONFIG.SIZE) * safeCellSize;
      const bonusSize = size - 6;
      const glowOpacity = isNearExpiry ? (blinkOn ? 0.9 : 0.35) : 0.7;

      return (
        <g key={`food-${index}-${item.id || `${item.x}-${item.y}`}`} className="animate-pulse">
          <rect
            x={x - 2}
            y={y - 2}
            width={size + 4}
            height={size + 4}
            rx={safeCellSize * 0.65}
            ry={safeCellSize * 0.65}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2.5"
            opacity={glowOpacity}
          />
          <rect
            x={x + 3}
            y={y + 3}
            width={bonusSize}
            height={bonusSize}
            fill="#f97316"
            opacity={isNearExpiry ? (blinkOn ? 1 : 0.68) : 0.96}
            rx={safeCellSize * 0.55}
            ry={safeCellSize * 0.55}
          />
          <circle
            cx={x + size * 0.34}
            cy={y + size * 0.33}
            r={Math.max(2, safeCellSize * 0.14)}
            fill="#fff7ed"
            opacity="0.9"
          />
          <circle
            cx={x + size * 0.66}
            cy={y + size * 0.38}
            r={Math.max(2, safeCellSize * 0.11)}
            fill="#fde68a"
            opacity="0.9"
          />
          <circle
            cx={x + size * 0.52}
            cy={y + size * 0.62}
            r={Math.max(2, safeCellSize * 0.1)}
            fill="#fff7ed"
            opacity="0.8"
          />
        </g>
      );
    }

    return (
      <g key={`food-${index}-${item.x}-${item.y}`}>
        <circle
          cx={x + safeCellSize / 2}
          cy={y + safeCellSize / 2}
          r={safeCellSize * 0.6}
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
          cx={x + safeCellSize * 0.6}
          cy={y + safeCellSize * 0.4}
          r={Math.max(1, safeCellSize * 0.1)}
          fill="#ffffff"
          opacity="0.8"
        />
      </g>
    );
  });
});

BoardFoodLayer.displayName = 'BoardFoodLayer';

export default BoardFoodLayer;
