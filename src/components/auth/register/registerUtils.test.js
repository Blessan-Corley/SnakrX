import { describe, expect, it } from 'vitest';
import { formatOtpCountdown, getPasswordStrength } from './registerUtils.js';

describe('register utils', () => {
  it('calculates password strength across multiple signals', () => {
    expect(getPasswordStrength('')).toBe(0);
    expect(getPasswordStrength('short')).toBe(1);
    expect(getPasswordStrength('Password1!')).toBe(6);
  });

  it('formats otp countdown as mm:ss', () => {
    expect(formatOtpCountdown(0)).toBe('0:00');
    expect(formatOtpCountdown(65)).toBe('1:05');
    expect(formatOtpCountdown(600)).toBe('10:00');
  });
});
