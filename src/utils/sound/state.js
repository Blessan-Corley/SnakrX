export const soundState = {
  audioContext: null,
  isMuted: false,
  globalVolume: 0.5,
  audioInitialized: false,
  listeners: new Set(),
  initListenersAttached: false
};
