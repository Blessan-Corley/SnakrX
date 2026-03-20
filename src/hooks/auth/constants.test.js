import { describe, expect, it, vi } from 'vitest';

vi.mock('../../services/firebase/index.js', () => ({
  serverTimestamp: vi.fn(() => 'mock-timestamp')
}));

import { createDefaultUserProfile } from './constants.js';

describe('auth constants', () => {
  it('creates profiles with sound enabled at full volume by default', () => {
    const profile = createDefaultUserProfile({
      email: 'player@example.com',
      displayName: 'Player One'
    });

    expect(profile.settings).toMatchObject({
      soundEnabled: true,
      soundVolume: 1
    });
  });
});
