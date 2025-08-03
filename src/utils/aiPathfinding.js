/**
 * SnakrX AI Pathfinding Algorithm
 * A* pathfinding and strategic AI decision making for different difficulty levels
 */

import { 
  DIRECTIONS, 
  positionsEqual, 
  isWithinBounds, 
  manhattanDistance,
  checkSelfCollision,
  checkSnakeCollision 
} from './gameUtils.js';

/**
 * A* Node class for pathfinding
 */
class AStarNode {
  constructor(position, gCost = 0, hCost = 0, parent = null) {
    this.position = position;
    this.gCost = gCost; // Distance from start
    this.hCost = hCost; // Distance to target (heuristic)
    this.fCost = gCost + hCost; // Total cost
    this.parent = parent;
  }

  equals(other) {
    return positionsEqual(this.position, other.position);
  }
}

/**
 * A* Pathfinding implementation
 */
export class AStarPathfinder {
  constructor(boardWidth, boardHeight) {
    this.boardWidth = boardWidth;
    this.boardHeight = boardHeight;
  }

  /**
   * Find path from start to target using A* algorithm
   */
  findPath(start, target, obstacles = [], maxIterations = 1000) {
    const openList = [];
    const closedList = [];
    
    // Add starting node to open list
    const startNode = new AStarNode(start, 0, this.getHeuristic(start, target));
    openList.push(startNode);
    
    let iterations = 0;
    
    while (openList.length > 0 && iterations < maxIterations) {
      iterations++;
      
      // Get node with lowest F cost
      const currentNode = openList.reduce((lowest, node) => 
        node.fCost < lowest.fCost ? node : lowest
      );
      
      // Remove current node from open list and add to closed list
      const currentIndex = openList.indexOf(currentNode);
      openList.splice(currentIndex, 1);
      closedList.push(currentNode);
      
      // Check if we reached the target
      if (positionsEqual(currentNode.position, target)) {
        return this.reconstructPath(currentNode);
      }
      
      // Check all neighbors
      const neighbors = this.getNeighbors(currentNode.position);
      
      for (const neighborPos of neighbors) {
        // Skip if position is an obstacle or out of bounds
        if (this.isObstacle(neighborPos, obstacles) || 
            !isWithinBounds(neighborPos, this.boardWidth, this.boardHeight)) {
          continue;
        }
        
        // Skip if already in closed list
        if (closedList.some(node => positionsEqual(node.position, neighborPos))) {
          continue;
        }
        
        const gCost = currentNode.gCost + 1;
        const hCost = this.getHeuristic(neighborPos, target);
        const neighborNode = new AStarNode(neighborPos, gCost, hCost, currentNode);
        
        // Check if this path to neighbor is better than any previous one
        const existingNode = openList.find(node => positionsEqual(node.position, neighborPos));
        
        if (!existingNode) {
          openList.push(neighborNode);
        } else if (gCost < existingNode.gCost) {
          existingNode.gCost = gCost;
          existingNode.fCost = gCost + hCost;
          existingNode.parent = currentNode;
        }
      }
    }
    
    // No path found
    return [];
  }

  /**
   * Get all valid neighbor positions
   */
  getNeighbors(position) {
    return [
      { x: position.x + DIRECTIONS.UP.x, y: position.y + DIRECTIONS.UP.y },
      { x: position.x + DIRECTIONS.DOWN.x, y: position.y + DIRECTIONS.DOWN.y },
      { x: position.x + DIRECTIONS.LEFT.x, y: position.y + DIRECTIONS.LEFT.y },
      { x: position.x + DIRECTIONS.RIGHT.x, y: position.y + DIRECTIONS.RIGHT.y }
    ];
  }

  /**
   * Check if position is an obstacle
   */
  isObstacle(position, obstacles) {
    return obstacles.some(obstacle => positionsEqual(position, obstacle));
  }

  /**
   * Calculate heuristic (Manhattan distance)
   */
  getHeuristic(pos1, pos2) {
    return manhattanDistance(pos1, pos2);
  }

  /**
   * Reconstruct path from target to start
   */
  reconstructPath(node) {
    const path = [];
    let current = node;
    
    while (current !== null) {
      path.unshift(current.position);
      current = current.parent;
    }
    
    return path;
  }
}

/**
 * AI Strategy Manager
 * Handles different AI difficulties and decision making
 */
