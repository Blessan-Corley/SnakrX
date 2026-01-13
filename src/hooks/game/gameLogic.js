/**
 * Game Logic Functions
 * Core game mechanics and collision detection
 */

import { GAME_MODES } from './constants.js';
import {
  calculateBonusFoodPoints,
  createNormalFood,
  FOOD_TYPES,
  generateFoodPosition,
  isBonusFood
} from '../../utils/gameUtils.js';
import { playBonusFoodCollect, playDeath, playFoodEat } from '../../utils/sound.js';
import logger from '../../utils/logger.js';
import {
  countSafeMoves,
  findFoodCollisionIndex,
  resolveAiDirection,
  willSnakeGrowAtPosition
} from './gameLogicHelpers.js';

/**
 * Update all snakes' positions and handle collisions
 */
export const updateSnakesPosition = (snakes, food, boardSize, gameMode, aiControllers) => {
  const newSnakes = snakes.map(snake => ({ ...snake }));
  let newFood = Array.isArray(food) ? [...food] : (food ? [food] : []); // Normalize to array
  let foodConsumed = false;
  const events = [];

  const nextHeads = [];
  const nextDirections = [];
  const wallCollisions = new Set();
  const selfCollisions = new Set();
  const headOnCollisions = new Set();
  const bodyCollisions = new Set();
  const snakeWillGrow = new Map();

  // First pass: compute next heads and directions
  for (let i = 0; i < newSnakes.length; i++) {
    const snake = newSnakes[i];
    if (!snake.isAlive) continue;

    const direction = resolveAiDirection({
      aiControllers,
      gameMode,
      logger,
      newFood,
      newSnakes,
      snake,
      snakeIndex: i
    });

    const head = snake.body[0];
    if (!head || typeof head.x !== 'number' || typeof head.y !== 'number') {
      logger.error(`Invalid head position for snake ${i}:`, head);
      snake.isAlive = false;
      continue;
    }

    let newHead = {
      x: head.x + direction.x,
      y: head.y + direction.y
    };

    if (gameMode !== GAME_MODES.CLASSIC_TRANSPARENT) {
      if (newHead.x < 0 || newHead.x >= boardSize.width ||
          newHead.y < 0 || newHead.y >= boardSize.height) {
        wallCollisions.add(i);
      }
    } else {
      newHead = {
        x: (newHead.x + boardSize.width) % boardSize.width,
        y: (newHead.y + boardSize.height) % boardSize.height
      };
    }

    nextHeads[i] = newHead;
    nextDirections[i] = direction;
  }

  // Self collisions
  for (let i = 0; i < newSnakes.length; i++) {
    const snake = newSnakes[i];
    if (!snake?.isAlive || wallCollisions.has(i)) continue;
    const nextHead = nextHeads[i];
    if (!nextHead) continue;

    const willGrow = willSnakeGrowAtPosition({
      foods: newFood,
      head: nextHead
    });
    snakeWillGrow.set(i, willGrow);
    const collisionLength = willGrow ? snake.body.length : Math.max(1, snake.body.length - 1);

    for (let j = 1; j < collisionLength; j++) {
      const segment = snake.body[j];
      if (nextHead.x === segment.x && nextHead.y === segment.y) {
        selfCollisions.add(i);
        break;
      }
    }
  }

  // Head-to-head collisions (simultaneous)
  if (gameMode === GAME_MODES.VS_AI || gameMode === GAME_MODES.MULTIPLAYER) {
    const headPositions = new Map();
    for (let i = 0; i < newSnakes.length; i++) {
      if (!newSnakes[i]?.isAlive || wallCollisions.has(i) || selfCollisions.has(i)) continue;
      const head = nextHeads[i];
      if (!head) continue;
      const key = `${head.x},${head.y}`;
      const list = headPositions.get(key) || [];
      list.push(i);
      headPositions.set(key, list);
    }
    for (const ids of headPositions.values()) {
      if (ids.length > 1) {
        ids.forEach(id => headOnCollisions.add(id));
      }
    }
  } else {
    // Classic modes: collide with other snake bodies
    for (let i = 0; i < newSnakes.length; i++) {
      if (!newSnakes[i]?.isAlive || wallCollisions.has(i) || selfCollisions.has(i)) continue;
      const nextHead = nextHeads[i];
      if (!nextHead) continue;
      for (let j = 0; j < newSnakes.length; j++) {
        if (i === j) continue;
        const otherSnake = newSnakes[j];
        if (!otherSnake?.isAlive) continue;
        for (const segment of otherSnake.body) {
          if (nextHead.x === segment.x && nextHead.y === segment.y) {
            bodyCollisions.add(i);
            break;
          }
        }
        if (bodyCollisions.has(i)) break;
      }
    }
  }

  // Apply deaths
  for (let i = 0; i < newSnakes.length; i++) {
    const snake = newSnakes[i];
    if (!snake?.isAlive) continue;
    if (wallCollisions.has(i)) {
      newSnakes[i] = { ...snake, isAlive: false };
      playDeath('wall');
      events.push({ type: 'DEATH', cause: 'WALL', snakeId: i, position: nextHeads[i] });
      continue;
    }
    if (selfCollisions.has(i)) {
      newSnakes[i] = { ...snake, isAlive: false };
      playDeath('self');
      events.push({ type: 'DEATH', cause: 'SELF', snakeId: i, position: nextHeads[i] });
      continue;
    }
    if (headOnCollisions.has(i)) {
      newSnakes[i] = { ...snake, isAlive: false };
      playDeath('other');
      events.push({ type: 'DEATH', cause: 'HEAD_ON', snakeId: i, position: nextHeads[i] });
      continue;
    }
    if (bodyCollisions.has(i)) {
      newSnakes[i] = { ...snake, isAlive: false };
      playDeath('other');
      events.push({ type: 'DEATH', cause: 'OTHER', snakeId: i, position: nextHeads[i] });
      continue;
    }
  }

  // Move surviving snakes and handle food
  for (let i = 0; i < newSnakes.length; i++) {
    const snake = newSnakes[i];
    if (!snake?.isAlive) continue;
    const newHead = nextHeads[i];
    const direction = nextDirections[i] || snake.direction;

    if (!newHead) continue;

    events.push({ type: 'MOVE', snakeId: i });

    const eatenFoodIndex = findFoodCollisionIndex({
      foods: newFood,
      head: newHead
    });

    if (eatenFoodIndex !== -1) {
      const eatenFood = newFood[eatenFoodIndex];
      logger.log(`Snake ${i} ate food at:`, eatenFood);

      if (isBonusFood(eatenFood)) {
        const claimedBy = Array.isArray(eatenFood.claimedBy) ? eatenFood.claimedBy : [];
        if (gameMode === GAME_MODES.MULTIPLAYER && claimedBy.includes(i)) {
          newSnakes[i] = {
            ...snake,
            body: [newHead, ...snake.body.slice(0, -1)],
            direction
          };
          continue;
        }

        playBonusFoodCollect();
        const updatedClaimedBy = gameMode === GAME_MODES.MULTIPLAYER
          ? [...new Set([...claimedBy, i])]
          : claimedBy;

        if (gameMode === GAME_MODES.MULTIPLAYER) {
          if (updatedClaimedBy.length >= newSnakes.length) {
            newFood.splice(eatenFoodIndex, 1);
          } else {
            newFood[eatenFoodIndex] = {
              ...eatenFood,
              claimedBy: updatedClaimedBy
            };
          }
        } else {
          newFood.splice(eatenFoodIndex, 1);
        }

        events.push({
          type: 'BONUS_EAT',
          snakeId: i,
          food: {
            ...eatenFood,
            claimedBy: updatedClaimedBy
          },
          points: calculateBonusFoodPoints(eatenFood)
        });
        newSnakes[i] = {
          ...snake,
          body: [newHead, ...snake.body.slice(0, -1)],
          direction
        };
      } else {
        playFoodEat();
        newFood.splice(eatenFoodIndex, 1);
        foodConsumed = true;
        events.push({ type: 'EAT', snakeId: i, food: eatenFood });
        newSnakes[i] = {
          ...snake,
          body: [newHead, ...snake.body],
          direction
        };
      }
    } else {
      newSnakes[i] = {
        ...snake,
        body: [newHead, ...snake.body.slice(0, -1)],
        direction
      };
    }

    if (!newSnakes[i].isAI && newSnakes[i].body.length >= 3) {
      const safeMoves = countSafeMoves(newHead, i, newSnakes, boardSize, gameMode);
      if (safeMoves <= 1) {
        events.push({ type: 'CLOSE_CALL', snakeId: i });
      }
    }
  }

  // Generate new food if needed
  // Classic/VS AI: Keep 1 food
  const activeNormalFoodCount = newFood.filter((foodItem) => foodItem?.type !== FOOD_TYPES.BONUS_LARGE).length;
  if ((gameMode === GAME_MODES.CLASSIC || gameMode === GAME_MODES.CLASSIC_TRANSPARENT || gameMode === GAME_MODES.VS_AI) && activeNormalFoodCount === 0) {
      const allSnakeBodies = newSnakes.flatMap(s => s.body);
      newFood.push(createNormalFood(
        generateFoodPosition(boardSize.width, boardSize.height, allSnakeBodies),
        Date.now()
      ));
  }
  // Multiplayer food pacing is handled elsewhere, but we immediately replace consumed food here so matches do not stall.

  if (gameMode === GAME_MODES.MULTIPLAYER && foodConsumed) {
      // Spawn replacement for eaten food
      const allSnakeBodies = newSnakes.flatMap(s => s.body);
      // Ensure we don't exceed max food limit (handled by state, but here we just replace what was eaten)
      newFood.push(createNormalFood(
        generateFoodPosition(boardSize.width, boardSize.height, allSnakeBodies),
        Date.now()
      ));
  }

  // Return formatted based on input (if input was object, return object? No, unify to array for state)
  
  return { snakes: newSnakes, food: newFood, foodConsumed, events };
};

/**
 * Check if direction change is valid (not opposite direction)
 */
export const isValidDirectionChange = (currentDirection, newDirection, snakeBody) => {
  // Check if it's the opposite direction
  const isOpposite =
    currentDirection.x === -newDirection.x &&
    currentDirection.y === -newDirection.y;

  if (isOpposite && snakeBody.length > 1) {
    return false;
  }

  return true;
};

