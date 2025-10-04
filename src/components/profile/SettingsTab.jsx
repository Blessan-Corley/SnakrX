import { useState, useEffect } from 'react';
import { User, Shield, Volume2, VolumeX, Gamepad2, Eye, EyeOff } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { getMuted, getVolume, setVolume, toggleMute } from '@/utils/sound';
import { playClick } from '@/utils/sound';

/**
 * Profile Settings Tab Component
 */
export const SettingsTab = ({ userProfile, onSaveProfile }) => {
  const [loading, setLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: userProfile.displayName || '',
    favoriteGameMode: userProfile.preferences?.favoriteGameMode || 'classic'
  });
  const [soundEnabled, setSoundEnabled] = useState(!getMuted());
  const [soundVolume, setSoundVolume] = useState(getVolume());
  const [showStats, setShowStats] = useState(true);

  useEffect(() => {
    if (userProfile) {
      setEditForm({
        displayName: userProfile.displayName || '',
        favoriteGameMode: userProfile.preferences?.favoriteGameMode || 'classic'
      });
    }
  }, [userProfile]);

  const handleSoundToggle = () => {
    const newMuted = toggleMute();
    setSoundEnabled(!newMuted);
    if (!newMuted) playClick();
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    setSoundVolume(newVolume);
  };

  const handleSaveEdit = async () => {
    setLoading(true);
    try {
      await onSaveProfile({
        displayName: editForm.displayName,
        preferences: {
          ...userProfile.preferences,
          favoriteGameMode: editForm.favoriteGameMode
        }
      });
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-white">Settings</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Account Settings */}
        <div className="space-y-6">
          <Card variant="glass" padding="md">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <User className="mr-2" size={20} />
              Account Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/70 mb-2">Display Name</label>
                <input
                  type="text"
                  value={editForm.displayName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-2">Username</label>
                <input
                  type="text"
                  value={userProfile.username}
                  disabled
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white/50 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-2">Email</label>
                <input
                  type="email"
                  value={userProfile.email}
                  disabled
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white/50 cursor-not-allowed"
                />
              </div>
              <Button onClick={handleSaveEdit} loading={loading} disabled={loading}>
                Save Changes
              </Button>
            </div>
          </Card>

          <Card variant="glass" padding="md">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Shield className="mr-2" size={20} />
              Privacy
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">Show Statistics</div>
                  <div className="text-white/60 text-sm">Allow others to see your game statistics</div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowStats(!showStats)}
                  icon={showStats ? <Eye size={18} /> : <EyeOff size={18} />}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Game Settings */}
        <div className="space-y-6">
          <Card variant="glass" padding="md">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Volume2 className="mr-2" size={20} />
              Audio Settings
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">Sound Effects</div>
                  <div className="text-white/60 text-sm">Game sounds and music</div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSoundToggle}
                  icon={soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                />
              </div>

              {soundEnabled && (
                <div>
                  <label className="block text-sm text-white/70 mb-2">Volume</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={soundVolume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="text-right text-sm text-white/60 mt-1">
                    {Math.round(soundVolume * 100)}%
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card variant="glass" padding="md">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Gamepad2 className="mr-2" size={20} />
              Game Preferences
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/70 mb-2">Favorite Game Mode</label>
                <select
                  value={editForm.favoriteGameMode}
                  onChange={(e) => setEditForm(prev => ({ ...prev, favoriteGameMode: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                >
                  <option value="classic" className="bg-dark-surface">Classic Mode</option>
                  <option value="vsai" className="bg-dark-surface">VS AI</option>
                  <option value="multiplayer" className="bg-dark-surface">Multiplayer</option>
                </select>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
