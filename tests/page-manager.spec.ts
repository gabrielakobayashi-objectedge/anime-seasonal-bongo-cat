import { test, expect } from '@playwright/test';
import { PageManager } from '../pages/PageManager';
import { NavigationPage } from '../pages/NavigationPage';

test.describe('PageManager', () => {
  test('exposes navigationPage as a NavigationPage instance', async ({ page }) => {
    const pm = new PageManager(page);
    expect(pm.navigationPage).toBeInstanceOf(NavigationPage);
  });

  test('returns same navigationPage instance on repeated access', async ({ page }) => {
    const pm = new PageManager(page);
    expect(pm.navigationPage).toBe(pm.navigationPage);
  });

  test('navigationPage can navigate to current season', async ({ page }) => {
    const pm = new PageManager(page);
    await pm.navigationPage.goToCurrentSeason();

    expect(page.url()).toMatch(
      /https:\/\/myanimelist\.net\/anime\/season\/\d{4}\/(winter|spring|summer|fall)/
    );
  });
});
