import { test, expect } from '@playwright/test';
import { ensureAuthenticatedOrSkip } from './helpers/auth.js';

test.describe('Social Features', () => {
  test('opens friends tab and keeps search input interactive', async ({ page }) => {
    await ensureAuthenticatedOrSkip(page, test.info());
    await page.goto('/profile');
    await page.getByRole('button', { name: /friends/i }).click();

    const searchInput = page.getByPlaceholder('Search by username...');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('testuser');
    await expect(searchInput).toHaveValue('testuser');
  });
});
