export const soundState = {
  audioContext: null,
  isMuted: false,
  globalVolume: 1,
  audioInitialized: false,
  listeners: new Set(),
  initListenersAttached: false
};
