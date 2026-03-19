import { soundState } from './state.js';

const MUTE_STORAGE_KEY = 'snakrx:audioMuted';
const VOLUME_STORAGE_KEY = 'snakrx:audioVolume';

const loadStoredSettings = () => {
  if (typeof window === 'undefined') return;

  try {
    const storedMuted = window.localStorage.getItem(MUTE_STORAGE_KEY);
    if (storedMuted !== null) {
      soundState.isMuted = storedMuted === 'true';
    }

    const storedVolumeRaw = window.localStorage.getItem(VOLUME_STORAGE_KEY);
    const storedVolume = Number(storedVolumeRaw);
    if (storedVolumeRaw !== null && Number.isFinite(storedVolume)) {
      soundState.globalVolume = Math.max(0, Math.min(1, storedVolume));
    }
  } catch {
    // Ignore storage read errors.
  }
};

const notifySoundSettings = () => {
  const payload = { muted: soundState.isMuted, volume: soundState.globalVolume };
  soundState.listeners.forEach((listener) => {
    try {
      listener(payload);
    } catch {
      // Ignore listener errors to avoid breaking audio flow.
    }
  });
};

export const subscribeSoundSettings = (listener) => {
  if (typeof listener !== 'function') return () => {};
  soundState.listeners.add(listener);
  listener({ muted: soundState.isMuted, volume: soundState.globalVolume });
  return () => soundState.listeners.delete(listener);
};

export const setMuted = (muted) => {
  soundState.isMuted = !!muted;

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(MUTE_STORAGE_KEY, String(soundState.isMuted));
    } catch {
      // Ignore storage write errors.
    }
  }

  if (soundState.isMuted && soundState.audioContext) {
    soundState.audioContext.suspend().catch(() => {});
  } else if (!soundState.isMuted && soundState.audioContext) {
    soundState.audioContext.resume().catch(() => {});
  }

  notifySoundSettings();
};

export const getMuted = () => soundState.isMuted;

export const toggleMute = () => {
  setMuted(!soundState.isMuted);
  return soundState.isMuted;
};

export const setVolume = (volume) => {
  const parsedVolume = Number(volume);
  soundState.globalVolume = Number.isFinite(parsedVolume)
    ? Math.max(0, Math.min(1, parsedVolume))
    : soundState.globalVolume;

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(VOLUME_STORAGE_KEY, String(soundState.globalVolume));
    } catch {
      // Ignore storage write errors.
    }
  }

  notifySoundSettings();
};

export const getVolume = () => soundState.globalVolume;

export const applyProfileSoundSettings = (settings) => {
  if (!settings || typeof settings !== 'object') return;

  if (Number.isFinite(Number(settings.soundVolume))) {
    setVolume(Number(settings.soundVolume));
  }

  if (typeof settings.soundEnabled === 'boolean') {
    setMuted(!settings.soundEnabled);
  }
};

loadStoredSettings();
