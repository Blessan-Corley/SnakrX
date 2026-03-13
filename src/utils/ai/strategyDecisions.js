import { DIRECTIONS, manhattanDistance, positionsEqual } from '../gameUtils.js';

export const getNextMoveDecision = (
  strategy,
  aiSnake,
  food,
  obstacles = [],
  otherSnakes = [],
  gameMode = 'vsai'
) => {
  if (!aiSnake || aiSnake.length === 0) return strategy.getRandomDirection();

  const currentSettings = strategy.settings[strategy.difficulty];
  const head = aiSnake[0];

  if (strategy.difficulty === 'impossible') {
    return strategy.getImpossibleMove(head, food, aiSnake, obstacles, otherSnakes, gameMode, currentSettings);
  }

  const safeMoves = strategy.getSafeMoves(head, aiSnake, obstacles, otherSnakes, currentSettings, gameMode);

  if (safeMoves.length === 0) {
    return strategy.getDesperateMove(head, aiSnake, obstacles, otherSnakes, gameMode, currentSettings);
  }

  const shouldMakeOptimalMove = Math.random() < currentSettings.optimality;

  if (shouldMakeOptimalMove) {
    return strategy.getOptimalMove(head, food, aiSnake, obstacles, otherSnakes, currentSettings, gameMode);
  }

  return strategy.getSuboptimalMove(safeMoves, currentSettings);
};

