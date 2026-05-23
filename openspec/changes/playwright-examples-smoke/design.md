## Context

The site has just finished migrating to SvelteKit + Skeleton, and the four example routes (`minimal`, `promotion`, `chessjs`, `live-games-grid`) are the public face of `@mirasen/chessboard`. They use a thin `useBoard` lifecycle helper that calls `createBoard({ element })` from `onMount` (`src/lib/board/use.svelte.ts`). The library is browser-only and does its own DOM via SVG.

Existing test surface today:

- `playwright.config.ts`: `webServer` runs `npm run build && npm run preview` on port 4173, `testMatch: '**/*.e2e.{ts,js}'`. No `testDir`, so any `*.e2e.ts` anywhere is picked up.
- One test exists: `src/routes/demo/playwright/page.svelte.e2e.ts` checks an `<h1>` on the orphaned `/demo/playwright` route. The route is the SvelteKit scaffold; nothing in `rootNav` or production pages links to it.
- `npm run test:e2e` runs `playwright install && playwright test`. `npm run test` runs vitest then e2e.

The chessboard renderer's DOM is highly stable: `src/render/svg/factory.ts` always emits an `<svg>` with `data-chessboard-id="svg-root"` and a `<g data-chessboard-id="board-root">`, plus per-square `data-chessboard-id="square-<sq>"` and per-piece `data-chessboard-id="piece-<code>-<sq>"` from the main renderer. The library's own tests query these markers.

The recursive-mutation crash that motivated this work was a route-level runtime error. Catching `pageerror` and `console.error` in tests would have surfaced it.

## Goals / Non-Goals

**Goals:**

