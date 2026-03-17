import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { UsersTab } from './UsersTab.jsx';

describe('UsersTab', () => {
  it('renders filters, applies filter actions, and forwards pagination', () => {
    const onPrevPage = vi.fn();
    const onNextPage = vi.fn();
    const onApplyFilters = vi.fn();
    const onResetFilters = vi.fn();
    const onFilterChange = vi.fn();

    render(
      <UsersTab
        users={[
          {
            id: 'u-1',
            username: 'alpha',
            displayName: 'Alpha',
            email: 'alpha@example.com',
            role: 'admin',
            banned: false,
            lastActive: new Date(),
            stats: { bestScore: 100, totalGames: 5, achievementsCompleted: 2 }
          }
        ]}
        loading={false}
        filters={{
          draft: {
            search: '',
            role: 'all',
            bannedState: 'all',
            activityWindow: 'all',
            sortBy: 'createdAt_desc'
          },
          active: {
            search: '',
            role: 'all',
            bannedState: 'all',
            activityWindow: 'all',
            sortBy: 'createdAt_desc'
          }
        }}
        onFilterChange={onFilterChange}
        onApplyFilters={onApplyFilters}
        onResetFilters={onResetFilters}
        onRefresh={() => {}}
        onBanUser={() => {}}
        pagination={{ page: 2, limit: 25, hasPrev: true, hasNext: true }}
        onPrevPage={onPrevPage}
        onNextPage={onNextPage}
      />
    );

    expect(screen.getByText('Users Page 2')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/search username, name, or email/i), {
      target: { value: 'alpha' }
    });
    expect(onFilterChange).toHaveBeenCalledWith('search', 'alpha');

    fireEvent.click(screen.getByRole('button', { name: /apply filters/i }));
    fireEvent.click(screen.getByRole('button', { name: /reset/i }));
    fireEvent.click(screen.getByRole('button', { name: /previous users page/i }));
    fireEvent.click(screen.getByRole('button', { name: /next users page/i }));

    expect(onApplyFilters).toHaveBeenCalledTimes(1);
    expect(onResetFilters).toHaveBeenCalledTimes(1);
    expect(onPrevPage).toHaveBeenCalledTimes(1);
    expect(onNextPage).toHaveBeenCalledTimes(1);
  });
});
