import { describe, expect, it } from 'vitest';
import {
  buildReportMailtoUrl,
  createErrorId,
  createInitialErrorState,
  detectErrorType,
  shouldForceReloadOnRetry
} from './errorUtils.js';

describe('errorUtils', () => {
  it('detects expected error types from messages', () => {
    expect(detectErrorType({ message: 'Cannot read property forEach of undefined' })).toBe('array');
    expect(detectErrorType({ message: 'Firebase: Missing permissions' })).toBe('firebase');
    expect(detectErrorType({ message: 'Network request failed' })).toBe('network');
    expect(detectErrorType({ message: 'Failed to import module' })).toBe('import');
    expect(detectErrorType({ message: 'Unexpected failure' })).toBe('unknown');
  });

  it('creates resettable boundary state and unique ids', () => {
    const initialState = createInitialErrorState();

    expect(initialState).toEqual({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      errorType: 'unknown'
    });
    expect(createErrorId()).not.toBe(createErrorId());
  });

  it('marks only import and firebase errors for hard reload', () => {
    expect(shouldForceReloadOnRetry('import')).toBe(true);
    expect(shouldForceReloadOnRetry('firebase')).toBe(true);
    expect(shouldForceReloadOnRetry('network')).toBe(false);
  });

  it('builds a mailto bug report url', () => {
    const mailto = buildReportMailtoUrl({
      error: new Error('Boom'),
      errorId: 'abc123',
      errorType: 'network'
    });

    expect(mailto.startsWith('mailto:snakrxgame@gmail.com')).toBe(true);
    expect(mailto).toContain('SnakrX%20Bug%20Report%20-%20network');
    expect(mailto).toContain('abc123');
  });
});
