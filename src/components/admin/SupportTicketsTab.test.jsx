import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { SupportTicketsTab } from './SupportTicketsTab.jsx';

describe('SupportTicketsTab', () => {
  it('renders ticket counts and saves admin ticket updates', async () => {
    const onUpdateTicket = vi.fn().mockResolvedValue({
      id: 'ticket-1',
      status: 'resolved',
      priority: 'high',
      adminResponse: 'Issue fixed.'
    });

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
        onUpdateTicket={onUpdateTicket}
      />
    );

    expect(screen.getByText('Open Queue')).toBeInTheDocument();
    expect(screen.getByText('Player Unread')).toBeInTheDocument();
    expect(screen.getByText('User sees new update')).toBeInTheDocument();

    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[1], { target: { value: 'resolved' } });
    fireEvent.change(selects[2], { target: { value: 'high' } });
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
});
