import { beforeEach, describe, expect, it } from 'vitest';
import {
  validators,
  validateInput,
  rateLimiters,
  security
} from './validation.js';
import { clearRateLimitStore } from './validation/rateLimiter.js';

describe('validation utilities', () => {
  beforeEach(() => {
    clearRateLimitStore();
  });

  it('normalizes valid registration inputs', () => {
    const result = validateInput.registration({
      username: '  PlayerOne  ',
      email: 'PLAYER@Example.com',
      password: 'StrongPass123'
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.data).toEqual({
      username: 'PlayerOne',
      email: 'player@example.com',
      password: 'StrongPass123'
    });
  });

  it('collects registration validation errors', () => {
    const result = validateInput.registration({
      username: 'a',
      email: 'invalid-email',
      password: 'weak'
    });

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBe(3);
  });

  it('sanitizes text input by default', () => {
    const result = validators.text('  <script>alert("x")</script>  ');
    expect(result.valid).toBe(true);
    expect(result.value).toBe('&lt;script&gt;alert(&quot;x&quot;)&lt;&#x2F;script&gt;');
  });

  it('validates game session and floors score', () => {
    const result = validateInput.gameSession({
      score: 42.99,
      mode: 'classic',
      difficulty: 'easy'
    });

    expect(result.valid).toBe(true);
    expect(result.data).toEqual({
      score: 42,
      mode: 'classic',
      difficulty: 'easy'
    });
  });

  it('applies API rate limiting for leaderboard submissions', () => {
    const payload = {
      score: 100,
      mode: 'classic',
      difficulty: null
    };

    for (let i = 0; i < 50; i += 1) {
      const result = validateInput.leaderboardEntry(payload, 'user-1');
      expect(result.valid).toBe(true);
    }

    const blocked = validateInput.leaderboardEntry(payload, 'user-1');
    expect(blocked.valid).toBe(false);
    expect(blocked.errors).toEqual(['Too many requests. Please wait before submitting again.']);
    expect(rateLimiters.getRemainingApiRequests('user-1')).toBe(0);
  });

  it('redacts sensitive fields from logs', () => {
    const input = {
      password: 'secret123',
      token: 'abc',
      apiKey: 'key',
      secret: 'top-secret',
      safe: 'value'
    };

    const sanitized = security.sanitizeForLogging(input);
    expect(sanitized).toEqual({
      password: '[REDACTED]',
      token: '[REDACTED]',
      apiKey: '[REDACTED]',
      secret: '[REDACTED]',
      safe: 'value'
    });
  });
});
