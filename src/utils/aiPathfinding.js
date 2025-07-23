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
    
    // Difficulty settings
    this.settings = {
      easy: {
        optimality: 0.65,
        lookAhead: 1,
        avoidancePriority: 0.3,
        randomness: 0.4
      },
      medium: {
        optimality: 0.80,
        lookAhead: 2,
        avoidancePriority: 0.6,
        randomness: 0.2
      },
      impossible: {
        optimality: 1.0,
        lookAhead: 4,
        avoidancePriority: 0.9,
        randomness: 0.0
      }
    };
  }

  /**
   * Get next move for AI snake
   */
  getNextMove(aiSnake, food, obstacles = [], otherSnakes = []) {
    const currentSettings = this.settings[this.difficulty];
    const head = aiSnake[0];
    
    // Get possible moves
    const possibleMoves = this.getPossibleMoves(head, aiSnake, obstacles, otherSnakes);
    
    if (possibleMoves.length === 0) {
      return this.getRandomDirection(); // Desperate move
    }
    
    // For impossible difficulty, use perfect pathfinding
    if (this.difficulty === 'impossible') {
      return this.getOptimalMove(head, food, aiSnake, obstacles, otherSnakes);
    }
    
    // For other difficulties, use strategic decision making with some randomness
    return this.getStrategicMove(head, food, possibleMoves, currentSettings, aiSnake, otherSnakes);
  }

  /**
   * Get all possible moves that don't result in immediate death
   */
  getPossibleMoves(head, snake, obstacles, otherSnakes) {
    const moves = [];
    
    for (const direction of Object.values(DIRECTIONS)) {
      const newPos = {
        x: head.x + direction.x,
        y: head.y + direction.y
      };
      
      // Check if move is safe
      if (this.isSafeMove(newPos, snake, obstacles, otherSnakes)) {
        moves.push({
          direction,
          position: newPos,
          safety: this.calculateSafety(newPos, snake, obstacles, otherSnakes)
        });
      }
    }
    
    return moves.sort((a, b) => b.safety - a.safety);
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
   * Get optimal move using A* pathfinding (impossible difficulty)
   */
  getOptimalMove(head, food, snake, obstacles, otherSnakes) {
    const allObstacles = [...obstacles];
    
    // Add other snakes as obstacles
    otherSnakes.forEach(otherSnake => {
      allObstacles.push(...otherSnake);
    });
    
    // Add own body (excluding tail) as obstacles
    allObstacles.push(...snake.slice(0, -1));
    
    // Find path to food
    const path = this.pathfinder.findPath(head, food, allObstacles);
    
    if (path.length > 1) {
      const nextPos = path[1];
      return this.getDirectionFromPositions(head, nextPos);
    }
    
    // If no path to food, find safest move
    const possibleMoves = this.getPossibleMoves(head, snake, obstacles, otherSnakes);
    if (possibleMoves.length > 0) {
      return possibleMoves[0].direction;
    }
    
    return this.getRandomDirection();
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
  }

  /**
   * Get next move for AI snake
   */
  getNextMove(aiSnake, food, obstacles = [], otherSnakes = []) {
    const move = this.strategy.getNextMove(aiSnake, food, obstacles, otherSnakes);
    
    // Anti-stuck mechanism
    if (this.lastMove && positionsEqual(move, this.lastMove)) {
      this.stuckCounter++;
      if (this.stuckCounter > 3) {
        // Try a different move
        const possibleMoves = this.strategy.getPossibleMoves(aiSnake[0], aiSnake, obstacles, otherSnakes);
        const alternativeMoves = possibleMoves.filter(m => !positionsEqual(m.direction, move));
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
  }
}

export default {
  AStarPathfinder,
  AIStrategy,
  AIController
};