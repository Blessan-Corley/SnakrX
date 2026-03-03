import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route, useNavigate } from 'react-router-dom';
import ScrollToTop from './ScrollToTop.jsx';

const NavHarness = () => {
  const navigate = useNavigate();

  return (
    <button type="button" onClick={() => navigate('/privacy')}>Go Privacy</button>
  );
};

describe('ScrollToTop', () => {
  beforeEach(() => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    document.documentElement.scrollTop = 420;
    document.body.scrollTop = 420;
  });

  it('resets scroll position on route changes', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter
        initialEntries={['/landing']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <ScrollToTop />
        <Routes>
          <Route path="/landing" element={<NavHarness />} />
          <Route path="/privacy" element={<div>Privacy Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    await act(async () => {
      await user.click(screen.getByRole('button', { name: /go privacy/i }));
    });

    await waitFor(() => {
      expect(screen.getByText('Privacy Page')).toBeInTheDocument();
    });
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'auto' });
    expect(document.documentElement.scrollTop).toBe(0);
    expect(document.body.scrollTop).toBe(0);
  });
});
