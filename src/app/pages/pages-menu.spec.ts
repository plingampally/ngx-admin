import { NbMenuItem } from '@nebular/theme';

import { MENU_ITEMS } from './pages-menu';

function flatten(items: NbMenuItem[]): NbMenuItem[] {
  return items.reduce((acc, item) => {
    acc.push(item);
    if (item.children) {
      acc.push(...flatten(item.children));
    }
    return acc;
  }, [] as NbMenuItem[]);
}

describe('MENU_ITEMS', () => {
  const allItems = flatten(MENU_ITEMS);

  it('should be non-empty', () => {
    expect(MENU_ITEMS.length).toBeGreaterThan(0);
  });

  it('every linked item should link into /pages/ or /auth/', () => {
    allItems
      .filter(item => !!item.link)
      .forEach(item => {
        expect(item.link.startsWith('/pages/') || item.link.startsWith('/auth/'))
          .toBe(true);
      });
  });

  it('item titles should be unique', () => {
    const titles = allItems.map(item => item.title);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it('should have exactly one home item linking to the dashboard', () => {
    const homeItems = allItems.filter(item => item.home === true);
    expect(homeItems.length).toBe(1);
    expect(homeItems[0].link).toBe('/pages/dashboard');
  });
});
