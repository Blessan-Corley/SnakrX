import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetDocs = vi.fn();
const mockHttpsCallable = vi.fn();
const mockOnSnapshot = vi.fn();
const createFileLike = (overrides = {}) => ({
  name: 'proof.png',
  type: 'image/png',
  size: 1024,
  arrayBuffer: vi.fn(async () => Uint8Array.from([1, 2, 3, 4]).buffer),
  ...overrides
});

vi.mock('./config.js', () => ({
  db: {},
  collection: vi.fn((_, name) => ({ name })),
  getDocs: (...args) => mockGetDocs(...args),
  onSnapshot: (...args) => mockOnSnapshot(...args),
  functions: {},
  httpsCallable: (...args) => mockHttpsCallable(...args),
  query: vi.fn(() => ({ type: 'query' })),
  where: vi.fn(() => ({ type: 'where' })),
  orderBy: vi.fn(() => ({ type: 'orderBy' })),
  limit: vi.fn(() => ({ type: 'limit' })),
  serverTimestamp: vi.fn(() => ({ __serverTimestamp: true })),
  COLLECTIONS: {
    SUPPORT_TICKETS: 'supportTickets'
  }
}));

vi.mock('../../utils/logger.js', () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    log: vi.fn()
  }
}));

describe('supportOperations', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    mockOnSnapshot.mockImplementation((_queryRef, onData) => {
      onData({ docs: [] });
      return vi.fn();
    });
    mockHttpsCallable.mockImplementation((_, name) => {
      if (name === 'submitSupportTicket') {
        return vi.fn().mockResolvedValue({ data: { ticketId: 'ticket-fn-1' } });
      }
      if (name === 'updateSupportTicket') {
        return vi.fn().mockResolvedValue({
          data: {
            ticket: {
              id: 'ticket-1',
              status: 'resolved',
              priority: 'high',
              adminResponse: 'Fixed'
            }
          }
        });
      }
      if (name === 'markSupportTicketUpdatesSeen') {
        return vi.fn().mockResolvedValue({ data: { updatedCount: 1 } });
      }
      return vi.fn();
    });

    const module = await import('./support/callables.js');
    module.__private__.resetCallables();
  });

  it('submits support ticket through cloud function', async () => {
    const { supportOperations } = await import('./support.js');

    const ticketId = await supportOperations.submitTicket(
      { uid: 'u1', email: 'player@example.com', username: 'tester' },
      {
        title: 'Need help',
        description: 'Something is wrong',
        category: 'general',
        attachmentFiles: [createFileLike()]
      }
    );

    expect(mockHttpsCallable).toHaveBeenCalledTimes(1);
    expect(ticketId).toBe('ticket-fn-1');
  });

  it('propagates callable submission failures without falling back to direct writes', async () => {
    mockHttpsCallable.mockImplementationOnce(() => vi.fn().mockRejectedValue(new Error('functions unavailable')));
    const { supportOperations } = await import('./support.js');

    await expect(
      supportOperations.submitTicket(
        { uid: 'u1', email: 'player@example.com', username: 'tester' },
        {
          title: 'Need help',
          description: 'Something is wrong',
          category: 'general',
          attachmentFiles: [createFileLike()]
        }
      )
    ).rejects.toThrow(/functions unavailable/i);
  });

  it('serializes support attachments before calling the backend', async () => {
    const { supportOperations } = await import('./support.js');

    await supportOperations.submitTicket(
      { uid: 'u1', email: 'player@example.com', username: 'tester' },
      {
        title: 'Need help',
        description: 'Something is wrong',
        category: 'general',
        attachmentNames: ['proof.png'],
        attachmentFiles: [createFileLike()]
      }
    );

    const submitSupportTicket = mockHttpsCallable.mock.results.find((result) => typeof result.value === 'function')?.value;
    expect(submitSupportTicket).toHaveBeenCalledWith(expect.objectContaining({
      payload: expect.objectContaining({
        attachmentNames: ['proof.png'],
        attachments: [
          {
            name: 'proof.png',
            contentType: 'image/png',
            size: 1024,
            dataBase64: 'AQIDBA=='
          }
        ]
      })
    }));
  });

  it('updates support ticket through callable admin flow', async () => {
    const { supportOperations } = await import('./support.js');
    const ticket = await supportOperations.updateTicket('ticket-1', {
      status: 'resolved',
      priority: 'high',
      adminResponse: 'Fixed'
    });

    expect(ticket).toMatchObject({
      id: 'ticket-1',
      status: 'resolved',
      priority: 'high',
      adminResponse: 'Fixed'
    });
  });

  it('returns empty array when fetching tickets fails', async () => {
    mockGetDocs.mockRejectedValueOnce(new Error('firestore unavailable'));
    const { supportOperations } = await import('./support.js');
    const tickets = await supportOperations.getRecentTickets(20);
    expect(tickets).toEqual([]);
  });

  it('fetches user tickets sorted by most recently updated', async () => {
    mockGetDocs.mockResolvedValue({
      docs: [
        {
          id: 'ticket-1',
          data: () => ({
            title: 'Older',
            userId: 'u1',
            updatedAt: { seconds: 10 }
          })
        },
        {
          id: 'ticket-2',
          data: () => ({
            title: 'Newer',
            userId: 'u1',
            updatedAt: { seconds: 20 }
          })
        }
      ]
    });

    const { supportOperations } = await import('./support.js');
    const tickets = await supportOperations.getUserTickets('u1', 10);

    expect(tickets.map((ticket) => ticket.id)).toEqual(['ticket-2', 'ticket-1']);
  });

  it('marks ticket updates as seen through callable flow', async () => {
    const { supportOperations } = await import('./support.js');
    const updatedCount = await supportOperations.markTicketUpdatesSeen(['ticket-1']);
    expect(updatedCount).toBe(1);
  });

  it('subscribes to recent tickets with snapshot updates', async () => {
    mockOnSnapshot.mockImplementationOnce((_queryRef, onData) => {
      onData({
        docs: [
          {
            id: 'ticket-1',
            data: () => ({
              title: 'Realtime',
              updatedAt: { seconds: 5 }
            })
          }
        ]
      });
      return vi.fn();
    });

    const { supportOperations } = await import('./support.js');
    const onData = vi.fn();

    supportOperations.subscribeToRecentTickets(10, onData);

    expect(onData).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'ticket-1', title: 'Realtime' })
    ]);
  });
});
