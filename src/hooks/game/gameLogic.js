/**
 * Game Logic Functions
 * Core game mechanics and collision detection
 */

import { GAME_MODES } from './constants.js';
import { generateFoodPosition } from '../../utils/gameUtils.js';
import { playFoodEat, playDeath } from '../../utils/sound.js';
import logger from '../../utils/logger.js';

/**
 * Update all snakes' positions and handle collisions
 */
export const updateSnakesPosition = (snakes, food, boardSize, gameMode, aiControllers) => {
  const newSnakes = [...snakes];
  let newFood = Array.isArray(food) ? [...food] : (food ? [food] : []); // Normalize to array
  let foodConsumed = false;
  const events = []; // Track game events for stats

  // Multiplayer Specific: Filter out completely dead snakes for collision purposes if needed? 
  // User says: "when some snake moves through it it wont do anything even if the snake moves through the dead snake head"
  // So dead snakes are Ghosts.

  for (let i = 0; i < newSnakes.length; i++) {
    const snake = newSnakes[i];

    // Skip dead snakes - they don't move
    if (!snake.isAlive) continue;

    let direction = snake.direction;

    // AI movement
    if (snake.isAI && aiControllers[i]) {
      try {
        // AI targets the closest food
        // Sort foods by distance to head
        let targetFood = newFood[0];
        if (newFood.length > 1) {
            const head = snake.body[0];
            targetFood = newFood.reduce((closest, current) => {
                const distCurrent = Math.abs(current.x - head.x) + Math.abs(current.y - head.y);
                const distClosest = Math.abs(closest.x - head.x) + Math.abs(closest.y - head.y);
                return distCurrent < distClosest ? current : closest;
            }, newFood[0]);
        }

        const aiDirection = aiControllers[i].getNextMove(
          snake.body,
          targetFood,
          newSnakes.filter((_, idx) => idx !== i), // Pass all snakes (AI handles filtering ghost/heads)
          boardSize,
          gameMode
        );

        if (aiDirection && typeof aiDirection.x === 'number' && typeof aiDirection.y === 'number') {
          direction = aiDirection;
        }
      } catch (error) {
        logger.error('AI error:', error);
      }
    }

    // Calculate new head position
    const head = snake.body[0];
    if (!head || typeof head.x !== 'number' || typeof head.y !== 'number') {
      logger.error(`Invalid head position for snake ${i}:`, head);
      snake.isAlive = false;
      continue;
    }

    const newHead = {
      x: head.x + direction.x,
      y: head.y + direction.y
    };

    // Wall collision
    let wallCollision = false;
    if (gameMode !== GAME_MODES.CLASSIC_TRANSPARENT) {
      if (newHead.x < 0 || newHead.x >= boardSize.width ||
          newHead.y < 0 || newHead.y >= boardSize.height) {
        wallCollision = true;
      }
    } else {
      // Transparent mode - wrap around
      newHead.x = (newHead.x + boardSize.width) % boardSize.width;
      newHead.y = (newHead.y + boardSize.height) % boardSize.height;
    }

    if (wallCollision) {
        newSnakes[i] = { ...snake, isAlive: false };
        playDeath('wall');
        events.push({ type: 'DEATH', cause: 'WALL', snakeId: i });
        continue;
    }

    // Self collision check
    for (let j = 1; j < snake.body.length; j++) {
      const segment = snake.body[j];
      if (newHead.x === segment.x && newHead.y === segment.y) {
        newSnakes[i] = { ...snake, isAlive: false };
        playDeath('self');
        events.push({ type: 'DEATH', cause: 'SELF', snakeId: i });
        break;
      }
    }

    if (!newSnakes[i].isAlive) continue;

    // Collision with other snakes
    if (gameMode !== GAME_MODES.VS_AI) {
        // Standard Multiplayer Logic: Body collision kills
        for (let j = 0; j < newSnakes.length; j++) {
          if (i === j) continue;
          
          const otherSnake = newSnakes[j];
          // Ghost Rule: Ignore dead snakes
          if (!otherSnake.isAlive) continue;

          for (const segment of otherSnake.body) {
            if (newHead.x === segment.x && newHead.y === segment.y) {
              newSnakes[i] = { ...snake, isAlive: false };
              playDeath('other');
              events.push({ type: 'DEATH', cause: 'OTHER', snakeId: i });
              break;
            }
          }

          if (!newSnakes[i].isAlive) break;
        }
    } else {
        // VS AI Logic: Ghost Mode (Pass through bodies), Head-to-Head is Draw/Crash
        for (let j = 0; j < newSnakes.length; j++) {
            if (i === j) continue;
            const otherSnake = newSnakes[j];
            if (!otherSnake.isAlive) continue; // Ignore dead AI

            const otherHead = otherSnake.body[0];
            if (otherHead && newHead.x === otherHead.x && newHead.y === otherHead.y) {
                 newSnakes[i] = { ...snake, isAlive: false };
                 newSnakes[j] = { ...otherSnake, isAlive: false };
                 playDeath('other');
                 events.push({ type: 'DEATH', cause: 'HEAD_ON', snakeId: i });
                 events.push({ type: 'DEATH', cause: 'HEAD_ON', snakeId: j });
            }
        }
    }

    if (!newSnakes[i].isAlive) continue;

    // Move successful
    events.push({ type: 'MOVE', snakeId: i });

    // Food collision (Handle Multiple Foods)
    let eatenFoodIndex = -1;
    for (let f = 0; f < newFood.length; f++) {
        if (newFood[f] && newHead.x === newFood[f].x && newHead.y === newFood[f].y) {
            eatenFoodIndex = f;
            break;
        }
    }

    if (eatenFoodIndex !== -1) {
      foodConsumed = true;
      playFoodEat();
      logger.log(`Snake ${i} ate food at:`, newFood[eatenFoodIndex]);
      events.push({ type: 'EAT', snakeId: i });
      
      // Remove the eaten food
      newFood.splice(eatenFoodIndex, 1);

      newSnakes[i] = {
        ...snake,
        body: [newHead, ...snake.body],
        direction
      };
    } else {
      // Move without growing
      newSnakes[i] = {
        ...snake,
        body: [newHead, ...snake.body.slice(0, -1)],
        direction
      };
    }
  }

  // Generate new food if needed
  // Classic/VS AI: Keep 1 food
  if ((gameMode === GAME_MODES.CLASSIC || gameMode === GAME_MODES.CLASSIC_TRANSPARENT || gameMode === GAME_MODES.VS_AI) && newFood.length === 0) {
      const allSnakeBodies = newSnakes.flatMap(s => s.body);
      newFood.push(generateFoodPosition(boardSize.width, boardSize.height, allSnakeBodies));
  }
  // Multiplayer: Dynamic Food Spawning handled by hook (timing based), but ensure at least 1 exists?
  // User says "spawn one by one randomly... 1-3... 2-5". 
  // We will leave the "spawning over time" to the main loop or a separate effect, 
  // but here we ensure if ALL food is gone, maybe spawn one immediately to keep game flowing?
  // Let's stick to the rule: "As users collect it, spawn one by one".
  // So if eaten, we can spawn a replacement immediately OR let the interval handle it.
  // "as the users collecct it spawn one by one and goes on" -> Immediate replacement seems implied for flow.
  
  if (gameMode === GAME_MODES.MULTIPLAYER && foodConsumed) {
      // Spawn replacement for eaten food
      const allSnakeBodies = newSnakes.flatMap(s => s.body);
      // Ensure we don't exceed max food limit (handled by state, but here we just replace what was eaten)
      newFood.push(generateFoodPosition(boardSize.width, boardSize.height, allSnakeBodies));
  }

  // Return formatted based on input (if input was object, return object? No, unify to array for state)
  // But legacy code in useGame expects 'food' object? We need to update useGame.
  
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