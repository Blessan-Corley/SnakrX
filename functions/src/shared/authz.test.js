// @vitest-environment node
import { beforeAll, describe, expect, it } from 'vitest';

class MockHttpsError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

let assertAdminUserCore;

beforeAll(async () => {
  const module = await import('./authz.js');
  assertAdminUserCore = (module.default ?? module).__private__.assertAdminUserCore;
});

describe('assertAdminUser', () => {
  it('rejects unauthenticated callers', async () => {
    await expect(assertAdminUserCore({}, {
      functions: {
        https: {
          HttpsError: MockHttpsError
        }
      }
    })).rejects.toMatchObject({
      code: 'unauthenticated'
    });
  });

  it('rejects authenticated non-admin users', async () => {
    await expect(assertAdminUserCore({
      auth: {
        uid: 'user-1'
      }
    }, {
      functions: {
        https: {
          HttpsError: MockHttpsError
        }
      },
      db: {
        collection: () => ({
          doc: () => ({
            get: async () => ({
              exists: true,
              data: () => ({
                role: 'player'
              })
            })
          })
        })
      }
    })).rejects.toMatchObject({
      code: 'permission-denied'
    });
  });

  it('allows authenticated admins', async () => {
    await expect(assertAdminUserCore({
      auth: {
        uid: 'admin-1'
      }
    }, {
      functions: {
        https: {
          HttpsError: MockHttpsError
        }
      },
      db: {
        collection: () => ({
          doc: () => ({
            get: async () => ({
              exists: true,
              data: () => ({
                role: 'admin'
              })
            })
          })
        })
      }
    })).resolves.toBeUndefined();
  });
});
