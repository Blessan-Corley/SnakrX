import { beforeEach, describe, expect, it, vi } from 'vitest';
import { completeEmailRegistration } from './emailRegistration.js';

const mockCallableFactory = vi.fn();
const mockCompleteRegistrationCallable = vi.fn();
const mockSignInWithEmailAndPassword = vi.fn();
const mockGetIdToken = vi.fn();

vi.mock('./config.js', () => ({
  auth: {},
  functions: {},
  httpsCallable: (...args) => mockCallableFactory(...args),
  signInWithEmailAndPassword: (...args) => mockSignInWithEmailAndPassword(...args)
}));

describe('emailRegistration service', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    mockCallableFactory.mockImplementation((_functions, name) => {
      if (name === 'completeEmailRegistration') {
        return mockCompleteRegistrationCallable;
      }
      return vi.fn();
    });

    const module = await import('./emailRegistration.js');
    module.__private__.resetCallables();
  });

  it('completes backend-owned registration and signs the user in', async () => {
    mockCompleteRegistrationCallable.mockResolvedValue({
      data: { success: true, uid: 'user-1' }
    });
    mockSignInWithEmailAndPassword.mockResolvedValue({
      user: {
        uid: 'user-1',
        getIdToken: mockGetIdToken
      }
    });

    const user = await completeEmailRegistration({
      email: '  Player@Example.com ',
      password: 'StrongPass123',
      username: 'Player_One',
      displayName: 'Player One'
    });

    expect(mockCallableFactory).toHaveBeenCalledWith({}, 'completeEmailRegistration');
    expect(mockCompleteRegistrationCallable).toHaveBeenCalledWith({
      email: 'player@example.com',
      password: 'StrongPass123',
      username: 'player_one',
      displayName: 'Player One'
    });
    expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
      {},
      'player@example.com',
      'StrongPass123'
    );
    expect(mockGetIdToken).not.toHaveBeenCalled();
    expect(user).toMatchObject({ uid: 'user-1' });
  });

  it('maps callable precondition errors into user-facing errors', async () => {
    mockCompleteRegistrationCallable.mockRejectedValue({
      code: 'functions/failed-precondition',
      message: 'Verify your email address before creating an account.'
    });

    await expect(
      completeEmailRegistration({
        email: 'player@example.com',
        password: 'StrongPass123',
        username: 'player_one',
        displayName: 'Player One'
      })
    ).rejects.toMatchObject({
      code: 'failed-precondition',
      message: 'Verify your email address before creating an account.'
    });

    expect(mockSignInWithEmailAndPassword).not.toHaveBeenCalled();
  });
});
