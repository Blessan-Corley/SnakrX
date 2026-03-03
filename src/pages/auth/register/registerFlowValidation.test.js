import { describe, expect, it } from 'vitest';
import { validateRegisterStep } from './registerFlowValidation.js';

const validFormData = {
  username: 'player_one',
  email: 'player@example.com',
  password: 'Password123!',
  confirmPassword: 'Password123!'
};

describe('validateRegisterStep', () => {
  it('validates account details step', () => {
    expect(validateRegisterStep({
      formData: { ...validFormData, username: 'a', email: 'bad-email' },
      otpCode: '',
      step: 1,
      usernameAvailable: true
    })).toEqual({
      username: 'Username must be at least 3 characters long',
      email: 'Please enter a valid email address'
    });

    expect(validateRegisterStep({
      formData: validFormData,
      otpCode: '',
      step: 1,
      usernameAvailable: false
    })).toEqual({
      username: 'Username is already taken'
    });
  });

  it('validates otp and password steps', () => {
    expect(validateRegisterStep({
      formData: validFormData,
      otpCode: '123',
      step: 2,
      usernameAvailable: true
    })).toEqual({
      otpCode: 'Enter the 6-digit code sent to your email'
    });

    expect(validateRegisterStep({
      formData: { ...validFormData, password: 'short', confirmPassword: 'nope' },
      otpCode: '',
      step: 3,
      usernameAvailable: true
    })).toEqual({
      password: 'Password must be at least 6 characters long',
      confirmPassword: 'Passwords do not match'
    });
  });
});
