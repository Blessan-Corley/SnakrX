import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import LandingPage from './LandingPage.jsx';

vi.mock('@/utils/sound', () => ({
  playClick: vi.fn(),
  playHover: vi.fn()
}));

describe('LandingPage', () => {
  it('renders primary auth links', () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <LandingPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: /^sign in$/i })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: /get started/i })).toHaveAttribute('href', '/register');
  });
});
