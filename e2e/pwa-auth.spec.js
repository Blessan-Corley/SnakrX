import { test, expect } from '@playwright/test';
import { ensureAuthenticatedOrSkip } from './helpers/auth.js';

test.describe('PWA and Session UX', () => {
  test('remembers last played mode and offers quick continue on home', async ({ page }) => {
    await ensureAuthenticatedOrSkip(page, test.info());

    await page.goto('/game/vsai/impossible');
    await expect(page.getByText(/checking authentication/i)).not.toBeVisible({ timeout: 30000 });
    await expect(page.getByRole('img', { name: /snake game board/i })).toBeVisible({ timeout: 20000 });

    await page.goto('/');
    await expect(page.getByText(/checking authentication/i)).not.toBeVisible({ timeout: 30000 });
    const continueButton = page.getByRole('button', { name: /continue last played:/i });
    await expect(continueButton).toBeVisible({ timeout: 20000 });
    await expect(continueButton).toContainText(/vs ai \(impossible\)/i);
    await continueButton.click();
    await expect(page).toHaveURL('/game/vsai/impossible');
  });
});
