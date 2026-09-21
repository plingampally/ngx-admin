import { expect, test } from '@playwright/test';

import { gotoAndSettle, switchTheme } from '../helpers';
import { THEME_LABELS, THEMES } from '../routes';

test('switching through all themes applies nb-theme-* on body', async ({ page }) => {
  await gotoAndSettle(page, '/pages/dashboard');

  for (let i = 0; i < THEMES.length; i++) {
    const theme = THEMES[i];
    const previous = i > 0 ? THEMES[i - 1] : 'default';

    await switchTheme(page, theme);

    await expect(page.locator('body')).toHaveClass(new RegExp(`nb-theme-${theme}`));
    if (theme !== previous) {
      await expect(page.locator('body')).not.toHaveClass(new RegExp(`nb-theme-${previous}`));
    }
    await expect(page.locator('.header-container nb-select')).toContainText(THEME_LABELS[theme]);
  }
});
