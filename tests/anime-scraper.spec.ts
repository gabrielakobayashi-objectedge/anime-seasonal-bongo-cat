import { test, expect } from '@playwright/test';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { PageManager } from '../pages/PageManager';
import { generateMockReview } from '../utils/mockReview';
import { writeAnimeResults, type AnimeResult } from '../utils/outputWriter';

const SCREENSHOT_PATH = 'output/top-anime-screenshot.png';
const JSON_PATH = 'output/anime-results.json';

test('Anime Seasonal Scraper — full pipeline', async ({ page }) => {
  const pm = new PageManager(page);

  await pm.navigationPage.goToCurrentSeason();

  const topAnime = await pm.navigationPage.getTopRatedAnime();
  expect(
    topAnime.length,
    'No rated anime found on the MAL seasonal page — cannot continue'
  ).toBeGreaterThanOrEqual(1);

  const results: AnimeResult[] = topAnime.map((entry) => ({
    ...entry,
    mock_user_review: generateMockReview(entry.title),
  }));

  await pm.navigationPage.screenshotTopAnime(SCREENSHOT_PATH);
  await writeAnimeResults(JSON_PATH, results);

  expect(existsSync(SCREENSHOT_PATH), 'Screenshot file not created').toBe(true);

  const content: AnimeResult[] = JSON.parse(await readFile(JSON_PATH, 'utf-8'));
  expect(content.length, 'anime-results.json must contain at least 1 entry').toBeGreaterThanOrEqual(1);
  expect(content.length, 'anime-results.json must contain at most 5 entries').toBeLessThanOrEqual(5);

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
