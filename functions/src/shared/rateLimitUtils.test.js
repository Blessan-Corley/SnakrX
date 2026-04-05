// @vitest-environment node
import { beforeAll, describe, expect, it, vi } from 'vitest';

let checkRateLimit;

beforeAll(async () => {
  const rateLimitUtilsModule = await import('./rateLimitUtils.js');
  ({ checkRateLimit } = rateLimitUtilsModule.default ?? rateLimitUtilsModule);
});

describe('checkRateLimit', () => {
  it('increments within the active window and persists the original start time', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-18T10:00:00.000Z'));

    const docRef = {
      get: vi.fn().mockResolvedValue({
        exists: true,
        data: () => ({
          requestWindowStart: {
            toMillis: () => Date.parse('2026-03-18T09:45:00.000Z')
          },
          requestCount: 2
        })
      }),
      set: vi.fn().mockResolvedValue(undefined)
    };

    await expect(checkRateLimit(docRef, 5, 60 * 60 * 1000, 'request')).resolves.toEqual({
      allowed: true
    });

    expect(docRef.set).toHaveBeenCalledWith(
      expect.objectContaining({
        requestCount: 3,
        requestWindowStart: expect.objectContaining({
          _seconds: Math.floor(Date.parse('2026-03-18T09:45:00.000Z') / 1000)
        })
      }),
      { merge: true }
    );

    vi.useRealTimers();
  });

  it('returns retry metadata without persisting when the limit is exceeded', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-18T10:00:00.000Z'));

    const docRef = {
      get: vi.fn().mockResolvedValue({
        exists: true,
        data: () => ({
          verifyWindowStart: {
            toMillis: () => Date.parse('2026-03-18T09:30:00.000Z')
          },
          verifyCount: 5
        })
      }),
      set: vi.fn().mockResolvedValue(undefined)
    };

    await expect(checkRateLimit(docRef, 5, 60 * 60 * 1000, 'verify')).resolves.toEqual({
      allowed: false,
      retryAfterMs: 1800000
    });
    expect(docRef.set).not.toHaveBeenCalled();

    vi.useRealTimers();
  });

  it('starts a fresh window after the previous one expires', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-18T10:00:00.000Z'));

    const docRef = {
      get: vi.fn().mockResolvedValue({
        exists: true,
        data: () => ({
          requestWindowStart: {
            toMillis: () => Date.parse('2026-03-18T08:00:00.000Z')
          },
          requestCount: 9
        })
      }),
      set: vi.fn().mockResolvedValue(undefined)
    };

    await expect(checkRateLimit(docRef, 5, 60 * 60 * 1000, 'request')).resolves.toEqual({
      allowed: true
    });

    expect(docRef.set).toHaveBeenCalledWith(
      expect.objectContaining({
        requestCount: 1,
        requestWindowStart: expect.objectContaining({
          _seconds: Math.floor(Date.parse('2026-03-18T10:00:00.000Z') / 1000)
        })
      }),
      { merge: true }
    );

    vi.useRealTimers();
  });
});
