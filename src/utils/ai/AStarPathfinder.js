import {
  DIRECTIONS,
  isWithinBounds,
  manhattanDistance,
  positionsEqual
} from '../gameUtils.js';

class AStarNode {
  constructor(position, gCost = 0, hCost = 0, parent = null) {
    this.position = position;
    this.gCost = gCost;
    this.hCost = hCost;
    this.fCost = gCost + hCost;
    this.parent = parent;
  }
}

export class AStarPathfinder {
  constructor(boardWidth, boardHeight) {
    this.boardWidth = boardWidth;
    this.boardHeight = boardHeight;
  }

  findPath(start, target, obstacles = [], maxIterations = 1000) {
    const openList = [];
    const closedList = [];

    const startNode = new AStarNode(start, 0, this.getHeuristic(start, target));
    openList.push(startNode);

    let iterations = 0;

    while (openList.length > 0 && iterations < maxIterations) {
      iterations++;

      const currentNode = openList.reduce((lowest, node) => (
        node.fCost < lowest.fCost ? node : lowest
      ));

      const currentIndex = openList.indexOf(currentNode);
      openList.splice(currentIndex, 1);
      closedList.push(currentNode);

      if (positionsEqual(currentNode.position, target)) {
        return this.reconstructPath(currentNode);
      }

      const neighbors = this.getNeighbors(currentNode.position);

      for (const neighborPos of neighbors) {
        if (
          this.isObstacle(neighborPos, obstacles)
          || !isWithinBounds(neighborPos, this.boardWidth, this.boardHeight)
        ) {
          continue;
        }

        if (closedList.some((node) => positionsEqual(node.position, neighborPos))) {
          continue;
        }

        const gCost = currentNode.gCost + 1;
        const hCost = this.getHeuristic(neighborPos, target);
        const neighborNode = new AStarNode(neighborPos, gCost, hCost, currentNode);

        const existingNode = openList.find((node) => positionsEqual(node.position, neighborPos));

        if (!existingNode) {
          openList.push(neighborNode);
        } else if (gCost < existingNode.gCost) {
          existingNode.gCost = gCost;
          existingNode.fCost = gCost + hCost;
          existingNode.parent = currentNode;
        }
      }
    }

    return [];
  }

  getNeighbors(position) {
    return [
      { x: position.x + DIRECTIONS.UP.x, y: position.y + DIRECTIONS.UP.y },
      { x: position.x + DIRECTIONS.DOWN.x, y: position.y + DIRECTIONS.DOWN.y },
      { x: position.x + DIRECTIONS.LEFT.x, y: position.y + DIRECTIONS.LEFT.y },
      { x: position.x + DIRECTIONS.RIGHT.x, y: position.y + DIRECTIONS.RIGHT.y }
    ];
  }

  isObstacle(position, obstacles) {
    return obstacles.some((obstacle) => positionsEqual(position, obstacle));
  }

  getHeuristic(pos1, pos2) {
    return manhattanDistance(pos1, pos2);
  }

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
