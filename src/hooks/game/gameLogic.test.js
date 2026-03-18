import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateSnakesPosition } from './gameLogic.js';
import { GAME_MODES } from './constants.js';
import { createLargeBonusFood, FOOD_TYPES } from '../../utils/gameUtils.js';

describe('Game Logic - Edge Cases & Modes', () => {
  const boardSize = { width: 10, height: 10 };
  const mockAI = {};

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Classic Transparent Mode', () => {
    it('should wrap around the right wall to the left', () => {
      const snakes = [{
        id: 0, isAlive: true,
        body: [{ x: 9, y: 5 }], // Right edge
        direction: { x: 1, y: 0 } // Moving Right
      }];
      
      const result = updateSnakesPosition(snakes, null, boardSize, GAME_MODES.CLASSIC_TRANSPARENT, mockAI);
      
      expect(result.snakes[0].isAlive).toBe(true);
      expect(result.snakes[0].body[0]).toEqual({ x: 0, y: 5 }); // Wrapped to 0
    });

    it('should wrap around the left wall to the right', () => {
      const snakes = [{
        id: 0, isAlive: true,
        body: [{ x: 0, y: 5 }], // Left edge
        direction: { x: -1, y: 0 } // Moving Left
      }];
      
      const result = updateSnakesPosition(snakes, null, boardSize, GAME_MODES.CLASSIC_TRANSPARENT, mockAI);
      
      expect(result.snakes[0].isAlive).toBe(true);
      expect(result.snakes[0].body[0]).toEqual({ x: 9, y: 5 }); // Wrapped to 9
    });

    it('should wrap around the top wall to the bottom', () => {
      const snakes = [{
        id: 0, isAlive: true,
        body: [{ x: 5, y: 0 }], // Top edge
        direction: { x: 0, y: -1 } // Moving Up
      }];
      
      const result = updateSnakesPosition(snakes, null, boardSize, GAME_MODES.CLASSIC_TRANSPARENT, mockAI);
      
      expect(result.snakes[0].isAlive).toBe(true);
      expect(result.snakes[0].body[0]).toEqual({ x: 5, y: 9 }); // Wrapped to 9
    });

    it('should wrap around the bottom wall to the top', () => {
      const snakes = [{
        id: 0, isAlive: true,
        body: [{ x: 5, y: 9 }], // Bottom edge
        direction: { x: 0, y: 1 } // Moving Down
      }];
      
      const result = updateSnakesPosition(snakes, null, boardSize, GAME_MODES.CLASSIC_TRANSPARENT, mockAI);
      
      expect(result.snakes[0].isAlive).toBe(true);
      expect(result.snakes[0].body[0]).toEqual({ x: 5, y: 0 }); // Wrapped to 0
    });

    it('should still die on self-collision even in transparent mode', () => {
      // Create a snake wrapped around itself
      const snakes = [{
        id: 0, isAlive: true,
        body: [
          { x: 5, y: 5 }, { x: 4, y: 5 }, { x: 4, y: 6 }, { x: 5, y: 6 }, { x: 5, y: 7 }
        ],
        direction: { x: 0, y: 1 } // Moving DOWN into (5,6)
      }];
      
      const result = updateSnakesPosition(snakes, null, boardSize, GAME_MODES.CLASSIC_TRANSPARENT, mockAI);
      
      expect(result.snakes[0].isAlive).toBe(false); // Should die
    });

    it('should die when a wall wrap moves the head into its own body', () => {
      const snakes = [{
        id: 0,
        isAlive: true,
        body: [
          { x: 0, y: 5 },
          { x: 0, y: 6 },
          { x: 9, y: 6 },
          { x: 9, y: 5 },
          { x: 8, y: 5 }
        ],
        direction: { x: -1, y: 0 }
      }];

      const result = updateSnakesPosition(snakes, null, boardSize, GAME_MODES.CLASSIC_TRANSPARENT, mockAI);

      expect(result.snakes[0].isAlive).toBe(false);
      expect(result.events).toContainEqual(expect.objectContaining({
        type: 'DEATH',
        cause: 'SELF',
        snakeId: 0,
        position: { x: 9, y: 5 }
      }));
    });
  });

  describe('Classic Mode Edge Cases', () => {
    it('should die exactly on the boundary (width)', () => {
      const snakes = [{
        id: 0, isAlive: true,
        body: [{ x: 9, y: 5 }],
        direction: { x: 1, y: 0 }
      }];
      // Next pos is (10, 5) -> Out of bounds (0-9)
      const result = updateSnakesPosition(snakes, null, boardSize, GAME_MODES.CLASSIC, mockAI);
      expect(result.snakes[0].isAlive).toBe(false);
    });

    it('should die exactly on the boundary (negative)', () => {
      const snakes = [{
        id: 0, isAlive: true,
        body: [{ x: 0, y: 5 }],
        direction: { x: -1, y: 0 }
      }];
      // Next pos is (-1, 5) -> Out of bounds
      const result = updateSnakesPosition(snakes, null, boardSize, GAME_MODES.CLASSIC, mockAI);
      expect(result.snakes[0].isAlive).toBe(false);
    });

    it('allows moving into the tail cell when the tail vacates on the same tick', () => {
      const snakes = [{
        id: 0,
        isAlive: true,
        body: [
          { x: 2, y: 2 },
          { x: 2, y: 3 },
          { x: 1, y: 3 },
          { x: 1, y: 2 }
        ],
        direction: { x: -1, y: 0 }
      }];

      const result = updateSnakesPosition(snakes, null, boardSize, GAME_MODES.CLASSIC, mockAI);

      expect(result.snakes[0].isAlive).toBe(true);
      expect(result.snakes[0].body[0]).toEqual({ x: 1, y: 2 });
      expect(result.events).not.toContainEqual(expect.objectContaining({ type: 'DEATH', snakeId: 0 }));
    });
  });

  describe('Events & Stats Tracking', () => {
    it('should return correct events for death', () => {
      const snakes = [{
        id: 0, isAlive: true,
        body: [{ x: 0, y: 0 }],
        direction: { x: -1, y: 0 }
      }];
      
      const result = updateSnakesPosition(snakes, null, boardSize, GAME_MODES.CLASSIC, mockAI);
      
      expect(result.events).toContainEqual(expect.objectContaining({ 
        type: 'DEATH', 
        cause: 'WALL', 
        snakeId: 0 
      }));
    });

    it('should return correct events for eating', () => {
      const snakes = [{
        id: 0, isAlive: true,
        body: [{ x: 5, y: 5 }],
        direction: { x: 1, y: 0 }
      }];
      const food = { x: 6, y: 5 };
      
      const result = updateSnakesPosition(snakes, food, boardSize, GAME_MODES.CLASSIC, mockAI);
      
      expect(result.events).toContainEqual(expect.objectContaining({ 
        type: 'EAT', 
        snakeId: 0 
      }));
    });

    it('treats the large bonus food as score-only and does not grow the snake', () => {
      const snakes = [{
        id: 0,
        isAlive: true,
        body: [{ x: 4, y: 5 }, { x: 3, y: 5 }],
        direction: { x: 1, y: 0 }
      }];
      const bonusFood = createLargeBonusFood({ x: 5, y: 4 }, 1_000);

      const result = updateSnakesPosition(snakes, [bonusFood], boardSize, GAME_MODES.CLASSIC, mockAI);

      expect(result.events).toContainEqual(expect.objectContaining({
        type: 'BONUS_EAT',
        snakeId: 0,
        points: expect.any(Number)
      }));
      expect(result.snakes[0].body.length).toBe(2);
      expect(result.food.some((item) => item?.type === FOOD_TYPES.NORMAL)).toBe(true);
    });

    it('keeps multiplayer bonus food alive after one player claims it', () => {
      const snakes = [
        {
          id: 0,
          isAlive: true,
          body: [{ x: 4, y: 5 }],
          direction: { x: 1, y: 0 }
        },
        {
          id: 1,
          isAlive: true,
          body: [{ x: 0, y: 0 }],
          direction: { x: 1, y: 0 }
        }
      ];
      const bonusFood = createLargeBonusFood({ x: 5, y: 4 }, 1_000);

      const result = updateSnakesPosition(snakes, [bonusFood], boardSize, GAME_MODES.MULTIPLAYER, mockAI);

      expect(result.events).toContainEqual(expect.objectContaining({
        type: 'BONUS_EAT',
        snakeId: 0
      }));
      expect(result.food).toContainEqual(expect.objectContaining({
        type: FOOD_TYPES.BONUS_LARGE,
        claimedBy: [0]
      }));
    });

    it('prevents the same multiplayer player from claiming the same bonus twice', () => {
      const bonusFood = createLargeBonusFood({ x: 5, y: 4 }, 1_000);
      const firstClaim = updateSnakesPosition([
        {
          id: 0,
          isAlive: true,
          body: [{ x: 4, y: 5 }],
          direction: { x: 1, y: 0 }
        },
        {
          id: 1,
          isAlive: true,
          body: [{ x: 0, y: 0 }],
          direction: { x: 1, y: 0 }
        }
      ], [bonusFood], boardSize, GAME_MODES.MULTIPLAYER, mockAI);

      const secondClaim = updateSnakesPosition([
        {
          id: 0,
          isAlive: true,
          body: [{ x: 5, y: 5 }],
          direction: { x: 0, y: -1 }
        },
        {
          id: 1,
          isAlive: true,
          body: [{ x: 0, y: 1 }],
          direction: { x: 1, y: 0 }
        }
      ], firstClaim.food, boardSize, GAME_MODES.MULTIPLAYER, mockAI);

      expect(secondClaim.events).not.toContainEqual(expect.objectContaining({
        type: 'BONUS_EAT',
        snakeId: 0
      }));
      expect(secondClaim.food).toContainEqual(expect.objectContaining({
        type: FOOD_TYPES.BONUS_LARGE,
        claimedBy: [0]
      }));
    });

    it('removes multiplayer bonus food after every player has claimed it', () => {
      const bonusFood = createLargeBonusFood({ x: 5, y: 4 }, 1_000);
      const firstClaim = updateSnakesPosition([
        {
          id: 0,
          isAlive: true,
          body: [{ x: 4, y: 5 }],
          direction: { x: 1, y: 0 }
        },
        {
          id: 1,
          isAlive: true,
          body: [{ x: 4, y: 4 }],
          direction: { x: 0, y: -1 }
        }
      ], [bonusFood], boardSize, GAME_MODES.MULTIPLAYER, mockAI);

      const secondClaim = updateSnakesPosition([
        {
          id: 0,
          isAlive: true,
          body: [{ x: 5, y: 5 }],
          direction: { x: 1, y: 0 }
        },
        {
          id: 1,
          isAlive: true,
          body: [{ x: 5, y: 3 }],
          direction: { x: 0, y: 1 }
        }
      ], firstClaim.food, boardSize, GAME_MODES.MULTIPLAYER, mockAI);

      expect(secondClaim.events).toContainEqual(expect.objectContaining({
        type: 'BONUS_EAT',
        snakeId: 1
      }));
      expect(secondClaim.food.some((item) => item?.type === FOOD_TYPES.BONUS_LARGE)).toBe(false);
    });

    it('keeps bonus food single-claim in VS AI mode', () => {
      const snakes = [
        {
          id: 0,
          isAlive: true,
          body: [{ x: 4, y: 5 }],
          direction: { x: 1, y: 0 }
        },
        {
          id: 1,
          isAlive: true,
          isAI: true,
          body: [{ x: 9, y: 9 }],
          direction: { x: -1, y: 0 }
        }
      ];
      const bonusFood = createLargeBonusFood({ x: 5, y: 4 }, 1_000);

      const result = updateSnakesPosition(snakes, [bonusFood], boardSize, GAME_MODES.VS_AI, mockAI);

      expect(result.events).toContainEqual(expect.objectContaining({
        type: 'BONUS_EAT',
        snakeId: 0
      }));
      expect(result.food.some((item) => item?.type === FOOD_TYPES.BONUS_LARGE)).toBe(false);
    });
  });

  describe('Head-on collision behavior', () => {
    it('should kill both snakes when they move into the same cell', () => {
      const snakes = [
        { id: 0, isAlive: true, body: [{ x: 4, y: 5 }], direction: { x: 1, y: 0 } },
        { id: 1, isAlive: true, body: [{ x: 6, y: 5 }], direction: { x: -1, y: 0 } }
      ];
      const result = updateSnakesPosition(snakes, null, boardSize, GAME_MODES.MULTIPLAYER, mockAI);
      expect(result.snakes[0].isAlive).toBe(false);
      expect(result.snakes[1].isAlive).toBe(false);
      expect(result.events).toContainEqual(expect.objectContaining({ type: 'DEATH', cause: 'HEAD_ON', snakeId: 0 }));
      expect(result.events).toContainEqual(expect.objectContaining({ type: 'DEATH', cause: 'HEAD_ON', snakeId: 1 }));
    });
  });

  describe('Ghosting behavior in competitive modes', () => {
    it('allows player head to pass through AI body in VS AI mode', () => {
      const snakes = [
        { id: 0, isAlive: true, body: [{ x: 4, y: 5 }], direction: { x: 1, y: 0 } },
        {
          id: 1,
          isAlive: true,
          isAI: true,
          body: [{ x: 8, y: 8 }, { x: 5, y: 5 }],
          direction: { x: 0, y: 1 }
        }
      ];

      const result = updateSnakesPosition(snakes, null, boardSize, GAME_MODES.VS_AI, mockAI);

      expect(result.snakes[0].isAlive).toBe(true);
      expect(result.snakes[0].body[0]).toEqual({ x: 5, y: 5 });
      expect(result.events).not.toContainEqual(expect.objectContaining({ type: 'DEATH', snakeId: 0 }));
    });

    it('allows player head to pass through another player body in multiplayer mode', () => {
      const snakes = [
        { id: 0, isAlive: true, body: [{ x: 2, y: 2 }], direction: { x: 1, y: 0 } },
        { id: 1, isAlive: true, body: [{ x: 7, y: 7 }, { x: 3, y: 2 }], direction: { x: 0, y: 1 } }
      ];

      const result = updateSnakesPosition(snakes, null, boardSize, GAME_MODES.MULTIPLAYER, mockAI);

      expect(result.snakes[0].isAlive).toBe(true);
      expect(result.snakes[0].body[0]).toEqual({ x: 3, y: 2 });
      expect(result.events).not.toContainEqual(expect.objectContaining({ type: 'DEATH', snakeId: 0 }));
    });

    it('still kills snake on wall collision in VS AI mode', () => {
      const snakes = [
        { id: 0, isAlive: true, body: [{ x: 0, y: 0 }], direction: { x: -1, y: 0 } },
        { id: 1, isAlive: true, isAI: true, body: [{ x: 8, y: 8 }], direction: { x: 0, y: 1 } }
      ];

      const result = updateSnakesPosition(snakes, null, boardSize, GAME_MODES.VS_AI, mockAI);

      expect(result.snakes[0].isAlive).toBe(false);
      expect(result.events).toContainEqual(
        expect.objectContaining({ type: 'DEATH', cause: 'WALL', snakeId: 0 })
      );
    });
  });
});
