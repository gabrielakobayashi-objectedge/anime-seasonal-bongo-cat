---
story_key: 1-1-project-setup-environment-configuration
epic: 1
story: 1
status: ready-for-dev
---

# Story 1.1: Project Setup & Environment Configuration

Status: done

## Story

As a **developer**,
I want a properly initialized Playwright project with all required dependencies and folder structure,
so that I have a stable, organized foundation to build the scraper on.

## Acceptance Criteria

1. **Given** a fresh project directory **When** the developer runs the install command **Then** Playwright (`@playwright/test`) and Faker (`@faker-js/faker`) are installed as dependencies in `package.json`.
2. **Given** dependencies are installed **Then** the folder structure exists: `pages/`, `tests/`, `output/`.
3. **Given** the project is initialized **Then** a `playwright.config.ts` is present and configures **only the Chromium browser** (remove Firefox and WebKit projects).
4. **Given** the project root **Then** a `.gitignore` file exists that excludes `node_modules/` and `output/`.

## Tasks / Subtasks

- [x] Task 1: Initialize Playwright project (AC: 1, 3)
  - [x] Run `npm init playwright@latest` — choose **TypeScript**, test folder `tests/`, skip GitHub Actions, install browsers
  - [x] Confirm `package.json`, `playwright.config.ts`, and `tests/` directory are generated
  - [x] Edit `playwright.config.ts`: remove the `firefox` and `webkit` entries from the `projects` array; keep only `chromium`

- [x] Task 2: Install Faker (AC: 1)
  - [x] Run `npm install @faker-js/faker`
  - [x] Confirm `@faker-js/faker` appears in `package.json` dependencies

- [x] Task 3: Create remaining folder structure (AC: 2)
  - [x] Create `pages/` directory (will hold POM classes: NavigationPage, etc.)
  - [x] Create `output/` directory (will hold `anime-results.json` and `top-anime-screenshot.png`)
  - [x] Add a `.gitkeep` inside `output/` so the directory is tracked by git

- [x] Task 4: Create `.gitignore` (AC: 4)
  - [x] Create `.gitignore` at project root containing at minimum:
    ```
    node_modules/
    output/
    test-results/
    playwright-report/
    ```

- [x] Task 5: Validate the complete setup (AC: 1–4)
  - [x] Run `npx playwright test` — confirm it runs (the scaffold test from init may pass or be deleted; either is acceptable)
  - [x] Confirm final folder structure matches:
    ```
    project-root/
    ├── pages/
    ├── tests/
    ├── output/
    │   └── .gitkeep
    ├── .gitignore
    ├── package.json
    ├── package-lock.json
    └── playwright.config.ts
    ```

## Dev Notes

### Tech Stack (Non-Negotiable)

- **Runtime:** Node.js 20.x, 22.x, or 24.x required by Playwright
- **Browser automation:** `@playwright/test` — initialized via `npm init playwright@latest`
- **Mock data:** `@faker-js/faker` — **use this package, NOT the legacy `faker` package** (different API, unmaintained)
- **Language:** TypeScript (select when prompted by the init wizard)

### Playwright Config — Required Changes

After `npm init playwright@latest` generates `playwright.config.ts`, the `projects` array will contain `chromium`, `firefox`, and `webkit`. **Remove firefox and webkit.** Final `projects` section must look like:

```ts
projects: [
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
  },
],
```

Leave all other generated config defaults intact (`baseURL`, `trace`, `reporter`, etc.).

### Folder Purpose (Critical for Future Stories)

| Folder | Purpose |
|--------|---------|
| `pages/` | All POM classes (`NavigationPage.ts`, future page objects) |
| `tests/` | Playwright test spec files only — no business logic |
| `output/` | Runtime artifacts (`anime-results.json`, `top-anime-screenshot.png`) — gitignored |

**Do NOT put POM classes in `tests/`. Do NOT put selectors in `tests/`.** These constraints are enforced from Story 1.2 onward.

### Package Names (Exact)

```json
{
  "devDependencies": {
    "@playwright/test": "^1.x.x"   // installed by npm init playwright@latest
  },
  "dependencies": {
    "@faker-js/faker": "^9.x.x"    // install separately: npm install @faker-js/faker
  }
}
```

