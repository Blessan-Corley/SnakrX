import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import GameStage from './GameStage.jsx';

const boardMock = vi.fn();
const readyOverlayMock = vi.fn();
const sidebarMock = vi.fn();

vi.mock('./GameBoard.jsx', () => ({
  GameBoardWithOverlay: (props) => {
    boardMock(props);
    return <div data-testid="board-with-overlay" />;
  }
}));

vi.mock('./GameReadyOverlay.jsx', () => ({
  default: (props) => {
    readyOverlayMock(props);
    return <div data-testid="ready-overlay" />;
  }
}));

vi.mock('./GameSidebar.jsx', () => ({
  default: (props) => {
    sidebarMock(props);
    return <div data-testid="game-sidebar" />;
  }
}));

const createProps = () => ({
  boardSize: { width: 20, height: 18 },
  currentKeyMappings: [],
  deadPlayers: new Set(),
  food: [{ x: 1, y: 1 }],
  foodEaten: 2,
  gameState: 'playing',
  gameStates: { READY: 'ready', PLAYING: 'playing' },
  gameTime: 12,
  highlightCollision: { x: 4, y: 5 },
  isGameActive: true,
  isGameOver: false,
  isMultiplayerMode: false,
  isPaused: false,
  mobile: false,
  modeDescriptions: { classic: { rules: ['Avoid walls'] } },
  multiplayerReadyPlayers: {},
  navigate: vi.fn(),
  numPlayers: 1,
  onQuit: vi.fn(),
  onRestart: vi.fn(),
  onTogglePause: vi.fn(),
  onTouchControl: vi.fn(),
  onTouchEnd: vi.fn(),
  onTouchMove: vi.fn(),
  onTouchStart: vi.fn(),
  readyPlayersCount: 0,
  resolvedDifficulty: 'medium',
  resolvedMode: 'classic',
  score: 20,
  showCollisionHighlight: false,
  snakes: [{ body: [{ x: 1, y: 1 }] }],
  speedMultiplier: 1
});

describe('GameStage', () => {
  beforeEach(() => {
    boardMock.mockClear();
    readyOverlayMock.mockClear();
    sidebarMock.mockClear();
  });

  it('wires props to board, ready overlay, and sidebar', () => {
    const props = createProps();
    render(<GameStage {...props} />);

    expect(screen.getByTestId('board-with-overlay')).toBeInTheDocument();
    expect(screen.getByTestId('ready-overlay')).toBeInTheDocument();
    expect(screen.getByTestId('game-sidebar')).toBeInTheDocument();

    const boardProps = boardMock.mock.calls[0][0];
    expect(boardProps.highlightCollision).toBeNull();
    expect(boardProps.isPaused).toBe(false);

    const sidebarProps = sidebarMock.mock.calls[0][0];
    expect(sidebarProps.resolvedMode).toBe('classic');
    expect(sidebarProps.score).toBe(20);
  });

  it('passes collision marker when highlighting is enabled and forwards touch handlers', () => {
    const props = createProps();
    props.showCollisionHighlight = true;

    render(<GameStage {...props} />);
    fireEvent.touchStart(screen.getByTestId('board-with-overlay'));
    fireEvent.touchMove(screen.getByTestId('board-with-overlay'));
    fireEvent.touchEnd(screen.getByTestId('board-with-overlay'));

    const boardProps = boardMock.mock.calls[0][0];
    expect(boardProps.highlightCollision).toEqual({ x: 4, y: 5 });
    expect(props.onTouchStart).toHaveBeenCalled();
    expect(props.onTouchMove).toHaveBeenCalled();
    expect(props.onTouchEnd).toHaveBeenCalled();
  });
});
