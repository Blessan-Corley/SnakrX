export const FRIENDSHIP_STATUSES = {
  NONE: 'none',
  SELF: 'self',
  ACCEPTED: 'accepted',
  PENDING_SENT: 'pending_sent',
  PENDING_RECEIVED: 'pending_received'
};

const applyRelationshipRecord = (map, items, status) => {
  items.forEach((item) => {
    if (!item?.id) return;
    map[item.id] = {
      status,
      profile: item
    };
  });
};

export const buildFriendRelationshipMap = ({
  currentUserId = null,
  friends = [],
  pendingRequests = [],
  outgoingRequests = []
}) => {
  const map = {};

  if (currentUserId) {
    map[currentUserId] = {
      status: FRIENDSHIP_STATUSES.SELF,
      profile: null
    };
  }

  applyRelationshipRecord(map, outgoingRequests, FRIENDSHIP_STATUSES.PENDING_SENT);
  applyRelationshipRecord(map, pendingRequests, FRIENDSHIP_STATUSES.PENDING_RECEIVED);
  applyRelationshipRecord(map, friends, FRIENDSHIP_STATUSES.ACCEPTED);

  return map;
};

export const getRelationshipState = (relationshipMap, targetId, currentUserId = null) => {
  if (!targetId) {
    return {
      status: FRIENDSHIP_STATUSES.NONE,
      profile: null
    };
  }

  if (relationshipMap[targetId]) {
    return relationshipMap[targetId];
  }

  if (currentUserId && targetId === currentUserId) {
    return {
      status: FRIENDSHIP_STATUSES.SELF,
      profile: null
    };
  }

  return {
    status: FRIENDSHIP_STATUSES.NONE,
    profile: null
  };
};

export const upsertRelationshipProfile = (items, profile, fallbackStatus = null) => {
  if (!profile?.id) return items;

  const nextItems = items.filter((item) => item.id !== profile.id);
  nextItems.unshift({
    ...profile,
    ...(fallbackStatus ? { status: fallbackStatus } : {})
  });
  return nextItems;
};
