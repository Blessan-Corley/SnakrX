import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AdminFilterBar from './AdminFilterBar.jsx';

describe('AdminFilterBar', () => {
  it('renders filter content and forwards apply, reset, and refresh actions', () => {
    const onApply = vi.fn();
    const onReset = vi.fn();
    const onRefresh = vi.fn();

    render(
      <AdminFilterBar
        title="User Filters"
        description="Find the exact users you need."
        onApply={onApply}
        onReset={onReset}
        onRefresh={onRefresh}
      >
        <label htmlFor="search">Search</label>
        <input id="search" type="text" />
      </AdminFilterBar>
    );

    expect(screen.getByText('User Filters')).toBeInTheDocument();
    expect(screen.getByText('Find the exact users you need.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /apply filters/i }));
    fireEvent.click(screen.getByRole('button', { name: /reset/i }));
    fireEvent.click(screen.getByRole('button', { name: /refresh/i }));

    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onReset).toHaveBeenCalledTimes(1);
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });
});
