import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Footer from './Footer.jsx';

vi.mock('@/utils/sound', () => ({
  playClick: vi.fn()
}));

describe('Footer', () => {
  it('renders key links', () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Footer />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: /^help & support$/i })).toHaveAttribute('href', '/support');
    expect(screen.getByRole('link', { name: /privacy policy/i })).toHaveAttribute('href', '/privacy');
    expect(screen.getByRole('link', { name: /terms & conditions/i })).toHaveAttribute('href', '/terms');
  });
});
