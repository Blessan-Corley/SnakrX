import { test, expect } from '@playwright/test';
test.describe('Route Guards', () => {
  test('redirects unauthenticated users to login for protected routes', async ({ page }) => {
    await page.goto('/leaderboard');
    await expect(page).toHaveURL(/\/(landing|login)$/);
    await expect(page.getByRole('link', { name: /sign in/i }).first()).toBeVisible();
  });
});
