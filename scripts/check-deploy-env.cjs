const fs = require('fs');
const path = require('path');

const ROOT_ENV_PATH = path.resolve(__dirname, '..', '.env');

const parseEnvFile = (filePath) => {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  return fs.readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .filter((line) => line && !line.trim().startsWith('#'))
    .reduce((accumulator, line) => {
      const separatorIndex = line.indexOf('=');
      if (separatorIndex === -1) {
        return accumulator;
      }

      const key = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '');
      accumulator[key] = value;
      return accumulator;
    }, {});
};

const envFile = parseEnvFile(ROOT_ENV_PATH);
const env = {
  ...envFile,
  ...process.env
};

const requiredKeys = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'EMAIL_USER',
  'EMAIL_PASS',
  'EMAIL_FROM',
  'SUPPORT_EMAIL_TO',
  'OTP_SALT'
];

const missingKeys = requiredKeys.filter((key) => !String(env[key] || '').trim());

if (missingKeys.length > 0) {
  console.error('Missing deploy environment variables:');
  missingKeys.forEach((key) => {
    console.error(`- ${key}`);
  });
  process.exit(1);
}

console.log('Deploy environment validation passed.');