export class AIStrategy {
  constructor(boardWidth, boardHeight, difficulty = 'medium') {
    this.boardWidth = boardWidth;
    this.boardHeight = boardHeight;
    this.difficulty = difficulty;
    this.pathfinder = new AStarPathfinder(boardWidth, boardHeight);
    
    // Enhanced difficulty settings with more precise control
    this.settings = {
      easy: {
        optimality: 0.65,        // 65% chance to make optimal move
        lookAhead: 2,            // Look 2 steps ahead
        avoidancePriority: 0.3,  // Low collision avoidance
        randomness: 0.35,        // 35% random moves
        reactionTime: 3,         // Slower reaction (3 game ticks)
        safetyDistance: 1        // Minimum distance from obstacles
      },
      medium: {
        optimality: 0.80,        // 80% chance to make optimal move
        lookAhead: 3,            // Look 3 steps ahead
        avoidancePriority: 0.6,  // Good collision avoidance
        randomness: 0.20,        // 20% random moves
        reactionTime: 2,         // Medium reaction (2 game ticks)
        safetyDistance: 2        // Better safety margin
      },
      impossible: {
        optimality: 1.0,         // 100% optimal moves
        lookAhead: 5,            // Look 5 steps ahead
        avoidancePriority: 0.95, // Near-perfect collision avoidance
        randomness: 0.0,         // No random moves
        reactionTime: 0,         // Instant reaction
        safetyDistance: 3        // Large safety margin
      }
    };
  }

  /**
   * Get next move for AI snake with enhanced difficulty-based behavior
   */
  getNextMove(aiSnake, food, obstacles = [], otherSnakes = []) {
    if (!aiSnake || aiSnake.length === 0) return this.getRandomDirection();
    
    const currentSettings = this.settings[this.difficulty];
    const head = aiSnake[0];
    
    // Get safe moves (moves that don't cause immediate death)
    const safeMoves = this.getSafeMoves(head, aiSnake, obstacles, otherSnakes, currentSettings);
    
    if (safeMoves.length === 0) {
      // No safe moves - try desperate escape
      return this.getDesperateMove(head, aiSnake, obstacles, otherSnakes);
    }
    
    // Determine if AI should make optimal move based on difficulty
    const shouldMakeOptimalMove = Math.random() < currentSettings.optimality;
    
    if (shouldMakeOptimalMove) {
      // Make strategic/optimal move
      return this.getOptimalMove(head, food, aiSnake, obstacles, otherSnakes, currentSettings);
    } else {
      // Make suboptimal move (simulate human-like mistakes)
      return this.getSuboptimalMove(safeMoves, currentSettings);
    }
  }

  /**
   * Get safe moves with enhanced safety calculation
   */
  getSafeMoves(head, snake, obstacles, otherSnakes, settings) {
    const moves = [];
    
    for (const direction of Object.values(DIRECTIONS)) {
      const newPos = {
        x: head.x + direction.x,
        y: head.y + direction.y
      };
      
      // Check if move is safe with difficulty-adjusted safety distance
      if (this.isSafeMoveWithDistance(newPos, snake, obstacles, otherSnakes, settings.safetyDistance)) {
        const safety = this.calculateAdvancedSafety(newPos, snake, obstacles, otherSnakes, settings);
        const futureSpace = this.calculateFutureSpace(newPos, direction, snake, obstacles, otherSnakes, settings.lookAhead);
        
        moves.push({
          direction,
          position: newPos,
          safety,
          futureSpace,
          score: safety + futureSpace
        });
      }
    }
    
    return moves.sort((a, b) => b.score - a.score);
  }

  /**
   * Enhanced safety check with distance consideration
   */
  isSafeMoveWithDistance(position, snake, obstacles, otherSnakes, minDistance = 1) {
    // Basic boundary check
    if (!isWithinBounds(position, this.boardWidth, this.boardHeight)) {
      return false;
    }
    
    // Check immediate collision with snake body (excluding tail)
    const bodyWithoutTail = snake.slice(0, -1);
    if (checkSelfCollision(position, bodyWithoutTail)) {
      return false;
    }
    
    // Check collision with obstacles
    if (obstacles.some(obstacle => positionsEqual(position, obstacle))) {
      return false;
    }
    
    // Check collision with other snakes
    for (const otherSnake of otherSnakes) {
      if (checkSnakeCollision(position, otherSnake)) {
        return false;
      }
    }
    
    // For higher difficulties, check safety distance
    if (minDistance > 1) {
      return this.checkSafetyDistance(position, snake, obstacles, otherSnakes, minDistance);
    }
    
    return true;
  }

