import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { SupportTicketsTab } from './SupportTicketsTab.jsx';

const defaultFilters = {
  draft: {
    search: '',
    status: 'all',
    priority: 'all',
    unreadOnly: false,
    period: 'all',
    sortBy: 'updatedAt_desc'
  },
  active: {
    search: '',
    status: 'all',
    priority: 'all',
    unreadOnly: false,
    period: 'all',
    sortBy: 'updatedAt_desc'
  }
};

describe('SupportTicketsTab', () => {
  it('renders ticket summary, filtering actions, and saves admin ticket updates', async () => {
    const onUpdateTicket = vi.fn().mockResolvedValue({
      id: 'ticket-1',
      status: 'resolved',
      priority: 'high',
      adminResponse: 'Issue fixed.'
    });
    const onFilterChange = vi.fn();
    const onApplyFilters = vi.fn();
    const onResetFilters = vi.fn();

    render(
      <SupportTicketsTab
        tickets={[
          {
            id: 'ticket-1',
            title: 'Username change',
            description: 'Please update my username.',
            status: 'open',
            priority: 'normal',
            adminResponse: '',
            customerUnreadUpdate: true,
            displayName: 'Player One',
            email: 'player@example.com',
            createdAt: { seconds: 10 },
            updatedAt: { seconds: 20 }
          }
        ]}
        summary={{
          open: 1,
          needsReply: 1,
          resolved: 0
        }}
        filters={defaultFilters}
        onFilterChange={onFilterChange}
        onApplyFilters={onApplyFilters}
        onResetFilters={onResetFilters}
        onUpdateTicket={onUpdateTicket}
        pagination={{ page: 1, limit: 10, hasPrev: false, hasNext: false }}
      />
    );

    expect(screen.getByText('Open Queue')).toBeInTheDocument();
    expect(screen.getByText('Player Unread')).toBeInTheDocument();
    expect(screen.getByText('User sees new update')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/search ticket, user, email, title, or category/i), {
      target: { value: 'username' }
    });
    expect(onFilterChange).toHaveBeenCalledWith('search', 'username');

    fireEvent.click(screen.getByRole('button', { name: /apply filters/i }));
    fireEvent.click(screen.getByRole('button', { name: /reset/i }));

    expect(onApplyFilters).toHaveBeenCalledTimes(1);
    expect(onResetFilters).toHaveBeenCalledTimes(1);

    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[selects.length - 2], { target: { value: 'resolved' } });
    fireEvent.change(selects[selects.length - 1], { target: { value: 'high' } });
    fireEvent.change(screen.getByPlaceholderText(/add the latest status/i), {
      target: { value: 'Issue fixed.' }
    });
    fireEvent.click(screen.getByRole('button', { name: /save ticket update/i }));

    await waitFor(() => {
      expect(onUpdateTicket).toHaveBeenCalledWith('ticket-1', {
        status: 'resolved',
        priority: 'high',
        adminResponse: 'Issue fixed.'
      });
    });
  });

  it('renders pagination controls for ticket browsing', () => {
    const onNextPage = vi.fn();

    render(
      <SupportTicketsTab
        tickets={[
          {
            id: 'ticket-1',
            title: 'Ticket 1',
            description: 'Please help with this issue.',
            status: 'open',
            priority: 'normal',
            adminResponse: '',
            customerUnreadUpdate: false,
            displayName: 'Player 1',
            email: 'player1@example.com',
            createdAt: { seconds: 1 },
            updatedAt: { seconds: 1 }
          }
        ]}
        summary={{
          open: 1,
          needsReply: 0,
          resolved: 0
        }}
        filters={defaultFilters}
        pagination={{ page: 2, limit: 10, hasPrev: true, hasNext: true }}
        onNextPage={onNextPage}
      />
    );

    expect(screen.getByText('Tickets Page 2')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /next tickets page/i }));
    expect(onNextPage).toHaveBeenCalledTimes(1);
  });
});
