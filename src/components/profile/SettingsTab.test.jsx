import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SettingsTab } from './SettingsTab.jsx';

const playClickMock = vi.fn();
const setVolumeMock = vi.fn();
const subscribeSoundSettingsMock = vi.fn();
const getMutedMock = vi.fn();
const getVolumeMock = vi.fn();

vi.mock('@/utils/sound', () => ({
  playClick: (...args) => playClickMock(...args),
  setVolume: (...args) => setVolumeMock(...args),
  subscribeSoundSettings: (...args) => subscribeSoundSettingsMock(...args),
  getMuted: (...args) => getMutedMock(...args),
  getVolume: (...args) => getVolumeMock(...args),
  toggleMute: vi.fn()
}));

describe('SettingsTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getMutedMock.mockReturnValue(false);
    getVolumeMock.mockReturnValue(1);
    subscribeSoundSettingsMock.mockImplementation((listener) => {
      listener({ muted: false, volume: 1 });
      return vi.fn();
    });
  });

  it('saves sound settings with the rest of the profile changes', async () => {
    const onSaveProfile = vi.fn().mockResolvedValue({ success: true });
    render(
      <SettingsTab
        userProfile={{
          username: 'playerone',
          displayName: 'Player One',
          email: 'player@example.com',
          preferences: {
            favoriteGameMode: 'classic',
            privateLeaderboard: false
          }
        }}
        onSaveProfile={onSaveProfile}
      />
    );

    await act(async () => {
      fireEvent.change(screen.getByRole('slider'), {
        target: { value: '0.55' }
      });
      fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
    });

    expect(onSaveProfile).toHaveBeenCalledWith(expect.objectContaining({
      displayName: 'Player One',
      settings: {
        soundEnabled: true,
        soundVolume: 0.55
      }
    }));
  });
});
