// @vitest-environment node
import { beforeAll, describe, expect, it } from 'vitest';

let supportPrivate;

beforeAll(async () => {
  const supportModule = await import('./support.js');
  supportPrivate = (supportModule.default ?? supportModule).__private__;
});

describe('support helpers', () => {
  it('normalizes valid support ticket input', () => {
    const payload = supportPrivate.resolveSupportTicketInput({
      payload: {
        email: ' Player@Example.com ',
        description: 'The leaderboard did not update after my game.',
        title: ' Score issue ',
        category: 'score_sync'
      },
      userPayload: {},
      authenticatedEmail: ''
    });

    expect(payload).toMatchObject({
      email: 'player@example.com',
      title: 'Score issue',
      category: 'score_sync',
      description: 'The leaderboard did not update after my game.'
    });
  });

  it('rejects invalid support submissions', () => {
    expect(() => supportPrivate.resolveSupportTicketInput({
      payload: {
        email: 'bad-email',
        description: 'Long enough description',
        category: 'score_sync'
      }
    })).toThrow(/valid email/i);

    expect(() => supportPrivate.resolveSupportTicketInput({
      payload: {
        email: 'player@example.com',
        description: 'short',
        category: 'score_sync'
      }
    })).toThrow(/more detail/i);

    expect(() => supportPrivate.resolveSupportTicketInput({
      payload: {
        email: 'player@example.com',
        description: 'This description is long enough for validation.',
        category: 'not-real'
      }
    })).toThrow(/invalid support ticket category/i);
  });
});

