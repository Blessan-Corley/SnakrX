// @vitest-environment node
import { beforeAll, describe, expect, it } from 'vitest';

let otpPrivate;

beforeAll(async () => {
  const otpModule = await import('./otp.js');
  otpPrivate = (otpModule.default ?? otpModule).__private__;
});

describe('otp helpers', () => {
  it('normalizes email input', () => {
    expect(otpPrivate.normalizeEmail(' Test@Example.com ')).toBe('test@example.com');
    expect(otpPrivate.normalizeEmail()).toBe('');
  });

  it('validates email addresses', () => {
    expect(otpPrivate.isValidEmail('player@example.com')).toBe(true);
    expect(otpPrivate.isValidEmail('playerexample.com')).toBe(false);
    expect(otpPrivate.isValidEmail('')).toBe(false);
  });

  it('validates OTP code format', () => {
    expect(otpPrivate.isValidOtpCode('123456')).toBe(true);
    expect(otpPrivate.isValidOtpCode('12345')).toBe(false);
    expect(otpPrivate.isValidOtpCode('12a456')).toBe(false);
  });
});