- Catch the obvious smoke regressions on each example route: page didn't load, hydration didn't run, board didn't mount, route threw at runtime, key controls disappeared.
- Use stable signals already in the rendered DOM (the library's `data-chessboard-id`) instead of inventing parallel test markers on board internals.
- Keep tests fast and maintainable: no waits on randomized timers, no coordinate-based moves, no SVG-internal assertions.
- Make the hydration signal a single, fixed convention everywhere (`html.app-started`).
- Remove the orphan SvelteKit demo route and its useless smoke test.

**Non-Goals:**

- No move-execution smoke that depends on simulating drags or pixel coordinates.
- No coverage of board internals (animation tracks, drag preview elements, promotion overlay structure). The library has its own unit tests for those.
- No new abstractions over Playwright's API (no custom fixtures beyond a minimal page-errors helper).
- No visual regression / screenshot tests.
- No change to the example pages' visual design or board behavior.

## Decisions

### 1. Hydration marker: `document.documentElement.classList.add('app-started')` from root layout `onMount`

Add to `src/routes/+layout.svelte`:

```ts
import { onMount } from 'svelte';
onMount(() => {
  document.documentElement.classList.add('app-started');
});
```

Playwright waits with `await page.waitForSelector('html.app-started')` (or `await page.locator('html.app-started').waitFor()`).

**Why this and not the alternatives:**

- `onMount` runs only after Svelte has hydrated in the browser. SSR markup never carries the class, so Playwright cannot accidentally pass on a non-hydrated server response.
- Class on `<html>` (not `<body>` or a `data-` attribute) per the explicit spec from the requester. It is the simplest, framework-agnostic signal and it's stable across page navigations because the layout root persists.
- Not a `data-app-started` attribute: simpler to assert with a CSS-style selector (`html.app-started`) and matches the existing project convention of using class hooks rather than data attributes for DOM state.
- Not `pageshow` / `domcontentloaded`: those fire before Svelte hydration. Tests would race the board mount.
- Not a timeout-based wait: brittle and slow.

### 2. Board mount assertion: query existing `[data-chessboard-id]` attributes

The renderer always emits `data-chessboard-id="svg-root"` and `data-chessboard-id="board-root"` (`chessboard/src/render/svg/factory.ts:11,22`). We assert presence and visibility of `[data-chessboard-id="board-root"]` inside the example board container.

Per page:

- Minimal / Promotion / chess.js: scope to the single `.board-wrap` and assert one `[data-chessboard-id="board-root"]` is visible.
- Live-games grid: assert exactly **12** matches across the page using `page.locator('[data-chessboard-id="board-root"]')` and `expect(...).toHaveCount(12)`.

We do **not** add any board-root `data-testid` ourselves. Doing so would duplicate a stable library marker and create drift if the library renames or relocates the marker (we'd want our tests to follow the library, not maintain a parallel name).

### 3. Page-level `data-testid` only on live-grid card structure

The live-games grid is the only page where structural assertions need a hook the library doesn't provide and accessible labels can't pin down (the overlay link's `aria-label` includes randomized bot names). Add:

- `data-testid="live-game-card"` on the `<article class="live-card">` in `LiveCard.svelte`.
- `data-testid="live-board-link"` on the `<a class="live-card__overlay">` in `LiveCard.svelte`.

These let us assert "12 cards" and "first card's link points to `/chessboard/examples/chessjs`" without scraping class names. No other `data-testid` on board internals or controls — controls are asserted by accessible button name.

### 4. Controls assertion: by accessible button name

All control buttons on the example pages already have human-readable text content (`Orientation: white`, `Reset position`, `Random move`, `Auto-queen: off`, `Draw: right`, `Auto-clear: on`, `Desktop`/`Mobile`, `On`/`Off`, `keyboard|ctrl|shift|alt|meta`). Use `page.getByRole('button', { name: /^Orientation:/ })` etc. No `data-testid` on controls.

For the chess.js page's segmented draw-modifier group we assert all five values with `getByRole('button', { name })` — they are visible buttons.

For the chess.js status pill we assert `'Your move'` is visible via `getByText('Your move')` initially.

### 5. Optional interactivity smoke per page

The point of clicking a control isn't to verify the library — it's to verify the route doesn't throw mid-interaction (the recursive-mutation crash class). For each page, perform exactly one click that exercises real code paths:

- Minimal: click "Random move" once → assert the board is still mounted (`board-root` still visible) and no page error / console error fired.
- Promotion: click "Auto-queen: off" once → assert the button text becomes "Auto-queen: on".
- chess.js: click "Reset" → assert "Your move" status is still visible. Skip drag/move smoke; coordinate moves on SVG are brittle.
- Live grid: click the overlay `<a data-testid="live-board-link">` of the first card → assert URL is `/chessboard/examples/chessjs` and that page hydrates (`html.app-started`).

We explicitly **do not** simulate a legal move via square targeting in chess.js, even though `data-chessboard-id="square-e2"` and `square-e4` exist. SVG hit-testing in headless Chromium is fragile, and a route-level smoke is satisfied by asserting controls work and no error fires.

### 6. Page-error trapping helper

Add `e2e/utils/page-errors.ts`. The helper MUST collect errors only — no throwing inside event listeners. Failure happens later, in the synchronous Playwright test flow, via an explicit assertion the spec calls.

```ts
import type { Page } from '@playwright/test';

const ALLOWED_CONSOLE_ERRORS: readonly RegExp[] = [
  // Add entries only with a comment explaining the third-party source.
];

export function trapPageErrors(page: Page): () => void {
  const pageErrors: Error[] = [];
  const consoleErrors: string[] = [];

  page.on('pageerror', (err) => {
    pageErrors.push(err);
  });

  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    if (ALLOWED_CONSOLE_ERRORS.some((pattern) => pattern.test(text))) return;
    consoleErrors.push(text);
  });

  return function assertNoPageErrors(): void {
    if (pageErrors.length === 0 && consoleErrors.length === 0) return;
    const lines: string[] = [];
    if (pageErrors.length > 0) {
      lines.push(`Captured ${pageErrors.length} uncaught page error(s):`);
      for (const err of pageErrors) {
        lines.push(`  - ${err.message}`);
        if (err.stack) lines.push(err.stack.split('\n').slice(1, 4).map((l) => `    ${l}`).join('\n'));
      }
    }
    if (consoleErrors.length > 0) {
      lines.push(`Captured ${consoleErrors.length} console.error message(s):`);
      for (const text of consoleErrors) lines.push(`  - ${text}`);
    }
    throw new Error(lines.join('\n'));
  };
}
```

Per-spec usage:

```ts
test('minimal example renders', async ({ page }) => {
  const assertNoPageErrors = trapPageErrors(page);
  await page.goto('/chessboard/examples/minimal');
  await page.locator('html.app-started').waitFor();
  // … assertions and one interaction …
  assertNoPageErrors();
});
```

`afterEach` is acceptable as an alternative wiring (store the finalizer on a context value the `afterEach` reads), but the simple "call at the end of the test body" form is preferred — it keeps the failure point obvious in test output and avoids a custom fixture.

**Why this shape:**

- Throwing inside `page.on('pageerror', ...)` runs the throw on the Playwright Node-side event-emitter callback. It does not abort the in-flight test step; it surfaces as an unhandled rejection at best and a confusing transcript at worst. Collecting and asserting later keeps failures inside the normal test flow with a clean stack.
- A returned `assertNoPageErrors()` makes the assertion visible at the call site and lets specs sequence it after their interactions, so the captured set is complete.
- Initial allowlist is empty. New entries require a code comment naming the third-party source and the text being suppressed.

This is the catch for "page mounts and looks right but something threw." It would have caught the recursive-mutation crash.

### 7. Test layout

Move the smoke specs to a top-level `e2e/` directory:

```
e2e/
  chessboard-examples/
    minimal.e2e.ts
    promotion.e2e.ts
    chessjs.e2e.ts
    live-games-grid.e2e.ts
  utils/
    page-errors.ts
```

`playwright.config.ts` already matches `**/*.e2e.{ts,js}` from the project root, so no config change is required. Keeping them under `e2e/` separates production code from test code — and the demo route's colocated test goes away with the route.

### 8. Demo route removal

`/demo` and `/demo/playwright` are SvelteKit scaffolded routes with no inbound links from `rootNav` (`src/lib/nav/links.ts:65-77`) or any production page. The only thing that references them is the demo's own e2e test. After the new smoke specs are in, delete:

- `src/routes/demo/+page.svelte`
- `src/routes/demo/playwright/+page.svelte`
- `src/routes/demo/playwright/page.svelte.e2e.ts`
- the empty `src/routes/demo/` directory

Nothing in `src/lib/board/`, the example pages, or shared CSS depends on them. The smoke specs we add cover the same "something renders" purpose with much more value.

## Risks / Trade-offs

- **[Risk] Randomized timers in live-games grid cause flake** → Mitigation: assert structure (12 cards, 12 board roots, link target) and hydration only. Do not wait for any move to occur. Don't assert status text values, since `LiveCard` flips between `meta.time` and game-end labels.
- **[Risk] SSR vs hydration timing** → Mitigation: every test waits on `html.app-started` first, before any board assertion. Since `onMount` only runs in the browser, the marker is the canonical "hydrated" signal.
- **[Risk] Brittle board DOM selectors** → Mitigation: use only `data-chessboard-id="board-root"` (and `="svg-root"` if needed) — these are the most stable nodes the library emits and are query targets in the library's own tests. Avoid square/piece markers and animation/drag internals.
- **[Risk] Removing demo route deletes something useful** → Mitigation: confirmed `rootNav` does not link to `/demo`; only the demo's own page references it. Removal is contained to the `demo/` subtree.
- **[Risk] `console.error` allowlist drift** → Mitigation: start with no allowlist. Only add entries with a comment explaining the third-party source if real noise appears.
- **[Trade-off] No move-execution smoke for chess.js** → Accepted. Coordinate-based SVG drag is the wrong tool here. Route-level smoke is enough; the library's own tests cover move mechanics.
- **[Trade-off] Tests run against `npm run preview` build, not dev** → Already the project default and matches what users see. Slower startup but no Vite HMR confusion.
