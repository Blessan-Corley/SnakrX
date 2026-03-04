import { test, expect } from '@playwright/test';
import { ensureAuthenticatedOrSkip, getAuthCredentials } from './helpers/auth.js';

test.describe('Authentication Flow', () => {
  test('logs in with an existing account', async ({ page }) => {
    await ensureAuthenticatedOrSkip(page, test.info());
    await expect(page.getByText('Choose Your Game Mode')).toBeVisible();
  });

  test('forgot-password page accepts a valid email input', async ({ page }) => {
    const credentials = getAuthCredentials();
    await page.goto('/forgot-password');
    await page.getByPlaceholder('you@example.com').fill(credentials?.email || 'user@example.com');
    await expect(page.getByRole('button', { name: /send reset link/i })).toBeVisible();
  });

  test('rejects invalid password and stays on login page', async ({ page }) => {
    const credentials = getAuthCredentials();
    test.skip(!credentials?.email, 'Missing credentials from e2e auth setup.');

    await page.goto('/login');
    await page.getByPlaceholder('Enter your email').fill(credentials.email);
    await page.getByRole('button', { name: /continue/i }).click();
    await page.getByPlaceholder('Enter your password').fill('WrongPass!123');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });
});
