import { expect, test } from '@playwright/test';

async function wordCount(page: import('@playwright/test').Page) {
  await page.keyboard.press('Control+j');
  const value = page.getByText('Words', { exact: true }).locator('xpath=following-sibling::span[1]');
  await expect(value).toBeVisible();
  const text = (await value.textContent()) ?? '';
  await page.keyboard.press('Escape');
  return Number(text.trim());
}

test('the word count matches what was typed', async ({ page }) => {
  await page.goto('/');
  const doc = page.locator('textarea[aria-label="Document content"]');
  await doc.fill('one two three');
  expect(await wordCount(page)).toBe(3);
  await doc.fill('');
  expect(await wordCount(page)).toBe(0);
});
