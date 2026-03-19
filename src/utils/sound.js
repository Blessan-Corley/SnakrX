/**
 * SnakrX Sound System
 * Compatibility entrypoint that exposes sound effects + settings APIs.
 */

import {
  playAchievement,
  playBonusFoodCollect,
  playBonusFoodSpawn,
  playClick,
  playCountdown,
  playDeath,
  playFoodEat,
  playGameStart,
  playHover,
  playPause,
  playResume,
  playVictory
} from './sound/effects.js';
import {
  getMuted,
  getVolume,
  applyProfileSoundSettings,
  setMuted,
  setVolume,
  subscribeSoundSettings,
  toggleMute
} from './sound/settings.js';
import { initializeAudioOnUserInteraction } from './sound/core.js';

initializeAudioOnUserInteraction();

export {
  playFoodEat,
  playBonusFoodSpawn,
  playBonusFoodCollect,
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
  getVolume,
  applyProfileSoundSettings,
  subscribeSoundSettings
};

export default {
  playFoodEat,
  playBonusFoodSpawn,
  playBonusFoodCollect,
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
  getVolume,
  applyProfileSoundSettings,
  subscribeSoundSettings
};
