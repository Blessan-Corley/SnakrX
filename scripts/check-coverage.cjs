const fs = require('fs');
const path = require('path');

const summaryPath = path.join(process.cwd(), 'coverage', 'coverage-final.json');

if (!fs.existsSync(summaryPath)) {
  console.error(`Coverage report not found at ${summaryPath}`);
  process.exit(1);
}

const report = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));

const aggregateMetric = (entries, mapKey, hitsKey) => {
  let covered = 0;
  let total = 0;

  entries.forEach((entry) => {
    const map = entry[mapKey] || {};
    const hits = entry[hitsKey] || {};

    Object.keys(map).forEach((key) => {
      const value = hits[key];
      total += 1;

      if (Array.isArray(value)) {
        if (value.some((count) => Number(count) > 0)) {
          covered += 1;
        }
        return;
      }

      if (Number(value) > 0) {
        covered += 1;
      }
    });
  });

  return {
    covered,
    total,
    pct: total === 0 ? 100 : Number(((covered / total) * 100).toFixed(2)),
  };
};

const entries = Object.values(report);
const totals = {
  statements: aggregateMetric(entries, 'statementMap', 's'),
  branches: aggregateMetric(entries, 'branchMap', 'b'),
  functions: aggregateMetric(entries, 'fnMap', 'f'),
};
totals.lines = totals.statements;

const thresholds = {
  lines: 44,
  statements: 44,
  functions: 53,
  branches: 63,
};

const failures = Object.entries(thresholds).flatMap(([metric, minimum]) => {
  const actual = Number(totals[metric]?.pct ?? 0);
  if (actual >= minimum) return [];

  return [`${metric}: expected >= ${minimum}%, received ${actual}%`];
});

if (failures.length > 0) {
  console.error('Coverage check failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Coverage check passed.');
