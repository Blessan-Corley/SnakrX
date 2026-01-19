import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import BoardFoodLayer from './BoardFoodLayer.jsx';

const renderLayer = (props) => render(
  <svg>
    <BoardFoodLayer {...props} />
  </svg>
);

describe('BoardFoodLayer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders nothing when food is missing', () => {
    const { container } = renderLayer({ food: null, safeCellSize: 20 });
    expect(container.querySelectorAll('rect').length).toBe(0);
    expect(container.querySelectorAll('circle').length).toBe(0);
  });

  it('renders a standard food item with expected geometry', () => {
    const { container } = renderLayer({
      food: { x: 1, y: 2 },
      safeCellSize: 20
    });

    const redFoodRect = Array.from(container.querySelectorAll('rect'))
      .find((element) => element.getAttribute('fill') === '#ff0000');

    expect(redFoodRect).toBeTruthy();
    expect(redFoodRect.getAttribute('x')).toBe('22');
    expect(redFoodRect.getAttribute('y')).toBe('42');
    expect(container.querySelectorAll('circle').length).toBe(2);
  });

  it('renders large bonus food visuals and expiry pulse state', () => {
    const now = Date.now();
    const { container } = renderLayer({
      food: {
        id: 'bonus-1',
        x: 3,
        y: 4,
        type: 'bonus_large',
        size: 2,
        expiresAt: now + 120
      },
      safeCellSize: 20
    });

    const bonusGroup = container.querySelector('g.animate-pulse');
    expect(bonusGroup).toBeTruthy();

    const outlinedRect = Array.from(container.querySelectorAll('rect'))
      .find((element) => element.getAttribute('stroke') === '#f59e0b');
    expect(outlinedRect).toBeTruthy();
    expect(outlinedRect.getAttribute('width')).toBe('44');
  });

  it('ignores invalid entries and still renders valid array items', () => {
    const { container } = renderLayer({
      food: [
        null,
        { x: 'bad', y: 1 },
        { x: 0, y: 0 }
      ],
      safeCellSize: 20
    });

    const redFoodRect = Array.from(container.querySelectorAll('rect'))
      .find((element) => element.getAttribute('fill') === '#ff0000');
    expect(redFoodRect).toBeTruthy();
    expect(container.querySelectorAll('g').length).toBe(1);
  });
});
