## 1. Hydration marker

- [ ] 1.1 In `src/routes/+layout.svelte`, import `onMount` from `svelte` and call `document.documentElement.classList.add('app-started')` inside it. No SSR side effects, no data attribute, no body class.
- [ ] 1.2 Manually verify (`npm run dev`) that the rendered HTML on first paint does not include `app-started` and that, after hydration, `document.documentElement.classList.contains('app-started')` is `true` in the browser console.

## 2. Page-level test selectors

- [ ] 2.1 In `src/routes/chessboard/examples/live-games-grid/LiveCard.svelte`, add `data-testid="live-game-card"` to the root `<article class="live-card">`.
- [ ] 2.2 In the same file, add `data-testid="live-board-link"` to the overlay `<a class="live-card__overlay">`.
- [ ] 2.3 Confirm no other example pages need new `data-testid` attributes — controls are reachable by accessible button name and board mount is reachable via `[data-chessboard-id="board-root"]`.

## 3. Page-error helper

- [ ] 3.1 Create `e2e/utils/page-errors.ts` exporting `trapPageErrors(page: Page): () => void` that:
  - declares `const ALLOWED_CONSOLE_ERRORS: readonly RegExp[] = []` with a comment explaining when entries may be added (initially empty)
  - registers `page.on('pageerror', (err) => pageErrors.push(err))` — listener only collects, never throws
  - registers `page.on('console', (msg) => { if (msg.type() === 'error' && !allowed) consoleErrors.push(msg.text()); })` — listener only collects, never throws
  - returns a synchronous `assertNoPageErrors()` finalizer that throws once with a single multi-line `Error` whose message reports counts plus each captured `pageerror` message (with a short stack excerpt when available) and each captured console-error text
  - is fully self-contained — no Playwright fixture, no global state, one closure per `trapPageErrors` call.
- [ ] 3.2 In each smoke spec, install the helper at the top of the test as `const assertNoPageErrors = trapPageErrors(page);`, perform the navigation/assertions/interaction, then call `assertNoPageErrors();` as the final synchronous step inside the test body. (Equivalently, store it on a context value for `afterEach` — pick one shape and use it consistently across all four specs.)
- [ ] 3.3 Sanity check: temporarily add `console.error('xxx')` inside one example's `onMount` and confirm the corresponding spec fails on the `assertNoPageErrors()` call (not earlier, not as an unhandled rejection) with a message that includes the text `xxx`. Revert before commit.

## 4. Smoke specs

- [ ] 4.1 Create `e2e/chessboard-examples/minimal.e2e.ts`:
  - install `const assertNoPageErrors = trapPageErrors(page);` at the start of the test
  - navigate to `/chessboard/examples/minimal`
  - wait for `html.app-started`
  - assert `<h1>Move pieces freely</h1>` is visible
  - assert exactly one visible `[data-chessboard-id="board-root"]`
  - assert visibility of buttons matching `/^Orientation:/`, `Reset position`, `Random move`
  - click `Random move`; assert `[data-chessboard-id="board-root"]` still visible
  - call `assertNoPageErrors()` as the final step.
- [ ] 4.2 Create `e2e/chessboard-examples/promotion.e2e.ts`:
  - install `const assertNoPageErrors = trapPageErrors(page);`
  - navigate, wait for `html.app-started`
  - assert `<h1>Promotion flow</h1>` is visible
  - assert `[data-chessboard-id="board-root"]` is visible
  - assert visibility of buttons matching `/^Orientation:/`, `Reset position`, `/^Auto-queen:/`
  - click the auto-queen button, assert its accessible name flips between `Auto-queen: off` and `Auto-queen: on`
  - call `assertNoPageErrors()` as the final step.
- [ ] 4.3 Create `e2e/chessboard-examples/chessjs.e2e.ts`:
  - install `const assertNoPageErrors = trapPageErrors(page);`
  - navigate, wait for `html.app-started`
  - assert `<h1>Play against a random-move computer</h1>` is visible
  - assert `[data-chessboard-id="board-root"]` is visible
  - assert visibility of buttons matching `/^Orientation:/`, `Reset`, `/^Auto-queen:/`, `/^Draw:/`, `/^Auto-clear:/`, plus segmented `Desktop`, `Mobile`, `On`, `Off`, `keyboard`, `ctrl`, `shift`, `alt`, `meta`
  - assert text `Your move` is visible
  - click `Reset`; assert `Your move` still visible and board root still visible
  - call `assertNoPageErrors()` as the final step.
- [ ] 4.4 Create `e2e/chessboard-examples/live-games-grid.e2e.ts`:
  - install `const assertNoPageErrors = trapPageErrors(page);`
  - navigate, wait for `html.app-started`
  - assert `<h1>12 boards. 12 engines. Zero shared clocks.</h1>` is visible
  - assert `page.getByTestId('live-game-card')` resolves to exactly 12
  - assert `page.locator('[data-chessboard-id="board-root"]')` resolves to exactly 12
  - assert the first card shows recognizable bot/player metadata (e.g. text `Bot Aurora` and rating `1842`)
  - click the first `[data-testid="live-board-link"]`, assert URL ends with `/chessboard/examples/chessjs`, then wait for `html.app-started` on the destination
  - call `assertNoPageErrors()` as the final step
  - explicitly do NOT wait on randomized timers, status-text changes, or animation completion.

## 5. Remove the old SvelteKit demo route

- [ ] 5.1 Confirm no inbound link to `/demo` or `/demo/playwright` from `src/lib/nav/links.ts`, the example pages, or any other production code.
- [ ] 5.2 Delete `src/routes/demo/playwright/page.svelte.e2e.ts`.
- [ ] 5.3 Delete `src/routes/demo/playwright/+page.svelte` and `src/routes/demo/+page.svelte`.
- [ ] 5.4 Remove the now-empty `src/routes/demo/` directory.
- [ ] 5.5 Verify no other `*.e2e.ts` remains under `src/routes/`.

## 6. Validation

- [ ] 6.1 `npm run lint` passes (Prettier + ESLint).
- [ ] 6.2 `npm run check` passes (svelte-kit sync + svelte-check).
- [ ] 6.3 `npm run build` passes.
- [ ] 6.4 `npm run test:e2e` passes locally — Playwright builds, previews on `:4173`, and runs all four new smoke specs end-to-end. Confirm the demo `*.e2e.ts` is no longer reported and the four new specs are.
- [ ] 6.5 Sanity check the helper: temporarily add `console.error('xxx')` (or `throw new Error('xxx')`) inside one example's `onMount` and confirm the relevant smoke spec fails on the `assertNoPageErrors()` call with a message that includes `xxx` — not as an unhandled rejection, not before the interaction completes. Revert before commit.

## 7. Documentation

- [ ] 7.1 Add a one-paragraph note to `e2e/README.md` (create if absent) explaining the `app-started` hydration convention, the `[data-chessboard-id="board-root"]` board-mount convention, and where to add new example smoke specs. Do not duplicate the spec; link to `openspec/specs/chessboard-examples-smoke/spec.md`.

## 8. Archive trigger

- [ ] 8.1 After the change is merged and validated in CI, run the archive workflow (`/opsx:archive`) so the new specs land under `openspec/specs/`.
