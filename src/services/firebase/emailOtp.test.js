import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockRequestCallable = vi.fn();
const mockVerifyCallable = vi.fn();

vi.mock('./config.js', () => ({
  functions: {},
  httpsCallable: vi.fn((_, name) => {
    if (name === 'requestEmailOtp') return mockRequestCallable;
    if (name === 'verifyEmailOtp') return mockVerifyCallable;
    return vi.fn();
  })
}));

describe('emailOtp service', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    const module = await import('./emailOtp.js');
    module.__private__.resetCallables();
  });

  it('maps backend already-exists errors for registered email addresses', async () => {
    const { requestEmailOtp } = await import('./emailOtp.js');
    mockRequestCallable.mockRejectedValue({
      code: 'functions/already-exists'
    });

    await expect(requestEmailOtp('Player@Example.com')).rejects.toMatchObject({
      code: 'already-exists'
    });
  });

  it('maps rate-limit errors with retryAfterMs', async () => {
    const { requestEmailOtp } = await import('./emailOtp.js');
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
    const { requestEmailOtp } = await import('./emailOtp.js');
    mockRequestCallable.mockResolvedValue({ data: { expiresAt: Date.now() + 600000 } });

    await requestEmailOtp('  Test@Example.COM  ');

    expect(mockRequestCallable).toHaveBeenCalledWith({ email: 'test@example.com' });
  });

  it('maps verification errors to user-friendly message', async () => {
    const { verifyEmailOtp } = await import('./emailOtp.js');
    mockVerifyCallable.mockRejectedValue({
      code: 'functions/permission-denied'
    });

    await expect(verifyEmailOtp('test@example.com', '123456')).rejects.toMatchObject({
      code: 'permission-denied'
    });
  });

  it('preserves backend precondition messages from OTP verification', async () => {
    const { verifyEmailOtp } = await import('./emailOtp.js');
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
