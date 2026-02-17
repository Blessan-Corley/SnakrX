import { describe, expect, it } from 'vitest';
import {
  buildTicketSummary,
  createTicketDraft,
  filterTickets,
  formatDateTime
} from './helpers.js';

describe('support ticket helpers', () => {
  it('formats timestamps across supported input shapes', () => {
    expect(formatDateTime(null)).toBe('Unknown');
    expect(formatDateTime({ toDate: () => new Date('2026-01-01T00:00:00.000Z') })).toContain('2026');
    expect(formatDateTime({ seconds: 1000 })).toContain('1970');
    expect(formatDateTime('invalid-date')).toBe('Unknown');
  });

  it('builds queue summary counts correctly', () => {
    const summary = buildTicketSummary([
      { status: 'open', customerUnreadUpdate: true },
      { status: 'pending_user', customerUnreadUpdate: false },
      { status: 'resolved', customerUnreadUpdate: true },
      { status: 'closed', customerUnreadUpdate: false }
    ]);

    expect(summary).toEqual({
      open: 2,
      needsReply: 2,
      resolved: 2
    });
  });

  it('filters tickets by status and search text', () => {
    const tickets = [
      { id: 'A1', status: 'open', title: 'Login issue', email: 'a@example.com' },
      { id: 'B2', status: 'resolved', title: 'Leaderboard request', username: 'beta' }
    ];

    expect(filterTickets({ tickets, statusFilter: 'open' })).toHaveLength(1);
    expect(filterTickets({ tickets, searchTerm: 'leaderboard' })).toHaveLength(1);
    expect(filterTickets({ tickets, searchTerm: 'nomatch' })).toHaveLength(0);
  });

  it('creates drafts with safe defaults', () => {
    expect(createTicketDraft({})).toEqual({
      status: 'open',
      priority: 'normal',
      adminResponse: ''
    });
  });
});
