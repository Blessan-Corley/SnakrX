/**
 * Test setup file for Vitest
 * Configures testing environment and global test utilities
 */

import '@testing-library/jest-dom';
import { vi } from 'vitest';

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

// Mock window.HTMLMediaElement
Object.defineProperty(globalThis.HTMLMediaElement.prototype, 'play', {
  writable: true,
  value: () => Promise.resolve(),
});

Object.defineProperty(globalThis.HTMLMediaElement.prototype, 'pause', {
  writable: true,
  value: () => {},
});

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
  getFirestore: vi.fn(() => ({})),
  doc: vi.fn(),
  collection: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  serverTimestamp: vi.fn(() => new Date()),
}));

// Mock Howler (audio library)
vi.mock('howler', () => ({
  Howl: vi.fn().mockImplementation(() => ({
    play: vi.fn(),
    stop: vi.fn(),
    volume: vi.fn(),
  })),
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
vi.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    button: 'button',
    span: 'span',
  },
  AnimatePresence: ({ children }) => children,
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