/**
 * SnakrX AI Pathfinding
 * Backwards-compatible barrel around modular AI implementation.
 */

export { AStarPathfinder } from './ai/AStarPathfinder.js';
export { AIStrategy } from './ai/AIStrategy.js';
export { AIController } from './ai/AIController.js';

import { AStarPathfinder } from './ai/AStarPathfinder.js';
import { AIStrategy } from './ai/AIStrategy.js';
import { AIController } from './ai/AIController.js';

export default {
  AStarPathfinder,
  AIStrategy,
  AIController
};
