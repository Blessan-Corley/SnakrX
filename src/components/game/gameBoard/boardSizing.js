import { DEFAULT_BOARD_SIZE } from './constants.js';

export const normalizeBoardSize = (boardSize) => {
  const width = Number(boardSize?.width);
  const height = Number(boardSize?.height);

  if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
    return { width, height };
  }

  return DEFAULT_BOARD_SIZE;
};
