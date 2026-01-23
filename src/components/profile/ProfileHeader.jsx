import { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Edit3, Save, X, User } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { playClick } from '@/utils/sound';

/**
 * Profile Header Component
 * Displays user info, avatar, level, and edit functionality
 */
export const ProfileHeader = ({ userProfile, playerLevel, levelProgress, nextLevelScore, userStats, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: userProfile.displayName || '',
    favoriteGameMode: userProfile.preferences?.favoriteGameMode || 'classic'
  });

  const handleStartEdit = () => {
    setEditing(true);
    playClick();
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setEditForm({
      displayName: userProfile.displayName || '',
      favoriteGameMode: userProfile.preferences?.favoriteGameMode || 'classic'
    });
    playClick();
  };

  const handleSaveEdit = async () => {
    setLoading(true);
    try {
      await onUpdate({
        displayName: editForm.displayName,
        preferences: {
          ...userProfile.preferences,
          favoriteGameMode: editForm.favoriteGameMode
        }
      });
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <Card variant="glass" padding="lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* User Info */}
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/20 text-white overflow-hidden">
              {userProfile.photoURL ? (
                <img src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold">
                  {userProfile.displayName?.charAt(0).toUpperCase() || <User size={32} />}
                </span>
              )}
            </div>
            <div>
              {editing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editForm.displayName}
                    onChange={(e) => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                    placeholder="Display Name"
                  />
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={handleSaveEdit} loading={loading} disabled={loading}>
                      <Save size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                      <X size={14} />
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center space-x-3">
                    <h1 className="text-2xl font-bold text-white">
                      {userProfile.displayName || 'Player'}
                    </h1>
                    <Button variant="minimal" size="icon" onClick={handleStartEdit}>
                      <Edit3 size={16} />
                    </Button>
                  </div>
                  <p className="text-white/70">@{userProfile.username}</p>
                  <p className="text-white/50 text-sm">
                    Member since {new Date(userProfile.createdAt?.toDate?.() || Date.now()).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Player Level */}
          <div className="text-center md:text-right">
            <div className="flex items-center justify-center md:justify-end space-y-1">
              <div className="flex items-center space-x-2 mb-2">
                <Crown size={24} className="text-amber-400 fill-amber-400/20" />
                <span className="text-2xl font-bold text-white">Level {playerLevel}</span>
              </div>
            </div>
            <div className="w-48 bg-black/30 rounded-full h-3 backdrop-blur-sm overflow-hidden border border-white/5">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-500 relative"
                style={{ width: `${Math.min(100, levelProgress)}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </div>
            </div>
            <p className="text-white/60 text-xs mt-2 font-mono">
              {Math.max(0, nextLevelScore - (userStats.totalScore || 0))} XP to next level
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
