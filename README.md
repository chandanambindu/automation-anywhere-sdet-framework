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
