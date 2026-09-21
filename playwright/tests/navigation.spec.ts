import { expect, test } from '@playwright/test';

import { collectConsoleErrors, gotoAndSettle } from '../helpers';
import { PAGE_ROUTES } from '../routes';

// Pre-existing upstream console errors, verified identical on the Angular 14
// baseline (:4200) — not migration regressions. The routes still run; only
// these known substrings are tolerated, anything new fails the test.
const KNOWN_BROKEN: Record<string, string[]> = {
  '/pages/dashboard': ["reading 'setOption'"],
  '/pages/editors/ckeditor': ["'caller', 'callee', and 'arguments'"],
};

for (const route of PAGE_ROUTES) {
  test(`navigates to ${route}`, async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await gotoAndSettle(page, route);
    expect(page.url()).toContain(route);
    const root = route.startsWith('/auth/')
      ? page.locator('nb-auth-block')
      : page.locator('nb-layout');
    await expect(root.first()).toBeVisible();
    const known = KNOWN_BROKEN[route] || [];
    expect(errors.filter(e => !known.some(k => e.includes(k)))).toEqual([]);
  });
}
