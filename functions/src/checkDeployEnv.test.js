// @vitest-environment node
import fs from 'fs';
import os from 'os';
import path from 'path';
import { describe, expect, it } from 'vitest';

describe('check-deploy-env script helpers', () => {
  it('accepts mail and otp env from functions/.env and does not require SUPPORT_EMAIL_TO', async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'snakrx-deploy-env-'));
    const rootEnvPath = path.join(tempDir, '.env');
    const functionsDir = path.join(tempDir, 'functions');
    const functionsEnvPath = path.join(functionsDir, '.env');

    fs.mkdirSync(functionsDir, { recursive: true });
    fs.writeFileSync(rootEnvPath, [
      'VITE_FIREBASE_API_KEY=test-api-key',
      'VITE_FIREBASE_AUTH_DOMAIN=example.firebaseapp.com',
      'VITE_FIREBASE_PROJECT_ID=example-project',
      'VITE_FIREBASE_STORAGE_BUCKET=example.appspot.com',
      'VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890',
      'VITE_FIREBASE_APP_ID=test-app-id'
    ].join('\n'));
    fs.writeFileSync(functionsEnvPath, [
      'EMAIL_USER=mailer@example.com',
      'EMAIL_PASS=super-secret',
      'EMAIL_FROM=SnakrX <mailer@example.com>',
      'OTP_SALT=test-salt'
    ].join('\n'));

    const module = await import('../../scripts/check-deploy-env.cjs');
    const env = module.resolveDeployEnv({
      rootEnvPath,
      functionsEnvPath,
      processEnv: {}
    });

    expect(module.getMissingKeys(env)).toEqual([]);
  });

  it('still reports missing required mail credentials when absent from all env sources', async () => {
    const module = await import('../../scripts/check-deploy-env.cjs');
    const env = {
      VITE_FIREBASE_API_KEY: 'test-api-key',
      VITE_FIREBASE_AUTH_DOMAIN: 'example.firebaseapp.com',
      VITE_FIREBASE_PROJECT_ID: 'example-project',
      VITE_FIREBASE_STORAGE_BUCKET: 'example.appspot.com',
      VITE_FIREBASE_MESSAGING_SENDER_ID: '1234567890',
      VITE_FIREBASE_APP_ID: 'test-app-id'
    };

    expect(module.getMissingKeys(env)).toEqual([
      'EMAIL_USER',
      'EMAIL_PASS',
      'EMAIL_FROM',
      'OTP_SALT'
    ]);
  });
});
