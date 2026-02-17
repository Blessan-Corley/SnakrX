import { describe, expect, it } from 'vitest';
import {
  FRIENDSHIP_STATUSES,
  buildFriendRelationshipMap,
  getRelationshipState,
  upsertRelationshipProfile
} from './relationshipState.js';

describe('friend relationship state helpers', () => {
  it('builds a relationship map with correct status precedence', () => {
    const relationshipMap = buildFriendRelationshipMap({
      currentUserId: 'u1',
      friends: [{ id: 'u2', displayName: 'Friend' }],
      pendingRequests: [{ id: 'u3', displayName: 'Incoming' }],
      outgoingRequests: [{ id: 'u4', displayName: 'Outgoing' }]
    });

    expect(relationshipMap.u1.status).toBe(FRIENDSHIP_STATUSES.SELF);
    expect(relationshipMap.u2.status).toBe(FRIENDSHIP_STATUSES.ACCEPTED);
    expect(relationshipMap.u3.status).toBe(FRIENDSHIP_STATUSES.PENDING_RECEIVED);
    expect(relationshipMap.u4.status).toBe(FRIENDSHIP_STATUSES.PENDING_SENT);
  });

  it('returns a safe none/self fallback when no relationship exists', () => {
    expect(getRelationshipState({}, 'u2', 'u1')).toEqual({
      status: FRIENDSHIP_STATUSES.NONE,
      profile: null
    });
    expect(getRelationshipState({}, 'u1', 'u1')).toEqual({
      status: FRIENDSHIP_STATUSES.SELF,
      profile: null
    });
  });

  it('upserts relationship profiles without duplicating ids', () => {
    const items = upsertRelationshipProfile(
      [{ id: 'u2', displayName: 'Old Name' }],
      { id: 'u2', displayName: 'New Name' },
      FRIENDSHIP_STATUSES.PENDING_SENT
    );

    expect(items).toEqual([
      {
        id: 'u2',
        displayName: 'New Name',
        status: FRIENDSHIP_STATUSES.PENDING_SENT
      }
    ]);
  });
});