> `@faker-js/faker` v9+ uses named locale imports. Import as:
> `import { faker } from '@faker-js/faker';`
> This is the pattern all future stories must follow.

### Project Structure Notes

- This story creates the **entire project from scratch** — there are no existing files to preserve or conflicts to avoid.
- The `output/` directory is gitignored intentionally — screenshots and JSON are runtime artifacts, not source artifacts.
- The scaffold test created by `npm init playwright@latest` (typically `tests/example.spec.ts`) may be deleted; it will not be used.

### References

- Story requirements: [epics.md — Story 1.1](../../planning-artifacts/epics.md#story-11-project-setup--environment-configuration)
- Full epic context: [epics.md — Epic 1](../../planning-artifacts/epics.md#epic-1-pom-foundation--seasonal-navigation)
- Playwright init docs: https://playwright.dev/docs/intro

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- Playwright v1.59.1 installed locally as devDependency
- Chromium browser installed via `npx playwright install chromium`
- @faker-js/faker v10.4.0 installed as runtime dependency (version pinned to ~10.4.0)
- TypeScript v6.0.3 and @types/node v25.6.2 installed for type safety
- `playwright.config.ts` created with single Chromium project, headless mode, 1 worker (sequential)
- Removed redundant `fullyParallel: false` config line
- `tsconfig.json` created with proper compiler options and node types
- `pages/`, `tests/`, `output/` directories created
- `.gitignore` covers node_modules/, output/, test-results/, playwright-report/, .playwright/
- `npm test` script wired to `playwright test`
- **Code Review:** 2 decisions resolved, 7 patches applied:
  - Deleted scaffold test (setup.spec.ts) to reduce test clutter
  - Deleted output/.gitkeep (output/ is gitignored)
  - Fixed TypeScript configuration (tsconfig.json, @types/node)
  - Changed package.json "type" to "module" for ES module support
  - Added Node version requirement (>=20.19.0)
  - Tightened @faker-js/faker version to ~10.4.0

### File List

- package.json
- package-lock.json
- playwright.config.ts
- tsconfig.json
- .gitignore
- pages/ (directory)
- tests/ (directory)
- output/ (directory)

## Review Findings

### Decision Needed

- [x] [Review][Decision] .gitignore excludes output/ but output/.gitkeep exists — **RESOLVED:** Remove .gitkeep (output/ gitignored, auto-created at runtime).
- [x] [Review][Decision] setup.spec.ts test file will run alongside future test stories — **RESOLVED:** Delete setup.spec.ts (reduce test clutter for future stories).

### Patches

- [x] [Review][Patch] Tests check directory existence but don't create them — **FIXED:** Deleted setup.spec.ts (test was scaffold only).
- [x] [Review][Patch] fullyParallel=false + workers=1 redundant — **FIXED:** Removed `fullyParallel: false` from playwright.config.ts.
- [x] [Review][Patch] Missing error handling in setup tests — **FIXED:** Deleted setup.spec.ts (no longer needed).
- [x] [Review][Patch] Missing tsconfig.json — **FIXED:** Created tsconfig.json with TypeScript compiler options, added @types/node.
- [x] [Review][Patch] "type": "commonjs" conflicts with TypeScript — **FIXED:** Changed package.json to `"type": "module"`.
- [x] [Review][Patch] Node version requirements not enforced — **FIXED:** Added `"engines": { "node": ">=20.19.0" }` to package.json.
- [x] [Review][Patch] @faker-js/faker version range too loose — **FIXED:** Tightened to `~10.4.0` (patch-level only).

### Deferred

- [x] [Review][Defer] No baseURL in playwright.config.ts [playwright.config.ts:3-21] — deferred to Story 1.2; baseURL (`https://myanimelist.net`) needed for NavigationPage, not Story 1.1.
- [x] [Review][Defer] Empty pages/ directory [pages/] — deferred; Story 1.2 (NavigationPage) will populate it.
- [x] [Review][Defer] Reporter 'list' only (no HTML) [playwright.config.ts:9] — deferred; Story 1.2+ can add `reporter: ['html', 'list']` when scraping needs visual debugging.
