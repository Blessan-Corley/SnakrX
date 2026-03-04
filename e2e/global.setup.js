import fs from 'fs/promises';
import path from 'path';

const AUTH_DIR = path.resolve(process.cwd(), 'e2e/.auth');
const CREDENTIALS_PATH = path.join(AUTH_DIR, 'credentials.json');
const STATUS_PATH = path.join(AUTH_DIR, 'status.json');
const ROOT_ENV_PATH = path.resolve(process.cwd(), '.env');
const REQUIRED_FIREBASE_ENV_KEYS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

const readEnvFile = async () => {
  try {
    const content = await fs.readFile(ROOT_ENV_PATH, 'utf8');
    return content
      .split(/\r?\n/)
      .filter((line) => line && !line.startsWith('#'))
      .reduce((acc, line) => {
        const separator = line.indexOf('=');
        if (separator === -1) return acc;
        const key = line.slice(0, separator).trim();
        const value = line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '');
        acc[key] = value;
        return acc;
      }, {});
  } catch {
    return {};
  }
};

const writeStatus = async (status) => {
  await fs.mkdir(AUTH_DIR, { recursive: true });
  await fs.writeFile(STATUS_PATH, JSON.stringify(status, null, 2), 'utf8');
};

const writeCredentials = async (credentials) => {
  await fs.mkdir(AUTH_DIR, { recursive: true });
  await fs.writeFile(CREDENTIALS_PATH, JSON.stringify(credentials, null, 2), 'utf8');
};

const firebaseAuthRequest = async (endpoint, apiKey, payload) => {
  const response = await globalThis.fetch(`https://identitytoolkit.googleapis.com/v1/${endpoint}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const json = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, json };
};

const validateCredentials = async (apiKey, email, password) => {
  const result = await firebaseAuthRequest('accounts:signInWithPassword', apiKey, {
    email,
    password,
    returnSecureToken: true
  });
  return result.ok;
};

export default async () => {
  const envFile = await readEnvFile();
  const env = {
    ...envFile,
    ...process.env
  };
  const missingFirebaseKeys = REQUIRED_FIREBASE_ENV_KEYS.filter((key) => !env[key]);
  const apiKey = env.VITE_FIREBASE_API_KEY;

  if (missingFirebaseKeys.length > 0 || !apiKey) {
    await writeStatus({
      available: false,
      reason: `Missing Firebase env: ${missingFirebaseKeys.join(', ')}`
    });
    return;
  }

  const envEmail = env.E2E_EMAIL;
  const envPassword = env.E2E_PASSWORD;

  let credentials = null;
  if (envEmail && envPassword) {
    const valid = await validateCredentials(apiKey, envEmail, envPassword);
    if (valid) {
      credentials = { email: envEmail, password: envPassword, source: 'env' };
    }
  }

  if (!credentials) {
    await writeStatus({
      available: false,
      reason: 'E2E_EMAIL and E2E_PASSWORD must point to an app-ready account with Firestore profile records.',
      firebaseConfigReady: true
    });
    return;
  }

  await writeCredentials(credentials);
  await writeStatus({
    available: true,
    reason: `credentials ready (${credentials.source})`,
    firebaseConfigReady: true
  });
};
