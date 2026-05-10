import { Page } from '@playwright/test';
import { NavigationPage } from './NavigationPage';

export class PageManager {
  private readonly _navigationPage: NavigationPage;

  constructor(page: Page) {
    this._navigationPage = new NavigationPage(page);
  }

  get navigationPage(): NavigationPage {
    return this._navigationPage;
  }
}
