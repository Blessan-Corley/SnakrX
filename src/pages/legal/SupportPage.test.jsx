import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SupportPage from './SupportPage.jsx';
import { supportOperations } from '@/services/firebase/support.js';
import toast from 'react-hot-toast';

const mockAuthState = {
  user: null,
  userProfile: null
};
const createAttachmentFile = () => new File(['proof'], 'proof.png', { type: 'image/png' });

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockAuthState
}));

vi.mock('@/services/firebase/support.js', () => ({
  supportOperations: {
    submitTicket: vi.fn(),
    createTicket: vi.fn(),
    getUserTickets: vi.fn(),
    markTicketUpdatesSeen: vi.fn(),
    subscribeToUserTickets: vi.fn(() => vi.fn())
  }
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

const renderSupportPage = () => render(
  <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <SupportPage />
  </MemoryRouter>
);

describe('SupportPage', () => {
  let openSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthState.user = null;
    mockAuthState.userProfile = null;
    openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    supportOperations.submitTicket.mockResolvedValue({ id: 'ticket-1' });
    supportOperations.getUserTickets.mockResolvedValue([]);
    supportOperations.markTicketUpdatesSeen.mockResolvedValue(1);
  });

  afterEach(() => {
    openSpy.mockRestore();
  });

  it('renders support email and form fields', () => {
    renderSupportPage();

    expect(screen.getByText('snakrxgame@gmail.com')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send to Support' })).toBeInTheDocument();
  });

  it('opens WhatsApp from the support contact card', async () => {
    renderSupportPage();

    fireEvent.click(
      screen.getByRole('heading', { name: 'WhatsApp' }).closest('[class*="cursor-pointer"]')
    );

    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining('https://wa.me/919976768211?text='),
      '_self'
    );
  });

  it('shows detailed support request categories in the dropdown', () => {
    renderSupportPage();

    const categorySelect = screen.getByLabelText('Category');
    expect(categorySelect).toHaveDisplayValue('Other support request');

    fireEvent.change(categorySelect, { target: { value: 'username_change' } });
    expect(categorySelect).toHaveDisplayValue('Username change request');
  });

  it('submits support form directly without opening mail client', async () => {
    renderSupportPage();

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Test Player' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'player@example.com' } });
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'player1' } });
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Username change request' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Please rename my account to playerOne.' } });
    fireEvent.change(screen.getByLabelText('Device or Browser'), { target: { value: 'Windows 11 / Chrome' } });

    fireEvent.click(screen.getByRole('button', { name: 'Send to Support' }));

    await waitFor(() => {
      expect(supportOperations.submitTicket).toHaveBeenCalledTimes(1);
    });
    expect(openSpy).not.toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalled();
  });

  it('stores support ticket when user is authenticated', async () => {
    mockAuthState.user = { uid: 'user-1', email: 'player@example.com' };
    mockAuthState.userProfile = { username: 'player1', displayName: 'Player One' };
    supportOperations.getUserTickets.mockResolvedValue([
      {
        id: 'ticket-1',
        title: 'Score issue',
        description: 'Score did not save.',
        status: 'in_progress',
        priority: 'high',
        customerUnreadUpdate: true,
        adminResponse: 'We are checking the game session logs now.',
        category: 'score_sync',
        clientCreatedAt: Date.now()
      }
    ]);

    renderSupportPage();

    expect(await screen.findByText('Your Support Tickets')).toBeInTheDocument();
    expect(screen.getByText('New admin update')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Player One' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'player@example.com' } });
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'player1' } });
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Score issue' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Score did not save.' } });

    fireEvent.click(screen.getByRole('button', { name: 'Send to Support' }));

    await waitFor(() => {
      expect(supportOperations.submitTicket).toHaveBeenCalledTimes(1);
    });
    const [userPayload, ticketPayload] = supportOperations.submitTicket.mock.calls[0];
    expect(userPayload).toMatchObject({ uid: 'user-1', email: 'player@example.com', username: 'player1' });
    expect(ticketPayload).toMatchObject({
      name: 'Player One',
      email: 'player@example.com',
      username: 'player1',
      title: 'Score issue',
      description: 'Score did not save.'
    });
    expect(openSpy).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /mark update read/i }));
    await waitFor(() => {
      expect(supportOperations.markTicketUpdatesSeen).toHaveBeenCalledWith(['ticket-1']);
    });
  }, 10000);

  it('passes selected attachment files to support submission', async () => {
    renderSupportPage();

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Test Player' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'player@example.com' } });
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Attachment issue' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Please check the attached screenshot for the bug.' } });
    fireEvent.change(screen.getByLabelText('Attachments'), {
      target: {
        files: [createAttachmentFile()]
      }
    });

    fireEvent.click(screen.getByRole('button', { name: 'Send to Support' }));

    await waitFor(() => {
      expect(supportOperations.submitTicket).toHaveBeenCalledTimes(1);
    });

    const [, payload] = supportOperations.submitTicket.mock.calls[0];
    expect(payload.attachmentNames).toEqual(['proof.png']);
    expect(payload.attachmentFiles).toHaveLength(1);
    expect(payload.attachmentFiles[0]).toBeInstanceOf(File);
  });
});


