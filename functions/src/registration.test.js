// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

class MockHttpsError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

const mockServerTimestamp = vi.fn(() => ({ __serverTimestamp: true }));
const sanitizeText = (value = '', maxLength = 1000) =>
  typeof value === 'string' ? value.trim().slice(0, maxLength) : '';

const createRegistrationCoreUnderTest = async () => {
  const { createRegistrationCore } = await import('./registrationCore.js');

  return createRegistrationCore({
    functions: {
      https: {
        HttpsError: MockHttpsError
      }
    },
    sanitizeText,
    OTP_COLLECTION: 'emailOtps',
    OTP_TTL_MS: 10 * 60 * 1000,
    getEmailKey: () => 'email-key',
    createDefaultUserProfileData: ({ email, username, displayName }) => ({
      email,
      username,
      displayName,
      stats: {
        totalGames: 0,
        totalWins: 0
      }
    }),
    createDefaultPublicProfileData: ({ uid, username, displayName, stats }) => ({
      uid,
      username,
      displayName,
      stats
    }),
    logCallableInfo: vi.fn(),
    logCallableError: vi.fn()
  });
};

describe('completeEmailRegistrationCore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('validates signup payload rules before touching auth or firestore', async () => {
    const registrationCore = await createRegistrationCoreUnderTest();

    expect(() => registrationCore.normalizeSignupPayload({
      email: 'nope',
      username: 'player_one',
      password: 'StrongPass123'
    })).toThrow(/valid email address/i);

    expect(() => registrationCore.normalizeSignupPayload({
      email: 'player@example.com',
      username: 'ab',
      password: 'StrongPass123'
    })).toThrow(/Username must be 3-20 characters/i);

    expect(() => registrationCore.normalizeSignupPayload({
      email: 'player@example.com',
      username: 'player-one',
      password: 'StrongPass123'
    })).toThrow(/Username must be 3-20 characters/i);

    expect(() => registrationCore.normalizeSignupPayload({
      email: 'player@example.com',
      username: 'player_one',
      password: 'short'
    })).toThrow(/between 6 and 128 characters/i);

    expect(() => registrationCore.normalizeSignupPayload({
      email: 'player@example.com',
      username: 'player_one',
      password: 'alllowercase1'
    })).toThrow(/uppercase, lowercase, and numeric/i);

    expect(registrationCore.normalizeSignupPayload({
      email: ' Player@Example.com ',
      username: 'Player_One',
      password: 'StrongPass123',
      displayName: ' Player One '
    })).toEqual({
      email: 'player@example.com',
      username: 'player_one',
      password: 'StrongPass123',
      displayName: 'Player One'
    });
  });

  it('rejects OTP records that are missing, mismatched, unverified, consumed, stale, or expired', async () => {
    const registrationCore = await createRegistrationCoreUnderTest();
    const now = 1700000005000;

    expect(() => registrationCore.assertOtpReadyForSignup({
      otpData: null,
      email: 'player@example.com',
      now
    })).toThrow(/Verify your email address/i);

    expect(() => registrationCore.assertOtpReadyForSignup({
      otpData: {
        email: 'other@example.com',
        verified: true,
        verifiedAt: { toMillis: () => now },
        expiresAt: { toMillis: () => now + 1000 }
      },
      email: 'player@example.com',
      now
    })).toThrow(/Verify your email address/i);

    expect(() => registrationCore.assertOtpReadyForSignup({
      otpData: {
        email: 'player@example.com',
        consumedAt: { toMillis: () => now - 1000 },
        verified: true,
        verifiedAt: { toMillis: () => now },
        expiresAt: { toMillis: () => now + 1000 }
      },
      email: 'player@example.com',
      now
    })).toThrow(/already used/i);

    expect(() => registrationCore.assertOtpReadyForSignup({
      otpData: {
        email: 'player@example.com',
        verified: false
      },
      email: 'player@example.com',
      now
    })).toThrow(/Verify your email address/i);

    expect(() => registrationCore.assertOtpReadyForSignup({
      otpData: {
        email: 'player@example.com',
        verified: true,
        verifiedAt: { toMillis: () => now - (11 * 60 * 1000) },
        expiresAt: { toMillis: () => now + 1000 }
      },
      email: 'player@example.com',
      now
    })).toThrow(/verification expired/i);

    expect(() => registrationCore.assertOtpReadyForSignup({
      otpData: {
        email: 'player@example.com',
        verified: true,
        verifiedAt: { toMillis: () => now - 1000 },
        expiresAt: { toMillis: () => now - 1 }
      },
      email: 'player@example.com',
      now
    })).toThrow(/Verification code has expired/i);

    expect(() => registrationCore.assertOtpReadyForSignup({
      otpData: {
        email: 'player@example.com',
        verified: true,
        verifiedAt: { toMillis: () => now - 1000 },
        expiresAt: { toMillis: () => now + 1000 }
      },
      email: 'player@example.com',
      now
    })).not.toThrow();
  });

  it('creates auth and profile records after a verified OTP', async () => {
    const otpRef = {
      get: vi.fn().mockResolvedValue({
        exists: true,
        data: () => ({
          email: 'player@example.com',
          verified: true,
          verifiedAt: { toMillis: () => 1700000000000 },
          expiresAt: { toMillis: () => 1700000300000 }
        })
      })
    };
    const transactionGet = vi.fn(async (ref) => {
      if (ref.path === 'usernames/player_one') {
        return { exists: false, data: () => ({}) };
      }

      if (ref.path === 'users/user-1') {
        return { exists: false, data: () => ({}) };
      }

      return { exists: false, data: () => ({}) };
    });
    const transactionSet = vi.fn();
    const createUser = vi.fn().mockResolvedValue({ uid: 'user-1' });
    const deleteUser = vi.fn();

    const services = {
      now: 1700000005000,
      admin: {
        auth: () => ({
          getUserByEmail: vi.fn().mockRejectedValue({ code: 'auth/user-not-found' }),
          createUser,
          deleteUser
        }),
        firestore: {
          FieldValue: {
            serverTimestamp: mockServerTimestamp
          },
          Timestamp: {
            fromMillis: (value) => ({ toMillis: () => value, value })
          }
        }
      },
      db: {
        collection: (name) => ({
          doc: (id) => {
            if (name === 'emailOtps') {
              return { path: `${name}/${id}`, get: otpRef.get };
            }

            return { path: `${name}/${id}` };
          }
        }),
        runTransaction: async (callback) =>
          callback({
            get: transactionGet,
            set: transactionSet
          })
      }
    };

    const registrationCore = await createRegistrationCoreUnderTest();
    const result = await registrationCore.completeEmailRegistrationCore({
      email: 'Player@Example.com',
      username: 'Player_One',
      password: 'StrongPass123',
      displayName: 'Player One'
    }, services);

    expect(result).toMatchObject({
      success: true,
      uid: 'user-1',
      email: 'player@example.com',
      username: 'player_one'
    });
    expect(createUser).toHaveBeenCalledWith({
      email: 'player@example.com',
      password: 'StrongPass123',
      displayName: 'Player One',
      emailVerified: true
    });
    expect(transactionSet).toHaveBeenCalledWith(
      expect.objectContaining({ path: 'usernames/player_one' }),
      expect.objectContaining({
        username: 'player_one',
        userId: 'user-1'
      }),
      { merge: true }
    );
    expect(transactionSet).toHaveBeenCalledWith(
      expect.objectContaining({ path: 'emailOtps/email-key' }),
      expect.objectContaining({
        consumedByUid: 'user-1'
      }),
      { merge: true }
    );
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it('rolls back the auth user if the registration transaction fails', async () => {
    const createUser = vi.fn().mockResolvedValue({ uid: 'user-2' });
    const deleteUser = vi.fn().mockResolvedValue();

    const services = {
      now: 1700000005000,
      admin: {
        auth: () => ({
          getUserByEmail: vi.fn().mockRejectedValue({ code: 'auth/user-not-found' }),
          createUser,
          deleteUser
        }),
        firestore: {
          FieldValue: {
            serverTimestamp: mockServerTimestamp
          },
          Timestamp: {
            fromMillis: (value) => ({ toMillis: () => value, value })
          }
        }
      },
      db: {
        collection: (name) => ({
          doc: (id) => ({
            path: `${name}/${id}`,
            get: vi.fn().mockResolvedValue({
              exists: true,
              data: () => ({
                email: 'player@example.com',
                verified: true,
                verifiedAt: { toMillis: () => 1700000000000 },
                expiresAt: { toMillis: () => 1700000300000 }
              })
            })
          })
        }),
        runTransaction: async () => {
          throw new MockHttpsError('already-exists', 'This username is already taken. Please choose another.');
        }
      }
    };

    const registrationCore = await createRegistrationCoreUnderTest();

    await expect(
      registrationCore.completeEmailRegistrationCore({
        email: 'player@example.com',
        username: 'player_one',
        password: 'StrongPass123',
        displayName: 'Player One'
      }, services)
    ).rejects.toMatchObject({
      code: 'already-exists'
    });

    expect(deleteUser).toHaveBeenCalledWith('user-2');
  });
});
