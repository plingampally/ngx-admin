import { expect, test } from '@playwright/test';

import { gotoAndSettle } from '../helpers';

test('root redirects to /pages/dashboard', async ({ page }) => {
  await gotoAndSettle(page, '/');
  await expect(page).toHaveURL(/\/pages\/dashboard/);
});

test('header shows Bank of America logo', async ({ page }) => {
  await gotoAndSettle(page, '/pages/dashboard');
  await expect(page.locator('.logo')).toHaveText(/Bank of America/);
});

test('sidebar nb-menu has more than 5 items', async ({ page }) => {
  await gotoAndSettle(page, '/pages/dashboard');
  const items = page.locator('nb-menu .menu-item');
  expect(await items.count()).toBeGreaterThan(5);
});

test('title tag is non-empty', async ({ page }) => {
  await gotoAndSettle(page, '/pages/dashboard');
  expect(await page.title()).not.toBe('');
});
