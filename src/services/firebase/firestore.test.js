import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetDoc = vi.fn();
const mockSetDoc = vi.fn();
const mockUpdateDoc = vi.fn();

vi.mock('./config.js', () => ({
  getDoc: (...args) => mockGetDoc(...args),
  setDoc: (...args) => mockSetDoc(...args),
  updateDoc: (...args) => mockUpdateDoc(...args)
}));

vi.mock('../../utils/logger.js', () => ({
  default: {
    log: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}));

describe('firestoreOperations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws an explicit offline error when a write cannot be confirmed', async () => {
    mockSetDoc.mockRejectedValueOnce({ code: 'unavailable', message: 'offline' });

    const { firestoreOperations } = await import('./firestore.js');

    await expect(
      firestoreOperations.setDocument({ path: 'users/u1' }, { displayName: 'Player One' })
    ).rejects.toMatchObject({
      code: 'offline-unavailable',
      message: expect.stringContaining('offline')
    });
  });

  it('throws an explicit offline error when an update cannot be confirmed', async () => {
    mockUpdateDoc.mockRejectedValueOnce({ message: 'client is offline right now' });

    const { firestoreOperations } = await import('./firestore.js');

    await expect(
      firestoreOperations.updateDocument({ path: 'users/u1' }, { updatedAt: 1 })
    ).rejects.toMatchObject({
      code: 'offline-unavailable',
      message: expect.stringContaining('offline')
    });
  });

  it('returns the document once a read succeeds within the retry budget', async () => {
    const expectedSnap = { exists: () => true };

    mockGetDoc
      .mockRejectedValueOnce(new Error('temporary read error'))
      .mockResolvedValueOnce(expectedSnap);

    const { firestoreOperations } = await import('./firestore.js');

    await expect(firestoreOperations.getDocument({ path: 'users/u1' }, 2)).resolves.toBe(expectedSnap);
    expect(mockGetDoc).toHaveBeenCalledTimes(2);
  });
});
