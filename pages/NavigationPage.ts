import { mkdir } from 'fs/promises';
import { dirname } from 'path';
import { Page } from '@playwright/test';

export interface AnimeEntry {
  title: string;
  score: number;
}

export class NavigationPage {
  private readonly page: Page;

  private static readonly BASE_URL = 'https://myanimelist.net/anime/season';
  private static readonly SEASONAL_LIST_SELECTOR = '.js-categories-seasonal';
  private static readonly ANIME_CARD_SELECTOR = '.seasonal-anime';
  private static readonly TITLE_SELECTOR = 'h2.h2_anime_title';
  private static readonly SCORE_SELECTOR = '.score-label';

  constructor(page: Page) {
    this.page = page;
  }

  static monthToSeason(month: number): string {
    if (month <= 3) return 'winter';
    if (month <= 6) return 'spring';
    if (month <= 9) return 'summer';
    return 'fall';
  }

  getSeasonInfo(): { season: string; year: number } {
    const now = new Date();
    return {
      season: NavigationPage.monthToSeason(now.getMonth() + 1),
      year: now.getFullYear(),
    };
  }

  async goToCurrentSeason(): Promise<void> {
    const { season, year } = this.getSeasonInfo();
    await this.page.goto(`${NavigationPage.BASE_URL}/${year}/${season}`);
    await this.page.waitForSelector(NavigationPage.SEASONAL_LIST_SELECTOR, {
      timeout: 30000,
    });
  }

  async getTopRatedAnime(): Promise<AnimeEntry[]> {
    const titleSel = NavigationPage.TITLE_SELECTOR;
    const scoreSel = NavigationPage.SCORE_SELECTOR;

    const raw = await this.page.$$eval(
      NavigationPage.ANIME_CARD_SELECTOR,
      (cards, { titleSel, scoreSel }) =>
        cards.map((card) => ({
          title: card.querySelector(titleSel)?.textContent?.trim() ?? '',
          scoreText: card.querySelector(scoreSel)?.textContent?.trim() ?? '',
        })),
      { titleSel, scoreSel }
    );

    return raw
      .map(({ title, scoreText }) => ({ title, score: parseFloat(scoreText) }))
      .filter(({ title, score }) => title.length > 0 && !isNaN(score) && score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }

  async dismissCookieConsent(): Promise<void> {
    const cookieSelectors = [
      '#cookie-consent button[class*="agree"]',
      '#cookie-consent .btn-accept',
      '.cookie-banner button[class*="agree"]',
      'button[class*="cookie"][class*="agree"]',
      '#qc-cmp2-ui button.css-k8o10q',
      '.qc-cmp2-summary-buttons button:last-child',
      '[id*="cookie"] button[class*="accept"]',
      '[id*="consent"] button[class*="agree"]',
    ];

    for (const selector of cookieSelectors) {
      const btn = this.page.locator(selector).first();
      if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await btn.click();
        await this.page.waitForTimeout(500);
        return;
      }
    }
  }

  async screenshotTopAnime(outputPath: string): Promise<void> {
    const scoreSel = NavigationPage.SCORE_SELECTOR;

    await this.dismissCookieConsent();

    const bestIndex = await this.page.$$eval(
      NavigationPage.ANIME_CARD_SELECTOR,
      (cards, scoreSel) => {
        let best = -1;
        let bestScore = -Infinity;
        cards.forEach((card, i) => {
          const score = parseFloat(card.querySelector(scoreSel)?.textContent?.trim() ?? '');
          if (!isNaN(score) && score > bestScore) {
            bestScore = score;
            best = i;
          }
        });
        return best;
      },
      scoreSel
    );

    if (bestIndex === -1) throw new Error('No rated anime card found for screenshot');

    const cards = await this.page.$$(NavigationPage.ANIME_CARD_SELECTOR);
    const titleLink = await cards[bestIndex].$('h2.h2_anime_title a');
    if (!titleLink) throw new Error('No title link found on top-rated anime card');

    await titleLink.click();
    await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 });
    await this.dismissCookieConsent();

    await mkdir(dirname(outputPath), { recursive: true });
    await this.page.screenshot({ path: outputPath, type: 'png' });
  }
}
