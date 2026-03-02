import { act, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from './useAuth.js';

const mockGetDocument = vi.fn();
const mockSetDocument = vi.fn();
const mockUpdateDocument = vi.fn();
const mockOnAuthStateChanged = vi.fn();
const mockSignOut = vi.fn();
const mockDoc = vi.fn((_, collectionName, id) => ({ path: `${collectionName}/${id}` }));
const mockServerTimestamp = vi.fn(() => ({ __serverTimestamp: true }));
const mockOnSnapshot = vi.fn();

const authUnsubscribe = vi.fn();
const snapshotUnsubscribe = vi.fn();

vi.mock('../services/firebase/config.js', () => ({
  auth: {},
  db: {},
  onAuthStateChanged: (...args) => mockOnAuthStateChanged(...args),
  signOut: (...args) => mockSignOut(...args),
  doc: (...args) => mockDoc(...args),
  serverTimestamp: (...args) => mockServerTimestamp(...args),
  COLLECTIONS: {
    USERS: 'users',
    PUBLIC_PROFILES: 'publicProfiles',
    USERNAMES: 'usernames'
  }
}));

vi.mock('firebase/firestore', () => ({
  onSnapshot: (...args) => mockOnSnapshot(...args)
}));

vi.mock('../services/firebase/firestore.js', () => ({
  firestoreOperations: {
    getDocument: (...args) => mockGetDocument(...args),
    setDocument: (...args) => mockSetDocument(...args),
    updateDocument: (...args) => mockUpdateDocument(...args)
  }
}));

vi.mock('../services/firebase/publicProfileStats.js', () => ({
  buildPublicProfileIdentity: vi.fn(() => ({
    username: 'alpha',
    displayName: 'Alpha'
  })),
  projectPublicProfileStats: vi.fn((stats) => stats || {})
}));

vi.mock('../utils/logger.js', () => ({
  default: {
    log: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    error: vi.fn()
  }
}));

vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn()
  }
}));

const createDeferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((nextResolve, nextReject) => {
    resolve = nextResolve;
    reject = nextReject;
  });
  return { promise, resolve, reject };
};

const Probe = () => {
  const { user, userProfile, loading, initialized } = useAuth();

  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="initialized">{String(initialized)}</span>
      <span data-testid="user">{user?.uid || 'none'}</span>
      <span data-testid="profile">{userProfile?.displayName || userProfile?.username || 'none'}</span>
    </div>
  );
};

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignOut.mockResolvedValue();
    mockOnAuthStateChanged.mockImplementation((_auth, callback) => {
      mockOnAuthStateChanged.callback = callback;
      return authUnsubscribe;
    });
    mockOnSnapshot.mockImplementation((_ref, onNext) => {
      mockOnSnapshot.callback = onNext;
      return snapshotUnsubscribe;
    });
  });

  it('hydrates an existing profile and applies realtime updates', async () => {
    const firebaseUser = {
      uid: 'user-1',
      email: 'alpha@example.com',
      photoURL: 'avatar.png'
    };

    mockGetDocument
      .mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          username: 'alpha',
          displayName: 'Alpha',
          stats: { bestScore: 25 }
        })
      })
      .mockResolvedValueOnce({
        exists: () => true,
        data: () => ({})
      });

    const { unmount } = render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    await act(async () => {
      await mockOnAuthStateChanged.callback(firebaseUser);
    });

    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('user-1'));
    expect(screen.getByTestId('profile')).toHaveTextContent(/alpha/i);
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('initialized')).toHaveTextContent('true');
    expect(mockUpdateDocument).toHaveBeenCalledWith(
      { path: 'users/user-1' },
      expect.objectContaining({
        lastLoginAt: { __serverTimestamp: true },
        lastActiveAt: { __serverTimestamp: true }
      })
    );

    unmount();
    expect(authUnsubscribe).toHaveBeenCalledTimes(1);
  });

  it('does not bind realtime profile listeners after unmount during async profile load', async () => {
    const firebaseUser = {
      uid: 'user-2',
      email: 'beta@example.com',
      photoURL: null
    };
    const deferredUserDoc = createDeferred();

    mockGetDocument.mockReturnValueOnce(deferredUserDoc.promise);

    const { unmount } = render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    let authPromise;
    await act(async () => {
      authPromise = mockOnAuthStateChanged.callback(firebaseUser);
    });

    unmount();

    await act(async () => {
      deferredUserDoc.resolve({
        exists: () => true,
        data: () => ({
          username: 'beta',
          displayName: 'Beta'
        })
      });
      await authPromise;
    });

    expect(mockOnSnapshot).not.toHaveBeenCalled();
    expect(snapshotUnsubscribe).not.toHaveBeenCalled();
    expect(authUnsubscribe).toHaveBeenCalledTimes(1);
  });

  it('signs out instead of auto-creating a missing Firestore profile', async () => {
    const firebaseUser = {
      uid: 'user-3',
      email: 'gamma@example.com',
      photoURL: null
    };

    mockGetDocument.mockResolvedValueOnce({
      exists: () => false,
      data: () => ({})
    });

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    await act(async () => {
      await mockOnAuthStateChanged.callback(firebaseUser);
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('none');
    });
    expect(mockSignOut).toHaveBeenCalledWith({});
    expect(mockSetDocument).not.toHaveBeenCalled();
    expect(mockOnSnapshot).not.toHaveBeenCalled();
  });
});
