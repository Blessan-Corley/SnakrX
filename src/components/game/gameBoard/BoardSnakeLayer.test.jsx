import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import BoardSnakeLayer from './BoardSnakeLayer.jsx';

const renderLayer = (props) => render(
  <svg>
    <BoardSnakeLayer {...props} />
  </svg>
);

describe('BoardSnakeLayer', () => {
  it('renders player snake head/body and collision highlight', () => {
    const { container } = renderLayer({
      snakes: [{ body: [{ x: 2, y: 3 }, { x: 2, y: 4 }] }],
      deadPlayers: new Set(),
      highlightCollision: { x: 2, y: 3 },
      safeCellSize: 20
    });

    const headRect = Array.from(container.querySelectorAll('rect'))
      .find((element) => element.getAttribute('stroke') === '#ffffff');
    expect(headRect).toBeTruthy();

    const highlightCircle = Array.from(container.querySelectorAll('circle'))
      .find((element) => element.getAttribute('class') === 'animate-ping');
    expect(highlightCircle).toBeTruthy();
  });

  it('renders AI indicator and dead-player styling branches', () => {
    const { container } = renderLayer({
      snakes: [
        { isAI: true, body: [{ x: 0, y: 0 }] },
        { body: [{ x: 1, y: 1 }] }
      ],
      deadPlayers: new Set([1]),
      highlightCollision: null,
      safeCellSize: 20
    });

    const aiRect = Array.from(container.querySelectorAll('rect'))
      .find((element) => element.getAttribute('fill') === '#ff6b00');
    expect(aiRect).toBeTruthy();

    const deadRect = Array.from(container.querySelectorAll('rect'))
      .find((element) => element.getAttribute('fill') === '#666666');
    expect(deadRect).toBeTruthy();
    expect(deadRect.getAttribute('opacity')).toBe('0.5');
  });

  it('skips invalid snakes and invalid body segments', () => {
    const { container } = renderLayer({
      snakes: [
        null,
        { body: [] },
        { body: [{ x: 'bad', y: 1 }, { x: 1, y: 1 }] }
      ],
      safeCellSize: 20
    });

    expect(container.querySelectorAll('rect').length).toBe(1);
  });
});
