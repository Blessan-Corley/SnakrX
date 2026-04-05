// @vitest-environment node
import { beforeAll, describe, expect, it, vi } from 'vitest';

class MockHttpsError extends Error {
  constructor(code, message, details) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

const createDeferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((nextResolve, nextReject) => {
    resolve = nextResolve;
    reject = nextReject;
  });

  return { promise, resolve, reject };
};

let otpPrivate;

beforeAll(async () => {
  const otpModule = await import('./otp.js');
  otpPrivate = (otpModule.default ?? otpModule).__private__;
});

describe('otp helpers', () => {
  it('normalizes email input', () => {
    expect(otpPrivate.normalizeEmail(' Test@Example.com ')).toBe('test@example.com');
    expect(otpPrivate.normalizeEmail()).toBe('');
  });

  it('validates email addresses', () => {
    expect(otpPrivate.isValidEmail('player@example.com')).toBe(true);
    expect(otpPrivate.isValidEmail('playerexample.com')).toBe(false);
    expect(otpPrivate.isValidEmail('')).toBe(false);
  });

  it('validates OTP code format', () => {
    expect(otpPrivate.isValidOtpCode('123456')).toBe(true);
    expect(otpPrivate.isValidOtpCode('12345')).toBe(false);
    expect(otpPrivate.isValidOtpCode('12a456')).toBe(false);
  });

  it('starts auth lookup, IP throttling, and OTP lookup in parallel before sending the email', async () => {
    const authDeferred = createDeferred();
    const rateDeferred = createDeferred();
    const otpDocDeferred = createDeferred();
    const getUserByEmail = vi.fn(() => authDeferred.promise);
    const checkRateLimit = vi.fn(() => rateDeferred.promise);
    const sendMail = vi.fn().mockResolvedValue(undefined);
    const otpDocRef = {
      get: vi.fn(() => otpDocDeferred.promise),
      set: vi.fn().mockResolvedValue(undefined)
    };

    const requestPromise = otpPrivate.requestEmailOtpCore(
      { email: 'player@example.com' },
      {
        now: () => 1700000000000,
        functions: {
          https: { HttpsError: MockHttpsError }
        },
        admin: {
          auth: () => ({ getUserByEmail }),
          firestore: {
            Timestamp: {
              fromMillis: (value) => ({ toMillis: () => value, value })
            }
          }
        },
        crypto: {
          randomInt: vi.fn().mockReturnValue(123456)
        },
        db: {
          collection: (name) => ({
            doc: () => (name === 'emailOtps' ? otpDocRef : { path: `${name}/ip-hash` })
          })
        },
        OTP_COLLECTION: 'emailOtps',
        OTP_RATE_LIMITS: 'otpRateLimits',
        getEmailKey: () => 'email-key',
        getClientIp: () => '127.0.0.1',
        getIpHash: () => 'ip-hash',
        checkRateLimit,
        getOtpSalt: () => 'otp-salt',
        hashOtp: () => 'hashed-code',
        getTransporter: () => ({ sendMail }),
        buildOtpEmail: () => ({ subject: 'SnakrX verification code', text: '123456', html: '<p>123456</p>' }),
        logCallableError: vi.fn()
      }
    );

    await Promise.resolve();

    expect(getUserByEmail).toHaveBeenCalledWith('player@example.com');
    expect(checkRateLimit).toHaveBeenCalledWith(
      expect.objectContaining({ path: 'otpRateLimits/ip-hash' }),
      20,
      60 * 60 * 1000,
      'request'
    );
    expect(otpDocRef.get).toHaveBeenCalledTimes(1);

    authDeferred.reject({ code: 'auth/user-not-found' });
    rateDeferred.resolve({ allowed: true });
    otpDocDeferred.resolve({ exists: false, data: () => null });

    await expect(requestPromise).resolves.toEqual({
      expiresAt: 1700000600000
    });
    expect(sendMail).toHaveBeenCalledTimes(1);
    expect(otpDocRef.set).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'player@example.com',
        codeHash: 'hashed-code',
        requestCount: 1
      }),
      { merge: true }
    );
  });

  it('starts verification throttling and OTP lookup in parallel before checking the code', async () => {
    const rateDeferred = createDeferred();
    const otpDocDeferred = createDeferred();
    const checkRateLimit = vi.fn(() => rateDeferred.promise);
    const otpDocRef = {
      get: vi.fn(() => otpDocDeferred.promise),
      set: vi.fn().mockResolvedValue(undefined)
    };

    const verifyPromise = otpPrivate.verifyEmailOtpCore(
      { email: 'player@example.com', code: '123456' },
      {
        now: () => 1700000000000,
        functions: {
          https: { HttpsError: MockHttpsError }
        },
        admin: {
          firestore: {
            Timestamp: {
              fromMillis: (value) => ({ toMillis: () => value, value })
            }
          }
        },
        db: {
          collection: (name) => ({
            doc: () => (name === 'emailOtps' ? otpDocRef : { path: `${name}/ip-hash` })
          })
        },
        OTP_COLLECTION: 'emailOtps',
        OTP_RATE_LIMITS: 'otpRateLimits',
        getEmailKey: () => 'email-key',
        getClientIp: () => '127.0.0.1',
        getIpHash: () => 'ip-hash',
        checkRateLimit,
        getOtpSalt: () => 'otp-salt',
        hashOtp: () => 'expected-hash'
      }
    );

    await Promise.resolve();

    expect(checkRateLimit).toHaveBeenCalledWith(
      expect.objectContaining({ path: 'otpRateLimits/ip-hash' }),
      30,
      60 * 60 * 1000,
      'verify'
    );
    expect(otpDocRef.get).toHaveBeenCalledTimes(1);

    rateDeferred.resolve({ allowed: true });
    otpDocDeferred.resolve({
      exists: true,
      data: () => ({
        codeHash: 'expected-hash',
        attempts: 0,
        consumedAt: null,
        expiresAt: { toMillis: () => 1700000600000 },
        verified: false
      })
    });

    await expect(verifyPromise).resolves.toEqual({
      verified: true,
      expiresAt: 1700000600000,
      verifiedAt: 1700000000000
    });
    expect(otpDocRef.set).toHaveBeenCalledWith(
      expect.objectContaining({
        verified: true
      }),
      { merge: true }
    );
  });
});
