import { test, expect } from '@playwright/test';
import { NavigationPage } from '../pages/NavigationPage';

test.describe('NavigationPage', () => {
  test('goToCurrentSeason navigates to correct season URL', async ({ page }) => {
    const nav = new NavigationPage(page);
    await nav.goToCurrentSeason();

    const url = page.url();
    expect(url).toMatch(
      /https:\/\/myanimelist\.net\/anime\/season\/\d{4}\/(winter|spring|summer|fall)/
    );
  });

  test('goToCurrentSeason maps current month to correct season in URL', async ({ page }) => {
    const nav = new NavigationPage(page);
    const { season, year } = nav.getSeasonInfo();

    await nav.goToCurrentSeason();

    expect(page.url()).toContain(`${year}/${season}`);
  });

  test('season detection maps months correctly', () => {
    // Month → season mapping: 1-3=winter, 4-6=spring, 7-9=summer, 10-12=fall
    const cases: Array<[number, string]> = [
      [1, 'winter'], [2, 'winter'], [3, 'winter'],
      [4, 'spring'], [5, 'spring'], [6, 'spring'],
      [7, 'summer'], [8, 'summer'], [9, 'summer'],
      [10, 'fall'], [11, 'fall'], [12, 'fall'],
    ];

    for (const [month, expected] of cases) {
      expect(NavigationPage.monthToSeason(month)).toBe(expected);
    }
  });

  test('MAL seasonal listing main content is visible after navigation', async ({ page }) => {
    const nav = new NavigationPage(page);
    await nav.goToCurrentSeason();

    await expect(page.locator('.js-categories-seasonal')).toBeVisible();
  });
});
