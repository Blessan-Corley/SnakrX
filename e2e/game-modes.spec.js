import { test, expect } from '@playwright/test';
import { ensureAuthenticatedOrSkip } from './helpers/auth.js';

const startGameIfReady = async (page) => {
  const readyOverlay = page.getByText('Get Ready!');
  const isReadyVisible = await readyOverlay.isVisible().catch(() => false);
  if (isReadyVisible) {
    await page.keyboard.press('ArrowUp');
    await expect(readyOverlay).not.toBeVisible();
  }
};

test.describe('Game Modes', () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuthenticatedOrSkip(page, test.info());
  });

  test('opens the game mode selection hub', async ({ page }) => {
    await page.goto('/game');
    await expect(page.getByText('Choose Your Game Mode')).toBeVisible();
    await expect(page.getByText('Classic Mode')).toBeVisible();
    await expect(page.getByText('VS AI Mode')).toBeVisible();
  });

  test('opens VS AI mode with selected difficulty', async ({ page }) => {
    await page.goto('/game/vsai/medium');
    await expect(page.getByText(/checking authentication/i)).not.toBeVisible({ timeout: 30000 });
    await expect(page.getByRole('img', { name: /snake game board/i })).toBeVisible({ timeout: 20000 });
    await startGameIfReady(page);
    await expect(page.getByLabel(/game mode: vsai/i)).toBeVisible();
  });

  test('opens classic transparent mode directly and starts', async ({ page }) => {
    await page.goto('/game/classic_transparent');
    await expect(page.getByText(/checking authentication/i)).not.toBeVisible({ timeout: 30000 });
    await expect(page.getByRole('img', { name: /snake game board/i })).toBeVisible({ timeout: 20000 });
    await startGameIfReady(page);
    await expect(page.getByLabel(/game mode: classic_transparent/i)).toBeVisible();
  });

  test('opens multiplayer mode and shows player score rows', async ({ page }) => {
    await page.goto('/game/multiplayer/2');
    await expect(page.getByText(/checking authentication/i)).not.toBeVisible({ timeout: 30000 });
    await expect(page.getByRole('img', { name: /snake game board/i })).toBeVisible({ timeout: 20000 });
    const readyOverlayTitle = page.getByText('Multiplayer Ready Check');
    await expect(readyOverlayTitle).toBeVisible();

    await page.keyboard.press('KeyW');
    await expect(page.getByText('Ready: 1/2')).toBeVisible();
    await expect(readyOverlayTitle).toBeVisible();

    await page.keyboard.press('ArrowUp');
    await expect(readyOverlayTitle).not.toBeVisible();

    await expect(page.getByText(/^Player 1$/)).toBeVisible();
    await expect(page.getByText(/^Player 2$/)).toBeVisible();
  });
});
