import { GAME_MODES } from '../../../utils/gameUtils.js';

export const resolveGameOutcome = ({ gameMode, newSnakes }) => {
  const aliveSnakes = newSnakes.filter(
    (snake) => snake && snake.isAlive && Array.isArray(snake.body) && snake.body.length > 0
  );

  if (
    gameMode === GAME_MODES.CLASSIC ||
    gameMode === GAME_MODES.CLASSIC_TRANSPARENT
  ) {
    return { gameEnded: !aliveSnakes.find((snake) => snake.id === 0), victory: false };
  }

  if (gameMode === GAME_MODES.VS_AI) {
    return { gameEnded: aliveSnakes.length <= 1, victory: false };
  }

  if (gameMode === GAME_MODES.MULTIPLAYER && aliveSnakes.length <= 1) {
    return { gameEnded: true, victory: aliveSnakes.length === 1 };
  }

  return { gameEnded: false, victory: false };
};
