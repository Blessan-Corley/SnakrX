import logger from '../logger.js';
import { createChord, createTone, hasAudioInitialized } from './core.js';

export const playFoodEat = (speedMultiplier = 1) => {
  try {
    const baseFreq = 400 + (speedMultiplier * 50);
    const notes = [baseFreq, baseFreq * 1.25, baseFreq * 1.5];

    notes.forEach((freq, index) => {
      setTimeout(() => {
        void createTone(freq, 0.15, 'triangle', 0.12);
      }, index * 60);
    });
  } catch (error) {
    logger.warn('Food eat sound failed:', error);
  }
};

export const playBonusFoodSpawn = () => {
  try {
    const notes = [392, 523, 659, 784];
    notes.forEach((freq, index) => {
      setTimeout(() => {
        void createTone(freq, 0.16, 'triangle', 0.09);
      }, index * 55);
    });
  } catch (error) {
    logger.warn('Bonus food spawn sound failed:', error);
  }
};

export const playBonusFoodCollect = () => {
  try {
    const notes = [740, 932, 1175];
    notes.forEach((freq, index) => {
      setTimeout(() => {
        void createTone(freq, 0.18, 'sine', 0.11);
      }, index * 45);
    });

    setTimeout(() => {
      void createTone(1480, 0.08, 'triangle', 0.07);
    }, 120);
  } catch (error) {
    logger.warn('Bonus food collect sound failed:', error);
  }
};

export const playDeath = (cause = 'wall') => {
  try {
    if (cause === 'wall') {
      void createTone(150, 0.3, 'square', 0.15);
      setTimeout(() => void createTone(100, 0.2, 'square', 0.1), 150);
    } else if (cause === 'self') {
      const notes = [300, 250, 200, 150];
      notes.forEach((freq, index) => {
        setTimeout(() => {
          void createTone(freq, 0.2, 'sawtooth', 0.1);
        }, index * 100);
      });
    } else {
      void createTone(200, 0.4, 'square', 0.12);
      setTimeout(() => void createTone(100, 0.3, 'triangle', 0.08), 200);
    }
  } catch (error) {
    logger.warn('Death sound failed:', error);
  }
};

export const playVictory = (gameMode = 'classic') => {
  try {
    if (gameMode === 'vsai') {
      createChord([262, 330, 392, 523], 0.5, 0.1);

      setTimeout(() => {
        const melody = [523, 587, 659, 698];
        melody.forEach((freq, index) => {
          setTimeout(() => {
            void createTone(freq, 0.3, 'sine', 0.12);
          }, index * 200);
        });
      }, 300);
    } else if (gameMode === 'multiplayer') {
      const fanfare = [392, 523, 659, 784];
      fanfare.forEach((freq, index) => {
        setTimeout(() => {
          void createTone(freq, 0.25, 'triangle', 0.1);
        }, index * 150);
      });
    } else {
      const classicMelody = [262, 294, 330, 349, 392, 440, 494, 523];
      classicMelody.forEach((freq, index) => {
        setTimeout(() => {
          void createTone(freq, 0.2, 'sine', 0.08);
        }, index * 120);
      });
    }
  } catch (error) {
    logger.warn('Victory sound failed:', error);
  }
};

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
        void createTone(freq, 0.3, 'sine', 0.1);
      }, index * 100);
    });

    if (['rare', 'epic', 'legendary'].includes(tier)) {
      setTimeout(() => {
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            void createTone(1568 + Math.random() * 400, 0.1, 'sine', 0.06);
          }, i * 50);
        }
      }, notes.length * 100);
    }
  } catch (error) {
    logger.warn('Achievement sound failed:', error);
  }
};

export const playClick = () => {
  try {
    void createTone(800, 0.08, 'square', 0.05);
  } catch (error) {
    logger.warn('Click sound failed:', error);
  }
};

export const playHover = () => {
  try {
    if (!hasAudioInitialized()) return;
    void createTone(600, 0.05, 'sine', 0.03);
  } catch (error) {
    logger.warn('Hover sound failed:', error);
  }
};

export const playPause = () => {
  try {
    void createTone(440, 0.2, 'triangle', 0.08);
    setTimeout(() => void createTone(330, 0.2, 'triangle', 0.08), 100);
  } catch (error) {
    logger.warn('Pause sound failed:', error);
  }
};

export const playResume = () => {
  try {
    void createTone(330, 0.2, 'triangle', 0.08);
    setTimeout(() => void createTone(440, 0.2, 'triangle', 0.08), 100);
  } catch (error) {
    logger.warn('Resume sound failed:', error);
  }
};

export const playGameStart = () => {
  try {
    const startMelody = [262, 330, 392];
    startMelody.forEach((freq, index) => {
      setTimeout(() => {
        void createTone(freq, 0.2, 'sine', 0.1);
      }, index * 100);
    });
  } catch (error) {
    logger.warn('Game start sound failed:', error);
  }
};

export const playCountdown = (number) => {
  try {
    const frequencies = { 3: 440, 2: 554, 1: 659 };
    const freq = frequencies[number] || 440;
    void createTone(freq, 0.3, 'square', 0.1);
  } catch (error) {
    logger.warn('Countdown sound failed:', error);
  }
};
