Playwright TypeScript API client scaffold

Usage:
- Copy the `src` files into your TypeScript project or use as a reference.
- They expect a Playwright `APIRequestContext` (e.g. `page.request` or `context.request`).

What this provides:
- `BaseApiClient` — thin wrapper around Playwright APIRequestContext.
- `AuthApiClient`, `WorkspaceApiClient`, `FormApiClient`, `ProcessApiClient` classes with methods you requested.
- `models.ts` — basic request/response TypeScript interfaces.
- `example.ts` — shows authenticate() then create form/process and save content (placeholder payload for form content).

Notes:
- Implementing `saveFormContent` requires the full JSON payload observed from the browser. See `WHAT I NEED` in the top-level repository issue or the README.
