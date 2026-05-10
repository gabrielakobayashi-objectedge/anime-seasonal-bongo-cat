import { test, expect } from '@playwright/test';
import { existsSync } from 'fs';
import { readFile, rm } from 'fs/promises';
import { NavigationPage } from '../pages/NavigationPage';
import { generateMockReview } from '../utils/mockReview';
import { writeAnimeResults, type AnimeResult } from '../utils/outputWriter';

const SCREENSHOT_PATH = 'output/top-anime-screenshot.png';
const JSON_PATH = 'output/anime-results.json';

test.describe('Screenshot & JSON Output (Story 2.3)', () => {
  test('screenshots #1 anime card to output/top-anime-screenshot.png', async ({ page }) => {
    const nav = new NavigationPage(page);
    await nav.goToCurrentSeason();
    await nav.screenshotTopAnime(SCREENSHOT_PATH);

    expect(existsSync(SCREENSHOT_PATH)).toBe(true);
  });

  test('writes anime-results.json with correct structure per entry', async ({ page }) => {
    const nav = new NavigationPage(page);
    await nav.goToCurrentSeason();
    const topAnime = await nav.getTopRatedAnime();

    const results: AnimeResult[] = topAnime.map((entry) => ({
      ...entry,
      mock_user_review: generateMockReview(entry.title),
    }));

    await writeAnimeResults(JSON_PATH, results);

    const content: AnimeResult[] = JSON.parse(await readFile(JSON_PATH, 'utf-8'));

    expect(Array.isArray(content)).toBe(true);
    expect(content.length).toBeGreaterThanOrEqual(1);
    expect(content.length).toBeLessThanOrEqual(5);

    for (const entry of content) {
      expect(typeof entry.title).toBe('string');
      expect(typeof entry.score).toBe('number');
      expect(typeof entry.mock_user_review).toBe('object');
      expect(entry.mock_user_review).not.toBeNull();
      expect(typeof entry.mock_user_review.reviewer_name).toBe('string');
      expect(typeof entry.mock_user_review.rating).toBe('number');
      expect(typeof entry.mock_user_review.comment).toBe('string');
    }
  });

  test('mock_user_review is an object, not a flat string', async ({ page }) => {
    const nav = new NavigationPage(page);
    await nav.goToCurrentSeason();
    const topAnime = await nav.getTopRatedAnime();

    const results: AnimeResult[] = topAnime.map((entry) => ({
      ...entry,
      mock_user_review: generateMockReview(entry.title),
    }));

    await writeAnimeResults(JSON_PATH, results);

    const content: AnimeResult[] = JSON.parse(await readFile(JSON_PATH, 'utf-8'));
    for (const entry of content) {
      expect(typeof entry.mock_user_review).toBe('object');
    }
  });

  test('creates output/ directory automatically if it does not exist', async () => {
    const tempPath = 'output/test-auto-create/results.json';
    await writeAnimeResults(tempPath, []);
    expect(existsSync(tempPath)).toBe(true);
    await rm('output/test-auto-create', { recursive: true });
  });
});
