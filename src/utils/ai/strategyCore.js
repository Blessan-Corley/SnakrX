import {
  DIRECTIONS,
  checkSelfCollision,
  checkSnakeCollision,
  isWithinBounds,
  manhattanDistance,
  positionsEqual
} from '../gameUtils.js';

export const getCandidateDirections = () => [
  DIRECTIONS.UP,
  DIRECTIONS.RIGHT,
  DIRECTIONS.DOWN,
  DIRECTIONS.LEFT
];

export const getDirectionRank = (strategy, direction) => {
  const directions = strategy.getCandidateDirections();
  const index = directions.findIndex((candidate) => (
    candidate.x === direction.x && candidate.y === direction.y
  ));
  return index === -1 ? 999 : index;
};

export const buildNavigationObstacles = (strategy, snake, obstacles, otherSnakes, gameMode, settings) => {
  const unique = new Map();
  const add = (position) => {
    if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') return;
    unique.set(`${position.x},${position.y}`, position);
  };

  obstacles.forEach(add);
  snake.slice(1).forEach(add);

  if (gameMode === 'vsai') {
    for (const otherSnake of otherSnakes) {
      if (!otherSnake?.length) continue;
      add(otherSnake[0]);
      if (settings?.avoidHeadOn) {
        for (const dir of Object.values(DIRECTIONS)) {
          add({ x: otherSnake[0].x + dir.x, y: otherSnake[0].y + dir.y });
        }
      }
    }
  } else {
    for (const otherSnake of otherSnakes) {
      otherSnake.forEach(add);
    }
  }

  return [...unique.values()];
};

export const getPathLength = (strategy, start, target, obstacles) => {
  if (!target) return Number.POSITIVE_INFINITY;
  if (positionsEqual(start, target)) return 0;
  const path = strategy.pathfinder.findPath(start, target, obstacles, 1500);
  if (!path?.length) return Number.POSITIVE_INFINITY;
  return Math.max(0, path.length - 1);
};

export const getReachableSpace = (strategy, start, obstacles) => {
  const blocked = new Set(
    obstacles.map((position) => `${position.x},${position.y}`)
  );
  const queue = [start];
  const visited = new Set();
  let count = 0;

  while (queue.length) {
    const current = queue.shift();
    const key = `${current.x},${current.y}`;
    if (visited.has(key) || blocked.has(key)) continue;
    if (!isWithinBounds(current, strategy.boardWidth, strategy.boardHeight)) continue;

    visited.add(key);
    count += 1;

    for (const direction of strategy.getCandidateDirections()) {
      queue.push({
        x: current.x + direction.x,
        y: current.y + direction.y
      });
    }
  }

  return count;
};

export const isSafeMoveWithDistance = (
  strategy,
  position,
  snake,
  obstacles,
  otherSnakes,
  minDistance = 1,
  gameMode,
  settings = {}
) => {
  if (!isWithinBounds(position, strategy.boardWidth, strategy.boardHeight)) {
    return false;
  }

  const bodySegments = snake.slice(1);
  if (checkSelfCollision(position, bodySegments)) {
    return false;
  }

  if (obstacles.some((obstacle) => positionsEqual(position, obstacle))) {
    return false;
  }

  if (gameMode === 'vsai') {
    for (const otherSnake of otherSnakes) {
      if (otherSnake.length > 0 && positionsEqual(position, otherSnake[0])) {
        return false;
      }
    }

    if (settings.avoidHeadOn) {
      for (const otherSnake of otherSnakes) {
        if (!otherSnake.length) continue;
        const otherHead = otherSnake[0];
        for (const dir of Object.values(DIRECTIONS)) {
          const possibleHead = {
            x: otherHead.x + dir.x,
            y: otherHead.y + dir.y
          };
          if (positionsEqual(position, possibleHead)) {
            return false;
          }
        }
      }
    }
  } else {
    for (const otherSnake of otherSnakes) {
      if (checkSnakeCollision(position, otherSnake)) {
        return false;
      }
    }
  }

  if (minDistance > 0) {
    return strategy.checkSafetyDistance(position, snake, obstacles, otherSnakes, minDistance, gameMode);
  }

  return true;
};

