/**
 * SnakrX Sound System - Enhanced Audio Feedback
 * Provides audio feedback without external dependencies
 */

// Audio context for web audio API
let audioContext = null;

/**
 * Initialize audio context - FIXED to handle user gesture requirement
 */
const initAudioContext = async () => {
  if (!audioContext && typeof window !== 'undefined') {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Resume context if suspended (required by browsers for user gesture)
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
    } catch (error) {
      console.warn('Audio not supported:', error);
    }
  }
  return audioContext;
};

/**
 * Create a tone using Web Audio API - FIXED with proper async handling
 */
const createTone = async (frequency, duration = 0.1, type = 'sine', volume = 0.1) => {
  try {
    if (isMuted) return;
    
    const ctx = await initAudioContext();
    if (!ctx) return;

    // Ensure context is running (handles user gesture requirement)
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    oscillator.type = type;

    // Apply global volume
    const finalVolume = volume * globalVolume;

    // Volume envelope
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(finalVolume, ctx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (error) {
    console.warn('Sound error:', error);
  }
};

/**
 * Create a chord (multiple tones)
 */
const createChord = (frequencies, duration = 0.3, volume = 0.08) => {
  frequencies.forEach((freq, index) => {
    setTimeout(() => {
      createTone(freq, duration, 'sine', volume);
    }, index * 20);
  });
};

/**
 * Play food eat sound - Ascending notes
 */
export const playFoodEat = (speedMultiplier = 1) => {
  try {
    const baseFreq = 400 + (speedMultiplier * 50);
    const notes = [baseFreq, baseFreq * 1.25, baseFreq * 1.5];
    
    notes.forEach((freq, index) => {
      setTimeout(() => {
        createTone(freq, 0.15, 'triangle', 0.12);
      }, index * 60);
    });
  } catch (error) {
    console.warn('Food eat sound error:', error);
  }
};

/**
 * Play death sound based on cause
 */
export const playDeath = (cause = 'wall') => {
  try {
    if (cause === 'wall') {
      // Sharp impact sound
      createTone(150, 0.3, 'square', 0.15);
      setTimeout(() => createTone(100, 0.2, 'square', 0.1), 150);
    } else if (cause === 'self') {
      // Descending disappointed sound
      const notes = [300, 250, 200, 150];
      notes.forEach((freq, index) => {
        setTimeout(() => {
          createTone(freq, 0.2, 'sawtooth', 0.1);
        }, index * 100);
      });
    } else {
      // Opponent collision - dramatic sound
      createTone(200, 0.4, 'square', 0.12);
      setTimeout(() => createTone(100, 0.3, 'triangle', 0.08), 200);
    }
  } catch (error) {
    console.warn('Death sound error:', error);
  }
};

/**
 * Play victory sound
 */
export const playVictory = (gameMode = 'classic') => {
  try {
    if (gameMode === 'vsai') {
      // Triumphant AI victory theme
      const victoryChord = [262, 330, 392, 523]; // C major chord
      createChord(victoryChord, 0.5, 0.1);
      
      setTimeout(() => {
        const melody = [523, 587, 659, 698];
        melody.forEach((freq, index) => {
          setTimeout(() => {
            createTone(freq, 0.3, 'sine', 0.12);
          }, index * 200);
        });
      }, 300);
    } else if (gameMode === 'multiplayer') {
      // Multiplayer victory fanfare
      const fanfare = [392, 523, 659, 784];
      fanfare.forEach((freq, index) => {
        setTimeout(() => {
          createTone(freq, 0.25, 'triangle', 0.1);
        }, index * 150);
      });
    } else {
      // Classic mode victory
      const classicMelody = [262, 294, 330, 349, 392, 440, 494, 523];
      classicMelody.forEach((freq, index) => {
        setTimeout(() => {
          createTone(freq, 0.2, 'sine', 0.08);
        }, index * 120);
      });
    }
  } catch (error) {
    console.warn('Victory sound error:', error);
  }
};

/**
 * Play achievement unlock sound
 */
export const playAchievement = (tier = 'common') => {
  try {
    const tierSounds = {
      common: [440, 554, 659],
      uncommon: [440, 554, 659, 880],
      rare: [523, 659, 784, 1047],
      epic: [392, 523, 659, 784, 1047],
      legendary: [262, 330, 392, 523, 659, 784, 1047]
    };
    
    const notes = tierSounds[tier] || tierSounds.common;
    
    notes.forEach((freq, index) => {
      setTimeout(() => {
        createTone(freq, 0.3, 'sine', 0.1);
      }, index * 100);
    });
    
    // Special sparkle effect for rare+ achievements
    if (['rare', 'epic', 'legendary'].includes(tier)) {
      setTimeout(() => {
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            createTone(1568 + Math.random() * 400, 0.1, 'sine', 0.06);
          }, i * 50);
        }
      }, notes.length * 100);
    }
  } catch (error) {
    console.warn('Achievement sound error:', error);
  }
};

