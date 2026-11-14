import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

// The store defaults to the sidebar being open; read the label rather than assume it.
const headerToggle = (page: Page) => page.locator('header').getByRole('button', { name: /preferences/i });

async function ensureOpen(page: Page) {
  if ((await headerToggle(page).getAttribute('aria-expanded')) !== 'true') await headerToggle(page).click();
  await expect(headerToggle(page)).toHaveAttribute('aria-expanded', 'true');
}

async function ensureClosed(page: Page) {
  if ((await headerToggle(page).getAttribute('aria-expanded')) !== 'false') await headerToggle(page).click();
  await expect(headerToggle(page)).toHaveAttribute('aria-expanded', 'false');
}

test.describe('header preferences toggle', () => {
  test('stays in the header in both states', async ({ page }) => {
    await page.goto('/');
    await ensureOpen(page);

    await expect(headerToggle(page)).toHaveAttribute('aria-label', 'Close preferences');
    await expect(headerToggle(page)).toBeVisible();
    await expect(page.locator('aside[data-toolbox] button[aria-label="Close preferences"]')).toHaveCount(0);

    await ensureClosed(page);
    await expect(headerToggle(page)).toHaveAttribute('aria-label', 'Open preferences');
    await expect(headerToggle(page)).toBeVisible();
  });

  test('has no serious or critical axe violations, open and closed', async ({ page }, testInfo) => {
    await page.goto('/');
    await expect(page.locator('textarea[aria-label="Document content"]')).toBeVisible();

    await ensureClosed(page);
    const closed = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    await ensureOpen(page);
    await page.waitForTimeout(600); // sidebar transition is 500ms
    const open = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();

    await testInfo.attach('axe-results', {
      body: JSON.stringify({ closed: closed.violations, open: open.violations }, null, 2),
      contentType: 'application/json',
    });

    const serious = [...closed.violations, ...open.violations].filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    );
    expect(serious.map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
  });

  test('screenshots both states', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await ensureOpen(page);
    await page.waitForTimeout(600);
    const openPath = testInfo.outputPath('open.png');
    await page.screenshot({ path: openPath });
    await ensureClosed(page);
    await page.waitForTimeout(600);
    const closedPath = testInfo.outputPath('closed.png');
    await page.screenshot({ path: closedPath });
    await testInfo.attach('open', { path: openPath, contentType: 'image/png' });
    await testInfo.attach('closed', { path: closedPath, contentType: 'image/png' });
  });
});
