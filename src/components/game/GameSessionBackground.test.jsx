import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import GameSessionBackground from './GameSessionBackground.jsx';

vi.mock('framer-motion', () => ({
  motion: {
    div: (props) => <div data-testid="motion-div" {...props} />
  }
}));

describe('GameSessionBackground', () => {
  it('renders animated session backdrop container', () => {
    const { container } = render(<GameSessionBackground />);
    expect(container.firstChild).toHaveClass('absolute', 'inset-0', 'z-0');
    expect(screen.getByTestId('motion-div')).toBeInTheDocument();
  });
});
