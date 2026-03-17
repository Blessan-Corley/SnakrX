/**
 * Test setup file for Vitest
 * Configures testing environment and global test utilities
 */

import '@testing-library/jest-dom';
import React, { forwardRef } from 'react';
import { vi } from 'vitest';

if (typeof window !== 'undefined') {
  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
    }),
  });
}

// Mock ResizeObserver
Object.defineProperty(globalThis, 'ResizeObserver', {
  writable: true,
  value: class ResizeObserver {
    constructor(cb) {
      this.cb = cb;
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  },
});

// Mock IntersectionObserver
Object.defineProperty(globalThis, 'IntersectionObserver', {
  writable: true,
  value: class IntersectionObserver {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  },
});

if (typeof globalThis.HTMLMediaElement !== 'undefined') {
  // Mock window.HTMLMediaElement
  Object.defineProperty(globalThis.HTMLMediaElement.prototype, 'play', {
    writable: true,
    value: () => Promise.resolve(),
  });

  Object.defineProperty(globalThis.HTMLMediaElement.prototype, 'pause', {
    writable: true,
    value: () => {},
  });
}

// Mock AudioContext for sound utilities
class MockAudioContext {
  constructor() {
    this.state = 'running';
    this.currentTime = 0;
    this.destination = {};
  }
  resume() {
    this.state = 'running';
    return Promise.resolve();
  }
  suspend() {
    this.state = 'suspended';
    return Promise.resolve();
  }
  createOscillator() {
    return {
      connect: () => {},
      frequency: { setValueAtTime: () => {} },
      type: 'sine',
      start: () => {},
      stop: () => {}
    };
  }
  createGain() {
    return {
      connect: () => {},
      gain: {
        setValueAtTime: () => {},
        linearRampToValueAtTime: () => {},
        exponentialRampToValueAtTime: () => {}
      }
    };
  }
}

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'AudioContext', {
    writable: true,
    value: MockAudioContext
  });

  Object.defineProperty(window, 'webkitAudioContext', {
    writable: true,
    value: MockAudioContext
  });
}

// Mock Firebase
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  GoogleAuthProvider: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  initializeFirestore: vi.fn(() => ({})),
  persistentLocalCache: vi.fn(() => ({})),
  doc: vi.fn(),
  collection: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  runTransaction: vi.fn(),
  serverTimestamp: vi.fn(() => new Date()),
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  },
  Toaster: () => null,
}));

// Mock framer-motion
const MOTION_ONLY_PROPS = new Set([
  'initial',
  'animate',
  'exit',
  'variants',
  'transition',
  'whileHover',
  'whileTap',
  'whileInView',
  'layout',
  'layoutId',
  'drag',
  'dragConstraints',
  'dragElastic',
  'dragTransition',
  'viewport'
]);

const stripMotionProps = (props = {}) => {
  const rest = { ...props };
  MOTION_ONLY_PROPS.forEach((key) => {
    delete rest[key];
  });
  return rest;
};

const createMotionComponent = (tag) => {
  const MotionComponent = forwardRef(({ children, ...props }, ref) => (
    React.createElement(tag, { ref, ...stripMotionProps(props) }, children)
  ));
  MotionComponent.displayName = `MockMotion(${tag})`;
  return MotionComponent;
};

const motionComponentCache = new Map();

vi.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: (_, tag) => {
      const tagName = typeof tag === 'string' ? tag : 'div';
      if (!motionComponentCache.has(tagName)) {
        motionComponentCache.set(tagName, createMotionComponent(tagName));
      }
      return motionComponentCache.get(tagName);
    }
  }),
  AnimatePresence: ({ children }) => children,
  useScroll: () => ({ scrollYProgress: 0 }),
  useTransform: () => 0
}));

// Mock sound utilities
vi.mock('@/utils/sound', () => ({
  playClick: vi.fn(),
  playHover: vi.fn(),
  playFoodEat: vi.fn(),
  playBonusFoodSpawn: vi.fn(),
  playBonusFoodCollect: vi.fn(),
  playDeath: vi.fn(),
  playVictory: vi.fn(),
  playAchievement: vi.fn(),
  playPause: vi.fn(),
  playResume: vi.fn(),
  playGameStart: vi.fn(),
  playCountdown: vi.fn(),
  setMuted: vi.fn(),
  getMuted: vi.fn(),
  toggleMute: vi.fn(),
  setVolume: vi.fn(),
  getVolume: vi.fn(),
  subscribeSoundSettings: vi.fn(),
  applyProfileSoundSettings: vi.fn()
}));

// Global test utilities
Object.defineProperty(globalThis, 'createMockUser', {
  value: () => ({
    uid: 'test-user-123',
    email: 'test@example.com',
    displayName: 'Test User',
  }),
});

Object.defineProperty(globalThis, 'createMockGameState', {
  value: () => ({
    gameState: 'playing',
    score: 100,
    foodEaten: 5,
    gameTime: 30,
    speed: 200,
    snakes: [{
      id: 0,
      body: [{ x: 5, y: 5 }],
      direction: { x: 1, y: 0 },
      isAlive: true,
    }],
    food: { x: 10, y: 10 },
  }),
});

Object.defineProperty(globalThis, 'waitForNextTick', {
  value: () => new Promise(resolve => setTimeout(resolve, 0)),
});
