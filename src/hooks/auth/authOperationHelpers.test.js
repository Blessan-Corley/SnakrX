import { describe, expect, it } from 'vitest';
import { validators } from '../../utils/validation.js';
import {
  buildPublicProfileData,
  buildUserProfileData,
  createProfileUpdatePayloads,
  normalizeRegistrationInput
} from './authOperationHelpers.js';
import {
  getPasswordResetErrorMessage,
  getSignInErrorMessage,
  getSignUpErrorMessage
} from './authOperationErrors.js';

describe('auth operation helpers', () => {
  const serverTimestamp = () => ({ __serverTimestamp: true });

  it('normalizes and validates registration input', () => {
    const result = normalizeRegistrationInput({
      username: ' PlayerOne ',
      email: 'PLAYER@Example.com',
      password: 'StrongPass123'
    }, validators);

    expect(result).toEqual({
      password: 'StrongPass123',
      normalizedUsername: 'playerone',
      normalizedEmail: 'player@example.com',
      displayName: 'PlayerOne'
    });
  });

  it('throws validation errors for invalid registration input', () => {
    expect(() => normalizeRegistrationInput({
      username: 'a',
      email: 'player@example.com',
      password: 'StrongPass123'
    }, validators)).toThrow('Username must be at least 3 characters long');
  });

  it('creates profile update payloads without allowing username changes', () => {
    const payloads = createProfileUpdatePayloads({
      username: 'hijack',
      displayName: 'New Name',
      avatar: 'avatar.png',
      avatarPath: '/avatars/new.png',
      preferences: { privateLeaderboard: true }
    });

    expect(payloads.safeUpdates).not.toHaveProperty('username');
    expect(payloads.authProfileUpdates).toEqual({
      displayName: 'New Name',
      photoURL: 'avatar.png'
    });
    expect(payloads.publicUpdates).toEqual({
      displayName: 'New Name',
      avatar: 'avatar.png',
      avatarPath: '/avatars/new.png',
      isPrivateLeaderboard: true
    });
  });

  it('builds user and public profile records', () => {
    const user = {
      uid: 'user-1',
      email: 'player@example.com',
      displayName: null,
      photoURL: null
    };
    const createDefaultUserProfile = () => ({
      role: 'player',
      settings: { soundEnabled: true },
      stats: { totalGames: 0 }
    });
    const userProfile = buildUserProfileData({
      createDefaultUserProfile,
      user,
      normalizedUsername: 'playerone',
      displayName: 'PlayerOne',
      normalizedEmail: 'player@example.com',
      serverTimestamp
    });
    const publicProfile = buildPublicProfileData({
      user,
      normalizedUsername: 'playerone',
      displayName: 'PlayerOne',
      serverTimestamp
    });

    expect(userProfile.username).toBe('playerone');
    expect(userProfile.displayName).toBe('PlayerOne');
    expect(userProfile.email).toBe('player@example.com');
    expect(userProfile.createdAt).toEqual({ __serverTimestamp: true });
    expect(publicProfile.uid).toBe('user-1');
    expect(publicProfile.username).toBe('playerone');
    expect(publicProfile.displayName).toBe('PlayerOne');
    expect(publicProfile.createdAt).toEqual({ __serverTimestamp: true });
  });
});

describe('auth operation error mapping', () => {
  it('maps sign up errors', () => {
    expect(getSignUpErrorMessage({ code: 'auth/email-already-in-use' }))
      .toMatch(/already exists/i);
  });

  it('maps sign in errors', () => {
    expect(getSignInErrorMessage({ code: 'auth/invalid-credential' }))
      .toMatch(/incorrect password/i);
  });

  it('maps password reset errors', () => {
    expect(getPasswordResetErrorMessage({ code: 'auth/too-many-requests' }))
      .toMatch(/too many password reset requests/i);
  });
});
