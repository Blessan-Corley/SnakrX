import { Howl } from 'howler';

/**
 * SnakrX Sound System
 * Soothing and satisfying sounds for game events
 */

class SoundManager {
  constructor() {
    this.sounds = new Map();
    this.isMuted = false;
    this.volume = 0.7;
    
    // Load sound preferences from localStorage
    this.loadSettings();
    this.initializeSounds();
  }

  // Initialize all game sounds
  initializeSounds() {
    // Food eat sound - satisfying bite sound
    this.sounds.set('food', new Howl({
      src: ['/sounds/food-eat.mp3', '/sounds/food-eat.wav'],
      volume: this.volume * 0.8,
      rate: 1.0,
      // Fallback: create programmatic sound if files don't exist
      onloaderror: () => {
        this.sounds.set('food', this.createTone(800, 0.1, 'sine'));
      }
    }));

    // Death sound - gentle but clear indication of game over
    this.sounds.set('death', new Howl({
      src: ['/sounds/death.mp3', '/sounds/death.wav'],
      volume: this.volume * 0.9,
      rate: 1.0,
      onloaderror: () => {
        this.sounds.set('death', this.createTone(200, 0.5, 'sawtooth'));
      }
    }));

    // Victory sound - triumphant but not overwhelming
    this.sounds.set('victory', new Howl({
      src: ['/sounds/victory.mp3', '/sounds/victory.wav'],
      volume: this.volume * 0.8,
      rate: 1.0,
      onloaderror: () => {
        this.sounds.set('victory', this.createChord([523, 659, 783], 1.0));
      }
    }));

    // Achievement sound - special notification sound
    this.sounds.set('achievement', new Howl({
      src: ['/sounds/achievement.mp3', '/sounds/achievement.wav'],
      volume: this.volume * 0.7,
      rate: 1.0,
      onloaderror: () => {
        this.sounds.set('achievement', this.createChord([440, 554, 659], 0.8));
      }
    }));

    // UI sounds
    this.sounds.set('click', new Howl({
      src: ['/sounds/click.mp3', '/sounds/click.wav'],
      volume: this.volume * 0.5,
      rate: 1.0,
      onloaderror: () => {
        this.sounds.set('click', this.createTone(600, 0.05, 'sine'));
      }
    }));

    this.sounds.set('hover', new Howl({
      src: ['/sounds/hover.mp3', '/sounds/hover.wav'],
      volume: this.volume * 0.3,
      rate: 1.0,
      onloaderror: () => {
        this.sounds.set('hover', this.createTone(400, 0.03, 'sine'));
      }
    }));

    // Background music (optional)
    this.sounds.set('bgMusic', new Howl({
      src: ['/sounds/background.mp3', '/sounds/background.ogg'],
      volume: this.volume * 0.3,
      loop: true,
      rate: 1.0,
      onloaderror: () => {
        // No fallback for background music
      }
    }));
  }

  // Create programmatic tones as fallback
  createTone(frequency, duration, type = 'sine') {
    if (typeof window === 'undefined' || !window.AudioContext) {
      return { play: () => {} }; // Mock for SSR or browsers without Web Audio API
    }

    return {
      play: () => {
        if (this.isMuted) return;

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = type;

        gainNode.gain.setValueAtTime(this.volume * 0.5, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

        oscillator.start();
        oscillator.stop(audioContext.currentTime + duration);
      }
    };
  }

  // Create chord sounds
  createChord(frequencies, duration) {
    return {
      play: () => {
        frequencies.forEach((freq, index) => {
          setTimeout(() => {
            this.createTone(freq, duration * 0.8, 'sine').play();
          }, index * 50);
        });
      }
    };
  }

  // Play a sound by name
  play(soundName, options = {}) {
    if (this.isMuted) return;
    
    const sound = this.sounds.get(soundName);
    if (sound && typeof sound.play === 'function') {
      if (options.rate) {
        sound.rate(options.rate);
      }
      if (options.volume) {
        sound.volume(options.volume * this.volume);
      }
      sound.play();
    }
  }

  // Stop a sound
  stop(soundName) {
    const sound = this.sounds.get(soundName);
    if (sound && typeof sound.stop === 'function') {
      sound.stop();
    }
  }

  // Stop all sounds
  stopAll() {
    this.sounds.forEach(sound => {
      if (sound && typeof sound.stop === 'function') {
        sound.stop();
      }
    });
  }

  // Toggle mute
  toggleMute() {
    this.isMuted = !this.isMuted;
    this.saveSettings();
    
    if (this.isMuted) {
      this.stopAll();
    }
    
    return this.isMuted;
  }

  // Set volume (0.0 to 1.0)
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
    
    // Update volume for all sounds
    this.sounds.forEach(sound => {
      if (sound && typeof sound.volume === 'function') {
        sound.volume(this.volume);
      }
    });
  }

