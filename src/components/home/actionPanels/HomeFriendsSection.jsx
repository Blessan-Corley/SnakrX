import { Check, UserPlus, Users, X } from 'lucide-react';
import Button from '@/components/ui/Button.jsx';
import Card from '@/components/ui/Card.jsx';
import UserAvatar from '@/components/ui/UserAvatar.jsx';

const RelationshipActionButton = ({
  getRelationshipStatus,
  onAcceptRequest,
  onSendRequest,
  userId
}) => {
  const status = getRelationshipStatus(userId);

  if (status === 'none') {
    return (
      <Button size="sm" variant="ghost-primary" onClick={() => onSendRequest(userId)}>
        Send
      </Button>
    );
  }

  if (status === 'pending_sent') {
    return (
      <Button size="sm" variant="ghost" disabled>
        Request Sent
      </Button>
    );
  }

  if (status === 'pending_received') {
    return (
      <Button size="sm" variant="success" onClick={() => onAcceptRequest(userId)}>
        Accept
      </Button>
    );
  }

  if (status === 'accepted') {
    return (
      <Button size="sm" variant="ghost" disabled>
        Friends
      </Button>
    );
  }

  return null;
};

const HomeFriendsSection = ({
  friendSearch,
  getRelationshipStatus,
  onAcceptRequest,
  onCancelRequest,
  onFriendSearchChange,
  onFriendSearchSubmit,
  onManageFriends,
  onRejectRequest,
  onSendRequest,
  outgoingRequests,
  pendingRequests,
  searchResults,
  searching
}) => (
  <div>
    <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
      <Users className="mr-2" size={20} />
      Friends
    </h3>
    <Card variant="glass" padding="lg">
      {pendingRequests.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-white/80 mb-3">Pending Requests</h4>
          <div className="space-y-3">
            {pendingRequests.slice(0, 3).map((request) => (
              <div key={request.id} className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
                <div className="flex items-center gap-3">
                  <UserAvatar profile={request} size="xs" className="border border-white/20" />
                  <div>
                    <p className="text-white font-medium">{request.displayName}</p>
                    <p className="text-xs text-white/50">@{request.username}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="success" icon={<Check size={14} />} onClick={() => onAcceptRequest(request.id)}>
                    Accept
                  </Button>
                  <Button size="sm" variant="danger" icon={<X size={14} />} onClick={() => onRejectRequest(request.id)}>
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {outgoingRequests.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-white/80 mb-3">Sent Requests</h4>
          <div className="space-y-3">
            {outgoingRequests.slice(0, 3).map((request) => (
              <div key={request.id} className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
                <div className="flex items-center gap-3">
                  <UserAvatar profile={request} size="xs" className="border border-white/20" />
                  <div>
                    <p className="text-white font-medium">{request.displayName}</p>
                    <p className="text-xs text-white/50">@{request.username}</p>
                  </div>
                </div>
                <Button size="sm" variant="ghost-danger" onClick={() => onCancelRequest(request.id)}>
                  Cancel
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={onFriendSearchSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="Search username or display name"
          value={friendSearch}
          onChange={(event) => onFriendSearchChange(event.target.value)}
          className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <Button type="submit" loading={searching} icon={<UserPlus size={16} />}>
          Add
        </Button>
      </form>

      {searchResults.length > 0 && (
        <div className="mt-4 space-y-2">
          {searchResults.slice(0, 5).map((user) => (
            <div key={user.id} className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
              <div className="flex items-center gap-3">
                <UserAvatar profile={user} size="xs" className="border border-white/20" />
                <div>
                  <p className="text-white font-medium">{user.displayName}</p>
                  <p className="text-xs text-white/50">@{user.username}</p>
                </div>
              </div>
              <RelationshipActionButton
                getRelationshipStatus={getRelationshipStatus}
                onAcceptRequest={onAcceptRequest}
                onSendRequest={onSendRequest}
                userId={user.id}
              />
            </div>
          ))}
        </div>
      )}

      <div className="mt-4">
        <Button variant="ghost" fullWidth onClick={onManageFriends}>
          Manage Friends
        </Button>
      </div>
    </Card>
  </div>
);

export default HomeFriendsSection;
