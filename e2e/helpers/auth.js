import fs from 'fs';
import path from 'path';
import { expect } from '@playwright/test';

const AUTH_DIR = path.resolve(process.cwd(), 'e2e/.auth');
const CREDENTIALS_PATH = path.join(AUTH_DIR, 'credentials.json');
const STATUS_PATH = path.join(AUTH_DIR, 'status.json');

const readJson = (filePath) => {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
};

export const getAuthStatus = () => readJson(STATUS_PATH);

export const getAuthCredentials = () => readJson(CREDENTIALS_PATH);

export const ensureAuthenticatedOrSkip = async (page, testInfo) => {
  const status = getAuthStatus();
  if (!status?.available) {
    testInfo.skip(`Auth e2e unavailable: ${status?.reason || 'missing auth status'}`);
    return;
  }

  const credentials = getAuthCredentials();
  if (!credentials?.email || !credentials?.password) {
    testInfo.skip('Auth e2e unavailable: missing generated credentials.');
    return;
  }

  await page.goto('/login');
  await page.getByPlaceholder('Enter your email').fill(credentials.email);
  await page.getByRole('button', { name: /continue/i }).click();
  await page.getByPlaceholder('Enter your password').fill(credentials.password);
  await page.getByRole('button', { name: /sign in/i }).click();

  try {
    await expect(page).not.toHaveURL(/\/login$/, { timeout: 15000 });
  } catch (error) {
    const visibleError = await page.locator('.text-red-400').first().textContent().catch(() => null);
    throw new Error(
      `E2E login failed for generated credentials. ${visibleError ? `UI error: ${visibleError.trim()}` : ''}`
    );
  }

  await page.goto('/');
  await expect(page.getByText(/checking authentication/i)).not.toBeVisible({ timeout: 30000 });
  await expect(page).not.toHaveURL(/\/landing$/, { timeout: 15000 });
};
