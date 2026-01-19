import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import InputPerformanceMonitor from './InputPerformanceMonitor.jsx';

const sampleMetrics = {
  averageLatency: '4.2ms',
  successRate: '99%',
  queueSize: 1,
  keysDown: 2,
  totalInputs: 12,
  processedInputs: 11,
  droppedInputs: 1
};

describe('InputPerformanceMonitor', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not render when hidden or missing data provider', () => {
    const { rerender } = render(
      <InputPerformanceMonitor
        getInputPerformance={vi.fn()}
        isVisible={false}
      />
    );
    expect(screen.queryByText('Input Monitor')).not.toBeInTheDocument();

    rerender(
      <InputPerformanceMonitor
        getInputPerformance={null}
        isVisible={true}
      />
    );
    expect(screen.queryByText('Input Monitor')).not.toBeInTheDocument();
  });

  it('renders metrics, updates on interval, and supports expand/collapse', () => {
    const getInputPerformance = vi.fn(() => sampleMetrics);

    render(
      <InputPerformanceMonitor
        getInputPerformance={getInputPerformance}
        isVisible={true}
        position="bottom-left"
      />
    );

    expect(screen.getByText('Input Monitor')).toBeInTheDocument();
    expect(getInputPerformance).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(getInputPerformance).toHaveBeenCalledTimes(3);

    fireEvent.click(screen.getByText('Input Monitor'));
    expect(screen.getByText('Latency')).toBeInTheDocument();
    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('Total:')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });
});
