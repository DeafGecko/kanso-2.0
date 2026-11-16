import { expect, test } from '@playwright/test';

test.describe('theme', () => {
  test.skip(({ isMobile }) => isMobile, 'preferences sidebar is covered on desktop');

  test('a chosen theme is kept after a reload', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Use coffee theme' }).click();
    await expect(page.locator('[data-theme]').first()).toHaveAttribute('data-theme', 'coffee');
    await page.reload();
    await expect(page.locator('[data-theme]').first()).toHaveAttribute('data-theme', 'coffee');
  });
});
