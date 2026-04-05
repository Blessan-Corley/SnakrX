import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import GamePage from './GamePage.jsx';

const navigateSpy = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateSpy
  };
});

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    userProfile: {
      stats: {
        totalGames: 5,
        totalWins: 2,
        bestScore: 250,
        totalPlayTime: 600,
        classicWins: 1,
        vsaiGames: 3,
        vsaiWins: 1
      }
    }
  })
}));

vi.mock('@/utils/gameUtils', async () => {
  const actual = await vi.importActual('@/utils/gameUtils');
  return {
    ...actual,
    isMobile: () => false
  };
});

describe('GamePage mode flows', () => {
  beforeEach(() => {
    navigateSpy.mockReset();
    window.localStorage.clear();
  });

  it('shows classic sub-modes when mode=classic and navigates to transparent mode', async () => {
    render(
      <MemoryRouter
        initialEntries={['/game?mode=classic']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <GamePage />
      </MemoryRouter>
    );

    expect(screen.getByText('Classic Mode Options')).toBeInTheDocument();
    expect(screen.getByText('Transparent Mode')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Transparent Mode'));

    expect(navigateSpy).toHaveBeenCalledWith('/game/classic_transparent');
  });

  it('configures VS AI difficulty and starts with selected difficulty', async () => {
    render(
      <MemoryRouter
        initialEntries={['/game']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <GamePage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /customize vs ai mode/i }));
    expect(screen.getByText('Select Difficulty')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Impossible'));
    fireEvent.click(screen.getByRole('button', { name: /start game/i }));

    expect(navigateSpy).toHaveBeenCalledWith('/game/vsai/impossible');
  });

  it('can disable bonus food before starting a match', async () => {
    render(
      <MemoryRouter
        initialEntries={['/game']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <GamePage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /customize vs ai mode/i }));
    fireEvent.click(screen.getByRole('switch', { name: /toggle large bonus food/i }));
    fireEvent.click(screen.getByRole('button', { name: /start game/i }));

    expect(navigateSpy).toHaveBeenCalledWith('/game/vsai/impossible?bonusFood=off');
  });

  it('keeps bonus food preference and defaults VS AI difficulty selection to impossible', async () => {
    window.localStorage.setItem('snakrx:lastPlayedMode', JSON.stringify({
      mode: 'vsai',
      difficulty: 'medium',
      playerCount: 2,
      bonusFoodEnabled: false
    }));

    render(
      <MemoryRouter
        initialEntries={['/game']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <GamePage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /customize vs ai mode/i }));
    expect(screen.getByRole('switch', { name: /toggle large bonus food/i })).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(screen.getByRole('button', { name: /start game/i }));

    expect(navigateSpy).toHaveBeenCalledWith('/game/vsai/impossible?bonusFood=off');
  });
});
