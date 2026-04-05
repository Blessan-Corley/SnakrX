import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['functions/src/**/*.test.js'],
    exclude: ['node_modules/**', 'functions/node_modules/**', 'src/**', 'e2e/**'],
    coverage: {
      all: true,
      provider: 'istanbul',
      reporter: ['text', 'json'],
      reportsDirectory: './coverage-functions',
      include: ['functions/src/**/*.js'],
      exclude: ['functions/src/**/*.test.js'],
      thresholds: {
        statements: 56,
        branches: 46,
        functions: 55,
        lines: 56
      }
    }
  }
});
