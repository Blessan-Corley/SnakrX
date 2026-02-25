import {
  GAME_MODES,
  GAME_STATES,
  calculatePoints,
  calculateSpeed,
  resolveVsAiWinner
} from '../../../utils/gameUtils.js';
import {
  countNormalFoodEvents,
  countSnakeBonusFoodEvents,
  countSnakeBonusFoodPoints,
  countSnakeFoodEvents
} from '../progress.js';

export const buildUpdatedStateFromTick = ({
  currentTimestamp,
  events,
  gameEnded,
  gameStartTime,
  newSnakes,
  normalFoodsSinceBonus,
  pendingBonusSpawns,
  prev,
  resolvedFood,
  victory
}) => {
  const updates = { ...prev };
  updates.snakes = newSnakes;
  updates.food = resolvedFood;
  updates.normalFoodsSinceBonus = normalFoodsSinceBonus;
  updates.pendingBonusSpawns = pendingBonusSpawns;
  updates.deadPlayers = new Set(
    newSnakes
      .map((snake, index) => (!snake?.isAlive ? index : null))
      .filter((index) => index !== null)
  );

  const points = calculatePoints(updates.gameMode, updates.difficulty);
  const playerFoodConsumed = countSnakeFoodEvents(events, 0);
  const playerBonusFoodCollected = countSnakeBonusFoodEvents(events, 0);
  const playerBonusFoodPoints = countSnakeBonusFoodPoints(events, 0);

  if (events?.length) {
    events.forEach((event) => {
      if (event.type === 'DEATH' && event.snakeId === 0) {
        if (event.cause === 'WALL') updates.wallHits = (updates.wallHits || 0) + 1;
        if (event.cause === 'SELF') updates.selfHits = (updates.selfHits || 0) + 1;
        if (event.position) {
          updates.highlightCollision = event.position;
        }
      }

      if (event.type === 'MOVE' && event.snakeId === 0) {
        updates.moves = (updates.moves || 0) + 1;
      }

      if (event.type === 'EAT') {
        if (updates.snakes[event.snakeId]) {
          updates.snakes[event.snakeId].score = (updates.snakes[event.snakeId].score || 0) + points;
        }

        if (event.snakeId === 0) {
          const currentTime = (currentTimestamp - (gameStartTime || currentTimestamp)) / 1000;
          if (updates.foodEaten === 0 && updates.timeToFirstFood === null) {
            updates.timeToFirstFood = currentTime;
          }

          const snake = newSnakes[0];
          if (snake && snake.body.length > (updates.maxLengthReached || 0)) {
            updates.maxLengthReached = snake.body.length;
            updates.timeToMaxLength = currentTime;
          }

          if (event.food?.createdAt && (currentTimestamp - event.food.createdAt) <= 2000) {
            updates.fastEats = (updates.fastEats || 0) + 1;
          }
        }
      }

      if (event.type === 'BONUS_EAT') {
        if (updates.snakes[event.snakeId]) {
          updates.snakes[event.snakeId].score =
            (updates.snakes[event.snakeId].score || 0) + (Number(event.points) || 0);
        }

        if (event.snakeId === 0) {
          updates.bonusFoodsCollected = (updates.bonusFoodsCollected || 0) + 1;
          updates.bonusFoodPoints = (updates.bonusFoodPoints || 0) + (Number(event.points) || 0);
        }
      }

      if (event.type === 'CLOSE_CALL' && event.snakeId === 0) {
        updates.closeCalls = (updates.closeCalls || 0) + 1;
      }
    });
  }

  if (updates.gameMode === GAME_MODES.VS_AI || updates.gameMode === GAME_MODES.MULTIPLAYER) {
    updates.score = updates.snakes[0]?.score || 0;
  }

  if (playerFoodConsumed > 0) {
    if (updates.gameMode === GAME_MODES.CLASSIC || updates.gameMode === GAME_MODES.CLASSIC_TRANSPARENT) {
      updates.score += points;
    }
    updates.foodEaten += playerFoodConsumed;
    updates.speed = calculateSpeed(updates.foodEaten);
  }

  if (
    playerBonusFoodCollected > 0 &&
    (updates.gameMode === GAME_MODES.CLASSIC || updates.gameMode === GAME_MODES.CLASSIC_TRANSPARENT)
  ) {
    updates.score += playerBonusFoodPoints;
  }

  if (gameEnded) {
    updates.gameState = GAME_STATES.GAME_OVER;
    updates.isPaused = true;

    if (updates.gameMode === GAME_MODES.MULTIPLAYER) {
      const sortedSnakes = [...updates.snakes].sort((a, b) => b.score - a.score);
      const winner = sortedSnakes[0];
      updates.winnerId = winner.id;
      updates.gameState = GAME_STATES.VICTORY;
    } else if (updates.gameMode === GAME_MODES.VS_AI) {
      const userScore = updates.snakes?.[0]?.score || 0;
      const aiScore = updates.snakes?.[1]?.score || 0;
      const winner = resolveVsAiWinner(userScore, aiScore);
      updates.score = userScore;
      updates.winnerId = winner === 'player' ? 0 : 1;
      updates.gameState = winner === 'player' ? GAME_STATES.VICTORY : GAME_STATES.GAME_OVER;
    } else {
      updates.gameState = victory ? GAME_STATES.VICTORY : GAME_STATES.GAME_OVER;
    }
  }

  return updates;
};

export const getTotalNormalFoodConsumed = (events) => countNormalFoodEvents(events);
