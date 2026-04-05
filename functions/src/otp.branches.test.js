// @vitest-environment node
import { beforeAll, describe, expect, it, vi } from 'vitest';

class MockHttpsError extends Error {
  constructor(code, message, details) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

let otpPrivate;

const createTimestampFactory = () => ({
  fromMillis: (value) => ({
    toMillis: () => value,
    value
  })
});

const createRequestServices = ({
  authExists = false,
  ipCheck = { allowed: true },
  doc = { exists: false, data: () => null },
  now = 1700000000000,
  sendMailError = null,
  maxRequestsPerHour = 3,
  resendCooldownMs = 120000
} = {}) => {
  const getUserByEmail = authExists
    ? vi.fn().mockResolvedValue({ uid: 'existing-user' })
    : vi.fn().mockRejectedValue({ code: 'auth/user-not-found' });
  const checkRateLimit = vi.fn().mockResolvedValue(ipCheck);
  const sendMail = sendMailError
    ? vi.fn().mockRejectedValue(sendMailError)
    : vi.fn().mockResolvedValue(undefined);
  const logCallableError = vi.fn();
  const docRef = {
    path: 'emailOtps/email-key',
    get: vi.fn().mockResolvedValue(doc),
    set: vi.fn().mockResolvedValue(undefined)
  };

  return {
    services: {
      now: () => now,
      functions: {
        https: {
          HttpsError: MockHttpsError
        }
      },
      admin: {
        auth: () => ({
          getUserByEmail
        }),
        firestore: {
          Timestamp: createTimestampFactory()
        }
      },
      crypto: {
        randomInt: vi.fn().mockReturnValue(123456)
      },
      db: {
        collection: (name) => ({
          doc: (id) => (name === 'emailOtps' ? docRef : { path: `${name}/${id}` })
        })
      },
      OTP_COLLECTION: 'emailOtps',
      OTP_RATE_LIMITS: 'otpRateLimits',
      MAX_REQUESTS_PER_HOUR: maxRequestsPerHour,
      RESEND_COOLDOWN_MS: resendCooldownMs,
      getEmailKey: () => 'email-key',
      getClientIp: () => '127.0.0.1',
      getIpHash: () => 'ip-hash',
      checkRateLimit,
      getOtpSalt: () => 'otp-salt',
      hashOtp: (otp) => `hash:${otp}`,
      getTransporter: () => ({ sendMail }),
      buildOtpEmail: ({ code }) => ({
        subject: 'SnakrX verification code',
        text: code,
        html: `<p>${code}</p>`
      }),
      logCallableError
    },
    mocks: {
      getUserByEmail,
      checkRateLimit,
      sendMail,
      logCallableError,
      docRef
    }
  };
};

const createVerifyServices = ({
  ipCheck = { allowed: true },
  doc = {
    exists: true,
    data: () => ({
      codeHash: 'hash:123456',
      attempts: 0,
      consumedAt: null,
      expiresAt: { toMillis: () => 1700000600000 },
      verified: false
    })
  },
  now = 1700000000000
} = {}) => {
  const checkRateLimit = vi.fn().mockResolvedValue(ipCheck);
  const docRef = {
    path: 'emailOtps/email-key',
    get: vi.fn().mockResolvedValue(doc),
    set: vi.fn().mockResolvedValue(undefined)
  };

  return {
    services: {
      now: () => now,
      functions: {
        https: {
          HttpsError: MockHttpsError
        }
      },
      admin: {
        firestore: {
          Timestamp: createTimestampFactory()
        }
      },
      db: {
        collection: (name) => ({
          doc: (id) => (name === 'emailOtps' ? docRef : { path: `${name}/${id}` })
        })
      },
      OTP_COLLECTION: 'emailOtps',
      OTP_RATE_LIMITS: 'otpRateLimits',
      getEmailKey: () => 'email-key',
      getClientIp: () => '127.0.0.1',
      getIpHash: () => 'ip-hash',
      checkRateLimit,
      getOtpSalt: () => 'otp-salt',
      hashOtp: (otp) => `hash:${otp}`
    },
    mocks: {
      checkRateLimit,
      docRef
    }
  };
};

beforeAll(async () => {
  const otpModule = await import('./otp.js');
  otpPrivate = (otpModule.default ?? otpModule).__private__;
});

describe('otp branch coverage', () => {
  it('rejects OTP requests for already-registered emails before sending anything', async () => {
    const { services, mocks } = createRequestServices({
      authExists: true
    });

    await expect(
      otpPrivate.requestEmailOtpCore({ email: 'player@example.com' }, services)
    ).rejects.toMatchObject({
      code: 'already-exists'
    });

    expect(mocks.sendMail).not.toHaveBeenCalled();
    expect(mocks.docRef.set).not.toHaveBeenCalled();
  });

  it('rejects IP-throttled OTP requests with retry metadata', async () => {
    const { services } = createRequestServices({
      ipCheck: {
        allowed: false,
        retryAfterMs: 4321
      }
    });

    await expect(
      otpPrivate.requestEmailOtpCore({ email: 'player@example.com' }, services)
    ).rejects.toMatchObject({
      code: 'resource-exhausted',
      details: {
        retryAfterMs: 4321
      }
    });
  });

  it('enforces resend cooldowns and per-hour request caps using stored timestamps', async () => {
    const cooldownNow = 1700000000000;
    const cooldownDoc = {
      exists: true,
      data: () => ({
        lastRequestedAt: { toMillis: () => cooldownNow - 30000 },
        requestCount: 1,
        windowStart: { toMillis: () => cooldownNow - 30000 }
      })
    };
    const cooldownServices = createRequestServices({
      doc: cooldownDoc,
      now: cooldownNow,
      resendCooldownMs: 120000
    }).services;

    await expect(
      otpPrivate.requestEmailOtpCore({ email: 'player@example.com' }, cooldownServices)
    ).rejects.toMatchObject({
      code: 'resource-exhausted',
      details: {
        retryAfterMs: 90000
      }
    });

    const capNow = 1700003600000;
    const { services } = createRequestServices({
      doc: {
        exists: true,
        data: () => ({
          lastRequestedAt: { toMillis: () => capNow - 180000 },
          requestCount: 3,
          windowStart: { toMillis: () => capNow - 1000 }
        })
      },
      now: capNow,
      resendCooldownMs: 120000,
      maxRequestsPerHour: 3
    });

    await expect(
      otpPrivate.requestEmailOtpCore({ email: 'player@example.com' }, services)
    ).rejects.toMatchObject({
      code: 'resource-exhausted',
      details: {
        retryAfterMs: 3599000
      }
    });
  });

  it('starts a fresh hourly request window after the previous one expires', async () => {
    const now = 1700000000000;
    const { services, mocks } = createRequestServices({
      doc: {
        exists: true,
        data: () => ({
          lastRequestedAt: { toMillis: () => now - 180000 },
          requestCount: 99,
          windowStart: { toMillis: () => now - (60 * 60 * 1000) - 1 }
        })
      },
      now
    });

    await expect(
      otpPrivate.requestEmailOtpCore({ email: 'player@example.com' }, services)
    ).resolves.toEqual({
      expiresAt: 1700000600000
    });

    expect(mocks.docRef.set).toHaveBeenCalledWith(
      expect.objectContaining({
        requestCount: 1,
        windowStart: expect.objectContaining({
          value: now
        })
      }),
      { merge: true }
    );
  });

  it('maps email transport authentication and generic send failures to stable callable errors', async () => {
    const authFailure = createRequestServices({
      sendMailError: {
        code: 'EAUTH',
        responseCode: 535
      }
    });

    await expect(
      otpPrivate.requestEmailOtpCore({ email: 'player@example.com' }, authFailure.services)
    ).rejects.toMatchObject({
      code: 'failed-precondition'
    });
    expect(authFailure.mocks.logCallableError).toHaveBeenCalledWith(
      'requestEmailOtp.sendMail',
      expect.objectContaining({ code: 'EAUTH' }),
      {
        responseCode: 535
      }
    );

    const genericFailure = createRequestServices({
      sendMailError: {
        code: 'ESOCKET'
      }
    });

    await expect(
      otpPrivate.requestEmailOtpCore({ email: 'player@example.com' }, genericFailure.services)
    ).rejects.toMatchObject({
      code: 'internal'
    });
  });

  it('returns existing verification state without rewriting the document', async () => {
    const { services, mocks } = createVerifyServices({
      doc: {
        exists: true,
        data: () => ({
          codeHash: 'hash:123456',
          attempts: 0,
          consumedAt: null,
          expiresAt: { toMillis: () => 1700000600000 },
          verified: true,
          verifiedAt: { toMillis: () => 1700000100000 }
        })
      }
    });

    await expect(
      otpPrivate.verifyEmailOtpCore(
        { email: 'player@example.com', code: '123456' },
        services
      )
    ).resolves.toEqual({
      verified: true,
      expiresAt: 1700000600000,
      verifiedAt: 1700000100000
    });

    expect(mocks.docRef.set).not.toHaveBeenCalled();
  });

  it('rejects missing, expired, consumed, and throttled verification attempts', async () => {
    const throttled = createVerifyServices({
      ipCheck: {
        allowed: false,
        retryAfterMs: 789
      }
    }).services;

    await expect(
      otpPrivate.verifyEmailOtpCore({ email: 'player@example.com', code: '123456' }, throttled)
    ).rejects.toMatchObject({
      code: 'resource-exhausted',
      details: {
        retryAfterMs: 789
      }
    });

    const missing = createVerifyServices({
      doc: {
        exists: false,
        data: () => null
      }
    }).services;

    await expect(
      otpPrivate.verifyEmailOtpCore({ email: 'player@example.com', code: '123456' }, missing)
    ).rejects.toMatchObject({
      code: 'not-found'
    });

    const expired = createVerifyServices({
      doc: {
        exists: true,
        data: () => ({
          codeHash: 'hash:123456',
          attempts: 0,
          consumedAt: null,
          expiresAt: { toMillis: () => 1699999999999 },
          verified: false
        })
      }
    }).services;

    await expect(
      otpPrivate.verifyEmailOtpCore({ email: 'player@example.com', code: '123456' }, expired)
    ).rejects.toMatchObject({
      code: 'deadline-exceeded'
    });

    const consumed = createVerifyServices({
      doc: {
        exists: true,
        data: () => ({
          codeHash: 'hash:123456',
          attempts: 0,
          consumedAt: { toMillis: () => 1699999900000 },
          expiresAt: { toMillis: () => 1700000600000 },
          verified: false
        })
      }
    }).services;

    await expect(
      otpPrivate.verifyEmailOtpCore({ email: 'player@example.com', code: '123456' }, consumed)
    ).rejects.toMatchObject({
      code: 'failed-precondition'
    });
  });

  it('rejects exhausted verify attempts and increments attempts on wrong codes', async () => {
    const maxAttempts = createVerifyServices({
      doc: {
        exists: true,
        data: () => ({
          codeHash: 'hash:123456',
          attempts: 999,
          consumedAt: null,
          expiresAt: { toMillis: () => 1700000600000 },
          verified: false
        })
      }
    }).services;

    await expect(
      otpPrivate.verifyEmailOtpCore({ email: 'player@example.com', code: '123456' }, maxAttempts)
    ).rejects.toMatchObject({
      code: 'resource-exhausted'
    });

    const { services, mocks } = createVerifyServices({
      doc: {
        exists: true,
        data: () => ({
          codeHash: 'hash:654321',
          attempts: 2,
          consumedAt: null,
          expiresAt: { toMillis: () => 1700000600000 },
          verified: false
        })
      }
    });

    await expect(
      otpPrivate.verifyEmailOtpCore({ email: 'player@example.com', code: '123456' }, services)
    ).rejects.toMatchObject({
      code: 'permission-denied'
    });

    expect(mocks.docRef.set).toHaveBeenCalledWith(
      expect.objectContaining({
        attempts: 3,
        updatedAt: expect.objectContaining({
          value: 1700000000000
        })
      }),
      { merge: true }
    );
  });
});
