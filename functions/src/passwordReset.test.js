// @vitest-environment node
import { beforeAll, describe, expect, it, vi } from 'vitest';

let passwordResetPrivate;

beforeAll(async () => {
  const passwordResetModule = await import('./passwordReset.js');
  passwordResetPrivate = (passwordResetModule.default ?? passwordResetModule).__private__;
});

describe('password reset helpers', () => {
  it('builds a custom SnakrX reset page link from Firebase action params', () => {
    const link = passwordResetPrivate.buildCustomResetLink(
      'https://example.firebaseapp.com/__/auth/action?mode=resetPassword&oobCode=abc123&apiKey=api-key&lang=en'
    );

    expect(link).toBe(
      'https://snakrx-23b0b.web.app/reset-password?mode=resetPassword&oobCode=abc123&apiKey=api-key&lang=en'
    );
  });

  it('returns success even when the user does not exist', async () => {
    const sendMail = vi.fn();
    const generatePasswordResetLink = vi.fn().mockRejectedValue({ code: 'auth/user-not-found' });

    const result = await passwordResetPrivate.requestPasswordResetEmailCore(
      { email: 'ghost@example.com' },
      {
        adminAuth: { generatePasswordResetLink },
        getTransporter: () => ({ sendMail }),
        getRequiredEnv: () => 'SnakrX <snakrxgame@gmail.com>',
        buildPasswordResetEmail: () => ({ subject: 'x', text: 'x', html: 'x' })
      }
    );

    expect(result).toEqual({ success: true });
    expect(sendMail).not.toHaveBeenCalled();
  });

  it('generates and sends a branded password reset email for known users', async () => {
    const sendMail = vi.fn().mockResolvedValue(undefined);
    const generatePasswordResetLink = vi.fn().mockResolvedValue(
      'https://example.firebaseapp.com/__/auth/action?mode=resetPassword&oobCode=reset-123&apiKey=api-key'
    );

    const result = await passwordResetPrivate.requestPasswordResetEmailCore(
      { email: ' Player@Example.com ' },
      {
        adminAuth: { generatePasswordResetLink },
        getTransporter: () => ({ sendMail }),
        getRequiredEnv: () => 'SnakrX <snakrxgame@gmail.com>',
        buildPasswordResetEmail: ({ resetLink }) => ({
          subject: 'Reset your SnakrX password',
          text: resetLink,
          html: resetLink
        })
      }
    );

    expect(result).toEqual({ success: true });
    expect(generatePasswordResetLink).toHaveBeenCalledWith('player@example.com');
    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({
      to: 'player@example.com',
      subject: 'Reset your SnakrX password',
      html: expect.stringContaining('snakrx-23b0b.web.app/reset-password?mode=resetPassword&oobCode=reset-123')
    }));
  });
});
