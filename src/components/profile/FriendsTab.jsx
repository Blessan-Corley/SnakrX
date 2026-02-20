import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, Check, X } from 'lucide-react';
import { useFriends } from '@/hooks/useFriends';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import UserAvatar from '@/components/ui/UserAvatar';
import { ConfirmModal } from '@/components/ui/Modal';
import { FriendList } from './FriendList';

export const FriendsTab = () => {
  const navigate = useNavigate();
  const { 
    friends, 
    pendingRequests, 
    outgoingRequests,
    searchResults, 
    searching, 
    searchUsers, 
    sendRequest, 
    acceptRequest, 
    cancelRequest,
    getRelationshipStatus,
    removeFriend,
    rejectRequest
  } = useFriends();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [friendToRemove, setFriendToRemove] = useState(null);
  const [removingFriend, setRemovingFriend] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    searchUsers(searchTerm);
  };

  const handleOpenRemoveModal = (friendId) => {
    const selectedFriend = friends.find(friend => friend.id === friendId) || null;
    setFriendToRemove(selectedFriend);
  };

  const handleCloseRemoveModal = () => {
    if (removingFriend) return;
    setFriendToRemove(null);
  };

  const handleConfirmRemove = async () => {
    if (!friendToRemove?.id) return;
    setRemovingFriend(true);
    try {
      await removeFriend(friendToRemove.id);
      setFriendToRemove(null);
    } finally {
      setRemovingFriend(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card variant="glass" padding="md" className="border-l-4 border-l-amber-500">
          <h3 className="text-lg font-bold text-white mb-4">Friend Requests</h3>
          <div className="space-y-3">
            {pendingRequests.map(req => (
              <div key={req.id} className="flex justify-between items-center bg-black/20 p-3 rounded-lg">
                <div className="flex items-center space-x-3">
                  <UserAvatar profile={req} size="xs" className="border border-white/20" />
                  <div>
                    <div className="font-bold text-white">{req.displayName}</div>
                    <div className="text-xs text-white/50">@{req.username}</div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="ghost" onClick={() => navigate(`/player/${req.id}`)}>View</Button>
                  <Button size="sm" variant="success" icon={<Check size={14} />} onClick={() => acceptRequest(req.id)}>Accept</Button>
                  <Button size="sm" variant="danger" icon={<X size={14} />} onClick={() => rejectRequest(req.id)}>Reject</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {outgoingRequests.length > 0 && (
        <Card variant="glass" padding="md" className="border-l-4 border-l-primary-500">
          <h3 className="text-lg font-bold text-white mb-4">Sent Requests</h3>
          <div className="space-y-3">
            {outgoingRequests.map((request) => (
              <div key={request.id} className="flex justify-between items-center bg-black/20 p-3 rounded-lg">
                <div className="flex items-center space-x-3">
                  <UserAvatar profile={request} size="xs" className="border border-white/20" />
                  <div>
                    <div className="font-bold text-white">{request.displayName}</div>
                    <div className="text-xs text-white/50">@{request.username}</div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="ghost" onClick={() => navigate(`/player/${request.id}`)}>View</Button>
                  <Button size="sm" variant="ghost-danger" onClick={() => cancelRequest(request.id)}>Cancel</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Add Friends */}
      <Card variant="glass" padding="md">
        <h3 className="text-lg font-bold text-white mb-4">Find Friends</h3>
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
            <input 
              type="text" 
              placeholder="Search by username..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <Button type="submit" loading={searching}>Search</Button>
        </form>

        {searchResults.length > 0 && (
          <div className="space-y-2">
            {searchResults.map(user => (
              <div key={user.id} className="flex justify-between items-center p-2 hover:bg-white/5 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <UserAvatar profile={user} size="xs" className="border border-white/20" />
                  <span className="text-white">{user.displayName}</span>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="ghost" onClick={() => navigate(`/player/${user.id}`)}>View</Button>
                  {getRelationshipStatus(user.id) === 'none' && (
                    <Button size="sm" variant="ghost-primary" icon={<UserPlus size={16} />} onClick={() => sendRequest(user.id)}>Add</Button>
                  )}
                  {getRelationshipStatus(user.id) === 'pending_sent' && (
                    <Button size="sm" variant="ghost" disabled>Request Sent</Button>
                  )}
                  {getRelationshipStatus(user.id) === 'pending_received' && (
                    <Button size="sm" variant="success" onClick={() => acceptRequest(user.id)}>Accept</Button>
                  )}
                  {getRelationshipStatus(user.id) === 'accepted' && (
                    <Button size="sm" variant="ghost" disabled>Friends</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Friend List */}
      <Card variant="glass" padding="md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white">My Friends ({friends.length})</h3>
        </div>
        <FriendList friends={friends} onRemove={handleOpenRemoveModal} onView={(id) => navigate(`/player/${id}`)} />
      </Card>

      <ConfirmModal
        isOpen={Boolean(friendToRemove)}
        onClose={handleCloseRemoveModal}
        onConfirm={handleConfirmRemove}
        title="Remove Friend"
        message={friendToRemove
          ? `Remove ${friendToRemove.displayName || friendToRemove.username || 'this friend'} from your friends list?`
          : 'Remove this friend from your friends list?'}
        confirmText="Remove"
        cancelText="Cancel"
        variant="danger"
        loading={removingFriend}
      />
    </div>
  );
};
