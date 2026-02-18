import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import GameDeveloperHud from './GameDeveloperHud.jsx';

const monitorMock = vi.fn();

vi.mock('./InputPerformanceMonitor.jsx', () => ({
  default: (props) => {
    monitorMock(props);
    return <div data-testid="input-monitor" />;
  }
}));

describe('GameDeveloperHud', () => {
  it('renders warning banner when input warning exists', () => {
    render(
      <GameDeveloperHud
        getInputPerformance={vi.fn()}
        inputWarning="High latency"
        showPerformanceMonitor={true}
      />
    );

    expect(screen.getByText('Warning: High latency')).toBeInTheDocument();
    if (import.meta.env.DEV) {
      expect(screen.getByTestId('input-monitor')).toBeInTheDocument();
      expect(monitorMock.mock.calls[0][0].position).toBe('top-left');
    }
  });

  it('omits warning banner when warning is absent', () => {
    render(
      <GameDeveloperHud
        getInputPerformance={vi.fn()}
        inputWarning={null}
        showPerformanceMonitor={false}
      />
    );

    expect(screen.queryByText(/Warning:/i)).not.toBeInTheDocument();
  });
});