  /**
   * Check if position maintains safe distance from dangers
   */
  checkSafetyDistance(position, snake, obstacles, otherSnakes, minDistance) {
    // Check distance from walls
    if (position.x < minDistance || position.x >= this.boardWidth - minDistance ||
        position.y < minDistance || position.y >= this.boardHeight - minDistance) {
      return false;
    }
    
    // Check distance from own body
    for (const segment of snake) {
      if (manhattanDistance(position, segment) < minDistance) {
        return false;
      }
    }
    
    // Check distance from other snakes
    for (const otherSnake of otherSnakes) {
      for (const segment of otherSnake) {
        if (manhattanDistance(position, segment) < minDistance) {
          return false;
        }
      }
    }
    
    return true;
  }

  /**
   * Calculate advanced safety score
   */
  calculateAdvancedSafety(position, snake, obstacles, otherSnakes, settings) {
    let safety = 100;
    
    // Penalty for being near walls (scaled by difficulty)
    const wallDistance = Math.min(
      position.x,
      position.y,
      this.boardWidth - position.x - 1,
      this.boardHeight - position.y - 1
    );
    safety -= Math.max(0, (settings.safetyDistance - wallDistance) * 15);
    
    // Penalty for being near own body
    for (const segment of snake) {
      const dist = manhattanDistance(position, segment);
      if (dist <= settings.safetyDistance) {
        safety -= (settings.safetyDistance - dist + 1) * 20;
      }
    }
    
    // Penalty for being near other snakes
    for (const otherSnake of otherSnakes) {
      for (const segment of otherSnake) {
        const dist = manhattanDistance(position, segment);
        if (dist <= settings.safetyDistance) {
          safety -= (settings.safetyDistance - dist + 1) * 25;
        }
      }
    }
    
    return Math.max(0, safety);
  }

  /**
   * Calculate future space availability
   */
  calculateFutureSpace(position, direction, snake, obstacles, otherSnakes, depth) {
    let space = 0;
    let current = position;
    
    for (let i = 0; i < depth; i++) {
      current = {
        x: current.x + direction.x,
        y: current.y + direction.y
      };
      
      if (!isWithinBounds(current, this.boardWidth, this.boardHeight) ||
          checkSelfCollision(current, snake) ||
          otherSnakes.some(otherSnake => checkSnakeCollision(current, otherSnake))) {
        break;
      }
      
      space += (depth - i); // Weight closer spaces more
    }
    
    return space;
  }

  /**
   * Get desperate move when no safe moves available
   */
  getDesperateMove(head, snake, obstacles, otherSnakes) {
    // Try to find any move that doesn't cause immediate death
    for (const direction of Object.values(DIRECTIONS)) {
      const newPos = {
        x: head.x + direction.x,
        y: head.y + direction.y
      };
      
      if (this.isSafeMoveWithDistance(newPos, snake, obstacles, otherSnakes, 0)) {
        return direction;
      }
    }
    
    // Last resort - return random direction
    return this.getRandomDirection();
  }

  /**
   * Make suboptimal move to simulate human-like behavior
   */
  getSuboptimalMove(safeMoves, settings) {
    if (safeMoves.length === 0) return this.getRandomDirection();
    
    // For easy/medium, sometimes choose worse moves
    const randomFactor = Math.random();
    
    if (randomFactor < settings.randomness) {
      // Choose completely random safe move
      const randomIndex = Math.floor(Math.random() * safeMoves.length);
      return safeMoves[randomIndex].direction;
    } else {
      // Choose from top moves but not necessarily the best
      const topMoves = safeMoves.slice(0, Math.min(3, safeMoves.length));
      const randomIndex = Math.floor(Math.random() * topMoves.length);
      return topMoves[randomIndex].direction;
    }
  }

