import logger from '../logger.js';

export const isMobile = () => {
  try {
    if (typeof window === 'undefined') return false;

    const userAgentCheck = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const touchCheck = navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform);
    const screenCheck = window.innerWidth <= 768;

    return userAgentCheck || touchCheck || screenCheck;
  } catch (error) {
    logger.error('Error detecting mobile:', error);
    return false;
  }
};

export const generateGameId = () => {
  try {
    return `game_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  } catch (error) {
    logger.error('Error generating game ID:', error);
    return `game_${Date.now()}_fallback`;
  }
};

export const deepClone = (obj) => {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    logger.error('Error deep cloning object:', error);
    return obj;
  }
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function throttledFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};
