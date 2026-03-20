import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockResetCallable = vi.fn();

vi.mock('./config.js', () => ({
  functions: {},
  httpsCallable: vi.fn((_, name) => {
    if (name === 'requestPasswordResetEmail') return mockResetCallable;
    return vi.fn();
  })
}));

describe('passwordReset service', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    const module = await import('./passwordReset.js');
    module.__private__.resetCallables();
  });

  it('normalizes email addresses before calling the backend', async () => {
    const { requestPasswordResetEmail } = await import('./passwordReset.js');
    mockResetCallable.mockResolvedValue({ data: { success: true } });

    await requestPasswordResetEmail(' Player@Example.com ');

    expect(mockResetCallable).toHaveBeenCalledWith({ email: 'player@example.com' });
  });

  it('maps retryable backend failures to a user-friendly error', async () => {
    const { requestPasswordResetEmail } = await import('./passwordReset.js');
    mockResetCallable.mockRejectedValue({
      code: 'functions/internal'
    });

    await expect(requestPasswordResetEmail('player@example.com')).rejects.toMatchObject({
      code: 'internal',
      message: 'Unable to send a password reset email right now. Please try again.'
    });
  });
});
