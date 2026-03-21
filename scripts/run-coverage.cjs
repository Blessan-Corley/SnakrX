/* eslint-env node */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const getCoverageDirectory = (cwd = process.cwd()) => path.join(cwd, 'coverage');
const getVitestCliPath = (cwd = process.cwd()) => path.join(cwd, 'node_modules', 'vitest', 'vitest.mjs');
const getCheckCoverageScriptPath = (cwd = process.cwd()) => path.join(cwd, 'scripts', 'check-coverage.cjs');

const isCoverageTempFileMissingError = (output = '') => {
  const text = String(output || '');
  const normalized = text.replace(/\\/g, '/');

  return text.includes('ENOENT')
    && text.includes('coverage')
    && text.includes('.tmp')
    && /coverage\/\.tmp\/coverage-\d+\.json/.test(normalized);
};

const removeCoverageDirectory = (cwd = process.cwd()) => {
  fs.rmSync(getCoverageDirectory(cwd), { recursive: true, force: true });
};

const runNodeCommand = (scriptPath, args, cwd = process.cwd()) => (
  spawnSync(process.execPath, [scriptPath, ...args], {
    cwd,
    stdio: 'inherit',
    env: process.env
  })
);

const runVitestCoverage = (cwd = process.cwd()) => (
  runNodeCommand(getVitestCliPath(cwd), ['run', '--coverage'], cwd)
);

const runCoverageCheck = (cwd = process.cwd()) => (
  runNodeCommand(getCheckCoverageScriptPath(cwd), [], cwd)
);

const main = (cwd = process.cwd()) => {
  removeCoverageDirectory(cwd);
  let result = runVitestCoverage(cwd);

  if (result.status === 0) {
    return runCoverageCheck(cwd).status ?? 1;
  }

  const combinedOutput = `${result.stdout || ''}\n${result.stderr || ''}`;
  if (!isCoverageTempFileMissingError(combinedOutput)) {
    return result.status ?? 1;
  }

  console.warn('Vitest coverage temp files were missing during report generation. Retrying coverage once...');
  removeCoverageDirectory(cwd);
  result = runVitestCoverage(cwd);

  if (result.status !== 0) {
    return result.status ?? 1;
  }

  return runCoverageCheck(cwd).status ?? 1;
};

if (require.main === module) {
  process.exit(main());
}

module.exports = {
  getCoverageDirectory,
  getVitestCliPath,
  getCheckCoverageScriptPath,
  isCoverageTempFileMissingError,
  removeCoverageDirectory,
  runVitestCoverage,
  runCoverageCheck,
  main
};
