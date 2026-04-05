// @vitest-environment node
import { beforeAll, describe, expect, it, vi } from 'vitest';

class MockHttpsError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

let registrationPrivate;

beforeAll(async () => {
  const registrationModule = await import('./registration.js');
  registrationPrivate = (registrationModule.default ?? registrationModule).__private__;
});

describe('registration wrapper', () => {
  it('returns the core result with injected admin and db services', async () => {
    const completeEmailRegistrationCore = vi.fn().mockResolvedValue({
      success: true,
      uid: 'user-1'
    });
    const admin = { marker: 'admin' };
    const db = { marker: 'db' };

    await expect(registrationPrivate.completeEmailRegistrationHandler(
      {
        email: 'player@example.com'
      },
      {
        functions: {
          https: {
            HttpsError: MockHttpsError
          }
        },
        admin,
        db,
        registrationCore: {
          completeEmailRegistrationCore
        },
        logCallableError: vi.fn()
      }
    )).resolves.toEqual({
      success: true,
      uid: 'user-1'
    });

    expect(completeEmailRegistrationCore).toHaveBeenCalledWith(
      {
        email: 'player@example.com'
      },
      {
        admin,
        db
      }
    );
  });

  it('rethrows existing callable errors and logs a sanitized email', async () => {
    const logCallableError = vi.fn();

    await expect(registrationPrivate.completeEmailRegistrationHandler(
      {
        email: ' Player@Example.com '
      },
      {
        functions: {
          https: {
            HttpsError: MockHttpsError
          }
        },
        registrationCore: {
          completeEmailRegistrationCore: vi.fn().mockRejectedValue(
            new MockHttpsError('already-exists', 'taken')
          )
        },
        logCallableError,
        sanitizeText: (value = '', maxLength = 1000) =>
          typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
      }
    )).rejects.toMatchObject({
      code: 'already-exists',
      message: 'taken'
    });

    expect(logCallableError).toHaveBeenCalledWith(
      'completeEmailRegistration',
      expect.objectContaining({
        code: 'already-exists'
      }),
      {
        email: 'player@example.com'
      }
    );
  });

  it('maps unexpected failures to a stable internal callable error', async () => {
    const logCallableError = vi.fn();

    await expect(registrationPrivate.completeEmailRegistrationHandler(
      {
        email: ' Player@Example.com '
      },
      {
        functions: {
          https: {
            HttpsError: MockHttpsError
          }
        },
        registrationCore: {
          completeEmailRegistrationCore: vi.fn().mockRejectedValue(new Error('boom'))
        },
        logCallableError,
        sanitizeText: (value = '', maxLength = 1000) =>
          typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
      }
    )).rejects.toMatchObject({
      code: 'internal',
      message: 'Unable to complete signup right now. Please try again.'
    });

    expect(logCallableError).toHaveBeenCalledWith(
      'completeEmailRegistration',
      expect.any(Error),
      {
        email: 'player@example.com'
      }
    );
  });
});