/**
 * Play button click sound
 */
export const playClick = () => {
  try {
    createTone(800, 0.08, 'square', 0.05);
  } catch (error) {
    console.warn('Click sound error:', error);
  }
};

/**
 * Play hover sound
 */
export const playHover = () => {
  try {
    createTone(600, 0.05, 'sine', 0.03);
  } catch (error) {
    console.warn('Hover sound error:', error);
  }
};

/**
 * Play pause sound
 */
export const playPause = () => {
  try {
    createTone(440, 0.2, 'triangle', 0.08);
    setTimeout(() => createTone(330, 0.2, 'triangle', 0.08), 100);
  } catch (error) {
    console.warn('Pause sound error:', error);
  }
};

/**
 * Play resume sound
 */
export const playResume = () => {
  try {
    createTone(330, 0.2, 'triangle', 0.08);
    setTimeout(() => createTone(440, 0.2, 'triangle', 0.08), 100);
  } catch (error) {
    console.warn('Resume sound error:', error);
  }
};

/**
 * Play game start sound
 */
export const playGameStart = () => {
  try {
    const startMelody = [262, 330, 392];
    startMelody.forEach((freq, index) => {
      setTimeout(() => {
        createTone(freq, 0.2, 'sine', 0.1);
      }, index * 100);
    });
  } catch (error) {
    console.warn('Game start sound error:', error);
  }
};

/**
 * Play countdown sound (3, 2, 1)
 */
export const playCountdown = (number) => {
  try {
    const frequencies = { 3: 440, 2: 554, 1: 659 };
    const freq = frequencies[number] || 440;
    createTone(freq, 0.3, 'square', 0.1);
  } catch (error) {
    console.warn('Countdown sound error:', error);
  }
};

/**
 * Mute/unmute and volume system
 */
let isMuted = false;
let globalVolume = 0.5; // Default volume 50%

export const setMuted = (muted) => {
  isMuted = muted;
  if (muted && audioContext) {
    audioContext.suspend();
  } else if (!muted && audioContext) {
    audioContext.resume();
  }
};

export const getMuted = () => isMuted;

export const toggleMute = () => {
  setMuted(!isMuted);
  return !isMuted;
};

export const setVolume = (volume) => {
  globalVolume = Math.max(0, Math.min(1, volume)); // Clamp between 0 and 1
};

export const getVolume = () => globalVolume;

// Initialize audio context on first user interaction - FIXED with better handling
let audioInitialized = false;

if (typeof window !== 'undefined') {
  const initAudio = async (event) => {
    if (audioInitialized) return;
    
    try {
      await initAudioContext();
      audioInitialized = true;
      console.log('Audio context initialized after user interaction');
      
      // Remove all listeners after successful initialization
      document.removeEventListener('click', initAudio);
      document.removeEventListener('touchstart', initAudio);
      document.removeEventListener('keydown', initAudio);
      document.removeEventListener('pointerdown', initAudio);
    } catch (error) {
      console.warn('Failed to initialize audio:', error);
    }
  };
  
  // Listen for various user interaction events
  document.addEventListener('click', initAudio, { once: true });
  document.addEventListener('touchstart', initAudio, { once: true });
  document.addEventListener('keydown', initAudio, { once: true });
  document.addEventListener('pointerdown', initAudio, { once: true });
}

export default {
  playFoodEat,
  playDeath,
  playVictory,
  playAchievement,
  playClick,
  playHover,
  playPause,
  playResume,
  playGameStart,
  playCountdown,
  setMuted,
  getMuted,
  toggleMute,
  setVolume,
  getVolume
};