import { GAME_MODES } from './constants.js';
import { getFoodCells, isBonusFood } from '../../utils/gameUtils.js';

const MOVE_DIRECTIONS = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 }
];

export const countSafeMoves = (head, snakeId, snakes, boardSize, gameMode) => {
  let safeMoves = 0;

  for (const direction of MOVE_DIRECTIONS) {
    let nextX = head.x + direction.x;
    let nextY = head.y + direction.y;

    if (gameMode === GAME_MODES.CLASSIC_TRANSPARENT) {
      nextX = (nextX + boardSize.width) % boardSize.width;
      nextY = (nextY + boardSize.height) % boardSize.height;
    } else if (nextX < 0 || nextX >= boardSize.width || nextY < 0 || nextY >= boardSize.height) {
      continue;
    }

    let blocked = false;
    for (let s = 0; s < snakes.length && !blocked; s++) {
      const snake = snakes[s];
      if (!snake?.isAlive) continue;
      const bodyStartIndex = s === snakeId ? 1 : 0;
      for (let segmentIndex = bodyStartIndex; segmentIndex < snake.body.length; segmentIndex++) {
        const segment = snake.body[segmentIndex];
        if (segment.x === nextX && segment.y === nextY) {
          blocked = true;
          break;
        }
      }
    }

    if (!blocked) {
      safeMoves += 1;
    }
  }

  return safeMoves;
};

export const getDistanceToFood = (head, foodItem) => {
  const foodCells = getFoodCells(foodItem);
  if (!foodCells.length) return Number.POSITIVE_INFINITY;

  return foodCells.reduce((closest, cell) => (
    Math.min(closest, Math.abs(cell.x - head.x) + Math.abs(cell.y - head.y))
  ), Number.POSITIVE_INFINITY);
};

export const getClosestFoodTarget = (head, foodItem) => {
  const foodCells = getFoodCells(foodItem);
  if (!foodCells.length) return foodItem;

  return foodCells.reduce((closest, cell) => {
    if (!closest) return cell;
    const currentDistance = Math.abs(cell.x - head.x) + Math.abs(cell.y - head.y);
    const closestDistance = Math.abs(closest.x - head.x) + Math.abs(closest.y - head.y);
    return currentDistance < closestDistance ? cell : closest;
  }, null) || foodItem;
};

export const resolveAiDirection = ({
  aiControllers,
  gameMode,
  logger,
  newFood,
  newSnakes,
  snake,
  snakeIndex
}) => {
  if (!snake.isAI || !aiControllers?.[snakeIndex]) {
    return snake.direction;
  }

  try {
    let targetFood = newFood[0];
    if (newFood.length > 1) {
      const head = snake.body[0];
      targetFood = newFood.reduce((closest, current) => {
        const distCurrent = getDistanceToFood(head, current);
        const distClosest = getDistanceToFood(head, closest);
        return distCurrent < distClosest ? current : closest;
      }, newFood[0]);
    }

    const otherSnakes = newSnakes
      .filter((_, idx) => idx !== snakeIndex)
      .map((otherSnake) => otherSnake.body);

    const aiDirection = aiControllers[snakeIndex].getNextMove(
      snake.body,
      getClosestFoodTarget(snake.body[0], targetFood),
      [],
      otherSnakes,
      gameMode
    );

    if (aiDirection && typeof aiDirection.x === 'number' && typeof aiDirection.y === 'number') {
      return aiDirection;
    }
  } catch (error) {
    logger.error('AI error:', error);
  }

  return snake.direction;
};

export const willSnakeGrowAtPosition = ({ foods, head }) => foods.some((foodItem) => (
  foodItem &&
  !isBonusFood(foodItem) &&
  getFoodCells(foodItem).some((cell) => (
    head.x === cell.x && head.y === cell.y
  ))
));

export const findFoodCollisionIndex = ({ foods, head }) => {
  for (let index = 0; index < foods.length; index++) {
    if (foods[index] && getFoodCells(foods[index]).some((cell) => (
      head.x === cell.x && head.y === cell.y
    ))) {
      return index;
    }
  }
  return -1;
};
