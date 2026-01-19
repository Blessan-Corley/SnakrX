export const countSnakeFoodEvents = (events = [], snakeId = 0) => (
  Array.isArray(events)
    ? events.reduce((count, event) => (
      event?.type === 'EAT' && event.snakeId === snakeId ? count + 1 : count
    ), 0)
    : 0
);

export const countNormalFoodEvents = (events = []) => (
  Array.isArray(events)
    ? events.reduce((count, event) => (
      event?.type === 'EAT' ? count + 1 : count
    ), 0)
    : 0
);

export const countSnakeBonusFoodEvents = (events = [], snakeId = 0) => (
  Array.isArray(events)
    ? events.reduce((count, event) => (
      event?.type === 'BONUS_EAT' && event.snakeId === snakeId ? count + 1 : count
    ), 0)
    : 0
);

export const countSnakeBonusFoodPoints = (events = [], snakeId = 0) => (
  Array.isArray(events)
    ? events.reduce((total, event) => (
      event?.type === 'BONUS_EAT' && event.snakeId === snakeId
        ? total + (Number(event.points) || 0)
        : total
    ), 0)
    : 0
);

export const getTrackedMaxLength = (gameState = {}) => {
  const trackedLength = Number(gameState?.maxLengthReached) || 0;
  const currentLength = Number(gameState?.snakes?.[0]?.body?.length) || 0;

  return Math.max(1, trackedLength, currentLength);
};

export const shouldRecordQuickDeath = ({
  victory = false,
  gameTime = 0,
  thresholdSeconds = 0
} = {}) => !victory && Number(gameTime) < Number(thresholdSeconds);
