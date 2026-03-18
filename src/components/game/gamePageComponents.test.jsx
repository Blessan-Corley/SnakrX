import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import AchievementUnlockModal from './AchievementUnlockModal.jsx';
import GameModeConfigurationPanel from './GameModeConfigurationPanel.jsx';
import GameReadyOverlay from './GameReadyOverlay.jsx';
import GameResultModal from './GameResultModal.jsx';
import { Cpu } from 'lucide-react';

const gameStates = {
  READY: 'ready'
};

const modeDescriptions = {
  classic: { rules: ['Avoid walls'] },
  multiplayer: { rules: ['Highest score wins'] }
};

describe('game page components', () => {
  it('renders the single-player ready overlay', () => {
    render(
      <GameReadyOverlay
        gameStatus="ready"
        gameStates={gameStates}
        isMultiplayerMode={false}
        numPlayers={1}
        multiplayerReadyPlayers={{}}
        readyPlayersCount={0}
        resolvedMode="classic"
        modeDescriptions={modeDescriptions}
      />
    );

    expect(screen.getByText('Get Ready!')).toBeInTheDocument();
    expect(screen.getByText('Avoid walls')).toBeInTheDocument();
  });

  it('renders multiplayer ready state and result modal branches', () => {
    const onRestart = vi.fn();

    const { rerender } = render(
      <GameReadyOverlay
        gameStatus="ready"
        gameStates={gameStates}
        isMultiplayerMode={true}
        numPlayers={2}
        multiplayerReadyPlayers={{ 0: true }}
        readyPlayersCount={1}
        resolvedMode="multiplayer"
        modeDescriptions={modeDescriptions}
      />
    );

    expect(screen.getByText('Multiplayer Ready Check')).toBeInTheDocument();
    expect(screen.getByText('Ready: 1/2')).toBeInTheDocument();

    rerender(
      <GameResultModal
        isOpen={true}
        onClose={vi.fn()}
        modalTitle="Victory!"
        isVictory={true}
        isVsAiMode={true}
        isMultiplayerMode={false}
        userFinalScore={120}
        aiFinalScore={100}
        vsAiResultLabel="You Win"
        multiplayerWinner={null}
        multiplayerScoreRows={[]}
        score={120}
        onRestart={onRestart}
        onContinue={vi.fn()}
        onShareScore={vi.fn()}
        onQuit={vi.fn()}
      />
    );

    expect(screen.getByText('You Win')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Play Again' }));
    expect(onRestart).toHaveBeenCalledOnce();
  });

  it('renders achievement modal content', () => {
    const MockIcon = (props) => <svg data-testid="achievement-icon" {...props} />;
    const onClose = vi.fn();

    render(
      <AchievementUnlockModal
        isOpen={true}
        onClose={onClose}
        achievement={{ title: 'Champion', description: 'Win a match' }}
        AchievementIcon={MockIcon}
      />
    );

    expect(screen.getByText('Champion')).toBeInTheDocument();
    expect(screen.getByTestId('achievement-icon')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Awesome!' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('renders VS AI difficulty cards in a multiplayer-style compact grid', () => {
    const onBack = vi.fn();

    render(
      <GameModeConfigurationPanel
        aiDifficulty="medium"
        bonusFoodToggle={() => <div>Bonus toggle</div>}
        onBack={onBack}
        onDifficultySelect={vi.fn()}
        onPlayerCountChange={vi.fn()}
        onPlayerCountSelect={vi.fn()}
        onStartGame={vi.fn()}
        playerCount={2}
        selectedMode={{
          id: 'vsai',
          title: 'VS AI Mode',
          Icon: Cpu
        }}
      />
    );

    const difficultyGrid = screen.getByTestId('vsai-difficulty-grid');

    expect(difficultyGrid.className).toContain('md:grid-cols-3');
    expect(screen.getByRole('button', { name: /easy/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /medium/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /impossible/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /view all modes/i }));
    expect(onBack).toHaveBeenCalledOnce();
  });
});
