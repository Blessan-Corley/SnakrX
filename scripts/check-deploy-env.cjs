const fs = require('fs');
const path = require('path');

const ROOT_ENV_PATH = path.resolve(__dirname, '..', '.env');
const FUNCTIONS_ENV_PATH = path.resolve(__dirname, '..', 'functions', '.env');

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

const REQUIRED_KEYS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'EMAIL_USER',
  'EMAIL_PASS',
  'EMAIL_FROM',
  'OTP_SALT'
];

const resolveDeployEnv = ({
  rootEnvPath = ROOT_ENV_PATH,
  functionsEnvPath = FUNCTIONS_ENV_PATH,
  processEnv = process.env
} = {}) => {
  const rootEnv = parseEnvFile(rootEnvPath);
  const functionsEnv = parseEnvFile(functionsEnvPath);

  return {
    ...functionsEnv,
    ...rootEnv,
    ...processEnv
  };
};

const getMissingKeys = (env, requiredKeys = REQUIRED_KEYS) => (
  requiredKeys.filter((key) => !String(env[key] || '').trim())
);

const main = () => {
  const env = resolveDeployEnv();
  const missingKeys = getMissingKeys(env);

  if (missingKeys.length > 0) {
    console.error('Missing deploy environment variables:');
    missingKeys.forEach((key) => {
      console.error(`- ${key}`);
    });
    process.exit(1);
  }

  console.log('Deploy environment validation passed.');
};

if (require.main === module) {
  main();
}

module.exports = {
  FUNCTIONS_ENV_PATH,
  REQUIRED_KEYS,
  ROOT_ENV_PATH,
  getMissingKeys,
  main,
  parseEnvFile,
  resolveDeployEnv
};
