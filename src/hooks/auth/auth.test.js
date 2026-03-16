import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { validators } from '../../utils/validation.js';

const mockCreateUser = vi.fn();
const mockDeleteUser = vi.fn();
const mockSignIn = vi.fn();
const mockUpdateAuthProfile = vi.fn();
const mockCompleteEmailRegistration = vi.fn();
const mockRequestPasswordResetEmail = vi.fn();
const mockGetDoc = vi.fn();
const mockRunTransaction = vi.fn();
const mockDoc = vi.fn((_, collectionName, id) => ({ path: `${collectionName}/${id}`, id }));
const mockServerTimestamp = vi.fn(() => ({ __serverTimestamp: true }));
const mockGetDocument = vi.fn();
const mockUpdateDocument = vi.fn();

const transactionGet = vi.fn();
const transactionSet = vi.fn();

vi.mock('../../services/firebase/index.js', () => ({
  auth: {},
  db: {},
  signInWithEmailAndPassword: (...args) => mockSignIn(...args),
  createUserWithEmailAndPassword: (...args) => mockCreateUser(...args),
  deleteUser: (...args) => mockDeleteUser(...args),
  signOut: vi.fn(),
  updateProfile: (...args) => mockUpdateAuthProfile(...args),
  doc: (...args) => mockDoc(...args),
  getDoc: (...args) => mockGetDoc(...args),
  runTransaction: (...args) => mockRunTransaction(...args),
  serverTimestamp: (...args) => mockServerTimestamp(...args),
  COLLECTIONS: {
    USERS: 'users',
    PUBLIC_PROFILES: 'publicProfiles',
    USERNAMES: 'usernames'
  },
  firestoreOperations: {
    getDocument: (...args) => mockGetDocument(...args),
    updateDocument: (...args) => mockUpdateDocument(...args)
  }
}));

vi.mock('../../services/firebase/emailRegistration.js', () => ({
  completeEmailRegistration: (...args) => mockCompleteEmailRegistration(...args)
}));

