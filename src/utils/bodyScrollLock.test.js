import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  acquireBodyScrollLock,
  releaseBodyScrollLock,
  __private__
} from './bodyScrollLock.js';

describe('bodyScrollLock', () => {
  beforeEach(() => {
    document.body.style.overflow = 'auto';
    document.body.style.touchAction = 'manipulation';
    __private__.resetBodyScrollLocks();
  });

  afterEach(() => {
    __private__.resetBodyScrollLocks();
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
  });

  it('keeps body scroll locked until the last owner releases it', () => {
    acquireBodyScrollLock('game-session', { touchAction: 'none' });
    expect(document.body.style.overflow).toBe('hidden');
    expect(document.body.style.touchAction).toBe('none');

    acquireBodyScrollLock('achievement-modal');
    releaseBodyScrollLock('achievement-modal');

    expect(document.body.style.overflow).toBe('hidden');
    expect(document.body.style.touchAction).toBe('none');

    releaseBodyScrollLock('game-session');

    expect(document.body.style.overflow).not.toBe('hidden');
    expect(document.body.style.touchAction).not.toBe('none');
  });
});
