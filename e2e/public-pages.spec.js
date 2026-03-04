import { test, expect } from '@playwright/test';

test.describe('Public Pages', () => {
  test('resets scroll position when navigating from landing to privacy', async ({ page }) => {
    await page.goto('/landing');

    const canScroll = await page.evaluate(() => document.documentElement.scrollHeight > window.innerHeight + 10);
    if (canScroll) {
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
    }

    await page.getByRole('link', { name: /privacy/i }).first().click();
    await expect(page).toHaveURL(/\/privacy$/);
    await expect.poll(async () => page.evaluate(() => window.scrollY)).toBe(0);
  });

  test('support page uses non-guaranteed response wording', async ({ page }) => {
    await page.goto('/support');

    await expect(page.getByText(/usually reply within 24 hours/i)).toBeVisible();
    await expect(page.getByText(/guaranteed to solve/i)).toHaveCount(0);
  });
});
