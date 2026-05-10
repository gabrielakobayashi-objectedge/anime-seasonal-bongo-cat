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

  async screenshotTopAnime(outputPath: string): Promise<void> {
    const scoreSel = NavigationPage.SCORE_SELECTOR;

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

    await mkdir(dirname(outputPath), { recursive: true });
    const cards = await this.page.$$(NavigationPage.ANIME_CARD_SELECTOR);
    await cards[bestIndex].screenshot({ path: outputPath });
  }
}
