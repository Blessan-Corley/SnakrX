import {
  GAME_MODES,
  GAME_STATES,
  SPEED_CONFIGS,
  createNormalFood,
  generateFoodPosition,
  generateGameId,
  getBoardSize,
  getStartingDirections,
  getStartingPositions,
  isMobile
} from '../../utils/gameUtils.js';
import { AIController } from '../../utils/aiPathfinding.js';

const createInitialSnakes = ({ boardSize, mode, playerCount }) => {
  const positions = getStartingPositions(playerCount, boardSize.width, boardSize.height);
  const directions = getStartingDirections(playerCount);

  const snakes = [];
  for (let index = 0; index < playerCount; index += 1) {
    snakes.push({
      id: index,
      body: [positions[index]],
      direction: directions[index],
      isAI: mode === GAME_MODES.VS_AI && index === 1,
      isAlive: true,
      color: index === 0 ? '#10b981' : '#ef4444',
      score: 0
    });
  }

  return snakes;
};

export const buildInitialGameSessionState = ({
  bonusFoodEnabled,
  difficulty,
  mode,
  playerCount
}) => {
  const boardSize = getBoardSize(mode, playerCount, isMobile());
  const gameId = generateGameId();
  const snakes = createInitialSnakes({ boardSize, mode, playerCount });
  const aiController = mode === GAME_MODES.VS_AI
    ? new AIController(boardSize.width, boardSize.height, difficulty)
    : null;
  const initialFood = [
    createNormalFood(
      generateFoodPosition(boardSize.width, boardSize.height, snakes.map((snake) => snake.body)),
      Date.now()
    )
  ];

  return {
    gameState: GAME_STATES.READY,
    gameMode: mode,
    difficulty,
    playerCount,
    boardSize,
    snakes,
    food: initialFood,
    score: 0,
    gameTime: 0,
    speed: SPEED_CONFIGS.INITIAL,
    foodEaten: 0,
    isPaused: false,
    aiController,
    deadPlayers: new Set(),
    gameId,
    startTime: null,
    moves: 0,
    wallHits: 0,
    selfHits: 0,
    timeToFirstFood: null,
    timeToMaxLength: null,
    maxLengthReached: 1,
    closeCalls: 0,
    fastEats: 0,
    highlightCollision: null,
    bonusFoodEnabled: bonusFoodEnabled !== false,
    normalFoodsSinceBonus: 0,
    pendingBonusSpawns: 0,
    bonusFoodsSpawned: 0,
    bonusFoodsCollected: 0,
    bonusFoodPoints: 0
  };
};
