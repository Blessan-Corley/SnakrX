import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import ErrorBoundary, { ErrorFallback } from './ErrorBoundary.jsx';

const ThrowingComponent = () => {
  throw new Error('Network request failed');
};

describe('ErrorBoundary', () => {
  it('renders the default fallback UI when a child crashes', () => {
    const originalConsoleError = console.error;
    const originalConsoleGroup = console.group;
    const originalConsoleGroupEnd = console.groupEnd;
    console.error = vi.fn();
    console.group = vi.fn();
    console.groupEnd = vi.fn();

    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Network Error/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();

    console.error = originalConsoleError;
    console.group = originalConsoleGroup;
    console.groupEnd = originalConsoleGroupEnd;
  });

  it('passes callbacks to a custom fallback component', () => {
    const onRetry = vi.fn();
    const CustomFallback = ({ onRetry: retry }) => (
      <button type="button" onClick={() => { retry(); onRetry(); }}>
        retry-custom
      </button>
    );

    const originalConsoleError = console.error;
    const originalConsoleGroup = console.group;
    const originalConsoleGroupEnd = console.groupEnd;
    console.error = vi.fn();
    console.group = vi.fn();
    console.groupEnd = vi.fn();

    render(
      <ErrorBoundary fallback={CustomFallback}>
        <ThrowingComponent />
      </ErrorBoundary>
    );

    fireEvent.click(screen.getByRole('button', { name: 'retry-custom' }));
    expect(onRetry).toHaveBeenCalledOnce();

    console.error = originalConsoleError;
    console.group = originalConsoleGroup;
    console.groupEnd = originalConsoleGroupEnd;
  });
});

describe('ErrorFallback helper component', () => {
  it('renders detail section and retry handler', () => {
    const onRetry = vi.fn();
    render(
      <ErrorFallback
        error={new Error('section failed')}
        onRetry={onRetry}
        showDetails={true}
        title="Section Broken"
      />
    );

    expect(screen.getByText('Section Broken')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Try Again/i }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
