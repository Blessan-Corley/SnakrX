import { describe, it, expect } from 'vitest';
import { 
  calculatePoints, 
  calculateSpeed, 
  calculateBonusFoodPoints,
  createLargeBonusFood,
  generateFoodPosition,
  generateLargeFoodPosition,
  getNextSpeedMilestone,
  getSpeedProgressUnits,
  getOppositeDirection,
  getFoodCells,
  resolveVsAiWinner,
  isQualifiedCompetitiveWin,
  BONUS_FOOD_CONFIG,
  DIRECTIONS,
  GAME_MODES, 
  SPEED_CONFIGS, 
  POINTS,
  AI_DIFFICULTIES
} from './gameUtils.js';

describe('Game Utilities - Classic Mode Mechanics', () => {
  
  describe('calculatePoints', () => {
    it('should return correct base points for Classic Mode', () => {
      const points = calculatePoints(GAME_MODES.CLASSIC);
      expect(points).toBe(POINTS[GAME_MODES.CLASSIC]);
      expect(points).toBe(5); // Default is 5
    });

    it('should multiply points by food count if specified', () => {
      const points = calculatePoints(GAME_MODES.CLASSIC, null, 2); // 2 food worth? (Function sig: foodCount)
      // The function implementation: return (basePoints) * foodCount;
      expect(points).toBe(10);
    });

    it('should handle VS AI points correctly', () => {
      const easyPoints = calculatePoints(GAME_MODES.VS_AI, AI_DIFFICULTIES.EASY);
      expect(easyPoints).toBe(POINTS[`${GAME_MODES.VS_AI}_${AI_DIFFICULTIES.EASY}`]);
    });
  });

  describe('calculateSpeed', () => {
    it('should return initial speed when food eaten is 0', () => {
      const speed = calculateSpeed(0);
      expect(speed).toBe(SPEED_CONFIGS.INITIAL);
    });

    it('should not increase speed before threshold is reached', () => {
      // Threshold is 5
      const speed0 = calculateSpeed(0);
      const speed1 = calculateSpeed(1);
      expect(speed1).toBe(speed0);
    });

    it('should increase speed (decrease delay) when threshold is reached', () => {
      // Threshold 5. At 5 food, level 1 increase.
      const speed2 = calculateSpeed(5);
      const expected = SPEED_CONFIGS.INITIAL - SPEED_CONFIGS.INCREMENT;
      expect(speed2).toBe(expected);
    });

    it('should increase speed progressively', () => {
      // With the solo threshold at 3, 10 progress units means 3 increases.
      const speed4 = calculateSpeed(10);
      const expected = SPEED_CONFIGS.INITIAL - (SPEED_CONFIGS.INCREMENT * 3);
      expect(speed4).toBe(expected);
    });

    it('should clamp speed to MIN_SPEED', () => {
      // Simulate eating a lot of food
      const speed = calculateSpeed(1000); 
      expect(speed).toBe(SPEED_CONFIGS.MIN_SPEED);
    });

    it('uses the tuned solo curve to ramp earlier than competitive for the same progress', () => {
      const soloSpeed = calculateSpeed(12, { mode: GAME_MODES.CLASSIC });
      const competitiveSpeed = calculateSpeed(12, { mode: GAME_MODES.VS_AI });

      expect(soloSpeed).toBeLessThan(competitiveSpeed);
    });

    it('shares the same competitive curve between vs ai and multiplayer', () => {
      expect(calculateSpeed(20, { mode: GAME_MODES.VS_AI }))
        .toBe(calculateSpeed(20, { mode: GAME_MODES.MULTIPLAYER }));
    });
  });

  describe('Food spawn safety', () => {
    it('should never return an occupied cell when free cells exist', () => {
      const originalRandom = Math.random;
      const sequence = [0, 0, 0, 0.2, 0.9, 0.9];
      let index = 0;
      try {
        Math.random = () => sequence[index++] ?? 0.9;

        const occupied = [
          { x: 0, y: 0 },
          { x: 0, y: 1 },
          { x: 1, y: 0 }
        ];

        const food = generateFoodPosition(2, 2, occupied);
        expect(food).toEqual({ x: 1, y: 1 });
      } finally {
        Math.random = originalRandom;
      }
    });

    it('should avoid occupied cells when snakes are provided as snake objects', () => {
      const originalRandom = Math.random;
      const sequence = [0, 0, 0.5, 0.5];
      let index = 0;
      try {
        Math.random = () => sequence[index++] ?? 0.5;

        const snakes = [
          {
            body: [{ x: 0, y: 0 }, { x: 1, y: 1 }]
          }
        ];

        const food = generateFoodPosition(3, 3, snakes);
        expect(food).not.toEqual({ x: 0, y: 0 });
        expect(food).not.toEqual({ x: 1, y: 1 });
      } finally {
        Math.random = originalRandom;
      }
    });

    it('finds a safe 2x2 area for large bonus food', () => {
      const largeFood = generateLargeFoodPosition(
        5,
        5,
        [{ body: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }] }],
        [{ x: 2, y: 2 }]
      );

      expect(largeFood).toBeTruthy();
      expect(getFoodCells(createLargeBonusFood(largeFood)).every((cell) => (
        !(cell.x === 0 && cell.y === 0) &&
        !(cell.x === 1 && cell.y === 0) &&
        !(cell.x === 0 && cell.y === 1) &&
        !(cell.x === 2 && cell.y === 2)
      ))).toBe(true);
    });

    it('calculates higher bonus points when the large food is caught quickly', () => {
      const now = 1_000;
      const largeFood = createLargeBonusFood({ x: 3, y: 3 }, now);

      expect(calculateBonusFoodPoints(largeFood, now)).toBe(BONUS_FOOD_CONFIG.MAX_POINTS);
      expect(calculateBonusFoodPoints(largeFood, now + BONUS_FOOD_CONFIG.LIFETIME_MS)).toBe(BONUS_FOOD_CONFIG.MIN_POINTS);
    });
  });

  describe('Speed milestones', () => {
    it('should report remaining food to next speed increase', () => {
      expect(getNextSpeedMilestone(0)).toBe(3);
      expect(getNextSpeedMilestone(1)).toBe(2);
      expect(getNextSpeedMilestone(3)).toBe(3);
    });

    it('counts bonus food points as food-equivalent speed progress', () => {
      expect(getSpeedProgressUnits({
        mode: GAME_MODES.CLASSIC,
        foodEaten: 50,
        bonusFoodPoints: 10
      })).toBe(52);
    });

    it('normalizes competitive food progress against score pace', () => {
      expect(getSpeedProgressUnits({
        mode: GAME_MODES.MULTIPLAYER,
        foodEaten: 10,
        bonusFoodPoints: 0
      })).toBe(20);

      expect(getSpeedProgressUnits({
        mode: GAME_MODES.VS_AI,
        difficulty: AI_DIFFICULTIES.IMPOSSIBLE,
        foodEaten: 5,
        bonusFoodPoints: 0
      })).toBe(20);
    });

    it('uses mode-aware milestones', () => {
      expect(getNextSpeedMilestone(20, { mode: GAME_MODES.CLASSIC })).toBe(1);
      expect(getNextSpeedMilestone(20, { mode: GAME_MODES.MULTIPLAYER })).toBe(4);
    });

    it('uses the tuned solo threshold for classic modes', () => {
      expect(getNextSpeedMilestone(0, { mode: GAME_MODES.CLASSIC })).toBe(3);
      expect(getNextSpeedMilestone(2, { mode: GAME_MODES.CLASSIC })).toBe(1);
      expect(getNextSpeedMilestone(3, { mode: GAME_MODES.CLASSIC })).toBe(3);
      expect(calculateSpeed(3, { mode: GAME_MODES.CLASSIC }))
        .toBe(SPEED_CONFIGS.INITIAL - SPEED_CONFIGS.INCREMENT);
      expect(calculateSpeed(6, { mode: GAME_MODES.CLASSIC }))
        .toBe(SPEED_CONFIGS.INITIAL - (SPEED_CONFIGS.INCREMENT * 2));
    });
  });

  describe('VS AI result resolution', () => {
    it('should return player when user score is greater', () => {
      expect(resolveVsAiWinner(120, 90)).toBe('player');
    });

    it('should return ai on tie or lower player score', () => {
      expect(resolveVsAiWinner(100, 100)).toBe('ai');
      expect(resolveVsAiWinner(80, 100)).toBe('ai');
    });
  });

  describe('Direction helpers', () => {
    it('returns the correct opposite direction for canonical directions', () => {
      expect(getOppositeDirection(DIRECTIONS.UP)).toEqual(DIRECTIONS.DOWN);
      expect(getOppositeDirection(DIRECTIONS.DOWN)).toEqual(DIRECTIONS.UP);
      expect(getOppositeDirection(DIRECTIONS.LEFT)).toEqual(DIRECTIONS.RIGHT);
      expect(getOppositeDirection(DIRECTIONS.RIGHT)).toEqual(DIRECTIONS.LEFT);
    });
  });

  describe('Qualified competitive streak wins', () => {
    it('counts multiplayer victories as qualified', () => {
      expect(isQualifiedCompetitiveWin({
        mode: GAME_MODES.MULTIPLAYER,
        victory: true,
        playerScore: 10
      })).toBe(true);
    });

    it('requires score greater than 100 for VS AI victories', () => {
      expect(isQualifiedCompetitiveWin({
        mode: GAME_MODES.VS_AI,
        victory: true,
        playerScore: 100
      })).toBe(false);
      expect(isQualifiedCompetitiveWin({
        mode: GAME_MODES.VS_AI,
        victory: true,
        playerScore: 101
      })).toBe(true);
    });

    it('never counts losses or ties as qualified wins', () => {
      expect(isQualifiedCompetitiveWin({
        mode: GAME_MODES.VS_AI,
        victory: false,
        playerScore: 200
      })).toBe(false);
    });
  });

});
