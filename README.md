# Automation Anywhere — Playwright Test Suite

This repository contains end-to-end UI and API tests for Automation Anywhere using Playwright.

## Overview

- **Use Case 1 (UI):** Create a Form via the web UI (login, Automation → Create → Form, add controls, upload file, save and verify).
- **Use Case 2 (API):** Create a private workspace, create a form and a process via API, save content and dependencies.

## Setup

1. Install Node.js (v18 recommended) and npm.
2. Clone the repository and install dependencies:

```bash
git clone git@github.com:chandanambindu/automation-anywhere-sdet-framework.git
cd automation-anywhere-sdet-framework
npm ci
npx playwright install --with-deps
```

## Environment / Configuration

Create a local `.env` file (do not commit) with the following variables:

- `BASE_URL` — UI base URL
- `API_BASE_URL` — API base URL
- `USERNAME` — test user email
- `PASSWORD` — test user password
- Optional: `TEST_TIMEOUT_MS`, `EXPECT_TIMEOUT_MS`, `ACTION_TIMEOUT_MS`, `NAVIGATION_TIMEOUT_MS`, `RETRIES`, `BROWSER`, `HEADLESS`

Example `.env` (local only):

```
API_BASE_URL=https://community.cloud.automationanywhere.digital
BASE_URL=https://www.automationanywhere.com/products/enterprise/community-edition
USERNAME=you@example.com
PASSWORD=supersecret
HEADLESS=true
```

## CI/CD

GitHub Actions workflow at `.github/workflows/playwright.yml` uses repository secrets: `BASE_URL`, `API_BASE_URL`, `USERNAME`, `PASSWORD`.

## Running Tests Locally

```bash
# Run full suite
npm test

# Run UI tests only (Use Case 1)
npm run test:ui

# Run API tests only (Use Case 2)
npm run test:api

# View HTML report
npm run report
```

## Manual Test Execution

```bash
# Use Case 1: UI test
npx playwright test tests/ui/create-form.spec.js --project=chromium --workers=1

# Use Case 2: API test
npx playwright test tests/api/create-process-with-form.spec.js --project=chromium --workers=1

# Both together
npx playwright test tests/ui/create-form.spec.js tests/api/create-process-with-form.spec.js --project=chromium --workers=1

# With headed mode (see browser for UI test)
npx playwright test tests/ui/create-form.spec.js --project=chromium --workers=1 --headed
```

## Test Organization

Tests are organized under `tests/ui/` and `tests/api/` with `Use Case` prefixes in titles.

## Frameworks & Tools

- Playwright Test (`@playwright/test`) for browser automation and API test orchestration
- Node.js (CommonJS) runtime
- `dotenv` for environment loading
- Page Object Model pattern for UI interactions
- Layered API client structure

## Repository Notes

- Do not commit `.env` files containing credentials
- Debug artifacts (e.g., `tmp-*.png`, `debug-*.js`) are in `.gitignore`
- Rotate credentials if accidentally committed

## Authorship

Prepared as part of the Automation Anywhere SDET assignment.

