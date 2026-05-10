import { test, expect } from '@playwright/test';
import { NavigationPage } from '../pages/NavigationPage';

test.describe('NavigationPage.getTopRatedAnime', () => {
  test('returns up to 5 entries each with title and numeric score', async ({ page }) => {
    const nav = new NavigationPage(page);
    await nav.goToCurrentSeason();

    const results = await nav.getTopRatedAnime();

    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.length).toBeLessThanOrEqual(5);

    for (const entry of results) {
      expect(typeof entry.title).toBe('string');
      expect(entry.title.length).toBeGreaterThan(0);
      expect(typeof entry.score).toBe('number');
      expect(isNaN(entry.score)).toBe(false);
      expect(entry.score).toBeGreaterThan(0);
    }
  });

  test('results are sorted by score descending', async ({ page }) => {
    const nav = new NavigationPage(page);
    await nav.goToCurrentSeason();

    const results = await nav.getTopRatedAnime();

    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
    }
  });

  test('filters out entries with N/A or missing scores', async ({ page }) => {
    const nav = new NavigationPage(page);
    await nav.goToCurrentSeason();

    const results = await nav.getTopRatedAnime();

    for (const entry of results) {
      expect(isNaN(entry.score)).toBe(false);
      expect(entry.score).toBeGreaterThan(0);
    }
  });

  test('does not throw when fewer than 5 rated entries exist', async ({ page }) => {
    const nav = new NavigationPage(page);
    await nav.goToCurrentSeason();

    await expect(nav.getTopRatedAnime()).resolves.toBeDefined();
  });
});
