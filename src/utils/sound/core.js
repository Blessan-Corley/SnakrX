import logger from '../logger.js';
import { soundState } from './state.js';

export const initAudioContext = async () => {
  if (!soundState.audioContext && typeof window !== 'undefined') {
    try {
      soundState.audioContext = new (window.AudioContext || window.webkitAudioContext)();

      if (soundState.audioContext.state === 'suspended') {
        await soundState.audioContext.resume();
      }
    } catch (error) {
      logger.warn('Audio context is unavailable in this environment:', error);
    }
  }

  return soundState.audioContext;
};

export const createTone = async (frequency, duration = 0.1, type = 'sine', volume = 0.1) => {
  try {
    if (soundState.isMuted || !soundState.audioInitialized) return;

    const ctx = await initAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    if (soundState.isMuted) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    oscillator.type = type;

    const finalVolume = volume * soundState.globalVolume;
    if (!Number.isFinite(finalVolume) || finalVolume <= 0) {
      return;
    }
    const releaseVolume = Math.max(0.0001, finalVolume * 0.05);

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(finalVolume, ctx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(releaseVolume, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (error) {
    logger.warn('Sound playback failed:', error);
  }
};

export const createChord = (frequencies, duration = 0.3, volume = 0.08) => {
  frequencies.forEach((freq, index) => {
    setTimeout(() => {
      void createTone(freq, duration, 'sine', volume);
    }, index * 20);
  });
};

const detachInitListeners = (handler) => {
  document.removeEventListener('click', handler);
  document.removeEventListener('touchstart', handler);
  document.removeEventListener('keydown', handler);
  document.removeEventListener('pointerdown', handler);
};

export const initializeAudioOnUserInteraction = () => {
  if (typeof window === 'undefined' || soundState.initListenersAttached) {
    return;
  }

  const initAudio = async () => {
    if (soundState.audioInitialized) return;

    try {
      await initAudioContext();
      soundState.audioInitialized = true;
      logger.info('Audio context initialized after user interaction.');
      detachInitListeners(initAudio);
    } catch (error) {
      logger.warn('Failed to initialize audio after user interaction:', error);
    }
  };

  soundState.initListenersAttached = true;
  document.addEventListener('click', initAudio, { once: true });
  document.addEventListener('touchstart', initAudio, { once: true });
  document.addEventListener('keydown', initAudio, { once: true });
  document.addEventListener('pointerdown', initAudio, { once: true });
};

export const hasAudioInitialized = () => soundState.audioInitialized;