  /**
   * Check if a move is safe (won't result in immediate collision)
   */
  isSafeMove(position, snake, obstacles, otherSnakes) {
    // Check bounds
    if (!isWithinBounds(position, this.boardWidth, this.boardHeight)) {
      return false;
    }
    
    // Check self collision (excluding tail since it will move)
    const bodyWithoutTail = snake.slice(0, -1);
    if (checkSelfCollision(position, bodyWithoutTail)) {
      return false;
    }
    
    // Check obstacles
    if (obstacles.some(obstacle => positionsEqual(position, obstacle))) {
      return false;
    }
    
    // Check collision with other snakes
    for (const otherSnake of otherSnakes) {
      if (checkSnakeCollision(position, otherSnake)) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Calculate safety score for a position
   */
  calculateSafety(position, snake, obstacles, otherSnakes) {
    let safety = 100;
    
    // Penalty for being near walls
    const distToWalls = Math.min(
      position.x,
      position.y,
      this.boardWidth - position.x - 1,
      this.boardHeight - position.y - 1
    );
    safety -= Math.max(0, (3 - distToWalls) * 10);
    
    // Penalty for being near own body
    const bodyWithoutTail = snake.slice(0, -1);
    for (const segment of bodyWithoutTail) {
      const dist = manhattanDistance(position, segment);
      if (dist <= 2) {
        safety -= (3 - dist) * 15;
      }
    }
    
    // Penalty for being near other snakes
    for (const otherSnake of otherSnakes) {
      for (const segment of otherSnake) {
        const dist = manhattanDistance(position, segment);
        if (dist <= 2) {
          safety -= (3 - dist) * 20;
        }
      }
    }
    
    return Math.max(0, safety);
  }

  /**
   * Get optimal move using enhanced A* pathfinding
   */
  getOptimalMove(head, food, snake, obstacles, otherSnakes, settings) {
    if (!food) return this.getRandomDirection();
    
    const allObstacles = [...obstacles];
    
    // Add other snakes as obstacles (predict their movement for higher difficulties)
    otherSnakes.forEach(otherSnake => {
      if (settings.lookAhead > 2) {
        // For harder difficulties, predict where other snakes might move
        allObstacles.push(...this.predictSnakeMovement(otherSnake, settings.lookAhead));
      } else {
        allObstacles.push(...otherSnake);
      }
    });
    
    // Add own body (excluding tail) as obstacles
    allObstacles.push(...snake.slice(0, -1));
    
    // Find path to food using A*
    const path = this.pathfinder.findPath(head, food, allObstacles, 500);
    
    if (path.length > 1) {
      const nextPos = path[1];
      const direction = this.getDirectionFromPositions(head, nextPos);
      
      // Double-check the move is safe
      if (this.isSafeMoveWithDistance(nextPos, snake, obstacles, otherSnakes, 0)) {
        return direction;
      }
    }
    
    // If no path to food or path is unsafe, prioritize survival
    return this.getSurvivalMove(head, snake, obstacles, otherSnakes, settings);
  }

  /**
   * Get survival move when can't reach food
   */
  getSurvivalMove(head, snake, obstacles, otherSnakes, settings) {
    const safeMoves = this.getSafeMoves(head, snake, obstacles, otherSnakes, settings);
    
    if (safeMoves.length > 0) {
      // Choose move that maximizes future space
      return safeMoves[0].direction;
    }
    
    // Last resort
    return this.getDesperateMove(head, snake, obstacles, otherSnakes);
  }

  /**
   * Predict where a snake might move (for advanced AI)
   */
  predictSnakeMovement(snake, steps) {
    if (!snake || snake.length === 0) return [];
    
    const predictions = [...snake];
    let currentHead = snake[0];
    
    // Simple prediction: assume snake continues in current direction
    if (snake.length > 1) {
      const direction = {
        x: snake[0].x - snake[1].x,
        y: snake[0].y - snake[1].y
      };
      
      for (let i = 0; i < steps; i++) {
        currentHead = {
          x: currentHead.x + direction.x,
          y: currentHead.y + direction.y
        };
        
        if (isWithinBounds(currentHead, this.boardWidth, this.boardHeight)) {
          predictions.unshift(currentHead);
        } else {
          break;
        }
      }
    }
    
    return predictions;
  }

  /**
   * Get strategic move with difficulty-based optimality
   */
  getStrategicMove(head, food, possibleMoves, settings, snake, otherSnakes) {
    // Calculate scores for each move
    const scoredMoves = possibleMoves.map(move => {
      let score = move.safety;
      
      // Distance to food (lower is better)
      const distToFood = manhattanDistance(move.position, food);
      score += Math.max(0, 100 - distToFood * 5);
      
      // Bonus for moves that don't trap the snake
      const spaceAhead = this.calculateSpaceAhead(move.position, move.direction, snake, otherSnakes);
      score += spaceAhead * 2;
      
      return {
        ...move,
        score
      };
    });
    
    // Sort by score
    scoredMoves.sort((a, b) => b.score - a.score);
    
    // Apply optimality and randomness based on difficulty
    if (Math.random() < settings.optimality) {
      // Choose optimal move
      return scoredMoves[0].direction;
    } else {
      // Choose random move from top options
      const topMoves = scoredMoves.slice(0, Math.min(3, scoredMoves.length));
      const randomMove = topMoves[Math.floor(Math.random() * topMoves.length)];
      return randomMove.direction;
    }
  }

  /**
   * Calculate available space ahead of a position
   */
  calculateSpaceAhead(position, direction, snake, otherSnakes, depth = 3) {
    let space = 0;
    let current = position;
    
    for (let i = 0; i < depth; i++) {
      current = {
        x: current.x + direction.x,
        y: current.y + direction.y
      };
      
      if (!isWithinBounds(current, this.boardWidth, this.boardHeight) ||
          checkSelfCollision(current, snake) ||
          otherSnakes.some(otherSnake => checkSnakeCollision(current, otherSnake))) {
        break;
      }
      
      space++;
    }
    
    return space;
  }

  /**
   * Get direction from two positions
   */
  getDirectionFromPositions(from, to) {
    const diff = {
      x: to.x - from.x,
      y: to.y - from.y
    };
    
    for (const [key, direction] of Object.entries(DIRECTIONS)) {
      if (direction.x === diff.x && direction.y === diff.y) {
        return direction;
      }
    }
    
    return DIRECTIONS.RIGHT; // fallback
  }

  /**
   * Get random direction
   */
  getRandomDirection() {
    const directions = Object.values(DIRECTIONS);
    return directions[Math.floor(Math.random() * directions.length)];
  }

  /**
   * Update difficulty setting
   */
  setDifficulty(difficulty) {
    this.difficulty = difficulty;
  }
}

/**
 * AI Controller class to manage AI behavior
 */
export class AIController {
  constructor(boardWidth, boardHeight, difficulty = 'medium') {
    this.strategy = new AIStrategy(boardWidth, boardHeight, difficulty);
    this.lastMove = null;
    this.moveHistory = [];
    this.stuckCounter = 0;
    this.moveDelay = 0;
    this.tickCounter = 0;
  }

  /**
   * Get next move for AI snake with reaction time simulation
   */
  getNextMove(aiSnake, food, obstacles = [], otherSnakes = []) {
    this.tickCounter++;
    
    const settings = this.strategy.settings[this.strategy.difficulty];
    
    // Implement reaction time delay for easier difficulties
    if (this.moveDelay < settings.reactionTime) {
      this.moveDelay++;
      // Return current direction or last move during delay
      return this.lastMove || { x: 1, y: 0 }; // Default right
    }
    
    this.moveDelay = 0; // Reset delay after making a move
    
    const move = this.strategy.getNextMove(aiSnake, food, obstacles, otherSnakes);
    
    // Anti-stuck mechanism with difficulty-based tolerance
    const stuckTolerance = settings.reactionTime + 2;
    if (this.lastMove && positionsEqual(move, this.lastMove)) {
      this.stuckCounter++;
      if (this.stuckCounter > stuckTolerance) {
        // Try alternative moves
        const safeMoves = this.strategy.getSafeMoves(aiSnake[0], aiSnake, obstacles, otherSnakes, settings);
        const alternativeMoves = safeMoves.filter(m => !positionsEqual(m.direction, move));
        
        if (alternativeMoves.length > 0) {
          this.stuckCounter = 0;
          this.lastMove = alternativeMoves[0].direction;
          return alternativeMoves[0].direction;
        }
      }
    } else {
      this.stuckCounter = 0;
    }
    
    this.lastMove = move;
    this.moveHistory.push(move);
    
    // Keep move history limited
    if (this.moveHistory.length > 10) {
      this.moveHistory.shift();
    }
    
    return move;
  }

  /**
   * Set difficulty
   */
  setDifficulty(difficulty) {
    this.strategy.setDifficulty(difficulty);
  }

  /**
   * Reset AI state
   */
  reset() {
    this.lastMove = null;
    this.moveHistory = [];
    this.stuckCounter = 0;
    this.moveDelay = 0;
    this.tickCounter = 0;
  }
}

export default {
  AStarPathfinder,
  AIStrategy,
  AIController
};