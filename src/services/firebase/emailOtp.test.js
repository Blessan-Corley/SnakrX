import { beforeEach, describe, expect, it, vi } from 'vitest';
import { requestEmailOtp, verifyEmailOtp } from './emailOtp.js';

const mockFetchSignInMethodsForEmail = vi.fn();
const mockRequestCallable = vi.fn();
const mockVerifyCallable = vi.fn();

vi.mock('firebase/auth', () => ({
  fetchSignInMethodsForEmail: (...args) => mockFetchSignInMethodsForEmail(...args)
}));

vi.mock('./config.js', () => ({
  auth: {},
  functions: {},
  httpsCallable: vi.fn((_, name) => {
    if (name === 'requestEmailOtp') return mockRequestCallable;
    if (name === 'verifyEmailOtp') return mockVerifyCallable;
    return vi.fn();
  })
}));

describe('emailOtp service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not call cloud function when email already exists', async () => {
    mockFetchSignInMethodsForEmail.mockResolvedValue(['password']);

    await expect(requestEmailOtp('Player@Example.com')).rejects.toMatchObject({
      code: 'already-exists'
    });
    expect(mockRequestCallable).not.toHaveBeenCalled();
  });

  it('maps rate-limit errors with retryAfterMs', async () => {
    mockFetchSignInMethodsForEmail.mockResolvedValue([]);
    mockRequestCallable.mockRejectedValue({
      code: 'functions/resource-exhausted',
      details: { retryAfterMs: 45000 }
    });

    await expect(requestEmailOtp('test@example.com')).rejects.toMatchObject({
      code: 'resource-exhausted',
      retryAfterMs: 45000
    });
  });

  it('normalizes request payload email', async () => {
    mockFetchSignInMethodsForEmail.mockResolvedValue([]);
    mockRequestCallable.mockResolvedValue({ data: { expiresAt: Date.now() + 600000 } });

    await requestEmailOtp('  Test@Example.COM  ');

    expect(mockRequestCallable).toHaveBeenCalledWith({ email: 'test@example.com' });
  });

  it('maps verification errors to user-friendly message', async () => {
    mockVerifyCallable.mockRejectedValue({
      code: 'functions/permission-denied'
    });

    await expect(verifyEmailOtp('test@example.com', '123456')).rejects.toMatchObject({
      code: 'permission-denied'
    });
  });

  it('preserves backend precondition messages from OTP verification', async () => {
    mockVerifyCallable.mockRejectedValue({
      code: 'functions/failed-precondition',
      message: 'This verification code was already used. Please request a new code.'
    });

    await expect(verifyEmailOtp('test@example.com', '123456')).rejects.toMatchObject({
      code: 'failed-precondition',
      message: 'This verification code was already used. Please request a new code.'
    });
  });
});
