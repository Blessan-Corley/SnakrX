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

test.describe('Classic Game Mode', () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuthenticatedOrSkip(page, test.info());
  });

  test('loads classic mode and starts on key press', async ({ page }) => {
    await page.goto('/game/classic');
    await expect(page.getByText(/checking authentication/i)).not.toBeVisible({ timeout: 30000 });
    await expect(page.getByRole('img', { name: /snake game board/i })).toBeVisible({ timeout: 20000 });
    await startGameIfReady(page);
    await expect(page.getByRole('region', { name: /game statistics/i })).toBeVisible();
  });

  test('prompts before leaving active game via navigation links', async ({ page }) => {
    await page.goto('/game/classic');
    await startGameIfReady(page);

    await page.getByRole('link', { name: /^Home$/ }).click();
    await expect(page.getByText('Quit Current Game?')).toBeVisible();
    await page.getByRole('button', { name: /stay here/i }).click();
    await expect(page.getByText('Quit Current Game?')).not.toBeVisible();
    await expect(page).toHaveURL(/\/game\/classic$/);

    await page.getByRole('link', { name: /^Home$/ }).click();
    await page.getByRole('button', { name: /quit game/i }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByText('Choose Your Game Mode')).toBeVisible();
  });

});
