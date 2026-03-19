import { beforeEach, describe, expect, it, vi } from 'vitest';

const loadSettingsModule = async () => {
  vi.resetModules();
  return import('./settings.js');
};

describe('sound settings', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('defaults volume to 100% when no saved value exists', async () => {
    const soundSettings = await loadSettingsModule();

    expect(soundSettings.getVolume()).toBe(1);
  });

  it('preserves an explicit saved volume of 0%', async () => {
    window.localStorage.setItem('snakrx:audioVolume', '0');

    const soundSettings = await loadSettingsModule();

    expect(soundSettings.getVolume()).toBe(0);
  });

  it('applies saved profile sound settings to the local sound state', async () => {
    const soundSettings = await loadSettingsModule();

    soundSettings.applyProfileSoundSettings({
      soundEnabled: false,
      soundVolume: 0.35
    });

    expect(soundSettings.getVolume()).toBe(0.35);
    expect(soundSettings.getMuted()).toBe(true);
    expect(window.localStorage.getItem('snakrx:audioVolume')).toBe('0.35');
    expect(window.localStorage.getItem('snakrx:audioMuted')).toBe('true');
  });
});
