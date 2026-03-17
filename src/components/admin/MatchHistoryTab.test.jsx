import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MatchHistoryTab } from './MatchHistoryTab.jsx';

describe('MatchHistoryTab', () => {
  it('renders filters, keeps xp visible, and forwards page actions', () => {
    const onPrevPage = vi.fn();
    const onNextPage = vi.fn();
    const onApplyFilters = vi.fn();
    const onResetFilters = vi.fn();
    const onFilterChange = vi.fn();

    render(
      <MatchHistoryTab
        matchHistory={[
          {
            id: 'g-1',
            username: 'alpha',
            mode: 'classic',
            score: 120,
            duration: 35,
            xpGained: 42,
            result: 'completed',
            timestamp: new Date()
          }
        ]}
        loading={false}
        filters={{
          draft: {
            search: '',
            mode: 'all',
            result: 'all',
            minScore: '',
            maxScore: '',
            period: 'all',
            sortBy: 'createdAt_desc'
          },
          active: {
            search: '',
            mode: 'all',
            result: 'all',
            minScore: '',
            maxScore: '',
            period: 'all',
            sortBy: 'createdAt_desc'
          }
        }}
        onFilterChange={onFilterChange}
        onApplyFilters={onApplyFilters}
        onResetFilters={onResetFilters}
        pagination={{ page: 3, limit: 20, hasPrev: true, hasNext: false }}
        onPrevPage={onPrevPage}
        onNextPage={onNextPage}
        onRefresh={() => {}}
      />
    );

    expect(screen.getByText('Games Page 3')).toBeInTheDocument();
    expect(screen.getByText('+42 XP')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/search username or user id/i), {
      target: { value: 'alpha' }
    });
    fireEvent.change(screen.getByPlaceholderText(/minimum score/i), {
      target: { value: '500' }
    });

    expect(onFilterChange).toHaveBeenNthCalledWith(1, 'search', 'alpha');
    expect(onFilterChange).toHaveBeenNthCalledWith(2, 'minScore', '500');

    fireEvent.click(screen.getByRole('button', { name: /apply filters/i }));
    fireEvent.click(screen.getByRole('button', { name: /reset/i }));
    fireEvent.click(screen.getByRole('button', { name: /previous games page/i }));

    expect(onApplyFilters).toHaveBeenCalledTimes(1);
    expect(onResetFilters).toHaveBeenCalledTimes(1);
    expect(onPrevPage).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: /next games page/i })).toBeDisabled();
  });
});
