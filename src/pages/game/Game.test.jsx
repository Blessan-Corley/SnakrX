import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import Game from './Game.jsx';

const controllerMock = vi.fn();
const stageMock = vi.fn();
const resultModalMock = vi.fn();
const achievementModalMock = vi.fn();
const confirmModalMock = vi.fn();
const developerHudMock = vi.fn();
const loadingSpinnerMock = vi.fn();

vi.mock('./useGamePageController.js', () => ({
  useGamePageController: () => controllerMock()
}));

vi.mock('../../components/game/GameSessionBackground.jsx', () => ({
  default: () => <div data-testid="game-session-background" />
}));

vi.mock('../../components/game/GameStage.jsx', () => ({
  default: (props) => {
    stageMock(props);
    return <div data-testid="game-stage" />;
  }
}));

vi.mock('../../components/game/GameResultModal.jsx', () => ({
  default: (props) => {
    resultModalMock(props);
    return <button type="button" onClick={props.onClose}>close-result</button>;
  }
}));

vi.mock('../../components/game/AchievementUnlockModal.jsx', () => ({
  default: (props) => {
    achievementModalMock(props);
    return <button type="button" onClick={props.onClose}>close-achievement</button>;
  }
}));

vi.mock('../../components/ui/Modal.jsx', () => ({
  ConfirmModal: (props) => {
    confirmModalMock(props);
    return <button type="button" onClick={props.onConfirm}>confirm-leave</button>;
  }
}));

vi.mock('../../components/game/GameDeveloperHud.jsx', () => ({
  default: (props) => {
    developerHudMock(props);
    return <div data-testid="game-dev-hud" />;
  }
}));

vi.mock('../../components/ui/LoadingSpinner.jsx', () => ({
  default: (props) => {
    loadingSpinnerMock(props);
    return <div data-testid="loading-spinner" />;
  }
}));

const baseController = () => ({
  loading: false,
  resolvedMode: 'classic',
  boardSize: { width: 20, height: 18 },
  getCurrentKeyMappings: () => [],
  deadPlayers: new Set(),
  food: [{ x: 1, y: 1 }],
  foodEaten: 2,
  gameStatus: 'playing',
  gameTime: 10,
  highlightCollision: null,
  isGameActive: true,
  isGameOver: false,
  isMultiplayerMode: false,
  isPaused: false,
  mobile: false,
  multiplayerReadyPlayers: {},
  navigate: vi.fn(),
  numPlayers: 1,
  handleQuit: vi.fn(),
  handleRestart: vi.fn(),
  togglePause: vi.fn(),
  handleTouchControl: vi.fn(),
  onTouchEnd: vi.fn(),
  onTouchMove: vi.fn(),
  onTouchStart: vi.fn(),
  readyPlayersCount: 0,
  resolvedDifficulty: 'medium',
  score: 42,
  showCollisionHighlight: false,
  snakes: [{ body: [{ x: 1, y: 1 }] }],
  speedMultiplier: 1,
  showGameOverModal: true,
  setShowGameOverModal: vi.fn(),
  modalTitle: 'Game Over',
  isVictory: false,
  isVsAiMode: false,
  userFinalScore: 42,
  aiFinalScore: 12,
  vsAiResultLabel: '',
  multiplayerWinner: null,
  multiplayerScoreRows: [],
  handleContinue: vi.fn(),
  handleShareScore: vi.fn(),
  showAchievementModal: true,
  setShowAchievementModal: vi.fn(),
  newAchievement: { id: 'a1' },
  AchievementIcon: () => null,
  leaveConfirmState: { isOpen: true },
  handleLeaveCancel: vi.fn(),
  handleLeaveConfirm: vi.fn(),
  getInputPerformance: vi.fn(),
  inputWarning: 'warn',
  showPerformanceMonitor: true
});

describe('Game page', () => {
  beforeEach(() => {
    controllerMock.mockReset();
    stageMock.mockReset();
    resultModalMock.mockReset();
    achievementModalMock.mockReset();
    confirmModalMock.mockReset();
    developerHudMock.mockReset();
    loadingSpinnerMock.mockReset();
  });

  it('shows loading spinner while game controller is loading', () => {
    controllerMock.mockReturnValue({
      ...baseController(),
      loading: true,
      resolvedMode: 'vsai'
    });

    render(<Game />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(loadingSpinnerMock.mock.calls[0][0].text).toContain('vsai');
    expect(stageMock).not.toHaveBeenCalled();
  });

  it('renders main stage and wires modal close handlers', () => {
    const controller = baseController();
    controllerMock.mockReturnValue(controller);

    render(<Game />);
    expect(screen.getByTestId('game-session-background')).toBeInTheDocument();
    expect(screen.getByTestId('game-stage')).toBeInTheDocument();
    expect(screen.getByTestId('game-dev-hud')).toBeInTheDocument();

    const stageProps = stageMock.mock.calls[0][0];
    expect(stageProps.score).toBe(42);
    expect(stageProps.resolvedMode).toBe('classic');

    fireEvent.click(screen.getByRole('button', { name: 'close-result' }));
    expect(controller.setShowGameOverModal).toHaveBeenCalledWith(false);

    fireEvent.click(screen.getByRole('button', { name: 'close-achievement' }));
    expect(controller.setShowAchievementModal).toHaveBeenCalledWith(false);

    fireEvent.click(screen.getByRole('button', { name: 'confirm-leave' }));
    expect(controller.handleLeaveConfirm).toHaveBeenCalled();
  });
});
