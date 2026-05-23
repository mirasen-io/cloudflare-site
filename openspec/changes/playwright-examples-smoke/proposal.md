## Why

The `/chessboard/examples/*` routes are now the public face of the Mirasen Chessboard library on this site, but they have zero automated coverage. The only Playwright test (`src/routes/demo/playwright/page.svelte.e2e.ts`) just asserts an `<h1>` exists on a SvelteKit scaffolded `/demo/playwright` route that is no longer linked from production navigation. A broken import, a hydration failure, or the recursive-mutation board crash we already hit once would all ship to production undetected. We need fast, stable smoke coverage that catches "page didn't load", "Svelte didn't hydrate", "board didn't mount", and "route threw at runtime" — without locking the tests to fragile board internals.

## What Changes

- Add an `app-started` hydration marker on `<html>` from the root `+layout.svelte` `onMount` so Playwright has a fixed, browser-only signal for "SvelteKit hydration done".
- Add Playwright smoke specs covering the four real example routes:
  - `/chessboard/examples/minimal`
  - `/chessboard/examples/promotion`
  - `/chessboard/examples/chessjs`
  - `/chessboard/examples/live-games-grid`
- Use the `@mirasen/chessboard` renderer's existing `data-chessboard-id` attributes (`svg-root`, `board-root`, `square-*`, `piece-*`) as the canonical signal that a board mounted, instead of inventing parallel `data-testid` markers on board elements.
- Add page-level `data-testid` markers only on the live-games-grid card and overlay link (`live-game-card`, `live-board-link`) where structural assertions need a stable hook that accessible labels can't provide.
- Add a small Playwright helper that fails any test on uncaught page errors and on browser `console.error` so route-level runtime errors surface as test failures.
- Remove the orphaned SvelteKit demo route (`src/routes/demo/+page.svelte`, `src/routes/demo/playwright/+page.svelte`, `src/routes/demo/playwright/page.svelte.e2e.ts`) once the new smoke specs are in place. It is not linked from `rootNav` or any production page.
- **BREAKING (test config only)**: smoke specs live in `e2e/` and continue to be matched by the existing `**/*.e2e.{ts,js}` pattern; no Playwright config change is required, but the demo `page.svelte.e2e.ts` test goes away with the route.

## Capabilities

### New Capabilities

- `chessboard-examples-smoke`: Playwright smoke coverage for the chessboard example routes — what each route's smoke spec must verify (hydration marker, board mount via library DOM markers, control visibility), the page-error trapping rule, and the page-level test selectors.
- `app-hydration-marker`: A site-wide hydration marker that signals "SvelteKit hydration completed" by adding `app-started` to `<html>` from the root layout's `onMount`. Specifies the marker location, lifecycle, and that it must not appear during SSR.

### Modified Capabilities

(none — the example shell, examples-minimal, and examples-live-grid specs do not change requirements; we only add new selectors documented in the new smoke capability.)

## Impact

- Code touched:
  - `src/routes/+layout.svelte` — add `onMount` that sets `document.documentElement.classList.add('app-started')`.
  - `src/routes/chessboard/examples/live-games-grid/LiveCard.svelte` — add `data-testid="live-game-card"` on the `<article>` and `data-testid="live-board-link"` on the overlay `<a>`. No visual or behavioral change.
  - New tests under `e2e/` (or kept colocated under `src/routes/...` — see design): four smoke specs plus a small `page-errors.ts` helper.
  - Delete `src/routes/demo/+page.svelte`, `src/routes/demo/playwright/+page.svelte`, `src/routes/demo/playwright/page.svelte.e2e.ts`, and the empty `src/routes/demo/` directory.
- Tooling: no change to `playwright.config.ts`, `eslint.config.js`, or `package.json` scripts. `npm run test:e2e` already runs `playwright install && playwright test`.
- Runtime: no production behavior change. The `app-started` class on `<html>` is browser-only and is not used by any CSS rule.
- Docs/specs: two new spec files under `openspec/specs/`. The existing `chessboard-example-shell`, `chessboard-examples-minimal`, and `chessboard-examples-live-grid` specs are unchanged.
