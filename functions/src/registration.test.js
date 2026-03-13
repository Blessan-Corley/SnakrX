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
