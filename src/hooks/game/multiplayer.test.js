import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateSnakesPosition } from './gameLogic.js';
import { GAME_MODES } from './constants.js';

describe('Multiplayer Mode Mechanics', () => {
  const boardSize = { width: 20, height: 20 };
  const mockAI = {};

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Win Condition - Score Based', () => {
    it('should track food events for specific snakes', () => {
      const snakes = [
        { id: 0, isAlive: true, body: [{ x: 5, y: 5 }], direction: { x: 1, y: 0 } },
        { id: 1, isAlive: true, body: [{ x: 10, y: 10 }], direction: { x: 1, y: 0 } }
      ];
      // Food at (6,5) which Snake 0 will eat
      const food = [{ x: 6, y: 5 }];
      
      const result = updateSnakesPosition(snakes, food, boardSize, GAME_MODES.MULTIPLAYER, mockAI);
      
      // Snake 0 eats
      expect(result.events).toContainEqual(expect.objectContaining({ type: 'EAT', snakeId: 0 }));
      expect(result.foodConsumed).toBe(true);
      // Food should be respawned (so not empty, but different or same length)
      // Actually, updateSnakesPosition returns the NEW food array.
      // Since we didn't mock generateFoodPosition to return specific things, and we know logic respawns, 
      // the array should not be empty if logic is working (it was spliced then pushed).
      // However, if generateFoodPosition fails or returns something we can't predict easily without mock, 
      // let's just check length > 0 or that the eaten food is gone.
      // Wait, updateSnakesPosition removes the SPECIFIC eaten food.
      // And then pushes a NEW one if conditions met.
      // The food at (6,5) should definitely be gone.
      expect(result.food).not.toContainEqual({ x: 6, y: 5 });
    });
  });

  describe('Collision Rules - Ghost Mode', () => {
    it('should NOT die when hitting a dead snake (Ghost Mode)', () => {
      const snakes = [
        { id: 0, isAlive: true, body: [{ x: 5, y: 5 }], direction: { x: 1, y: 0 } }, // Moving right
        { id: 1, isAlive: false, body: [{ x: 6, y: 5 }], direction: { x: 0, y: 0 } } // Dead snake at (6,5)
      ];
      const food = [];
      
      const result = updateSnakesPosition(snakes, food, boardSize, GAME_MODES.MULTIPLAYER, mockAI);
      
      // Snake 0 should move into (6,5) and NOT die
      expect(result.snakes[0].isAlive).toBe(true);
      expect(result.snakes[0].body[0]).toEqual({ x: 6, y: 5 });
    });

    it('should NOT die when passing through a LIVE snake body', () => {
      const snakes = [
        { id: 0, isAlive: true, body: [{ x: 5, y: 5 }], direction: { x: 1, y: 0 } },
        { id: 1, isAlive: true, body: [{ x: 7, y: 5 }, { x: 6, y: 5 }], direction: { x: 0, y: 1 } } // Head at (7,5), body at (6,5)
      ];
      const food = [];
      
      const result = updateSnakesPosition(snakes, food, boardSize, GAME_MODES.MULTIPLAYER, mockAI);
      
      // Snake 0 moves into body position and survives (ghosting)
      expect(result.snakes[0].isAlive).toBe(true);
      expect(result.snakes[0].body[0]).toEqual({ x: 6, y: 5 });
    });

    it('should die on head-to-head collision', () => {
      const snakes = [
        { id: 0, isAlive: true, body: [{ x: 5, y: 5 }], direction: { x: 1, y: 0 } },
        { id: 1, isAlive: true, body: [{ x: 7, y: 5 }], direction: { x: -1, y: 0 } }
      ];
      const food = [];

      const result = updateSnakesPosition(snakes, food, boardSize, GAME_MODES.MULTIPLAYER, mockAI);

      expect(result.snakes[0].isAlive).toBe(false);
      expect(result.snakes[1].isAlive).toBe(false);
      expect(result.events).toContainEqual(expect.objectContaining({ type: 'DEATH', cause: 'HEAD_ON', snakeId: 0 }));
      expect(result.events).toContainEqual(expect.objectContaining({ type: 'DEATH', cause: 'HEAD_ON', snakeId: 1 }));
    });

    it('should NOT die when heads swap positions (no same-cell collision)', () => {
      const snakes = [
        { id: 0, isAlive: true, body: [{ x: 5, y: 5 }], direction: { x: 1, y: 0 } },
        { id: 1, isAlive: true, body: [{ x: 6, y: 5 }], direction: { x: -1, y: 0 } }
      ];
      const food = [];

      const result = updateSnakesPosition(snakes, food, boardSize, GAME_MODES.MULTIPLAYER, mockAI);

      expect(result.snakes[0].isAlive).toBe(true);
      expect(result.snakes[1].isAlive).toBe(true);
      expect(result.snakes[0].body[0]).toEqual({ x: 6, y: 5 });
      expect(result.snakes[1].body[0]).toEqual({ x: 5, y: 5 });
    });
  });
});
