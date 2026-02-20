import { motion } from 'framer-motion';
import { UserMinus, Calendar } from 'lucide-react';
import Button from '@/components/ui/Button';
import UserAvatar from '@/components/ui/UserAvatar';

const formatDate = (timestamp) => {
  if (!timestamp) return 'Recently';
  // Handle Firestore timestamp (toDate) or standard Date
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const getFriendshipDuration = (timestamp) => {
  if (!timestamp) return 'New Friend';
  const start = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diffTime = Math.abs(now - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 1) return 'Friends for 1 day';
  if (diffDays < 30) return `Friends for ${diffDays} days`;
  if (diffDays < 365) return `Friends for ${Math.floor(diffDays / 30)} months`;
  return `Friends for ${Math.floor(diffDays / 365)} years`;
};

export const FriendList = ({ friends, onRemove, onView }) => {
  if (friends.length === 0) {
    return (
      <div className="text-center py-8 text-white/50 bg-black/20 rounded-xl border border-white/5">
        <p>You haven&apos;t added any friends yet.</p>
        <p className="text-sm mt-2">Search for users above to build your squad!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {friends.map((friend) => (
        <motion.div
          key={friend.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10 hover:border-primary-500/30 transition-colors gap-4"
        >
          <div className="flex items-center space-x-4">
            <UserAvatar profile={friend} size="md" enablePreview className="shadow-lg shadow-purple-500/20 border border-white/20" />
            <div>
              <h4 className="font-bold text-white text-lg">{friend.displayName}</h4>
              <p className="text-sm text-white/60 font-mono">@{friend.username}</p>
              
              <div className="flex items-center text-xs text-primary-300 mt-1 space-x-2">
                <Calendar size={12} />
                <span>{getFriendshipDuration(friend.timestamp)}</span>
                <span className="text-white/20">-</span>
                <span className="text-white/40">Since {formatDate(friend.timestamp)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2 self-end sm:self-auto">
            {onView && (
              <Button size="sm" variant="ghost" onClick={() => onView(friend.id)} aria-label="View Profile">
                View
              </Button>
            )}
            <Button 
              size="sm" 
              variant="ghost-danger" 
              icon={<UserMinus size={16} />} 
              onClick={() => onRemove(friend.id)}
              aria-label="Remove Friend"
            >
              Remove
            </Button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
