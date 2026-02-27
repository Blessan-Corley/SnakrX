import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import GameSidebar from './GameSidebar.jsx';

const gameControlsMock = vi.fn();
const playClickMock = vi.fn();

vi.mock('@/components/game/GameControls.jsx', () => ({
  default: (props) => {
    gameControlsMock(props);
    return <div data-testid="game-controls" />;
  }
}));

vi.mock('@/utils/sound.js', () => ({
  playClick: (...args) => playClickMock(...args)
}));

const baseProps = () => ({
  navigate: vi.fn(),
  mobile: false,
  numPlayers: 1,
  gameStatus: 'playing',
  gameStates: { PLAYING: 'playing' },
  currentKeyMappings: [
    { playerId: 0, playerName: 'Player 1' },
    { playerId: 1, playerName: 'Player 2' }
  ],
  resolvedMode: 'classic',
  resolvedDifficulty: 'medium',
  isGameActive: true,
  isPaused: false,
  isGameOver: false,
  score: 100,
  gameTime: 20,
  speedMultiplier: 1,
  foodEaten: 5,
  snakes: [{ body: [{ x: 1, y: 1 }] }],
  onTouchControl: vi.fn(),
  onTogglePause: vi.fn(),
  onRestart: vi.fn(),
  onQuit: vi.fn()
});

describe('GameSidebar', () => {
  beforeEach(() => {
    gameControlsMock.mockClear();
    playClickMock.mockClear();
  });

  it('navigates to help and maps gameplay props to GameControls', () => {
    const props = baseProps();
    render(<GameSidebar {...props} />);

    fireEvent.click(screen.getByRole('button', { name: /how to play/i }));
    expect(playClickMock).toHaveBeenCalled();
    expect(props.navigate).toHaveBeenCalledWith('/help');

    const controlsProps = gameControlsMock.mock.calls[0][0];
    expect(controlsProps.gameMode).toBe('classic');
    expect(controlsProps.disabled).toBe(false);
  });

  it('renders multiplayer key hints and disabled controls in non-playing state', () => {
    const props = baseProps();
    props.numPlayers = 3;
    props.gameStatus = 'ready';

    render(<GameSidebar {...props} />);
    expect(screen.getByText(/Player 1:/i)).toBeInTheDocument();
    expect(screen.getByText(/Player 2:/i)).toBeInTheDocument();

    const controlsProps = gameControlsMock.mock.calls[0][0];
    expect(controlsProps.disabled).toBe(true);
  });
});
