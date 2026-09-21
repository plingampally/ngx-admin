import { Page } from '@playwright/test';

import { THEME_LABELS } from './routes';

const IGNORED_CONSOLE_ERRORS = [
  'favicon',
  'ERR_BLOCKED_BY_CLIENT',
  'Google Maps',
  'maps.googleapis.com',
  'GoogleMapsAPI',
];

export async function gotoAndSettle(page: Page, path: string): Promise<void> {
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  // Dev servers keep some requests alive; networkidle is best-effort.
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  await page.locator('nb-layout, nb-auth-block').first().waitFor({ state: 'visible' });
  await page.waitForTimeout(500);
}

export function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  const shouldIgnore = (text: string) =>
    IGNORED_CONSOLE_ERRORS.some(fragment => text.includes(fragment));

  page.on('pageerror', error => {
    if (!shouldIgnore(error.message)) {
      errors.push(error.message);
    }
  });
  page.on('console', message => {
    if (message.type() === 'error' && !shouldIgnore(message.text())) {
      errors.push(message.text());
    }
  });
  return errors;
}

// Nebular applies the theme as `nb-theme-<name>` on <body>.
export async function switchTheme(page: Page, theme: string): Promise<void> {
  await page.locator('.header-container nb-select').first().click();
  await page.locator('nb-option', { hasText: THEME_LABELS[theme] }).first().click();
  await page.locator(`body.nb-theme-${theme}`).waitFor({ state: 'attached' });
}
