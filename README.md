# Automation Anywhere — Playwright Test Suite

This repository contains end-to-end UI and API tests for Automation Anywhere using Playwright.

Overview
- Use Case 1 (UI): Create a Form via the web UI (login, Automation → Create → Form, add controls, upload file, save and verify).
- Use Case 2 (API): Create a private workspace, create a form and a process via API, save content and dependencies.

Setup

1. Install Node.js (v18 recommended) and npm.
2. Clone the repository and install dependencies:

```bash
git clone git@github.com:chandanambindu/automation-anywhere-sdet-framework.git
cd automation-anywhere-sdet-framework
npm ci
npx playwright install --with-deps
```

Environment / Configuration
- Create a local `.env` file (do not commit) with the following variables:

- `BASE_URL` — UI base URL
- `API_BASE_URL` — API base URL
- `USERNAME` — test user email
- `PASSWORD` — test user password
- Optional timeouts and flags: `TEST_TIMEOUT_MS`, `EXPECT_TIMEOUT_MS`, `ACTION_TIMEOUT_MS`, `NAVIGATION_TIMEOUT_MS`, `RETRIES`, `BROWSER`, `HEADLESS`

Example `.env` (local only):

```
API_BASE_URL=https://community.cloud.automationanywhere.digital
BASE_URL=https://www.automationanywhere.com/products/enterprise/community-edition
USERNAME=you@example.com
PASSWORD=supersecret
HEADLESS=true
```

CI Notes
- GitHub Actions workflow is present at `.github/workflows/playwright.yml` and uses repository secrets: `BASE_URL`, `API_BASE_URL`, `USERNAME`, `PASSWORD`.

Running tests locally
- Run the full suite:

```bash
npm test
```

- Run UI tests only:

```bash
npm run test:ui
```

- Run API tests only:

```bash
npm run test:api
```

Test organization & naming
- Tests are organized under `tests/ui/` and `tests/api/` and labeled with `Use Case` prefixes in `describe` and test titles. This makes it clear which use case each test exercises.

Frameworks & tools
- Playwright Test (`@playwright/test`) for browser automation and API test orchestration.
- Node.js (CommonJS) as the runtime.
- `dotenv` for local environment loading.

Repository notes
- Do not commit `.env` files containing credentials. Rotate credentials if they were committed previously.
- Debug artifacts (e.g., `tmp-*.png`, `debug-*.js`) are ignored in `.gitignore`.

Authorship
- This repository was prepared as part of the Automation Anywhere SDET assignment. All changes and test artifacts live in the repo; run the tests using the commands above.

If you want, I can:
- Remove debug artifacts from history and the current tree.
- Add `docs/TESTING.md` with step-by-step verification notes.
# Automation Anywhere Playwright Framework

This repository contains a production-oriented Playwright Test framework for the Automation Anywhere Community Edition assignment. The initial milestone focuses on a clean project skeleton, environment configuration, reporting, and CI wiring. Application-specific selectors and API endpoints will be added after inspecting the running application and network activity.

## Project overview

- Playwright Test with JavaScript and Node.js
- Page Object Model structure for UI flows
- Layered API client structure for future automation coverage
- HTML reporting, tracing, screenshots, and video capture on failure
- GitHub Actions workflow for CI execution

## Folder structure

- `config/` – environment and configuration helpers
- `pages/` – page objects for UI flows
- `api/` – reusable API client classes
- `tests/ui/` – UI test cases
- `tests/api/` – API test cases
- `fixtures/` – Playwright fixtures
- `utils/` – logging, date, file, and helper utilities
- `data/` – externalized JSON test data
- `reports/` – generated HTML and JUnit output
- `screenshots/` – failure screenshots
- `.github/workflows/` – CI workflow definition

## Installation

```bash
npm install
npx playwright install --with-deps
```

## Environment variables

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

The following values must be supplied before running real UI or API tests:

- `BASE_URL`
- `USERNAME`
- `PASSWORD`

## Execution

### Run UI tests

```bash
npm run test:ui
```

### Run API tests

```bash
npm run test:api
```

### Run all tests

```bash
npm test
```

### View HTML report

```bash
npm run report
```

## Reports

- HTML report: `reports/html`
- JUnit XML: `reports/junit/results.xml`
- Traces, screenshots, and videos are retained on failure.

## Quickstart (mock mode)

1. Install dependencies:

```bash
npm install
npx playwright install --with-deps
```

2. Start the local mock API server (development):

```bash
node test-mock/server.js
```

3. Copy `.env.example.mock` to `.env` and edit if needed (do NOT commit `.env`):

```bash
cp .env.example.mock .env
```

4. Run API tests (they will target `API_BASE_URL` defined in `.env`):

```bash
npx playwright test tests/api --reporter=list --workers=1
```

Notes:
- The `test-mock` server is for local development and CI where the real backend is not available.
- Do not commit real credentials or access tokens; keep `.env` in `.gitignore`.
- To run tests against the real backend, set `API_BASE_URL` to the real API host and ensure credentials are present in your local `.env`.

## Reporting, Logging, and Artifacts

- Playwright HTML report is generated in `reports/html`. Open it with:

```bash
npm run report
```

- Logs are written to `logs/latest.log` by the framework logger. Tail them with:

```bash
npm run logs:tail
```

- To gather test artifacts (reports, test-results, screenshots, traces, logs):

```bash
npm run collect-artifacts
```

This will produce an archive under `reports/artifacts-<timestamp>.tar.gz`.

## Final validation

1. Start the mock server (or point `API_BASE_URL` to the real API):

```bash
npm run start:mock
```

2. Run the full test suite:

```bash
npm test
```

3. Collect artifacts and open the HTML report when finished.

