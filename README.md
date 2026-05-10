# Anime Seasonal Scraper

Playwright-based scraper that navigates to MyAnimeList's current seasonal anime listing, extracts the top 5 rated entries, enriches each with a Faker-generated mock user review, saves the results as JSON, and captures a screenshot of each of the top 5 ranked anime detail pages.

## Features

- Auto-detects current season from system date (Jan–Mar=Winter, Apr–Jun=Spring, Jul–Sep=Summer, Oct–Dec=Fall)
- Navigates to `https://myanimelist.net/anime/season/{year}/{season}` dynamically
- Scrapes all anime entries, filters out unrated (N/A) entries, returns top 5 sorted by score descending
- Generates mock user reviews via `@faker-js/faker` (reviewer name, rating 1–10, comment)
- Writes `output/anime-results.json` with `title`, `score`, and `mock_user_review` per entry
- Screenshots each of the top 5 anime detail pages to `output/anime-{1-5}-screenshot.png` at 1920×1080 viewport resolution
- Dismisses GDPR/cookie consent modal before capturing screenshot
- Full Page Object Model (POM) architecture

## Requirements

- Node.js >= 20.19.0
- Chromium (installed automatically via Playwright)

## Setup

```bash
npm install
npx playwright install chromium
```

## Run

```bash
npm test
```

Runs all 24 tests. The full pipeline test (`anime-scraper.spec.ts`) produces these output artifacts:

| Artifact | Path |
|----------|------|
| Ranked anime data with reviews | `output/anime-results.json` |
| Screenshot of #1 anime detail page | `output/anime-1-screenshot.png` |
| Screenshot of #2 anime detail page | `output/anime-2-screenshot.png` |
| Screenshot of #3 anime detail page | `output/anime-3-screenshot.png` |
| Screenshot of #4 anime detail page | `output/anime-4-screenshot.png` |
| Screenshot of #5 anime detail page | `output/anime-5-screenshot.png` |

> `output/` is git-ignored — artifacts are generated at runtime.

## Project Structure

```
├── pages/
│   ├── NavigationPage.ts     # POM class — season detection, MAL navigation, scraping, screenshot
│   └── PageManager.ts        # Central registry/factory for all page objects
│
├── tests/
│   ├── anime-scraper.spec.ts # Full pipeline orchestration (Entry point — run this end-to-end)
│   ├── navigation.spec.ts    # Unit + integration tests for NavigationPage navigation
│   ├── scraper.spec.ts       # Tests for getTopRatedAnime() filtering and sorting
│   ├── output.spec.ts        # Tests for screenshot capture and JSON output
│   ├── page-manager.spec.ts  # Tests for PageManager registry
│   └── mock-review.spec.ts   # Unit tests for Faker review generation
│
├── utils/
│   ├── mockReview.ts         # generateMockReview() — standalone Faker utility
│   └── outputWriter.ts       # writeAnimeResults() — JSON file writer with auto dir creation
│
├── output/                   # Runtime artifacts (git-ignored)
│   ├── anime-results.json
│   ├── anime-1-screenshot.png
│   ├── anime-2-screenshot.png
│   ├── anime-3-screenshot.png
│   ├── anime-4-screenshot.png
│   └── anime-5-screenshot.png
│
├── playwright.config.ts      # Playwright config — Chromium only, headless, 1 worker, 1920×1080 viewport
├── tsconfig.json
└── package.json
```

## Architecture

```
Test Spec (anime-scraper.spec.ts)
        │
        ▼
   PageManager
        │
        ▼
  NavigationPage ──────────────────────────────────────────────┐
  │  goToCurrentSeason()    → derives season from date, navigates MAL  │
  │  getTopRatedAnime()     → scrapes, filters N/A, sorts desc, top 5  │
  │  dismissCookieConsent() → clicks agree on cookie modal if present   │
  │  screenshotTopAnime()      → dismisses cookie modal, captures #1 at 1920×1080  │
  │  screenshotAllTopAnime()   → collects top 5 URLs, navigates to each,           │
  │                              dismisses cookies, captures 1920×1080 per anime   │
        │
        ▼
   utils/mockReview.ts
   generateMockReview(title) → { reviewer_name, rating, comment }
        │
        ▼
   utils/outputWriter.ts
   writeAnimeResults(path, results) → output/anime-results.json
```

## Output Format

`output/anime-results.json`:

```json
[
  {
    "title": "Anime Title",
    "score": 8.91,
    "mock_user_review": {
      "reviewer_name": "faker_username",
      "rating": 9,
      "comment": "Faker-generated sentence."
    }
  }
]
```

## Test Coverage

| Spec | Tests | What it covers |
|------|-------|----------------|
| `anime-scraper.spec.ts` | 1 | Full end-to-end pipeline |
| `navigation.spec.ts` | 4 | Season detection, URL construction, page load |
| `scraper.spec.ts` | 4 | Filtering, sorting, top-5 limit |
| `output.spec.ts` | 7 | All 5 screenshot files exist, 1920×1080 resolution per screenshot, cookie modal dismissed, JSON structure, auto dir creation |
| `page-manager.spec.ts` | 3 | POM registry, instance identity |
| `mock-review.spec.ts` | 5 | Field types, rating range, non-determinism |
| **Total** | **24** | |

## Dependencies

| Package | Version | Role |
|---------|---------|------|
| `@playwright/test` | ^1.59.1 | Browser automation + test runner |
| `@faker-js/faker` | ~10.4.0 | Mock data generation |
| `typescript` | ^6.0.3 | Type safety |
| `@types/node` | ^25.6.2 | Node.js type definitions |
