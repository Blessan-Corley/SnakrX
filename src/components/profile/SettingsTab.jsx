import { useEffect, useState } from 'react';
import { Eye, EyeOff, Gamepad2, Shield, User, Volume2, VolumeX } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import logger from '@/utils/logger.js';
import * as sound from '@/utils/sound';

/**
 * Profile Settings Tab Component.
 */
export const SettingsTab = ({ userProfile, onSaveProfile }) => {
  const [loading, setLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: userProfile.displayName || '',
    favoriteGameMode: userProfile.preferences?.favoriteGameMode || 'classic'
  });
  const [soundEnabled, setSoundEnabled] = useState(!sound.getMuted());
  const [soundVolume, setSoundVolume] = useState(sound.getVolume());
  const [privateLeaderboard, setPrivateLeaderboard] = useState(Boolean(userProfile.preferences?.privateLeaderboard));

  useEffect(() => {
    if (userProfile) {
      setEditForm({
        displayName: userProfile.displayName || '',
        favoriteGameMode: userProfile.preferences?.favoriteGameMode || 'classic'
      });
      setPrivateLeaderboard(Boolean(userProfile.preferences?.privateLeaderboard));
    }
  }, [userProfile]);

  useEffect(() => {
    const unsubscribe = sound.subscribeSoundSettings(({ muted, volume }) => {
      setSoundEnabled(!muted);
      setSoundVolume(volume);
    });
    return unsubscribe;
  }, []);

  const handleSoundToggle = () => {
    const newMuted = sound.toggleMute();
    setSoundEnabled(!newMuted);
    if (!newMuted) sound.playClick();
  };

  const handleVolumeChange = (newVolume) => {
    sound.setVolume(newVolume);
    setSoundVolume(newVolume);
  };

  const handleSaveEdit = async () => {
    setLoading(true);
    try {
      await onSaveProfile({
        displayName: editForm.displayName,
        settings: {
          ...userProfile.settings,
          soundEnabled,
          soundVolume
        },
        preferences: {
          ...userProfile.preferences,
          favoriteGameMode: editForm.favoriteGameMode,
          privateLeaderboard
        }
      });
    } catch (error) {
      logger.error('Failed to update profile settings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-white">Settings</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                  onChange={(e) => setEditForm((prev) => ({ ...prev, displayName: e.target.value }))}
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
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-white font-medium">Private leaderboard</div>
                  <div className="text-sm text-white/60">
                    Hide your score from public leaderboards and profile ranking views.
                  </div>
                </div>
                <Button
                  variant={privateLeaderboard ? 'ghost-primary' : 'ghost'}
                  size="sm"
                  onClick={() => setPrivateLeaderboard((previous) => !previous)}
                  icon={privateLeaderboard ? <EyeOff size={16} /> : <Eye size={16} />}
                >
                  {privateLeaderboard ? 'Private' : 'Public'}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card variant="glass" padding="md">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Gamepad2 className="mr-2" size={20} />
              Preferences
            </h3>
            <div className="space-y-5">
              <Select
                label="Favorite game mode"
                options={[
                  { value: 'classic', label: 'Classic' },
                  { value: 'classic_transparent', label: 'Classic Transparent' },
                  { value: 'vsai', label: 'VS AI' },
                  { value: 'multiplayer', label: 'Multiplayer' }
                ]}
                value={editForm.favoriteGameMode}
                onChange={(value) => setEditForm((prev) => ({ ...prev, favoriteGameMode: value }))}
              />
            </div>
          </Card>

          <Card variant="glass" padding="md">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              {soundEnabled ? <Volume2 className="mr-2" size={20} /> : <VolumeX className="mr-2" size={20} />}
              Sound
            </h3>
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-white font-medium">Enable sound effects</div>
                  <div className="text-sm text-white/60">Toggle UI and gameplay audio feedback.</div>
                </div>
                <Button variant={soundEnabled ? 'ghost-primary' : 'ghost'} size="sm" onClick={handleSoundToggle}>
                  {soundEnabled ? 'On' : 'Off'}
                </Button>
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-2">
                  Volume: {Math.round(soundVolume * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={soundVolume}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  className="w-full accent-primary-500"
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
