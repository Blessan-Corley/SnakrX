import { test, expect } from '@playwright/test';
import { ensureAuthenticatedOrSkip } from './helpers/auth.js';

const startGameIfReady = async (page) => {
  const readyOverlay = page.getByText('Get Ready!');
  const isReadyVisible = await readyOverlay.isVisible().catch(() => false);
  if (isReadyVisible) {
    await page.keyboard.press('ArrowRight');
    await expect(readyOverlay).not.toBeVisible();
  }
};

test.describe('Gameplay Lifecycle', () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuthenticatedOrSkip(page, test.info());
  });

  test('starts, advances timer, and pauses/resumes in classic mode', async ({ page }) => {
    await page.goto('/game/classic');
    await expect(page.getByText(/checking authentication/i)).not.toBeVisible({ timeout: 30000 });
    await expect(page.getByRole('img', { name: /snake game board/i })).toBeVisible({ timeout: 20000 });

    await startGameIfReady(page);

    const timeMetric = page.getByLabel(/time played:/i);
    await expect(timeMetric).toBeVisible();
    await expect
      .poll(async () => await timeMetric.getAttribute('aria-label'), { timeout: 15000 })
      .not.toContain('00:00');

    const pauseButton = page.getByRole('button', { name: /pause game/i });
    await pauseButton.click();
    await expect(page.getByRole('button', { name: /resume game/i })).toBeVisible();

    await page.getByRole('button', { name: /resume game/i }).click();
    await expect(page.getByRole('button', { name: /pause game/i })).toBeVisible();
  });
});