export const checkSafetyDistance = (
  strategy,
  position,
  snake,
  _obstacles,
  otherSnakes,
  minDistance,
  gameMode
) => {
  if (
    position.x < minDistance
    || position.x >= strategy.boardWidth - minDistance
    || position.y < minDistance
    || position.y >= strategy.boardHeight - minDistance
  ) {
    return false;
  }

  for (let i = 1; i < snake.length; i++) {
    const segment = snake[i];
    if (manhattanDistance(position, segment) < minDistance) {
      return false;
    }
  }

  for (const otherSnake of otherSnakes) {
    if (gameMode === 'vsai') {
      if (otherSnake.length > 0 && manhattanDistance(position, otherSnake[0]) < minDistance) {
        return false;
      }
    } else {
      for (const segment of otherSnake) {
        if (manhattanDistance(position, segment) < minDistance) {
          return false;
        }
      }
    }
  }

  return true;
};

export const calculateAdvancedSafety = (strategy, position, snake, _obstacles, otherSnakes, settings, gameMode) => {
  let safety = 100;

  const wallDistance = Math.min(
    position.x,
    position.y,
    strategy.boardWidth - position.x - 1,
    strategy.boardHeight - position.y - 1
  );
  safety -= Math.max(0, (settings.safetyDistance - wallDistance) * 15);

  for (const segment of snake) {
    const dist = manhattanDistance(position, segment);
    if (dist <= settings.safetyDistance) {
      safety -= (settings.safetyDistance - dist + 1) * 20;
    }
  }

  for (const otherSnake of otherSnakes) {
    if (gameMode === 'vsai') {
      if (otherSnake.length > 0) {
        const dist = manhattanDistance(position, otherSnake[0]);
        if (dist <= settings.safetyDistance) {
          safety -= (settings.safetyDistance - dist + 1) * 25;
        }
      }
    } else {
      for (const segment of otherSnake) {
        const dist = manhattanDistance(position, segment);
        if (dist <= settings.safetyDistance) {
          safety -= (settings.safetyDistance - dist + 1) * 25;
        }
      }
    }
  }

  return Math.max(0, safety);
};

export const calculateFutureSpace = (
  strategy,
  position,
  direction,
  snake,
  _obstacles,
  otherSnakes,
  depth,
  gameMode
) => {
  let space = 0;
  let current = position;

  for (let i = 0; i < depth; i++) {
    current = {
      x: current.x + direction.x,
      y: current.y + direction.y
    };

    let isSafe = true;

    if (!isWithinBounds(current, strategy.boardWidth, strategy.boardHeight)) isSafe = false;
    if (checkSelfCollision(current, snake)) isSafe = false;

    if (gameMode === 'vsai') {
      if (otherSnakes.some((s) => s.length > 0 && positionsEqual(current, s[0]))) isSafe = false;
    } else {
      if (otherSnakes.some((otherSnake) => checkSnakeCollision(current, otherSnake))) isSafe = false;
    }

    if (!isSafe) break;
    space += (depth - i);
  }

  return space;
};

export const predictSnakeMovement = (strategy, snake, steps) => {
  if (!snake || snake.length === 0) return [];

  const predictions = [...snake];
  let currentHead = snake[0];

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

      if (isWithinBounds(currentHead, strategy.boardWidth, strategy.boardHeight)) {
        predictions.unshift(currentHead);
      } else {
        break;
      }
    }
  }

  return predictions;
};

export const getDirectionFromPositions = (_strategy, from, to) => {
  const diff = {
    x: to.x - from.x,
    y: to.y - from.y
  };

  for (const [, direction] of Object.entries(DIRECTIONS)) {
    if (direction.x === diff.x && direction.y === diff.y) {
      return direction;
    }
  }

  return DIRECTIONS.RIGHT;
};

export const getRandomDirection = () => {
  const directions = Object.values(DIRECTIONS);
  return directions[Math.floor(Math.random() * directions.length)];
};