  // Get current volume
  getVolume() {
    return this.volume;
  }

  // Get mute status
  getMuted() {
    return this.isMuted;
  }

  // Save settings to localStorage
  saveSettings() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('snakrx-sound-settings', JSON.stringify({
        volume: this.volume,
        isMuted: this.isMuted
      }));
    }
  }

  // Load settings from localStorage
  loadSettings() {
    if (typeof window !== 'undefined') {
      try {
        const settings = JSON.parse(localStorage.getItem('snakrx-sound-settings') || '{}');
        this.volume = settings.volume ?? 0.7;
        this.isMuted = settings.isMuted ?? false;
      } catch (error) {
        console.warn('Failed to load sound settings:', error);
      }
    }
  }

  // Play background music
  playBackgroundMusic() {
    if (!this.isMuted) {
      this.play('bgMusic');
    }
  }

  // Stop background music
  stopBackgroundMusic() {
    this.stop('bgMusic');
  }

  // Game-specific sound methods with appropriate variations
  playFoodEat(speed = 1) {
    // Slightly higher pitch for faster gameplay
    this.play('food', { rate: 0.8 + (speed * 0.1) });
  }

  playDeath(cause = 'wall') {
    // Different variations based on death cause
    const variations = {
      wall: { rate: 1.0 },
      self: { rate: 0.9 },
      opponent: { rate: 1.1 }
    };
    
    this.play('death', variations[cause] || variations.wall);
  }

  playVictory(mode = 'classic') {
    // Different victory sounds for different modes
    const variations = {
      classic: { rate: 1.0 },
      vsai: { rate: 1.1 },
      multiplayer: { rate: 1.2 }
    };
    
    this.play('victory', variations[mode] || variations.classic);
  }

  playAchievement(tier = 'common') {
    // Different achievement sounds based on tier
    const variations = {
      common: { rate: 1.0, volume: 0.7 },
      uncommon: { rate: 1.1, volume: 0.8 },
      rare: { rate: 1.2, volume: 0.9 },
      epic: { rate: 1.3, volume: 1.0 },
      legendary: { rate: 1.4, volume: 1.0 }
    };
    
    this.play('achievement', variations[tier] || variations.common);
  }

  // UI sound methods
  playClick() {
    this.play('click');
  }

  playHover() {
    this.play('hover');
  }
}

// Create and export a singleton instance
const soundManager = new SoundManager();

// Export individual methods for convenience
export const playSound = (soundName, options) => soundManager.play(soundName, options);
export const stopSound = (soundName) => soundManager.stop(soundName);
export const stopAllSounds = () => soundManager.stopAll();
export const toggleMute = () => soundManager.toggleMute();
export const setVolume = (volume) => soundManager.setVolume(volume);
export const getVolume = () => soundManager.getVolume();
export const getMuted = () => soundManager.getMuted();

// Game-specific sound exports
export const playFoodEat = (speed) => soundManager.playFoodEat(speed);
export const playDeath = (cause) => soundManager.playDeath(cause);
export const playVictory = (mode) => soundManager.playVictory(mode);
export const playAchievement = (tier) => soundManager.playAchievement(tier);
export const playClick = () => soundManager.playClick();
export const playHover = () => soundManager.playHover();
export const playBackgroundMusic = () => soundManager.playBackgroundMusic();
export const stopBackgroundMusic = () => soundManager.stopBackgroundMusic();

export default soundManager;