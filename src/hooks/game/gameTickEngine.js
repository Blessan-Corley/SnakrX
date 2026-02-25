import { prepareFoodForTick, resolvePostMoveFood } from './tickEngine/foodState.js';
import { resolveGameOutcome } from './tickEngine/outcome.js';
import {
  buildUpdatedStateFromTick,
  getTotalNormalFoodConsumed
} from './tickEngine/stateUpdates.js';

export const applyQueuedDirections = (snakes, pendingDirectionQueuesRef) =>
  snakes.map((snake, snakeId) => {
    if (!snake || snake.isAI || !snake.isAlive) return snake;

    const queue = pendingDirectionQueuesRef.current.get(snakeId);
    if (!queue?.length) return snake;

    const nextDirection = queue.shift();
    if (!queue.length) {
      pendingDirectionQueuesRef.current.delete(snakeId);
    }

    return { ...snake, direction: nextDirection };
  });

export {
  prepareFoodForTick,
  resolvePostMoveFood,
  resolveGameOutcome,
  buildUpdatedStateFromTick,
  getTotalNormalFoodConsumed
};