export const getSafeMoves = (strategy, head, snake, obstacles, otherSnakes, settings, gameMode) => {
  const moves = [];

  for (const direction of Object.values(DIRECTIONS)) {
    const newPos = {
      x: head.x + direction.x,
      y: head.y + direction.y
    };

    if (
      strategy.isSafeMoveWithDistance(
        newPos,
        snake,
        obstacles,
        otherSnakes,
        settings.safetyDistance,
        gameMode,
        settings
      )
    ) {
      const safety = strategy.calculateAdvancedSafety(newPos, snake, obstacles, otherSnakes, settings, gameMode);
      const futureSpace = strategy.calculateFutureSpace(
        newPos,
        direction,
        snake,
        obstacles,
        otherSnakes,
        settings.lookAhead,
        gameMode
      );

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
};

export const getImpossibleMove = (strategy, head, food, snake, obstacles, otherSnakes, gameMode, settings) => {
  const candidates = strategy.getCandidateDirections()
    .map((direction) => ({
      direction,
      position: { x: head.x + direction.x, y: head.y + direction.y }
    }))
    .filter((candidate) => (
      strategy.isSafeMoveWithDistance(
        candidate.position,
        snake,
        obstacles,
        otherSnakes,
        0,
        gameMode,
        settings
      )
    ));

  if (!candidates.length) {
    return DIRECTIONS.RIGHT;
  }

  const navObstacles = strategy.buildNavigationObstacles(snake, obstacles, otherSnakes, gameMode, settings);

  const scored = candidates.map((candidate) => {
    const pathLength = strategy.getPathLength(candidate.position, food, navObstacles);
    const reachable = strategy.getReachableSpace(candidate.position, navObstacles);
    const wallDistance = Math.min(
      candidate.position.x,
      candidate.position.y,
      strategy.boardWidth - candidate.position.x - 1,
      strategy.boardHeight - candidate.position.y - 1
    );
    const opponentHeadDistance = gameMode === 'vsai' && otherSnakes[0]?.length
      ? manhattanDistance(candidate.position, otherSnakes[0][0])
      : 0;

    const pathScore = Number.isFinite(pathLength) ? (10000 - (pathLength * 120)) : -2000;
    const survivalScore = reachable * 5 + wallDistance * 3 + opponentHeadDistance * 2;

    return {
      ...candidate,
      pathLength,
      score: pathScore + survivalScore
    };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.pathLength !== b.pathLength) return a.pathLength - b.pathLength;
    return strategy.getDirectionRank(a.direction) - strategy.getDirectionRank(b.direction);
  });

  return scored[0].direction;
};

export const getDesperateMove = (strategy, head, snake, obstacles, otherSnakes, gameMode, settings = {}) => {
  const candidates = [];
  for (const direction of Object.values(DIRECTIONS)) {
    const newPos = {
      x: head.x + direction.x,
      y: head.y + direction.y
    };

    if (strategy.isSafeMoveWithDistance(newPos, snake, obstacles, otherSnakes, 0, gameMode, settings)) {
      const safety = strategy.calculateAdvancedSafety(newPos, snake, obstacles, otherSnakes, settings, gameMode);
      const futureSpace = strategy.calculateFutureSpace(newPos, direction, snake, obstacles, otherSnakes, 3, gameMode);
      candidates.push({ direction, score: safety + futureSpace });
    }
  }

  if (candidates.length > 0) {
    candidates.sort((a, b) => b.score - a.score);
    return candidates[0].direction;
  }

  return strategy.getRandomDirection();
};

export const getSuboptimalMove = (strategy, safeMoves, settings) => {
  if (safeMoves.length === 0) return strategy.getRandomDirection();

  const randomFactor = Math.random();

  if (randomFactor < settings.randomness) {
    const randomIndex = Math.floor(Math.random() * safeMoves.length);
    return safeMoves[randomIndex].direction;
  }

  const topMoves = safeMoves.slice(0, Math.min(3, safeMoves.length));
  const randomIndex = Math.floor(Math.random() * topMoves.length);
  return topMoves[randomIndex].direction;
};

export const getOptimalMove = (
  strategy,
  head,
  food,
  snake,
  obstacles,
  otherSnakes,
  settings,
  gameMode = 'vsai'
) => {
  if (!food) return strategy.getRandomDirection();

  const allObstacles = [...obstacles];

  otherSnakes.forEach((otherSnake) => {
    if (gameMode === 'vsai') {
      if (otherSnake.length > 0) {
        allObstacles.push(otherSnake[0]);
      }
    } else if (settings.lookAhead > 2) {
      allObstacles.push(...strategy.predictSnakeMovement(otherSnake, settings.lookAhead));
    } else {
      allObstacles.push(...otherSnake);
    }
  });

  allObstacles.push(...snake.slice(0, -1));

  const path = strategy.pathfinder.findPath(head, food, allObstacles, 500);

  if (path.length > 1) {
    const nextPos = path[1];
    const direction = strategy.getDirectionFromPositions(head, nextPos);

    if (strategy.isSafeMoveWithDistance(nextPos, snake, obstacles, otherSnakes, 0, gameMode, settings)) {
      return direction;
    }
  }

  return strategy.getSurvivalMove(head, snake, obstacles, otherSnakes, settings, gameMode);
};

export const getSurvivalMove = (strategy, head, snake, obstacles, otherSnakes, settings, gameMode) => {
  const safeMoves = strategy.getSafeMoves(head, snake, obstacles, otherSnakes, settings, gameMode);

  if (safeMoves.length > 0) {
    return safeMoves[0].direction;
  }

  return strategy.getDesperateMove(head, snake, obstacles, otherSnakes, gameMode, settings);
};

export const getAntiStuckMove = (strategy, aiSnake, move, obstacles, otherSnakes, settings, gameMode) => {
  if (strategy.difficulty === 'impossible') {
    return move;
  }

  const stuckTolerance = settings.reactionTime + 2;
  const head = aiSnake?.[0];
  const headKey = head ? `${head.x},${head.y}` : '';
  const headUnchanged = strategy.lastHeadKey === headKey;

  if (strategy.lastMove && positionsEqual(move, strategy.lastMove) && headUnchanged) {
    strategy.stuckCounter++;
    if (strategy.stuckCounter > stuckTolerance) {
      const safeMoves = strategy.getSafeMoves(aiSnake[0], aiSnake, obstacles, otherSnakes, settings, gameMode);
      const alternativeMoves = safeMoves.filter((m) => !positionsEqual(m.direction, move));

      if (alternativeMoves.length > 0) {
        strategy.stuckCounter = 0;
        strategy.lastHeadKey = headKey;
        strategy.lastMove = alternativeMoves[0].direction;
        return alternativeMoves[0].direction;
      }
    }
  } else {
    strategy.stuckCounter = 0;
  }

  strategy.lastHeadKey = headKey;
  return move;
};
