import { test, expect } from '@playwright/test';
import { ensureAuthenticatedOrSkip } from './helpers/auth.js';

test.describe('Navigation & UI', () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuthenticatedOrSkip(page, test.info());
  });

  test('navigates to Profile and Friends tab', async ({ page }) => {
    await page.goto('/profile');
    await expect(page).toHaveURL('/profile');
    await expect(page.getByRole('button', { name: /^Overview$/ })).toBeVisible();
    await page.getByRole('button', { name: /^Friends$/ }).click();
    await expect(page.getByText('Find Friends')).toBeVisible();
  });

  test('navigates to Leaderboard', async ({ page }) => {
    await page.goto('/leaderboard');
    await expect(page).toHaveURL('/leaderboard');
    await expect(page.getByText('Leaderboards')).toBeVisible();
    await expect(page.getByText('Ranked Players')).toBeVisible();
  });

  test('loads weekly leaderboard filter', async ({ page }) => {
    await page.goto('/leaderboard');
    await expect(page).toHaveURL('/leaderboard');
    await page.getByRole('button', { name: /^Weekly$/ }).click();
    await expect(page.getByText('Top Players')).toBeVisible();
    await expect(page.getByText('Unable to load leaderboard. Please try again.')).toHaveCount(0);
  });
});
