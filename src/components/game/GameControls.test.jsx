import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { DIRECTIONS } from '@/utils/gameUtils.js';
import GameControls, { FloatingGameHUD, GameOverOverlay } from './GameControls.jsx';

const playClickMock = vi.fn();

vi.mock('@/utils/sound.js', () => ({
  playClick: () => playClickMock()
}));

describe('GameControls', () => {
  beforeEach(() => {
    playClickMock.mockReset();
  });

  it('renders stats and control sections', () => {
    render(
      <GameControls
        score={120}
        gameTime={75}
        foodEaten={8}
        gameMode="classic"
        speedMultiplier={1.3}
        isPlaying={true}
      />
    );

    expect(screen.getByText('Game Stats')).toBeInTheDocument();
    expect(screen.getByText('Controls')).toBeInTheDocument();
    expect(screen.getByText('Keyboard')).toBeInTheDocument();
    expect(screen.getByText('Touch Controls')).toBeInTheDocument();
  });

  it('invokes pause, restart, and quit actions', () => {
    const onPause = vi.fn();
    const onRestart = vi.fn();
    const onQuit = vi.fn();

    render(
      <GameControls
        isPlaying={true}
        onPause={onPause}
        onRestart={onRestart}
        onQuit={onQuit}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Pause game' }));
    fireEvent.click(screen.getByRole('button', { name: 'Restart game' }));
    fireEvent.click(screen.getByRole('button', { name: 'Return to main menu' }));

    expect(onPause).toHaveBeenCalledOnce();
    expect(onRestart).toHaveBeenCalledOnce();
    expect(onQuit).toHaveBeenCalledOnce();
  });

  it('sends mobile direction input and plays click sound', () => {
    const onMobileControl = vi.fn();

    render(
      <GameControls
        isPlaying={true}
        showMobileControls={true}
        onMobileControl={onMobileControl}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Move up' }));

    expect(onMobileControl).toHaveBeenCalledWith(DIRECTIONS.UP);
    expect(playClickMock).toHaveBeenCalled();
  });
});

describe('GameControls overlays', () => {
  it('toggles floating HUD pause action', () => {
    const onPause = vi.fn();

    render(
      <FloatingGameHUD
        score={50}
        gameTime={22}
        isPaused={false}
        onPause={onPause}
      />
    );

    fireEvent.click(screen.getByRole('button'));
    expect(onPause).toHaveBeenCalledOnce();
  });

  it('renders game over overlay and action callbacks', () => {
    const onRestart = vi.fn();
    const onQuit = vi.fn();

    render(
      <GameOverOverlay
        isVisible={true}
        score={140}
        gameTime={31}
        onRestart={onRestart}
        onQuit={onQuit}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Play Again' }));
    fireEvent.click(screen.getByRole('button', { name: 'Menu' }));

    expect(onRestart).toHaveBeenCalledOnce();
    expect(onQuit).toHaveBeenCalledOnce();
  });
});
