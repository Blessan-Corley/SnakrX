import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AIStrategy, AIController } from './aiPathfinding.js';
import { DIRECTIONS } from './gameUtils.js';

describe('VS AI Mode Mechanics', () => {
  const boardSize = { width: 20, height: 20 };
  let aiStrategy;

  beforeEach(() => {
    // Default to medium
    aiStrategy = new AIStrategy(boardSize.width, boardSize.height, 'medium');
  });

  describe('Difficulty Levels', () => {
    it('should have correct settings for Easy', () => {
      aiStrategy = new AIStrategy(boardSize.width, boardSize.height, 'easy');
      const settings = aiStrategy.settings.easy;
      expect(settings.optimality).toBe(0.65);
      expect(settings.lookAhead).toBe(2);
      expect(settings.reactionTime).toBe(0);
    });

    it('should have correct settings for Medium', () => {
      const settings = aiStrategy.settings.medium;
      expect(settings.optimality).toBe(0.90);
      expect(settings.lookAhead).toBe(5);
      expect(settings.reactionTime).toBe(0);
    });

    it('should have correct settings for Impossible', () => {
      aiStrategy = new AIStrategy(boardSize.width, boardSize.height, 'impossible');
      const settings = aiStrategy.settings.impossible;
      expect(settings.optimality).toBe(1.0);
      expect(settings.lookAhead).toBe(10);
      expect(settings.reactionTime).toBe(0);
      expect(settings.aggressiveness).toBe(1.0);
    });
  });

  describe('Pathfinding Logic (A*)', () => {
    it('should find path to food when unobstructed', () => {
      const snake = [{ x: 5, y: 5 }];
      const food = { x: 5, y: 7 }; // 2 steps down
      const obstacles = [];
      const otherSnakes = [];

      // Force optimal move for test
      vi.spyOn(Math, 'random').mockReturnValue(0); // 0 < optimality (always true)

      const move = aiStrategy.getOptimalMove(snake[0], food, snake, obstacles, otherSnakes, aiStrategy.settings.medium);
      
      expect(move).toEqual(DIRECTIONS.DOWN);
    });

    it('should avoid simple obstacles', () => {
      const snake = [{ x: 5, y: 5 }];
      const food = { x: 5, y: 7 };
      // Obstacle directly in path (5, 6)
      const obstacles = [{ x: 5, y: 6 }];
      
      vi.spyOn(Math, 'random').mockReturnValue(0);

      const move = aiStrategy.getOptimalMove(snake[0], food, snake, obstacles, [], aiStrategy.settings.medium);
      
      // Should go LEFT or RIGHT to go around, not DOWN
      expect(move).not.toEqual(DIRECTIONS.DOWN);
      // Valid moves are LEFT, RIGHT, UP (but UP is away). 
      // A* usually picks one. Let's just ensure it's not the obstacle.
      const newPos = { x: 5 + move.x, y: 5 + move.y };
      expect(newPos).not.toEqual(obstacles[0]);
    });
  });

  describe('Impossible AI behavior', () => {
    it('chooses a deterministic optimal move toward food without randomness', () => {
      aiStrategy = new AIStrategy(boardSize.width, boardSize.height, 'impossible');

      const snake = [{ x: 5, y: 5 }, { x: 4, y: 5 }];
      const food = { x: 8, y: 5 };

      const firstMove = aiStrategy.getNextMove(snake, food, [], [[{ x: 15, y: 15 }]], 'vsai');
      const secondMove = aiStrategy.getNextMove(snake, food, [], [[{ x: 15, y: 15 }]], 'vsai');

      expect(firstMove).toEqual(DIRECTIONS.RIGHT);
      expect(secondMove).toEqual(DIRECTIONS.RIGHT);
    });

    it('avoids direct head-on tiles in impossible mode', () => {
      aiStrategy = new AIStrategy(boardSize.width, boardSize.height, 'impossible');

      const aiSnake = [{ x: 5, y: 5 }];
      const playerSnake = [{ x: 7, y: 5 }];
      const food = { x: 8, y: 5 };

      const move = aiStrategy.getNextMove(aiSnake, food, [], [playerSnake], 'vsai');
      expect(move).not.toEqual(DIRECTIONS.RIGHT);
    });

    it('AIController does not apply anti-stuck detours in impossible mode', () => {
      const controller = new AIController(boardSize.width, boardSize.height, 'impossible');
      const food = { x: 12, y: 5 };
      const other = [{ x: 18, y: 18 }];

      const snakeA = [{ x: 5, y: 5 }, { x: 4, y: 5 }];
      const moveA = controller.getNextMove(snakeA, food, [], [other], 'vsai');
      expect(moveA).toEqual(DIRECTIONS.RIGHT);

      // Advance one tile in the chosen direction and query again.
      const snakeB = [{ x: 6, y: 5 }, { x: 5, y: 5 }];
      const moveB = controller.getNextMove(snakeB, food, [], [other], 'vsai');
      expect(moveB).toEqual(DIRECTIONS.RIGHT);
    });
  });

  describe('Safety Logic', () => {
    it('should identify unsafe moves (walls)', () => {
      const head = { x: 0, y: 0 };
      const snake = [head];
      const obstacles = [];
      const otherSnakes = [];
      
      // Moving LEFT (-1, 0) or UP (0, -1) would hit walls
      // args: position, snake, obstacles, otherSnakes, minDistance, gameMode
      const isLeftSafe = aiStrategy.isSafeMoveWithDistance({ x: -1, y: 0 }, snake, obstacles, otherSnakes, 0, 'classic');
      const isUpSafe = aiStrategy.isSafeMoveWithDistance({ x: 0, y: -1 }, snake, obstacles, otherSnakes, 0, 'classic');
      const isRightSafe = aiStrategy.isSafeMoveWithDistance({ x: 1, y: 0 }, snake, obstacles, otherSnakes, 0, 'classic');

      expect(isLeftSafe).toBe(false);
      expect(isUpSafe).toBe(false);
      expect(isRightSafe).toBe(true);
    });

    it('should identify self-collision', () => {
      // Snake: (5,5), (4,5), (4,6), (5,6) - forming a 'U' shape
      // Moving DOWN (0,1) from (5,5) leads to a body segment.
      const longSnake = [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 4, y: 6 }, { x: 5, y: 6 }, { x: 6, y: 6 }];
      
      // Target position (5,6) is a body part
      const isSafe = aiStrategy.isSafeMoveWithDistance({ x: 5, y: 6 }, longSnake, [], [], 0, 'classic');
      expect(isSafe).toBe(false);
    });

    it('should not block all medium moves because of current head distance', () => {
      const head = { x: 10, y: 10 };
      const snake = [head, { x: 9, y: 10 }, { x: 8, y: 10 }];
      const isSafe = aiStrategy.isSafeMoveWithDistance(
        { x: 11, y: 10 },
        snake,
        [],
        [],
        aiStrategy.settings.medium.safetyDistance,
        'vsai',
        aiStrategy.settings.medium
      );
      expect(isSafe).toBe(true);
    });

    it('should avoid moving directly into player head lane in vsai for medium+', () => {
      const aiSnake = [{ x: 5, y: 5 }];
      const playerSnake = [{ x: 7, y: 5 }];
      const settings = aiStrategy.settings.medium;

      // Moving RIGHT to (6,5) is dangerous because player can move LEFT into same tile.
      const riskyMove = aiStrategy.isSafeMoveWithDistance(
        { x: 6, y: 5 },
        aiSnake,
        [],
        [playerSnake],
        settings.safetyDistance,
        'vsai',
        settings
      );
      expect(riskyMove).toBe(false);
    });
  });
});
