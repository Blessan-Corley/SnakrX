import { test, expect } from '@playwright/test';
test.describe('PWA and Session UX', () => {
  test('serves PWA manifest and service worker bundle', async ({ page }) => {
    await page.goto('/landing');

    const manifest = await page.request.get('/manifest.webmanifest');
    expect(manifest.ok()).toBe(true);
    const manifestJson = await manifest.json();
    expect(manifestJson.short_name).toBe('SnakrX');
    expect(Array.isArray(manifestJson.icons)).toBe(true);
    expect(manifestJson.icons.length).toBeGreaterThan(0);

    const sw = await page.request.get('/sw.js');
    expect(sw.ok()).toBe(true);
    const swBody = await sw.text();
    expect(swBody.length).toBeGreaterThan(100);
  });
});
