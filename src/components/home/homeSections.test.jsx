import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomeAchievementsPanel from './HomeAchievementsPanel.jsx';
import HomeFirstGameCta from './HomeFirstGameCta.jsx';
import HomeGameModesSection from './HomeGameModesSection.jsx';

describe('home page sections', () => {
  it('renders game modes and handles primary actions', () => {
    const onOpenHelp = vi.fn();
    const onPlayLastMode = vi.fn();
    const onSelectMode = vi.fn();

    render(
      <HomeGameModesSection
        showGameModes={true}
        lastPlayedSelection={{ mode: 'classic' }}
        mobile={false}
        onOpenHelp={onOpenHelp}
        onPlayLastMode={onPlayLastMode}
        onSelectMode={onSelectMode}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'How to Play' }));
    fireEvent.click(screen.getByRole('button', { name: /Continue Last Played/i }));
    fireEvent.click(screen.getByText('Classic Mode'));

    expect(onOpenHelp).toHaveBeenCalledOnce();
    expect(onPlayLastMode).toHaveBeenCalledOnce();
    expect(onSelectMode).toHaveBeenCalledWith('classic');
  });

  it('hides multiplayer interaction on mobile and renders first-game cta only for new players', () => {
    const onSelectMode = vi.fn();
    const onPlay = vi.fn();

    const { rerender } = render(
      <HomeGameModesSection
        showGameModes={true}
        lastPlayedSelection={null}
        mobile={true}
        onOpenHelp={vi.fn()}
        onPlayLastMode={vi.fn()}
        onSelectMode={onSelectMode}
      />
    );

    expect(screen.getByText('Play on PC/Laptop to unlock full experience')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Multiplayer Mode'));
    expect(onSelectMode).not.toHaveBeenCalled();

    rerender(<HomeFirstGameCta totalGames={0} lastPlayedSelection={null} onPlay={onPlay} />);
    fireEvent.click(screen.getByRole('button', { name: 'Start with Classic Mode' }));
    expect(onPlay).toHaveBeenCalledOnce();
  });

  it('renders achievement states for upcoming and empty recent unlocks', () => {
    render(
      <MemoryRouter>
        <HomeAchievementsPanel
          nextAchievements={[{
            id: 'a1',
            title: 'First Steps',
            description: 'Play once',
            tier: 'common',
            points: 5,
            requirements: { totalGames: 1 },
            progress: 50
          }]}
          recentUnlocks={[]}
          userStats={{ totalGames: 0 }}
          onViewAchievements={vi.fn()}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Next to Unlock')).toBeInTheDocument();
    expect(screen.getByText('Recent Achievements')).toBeInTheDocument();
    expect(screen.getByText('No achievements yet!')).toBeInTheDocument();
  });
});
