import { expect, test } from '@playwright/test';

import { gotoAndSettle, switchTheme } from '../helpers';
import { INITIAL_THEME, THEMES, VISUAL_ROUTES } from '../routes';

function slug(route: string): string {
  return route.replace(/^\//, '').replace(/\//g, '-');
}

// Extra masks for routes whose content changes between identical runs:
// the e-commerce dashboard has live-updating canvas charts (earning card
// re-renders on an interval), so its canvases are nondeterministic.
const EXTRA_MASKS: Record<string, string> = {
  '/pages/dashboard': 'canvas',
  '/pages/iot-dashboard': 'canvas',
};

for (const route of VISUAL_ROUTES) {
  const isAuth = route.startsWith('/auth/');
  for (const theme of THEMES) {
    // Auth pages render no header theme select; capture them in the boot theme only.
    if (isAuth && theme !== INITIAL_THEME) {
      continue;
    }
    test(`visual ${route} [${theme}]`, async ({ page }) => {
      await gotoAndSettle(page, route);
      if (!isAuth && theme !== INITIAL_THEME) {
        await switchTheme(page, theme);
        await page.waitForTimeout(300);
      }
      await expect(page).toHaveScreenshot(`${slug(route)}--${theme}.png`, {
        fullPage: false,
        mask: [
          page.locator('nb-chat'),
          page.locator('.recent-users, ngx-contacts, ngx-recent-users'),
          ...(EXTRA_MASKS[route] ? [page.locator(EXTRA_MASKS[route])] : []),
        ],
      });
    });
  }
}
