import { test, expect } from '@playwright/test';
import { existsSync } from 'fs';
import { readFile, rm } from 'fs/promises';

function readPngDimensions(buffer: Buffer): { width: number; height: number } {
  // PNG spec: bytes 16-19 = width, 20-23 = height (big-endian)
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}
import { NavigationPage } from '../pages/NavigationPage';
import { generateMockReview } from '../utils/mockReview';
import { writeAnimeResults, type AnimeResult } from '../utils/outputWriter';

const SCREENSHOT_DIR = 'output';
const SCREENSHOT_PATHS = [1, 2, 3, 4, 5].map((i) => `${SCREENSHOT_DIR}/anime-${i}-screenshot.png`);
const JSON_PATH = 'output/anime-results.json';

test.describe('Screenshot & JSON Output (Story 2.3)', () => {
  test('screenshots top 5 anime to output/anime-{1-5}-screenshot.png', async ({ page }) => {
    const nav = new NavigationPage(page);
    await nav.goToCurrentSeason();
    const paths = await nav.screenshotAllTopAnime(SCREENSHOT_DIR);

    expect(paths.length).toBeGreaterThanOrEqual(1);
    expect(paths.length).toBeLessThanOrEqual(5);

    for (const p of paths) {
      expect(existsSync(p), `Missing screenshot: ${p}`).toBe(true);
    }
  });

  test('all 5 screenshots exist after run', async ({ page }) => {
    const nav = new NavigationPage(page);
    await nav.goToCurrentSeason();
    await nav.screenshotAllTopAnime(SCREENSHOT_DIR);

    for (const p of SCREENSHOT_PATHS) {
      expect(existsSync(p), `Missing screenshot: ${p}`).toBe(true);
    }
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

  test('each screenshot has 1920x1080 resolution', async ({ page }) => {
    const nav = new NavigationPage(page);
    await nav.goToCurrentSeason();
    const paths = await nav.screenshotAllTopAnime(SCREENSHOT_DIR);

    for (const p of paths) {
      const buffer = await readFile(p);
      const { width, height } = readPngDimensions(buffer);
      expect(width, `Width mismatch: ${p}`).toBe(1920);
      expect(height, `Height mismatch: ${p}`).toBe(1080);
    }
  });

  test('cookie modal not visible after screenshots', async ({ page }) => {
    const nav = new NavigationPage(page);
    await nav.goToCurrentSeason();
    await nav.screenshotAllTopAnime(SCREENSHOT_DIR);

    const cookieSelectors = [
      '#cookie-consent',
      '.cookie-banner',
      '#qc-cmp2-ui',
      '[id*="cookie"]',
      '[id*="consent"]',
    ];

    for (const selector of cookieSelectors) {
      const el = page.locator(selector).first();
      const visible = await el.isVisible().catch(() => false);
      expect(visible, `Cookie modal still visible: ${selector}`).toBe(false);
    }
  });

  test('creates output/ directory automatically if it does not exist', async () => {
    const tempPath = 'output/test-auto-create/results.json';
    await writeAnimeResults(tempPath, []);
    expect(existsSync(tempPath)).toBe(true);
    await rm('output/test-auto-create', { recursive: true });
  });
});