vi.mock('../../services/firebase/passwordReset.js', () => ({
  requestPasswordResetEmail: (...args) => mockRequestPasswordResetEmail(...args)
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

vi.mock('../../utils/logger.js', () => ({
  default: {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}));

vi.mock('./rateLimit.js', () => ({
  useRateLimit: () => ({
    checkRateLimit: () => true,
    recordFailedAttempt: vi.fn(),
    resetAttempts: vi.fn()
  })
}));

describe('Authentication Validation', () => {
  it('rejects short passwords', () => {
    expect(validators.password('12345').valid).toBe(false);
  });

  it('rejects invalid email format', () => {
    expect(validators.email('invalid-email').valid).toBe(false);
  });

  it('accepts strong passwords', () => {
    expect(validators.password('StrongPass123').valid).toBe(true);
  });
});

describe('useAuthOperations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRunTransaction.mockImplementation(async (_db, callback) => callback({
      get: transactionGet,
      set: transactionSet
    }));
    mockCompleteEmailRegistration.mockReset();
    mockRequestPasswordResetEmail.mockReset();
  });

  it('checks username availability from the reservation document', async () => {
    mockGetDoc.mockResolvedValue({
      exists: () => false
    });

    const { useAuthOperations } = await import('./authOperations.js');
    const { result } = renderHook(() => useAuthOperations());

    let available;
    await act(async () => {
      available = await result.current.checkUsernameAvailability('TestUser');
    });

    expect(available).toBe(true);
    expect(mockDoc).toHaveBeenCalledWith({}, 'usernames', 'testuser');
  });

  it('returns false immediately for invalid usernames', async () => {
    const { useAuthOperations } = await import('./authOperations.js');
    const { result } = renderHook(() => useAuthOperations());

    let available;
    await act(async () => {
      available = await result.current.checkUsernameAvailability('a');
    });

    expect(available).toBe(false);
    expect(mockGetDoc).not.toHaveBeenCalled();
  });

  it('delegates sign up to the backend registration callable and signs the user in', async () => {
    const createdUser = {
      uid: 'user-1',
      email: 'player@example.com',
      displayName: null,
      photoURL: null,
      getIdToken: vi.fn()
    };

    mockGetDoc.mockResolvedValue({
      exists: () => false
    });
    mockCompleteEmailRegistration.mockResolvedValue(createdUser);
    mockSignIn.mockResolvedValue({ user: createdUser });

    const { useAuthOperations } = await import('./authOperations.js');
    const { result } = renderHook(() => useAuthOperations());

    let response;
    await act(async () => {
      response = await result.current.signUp({
        username: 'TestUser',
        email: 'Player@Example.com',
        password: 'StrongPass123'
      });
    });

    expect(response).toEqual({ success: true, user: createdUser });
    expect(mockCompleteEmailRegistration).toHaveBeenCalledWith({
      email: 'player@example.com',
      password: 'StrongPass123',
      username: 'testuser',
      displayName: 'TestUser'
    });
    expect(mockSignIn).not.toHaveBeenCalled();
    expect(createdUser.getIdToken).not.toHaveBeenCalled();
  });

  it('stops before backend signup when username is already taken', async () => {
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ userId: 'other-user' })
    });

    const { useAuthOperations } = await import('./authOperations.js');
    const { result } = renderHook(() => useAuthOperations());

    let response;
    await act(async () => {
      response = await result.current.signUp({
        username: 'TakenUser',
        email: 'player2@example.com',
        password: 'StrongPass123'
      });
    });

    expect(response.success).toBe(false);
    expect(response.error).toMatch(/username is already taken/i);
    expect(mockCompleteEmailRegistration).not.toHaveBeenCalled();
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('updates profile fields without allowing username mutation', async () => {
    const currentUser = {
      uid: 'user-9',
      displayName: 'Old Name',
      email: 'old-name@example.com',
      photoURL: null
    };
    const { auth } = await import('../../services/firebase/index.js');
    auth.currentUser = currentUser;
    mockGetDocument.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        username: 'oldname',
        displayName: 'Old Name'
      })
    });

    const { useAuthOperations } = await import('./authOperations.js');
    const { result } = renderHook(() => useAuthOperations());

    let response;
    await act(async () => {
      response = await result.current.updateProfile({
        displayName: 'New Name',
        username: 'hijack-attempt',
        avatar: 'avatar.png',
        avatarPath: '/avatars/user-9.png',
        settings: {
          soundEnabled: false,
          soundVolume: 0.25
        },
        preferences: {
          favoriteGameMode: 'classic',
          privateLeaderboard: true
        }
      });
    });

    expect(response).toEqual({ success: true });
    expect(mockUpdateAuthProfile).toHaveBeenCalledWith(currentUser, {
      displayName: 'New Name',
      photoURL: 'avatar.png'
    });

    const userWrite = mockUpdateDocument.mock.calls.find(([ref]) => ref.path === 'users/user-9');
    const publicWrite = mockUpdateDocument.mock.calls.find(([ref]) => ref.path === 'publicProfiles/user-9');

    expect(userWrite?.[1]).toMatchObject({
      displayName: 'New Name',
      avatar: 'avatar.png',
      avatarPath: '/avatars/user-9.png',
      settings: {
        soundEnabled: false,
        soundVolume: 0.25
      }
    });
    expect(userWrite?.[1]).not.toHaveProperty('username');
    expect(publicWrite?.[1]).toMatchObject({
      displayName: 'New Name',
      avatar: 'avatar.png',
      avatarPath: '/avatars/user-9.png',
      isPrivateLeaderboard: true
    });
    expect(publicWrite?.[1]).not.toHaveProperty('username');
  });

  it('delegates password reset requests to the custom reset service', async () => {
    mockRequestPasswordResetEmail.mockResolvedValue({ success: true });

    const { useAuthOperations } = await import('./authOperations.js');
    const { result } = renderHook(() => useAuthOperations());

    let response;
    await act(async () => {
      response = await result.current.resetPassword('Player@Example.com');
    });

    expect(response).toEqual({ success: true });
    expect(mockRequestPasswordResetEmail).toHaveBeenCalledWith('Player@Example.com');
  });
});
