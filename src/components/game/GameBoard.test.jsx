import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GameBoardWithOverlay } from './GameBoard.jsx';

describe('GameBoard', () => {
  it('falls back to safe dimensions when board size is invalid', () => {
    render(
      <GameBoardWithOverlay
        boardSize={{ width: NaN, height: undefined }}
        snakes={[]}
        food={[]}
        isPaused={false}
        isGameOver={false}
      />
    );

    const board = screen.getByRole('img', { name: /snake game board/i });
    const svg = board.querySelector('svg');

    expect(svg).toBeTruthy();
    expect(svg.getAttribute('width')).not.toBe('NaN');
    expect(svg.getAttribute('height')).not.toBe('NaN');
  });
});
