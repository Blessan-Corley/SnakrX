import {
  BONUS_FOOD_CONFIG,
  GAME_MODES,
  createLargeBonusFood,
  createNormalFood,
  generateFoodPosition,
  generateLargeFoodPosition,
  isBonusFood,
  isFoodExpired
} from '../../../utils/gameUtils.js';

export const prepareFoodForTick = (gameState, currentTimestamp) => {
  let currentFood = [...gameState.food];
  currentFood = currentFood.filter((foodItem) => !isFoodExpired(foodItem, currentTimestamp));

  if (gameState.gameMode === GAME_MODES.MULTIPLAYER) {
    const playerCount = gameState.playerCount;
    const bonusFoods = currentFood.filter((foodItem) => isBonusFood(foodItem));
    let normalFoods = currentFood.filter((foodItem) => !isBonusFood(foodItem));

    if (normalFoods.length > 1) {
      normalFoods = normalFoods.filter((foodItem) => {
        const age = currentTimestamp - (foodItem.createdAt || currentTimestamp);
        return age < 6000;
      });
    }

    const minFood = Math.max(1, playerCount - 1);
    const maxFood = Math.min(6, playerCount + 1);

    if (normalFoods.length < minFood || (normalFoods.length < maxFood && Math.random() < 0.02)) {
      const allBodies = gameState.snakes.flatMap((snake) => snake.body);
      const newPos = generateFoodPosition(
        gameState.boardSize.width,
        gameState.boardSize.height,
        allBodies
      );
      normalFoods.push(createNormalFood(newPos, currentTimestamp));
    }

    return [...normalFoods, ...bonusFoods];
  }

  const bonusFoods = currentFood.filter((foodItem) => isBonusFood(foodItem));
  const normalFoods = currentFood.filter((foodItem) => !isBonusFood(foodItem));
  if (normalFoods.length === 0) {
    const allBodies = gameState.snakes.flatMap((snake) => snake.body);
    normalFoods.push(createNormalFood(
      generateFoodPosition(
        gameState.boardSize.width,
        gameState.boardSize.height,
        allBodies
      ),
      currentTimestamp
    ));
  }

  return [...normalFoods, ...bonusFoods];
};

export const resolvePostMoveFood = ({
  boardSize,
  bonusFoodEnabled,
  currentTimestamp,
  newSnakes,
  nextFood,
  normalFoodsSinceBonus,
  pendingBonusSpawns,
  totalNormalFoodConsumed
}) => {
  let nextPendingBonusSpawns = Number(pendingBonusSpawns) || 0;
  let nextNormalFoodsSinceBonus = Number(normalFoodsSinceBonus) || 0;

  if (bonusFoodEnabled && totalNormalFoodConsumed > 0) {
    const accruedNormalFoods = nextNormalFoodsSinceBonus + totalNormalFoodConsumed;
    nextPendingBonusSpawns += Math.floor(accruedNormalFoods / BONUS_FOOD_CONFIG.SPAWN_AFTER_NORMAL_FOOD);
    nextNormalFoodsSinceBonus = accruedNormalFoods % BONUS_FOOD_CONFIG.SPAWN_AFTER_NORMAL_FOOD;
  }

  let resolvedFood = [...nextFood].filter((foodItem) => !isFoodExpired(foodItem, currentTimestamp));
  let bonusFoodSpawnedThisTick = 0;

  if (bonusFoodEnabled && !resolvedFood.some((foodItem) => isBonusFood(foodItem)) && nextPendingBonusSpawns > 0) {
    const bonusPosition = generateLargeFoodPosition(
      boardSize.width,
      boardSize.height,
      newSnakes,
      resolvedFood
    );

    if (bonusPosition) {
      resolvedFood.push(createLargeBonusFood(bonusPosition, currentTimestamp));
      nextPendingBonusSpawns -= 1;
      bonusFoodSpawnedThisTick = 1;
    }
  }

  return {
    bonusFoodSpawnedThisTick,
    normalFoodsSinceBonus: nextNormalFoodsSinceBonus,
    pendingBonusSpawns: nextPendingBonusSpawns,
    resolvedFood
  };
};
