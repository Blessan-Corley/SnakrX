// @vitest-environment node
import { describe, expect, it } from 'vitest';

describe('run-coverage helpers', () => {
  it('detects the Windows coverage temp-file ENOENT failure', async () => {
    const module = await import('../../scripts/run-coverage.cjs');

    expect(module.isCoverageTempFileMissingError(`
      Error: ENOENT: no such file or directory, open 'F:\\My Projects\\SnakrX\\coverage\\.tmp\\coverage-21.json'
    `)).toBe(true);
  });

  it('does not retry unrelated vitest failures', async () => {
    const module = await import('../../scripts/run-coverage.cjs');

    expect(module.isCoverageTempFileMissingError('Test timed out in 5000ms.')).toBe(false);
    expect(module.isCoverageTempFileMissingError('')).toBe(false);
  });
});
