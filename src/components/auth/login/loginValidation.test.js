import { describe, expect, it } from 'vitest';
import { validateLoginStep } from './loginValidation.js';

describe('validateLoginStep', () => {
  it('validates email identifier step', () => {
    expect(validateLoginStep({ identifier: '', password: '', step: 1 })).toEqual({
      identifier: 'Email is required'
    });

    expect(validateLoginStep({ identifier: 'invalid', password: '', step: 1 })).toEqual({
      identifier: 'Please enter a valid email address'
    });

    expect(validateLoginStep({ identifier: 'user@example.com', password: '', step: 1 })).toEqual({});
  });

  it('validates password step', () => {
    expect(validateLoginStep({ identifier: 'user@example.com', password: '', step: 2 })).toEqual({
      password: 'Password is required'
    });

    expect(validateLoginStep({ identifier: 'user@example.com', password: '123', step: 2 })).toEqual({
      password: 'Password must be at least 6 characters'
    });

    expect(validateLoginStep({ identifier: 'user@example.com', password: '123456', step: 2 })).toEqual({});
  });
});
