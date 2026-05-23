# End-to-end tests

Playwright smoke tests for the Mirasen site live here. Run them with `npm run test:e2e` (which builds the site, serves it via `npm run preview` on port 4173, and runs Playwright against it).

## Conventions

- **Hydration**: every test waits for `html.app-started` before asserting anything. The class is added by the root layout's `onMount` callback, so it is the canonical browser-only signal that SvelteKit hydration finished. Do not use timers, `domcontentloaded`, or `networkidle` as a substitute.
- **Board mount**: assert `[data-chessboard-id="board-root"]` from the `@mirasen/chessboard` renderer. Do not add `data-testid` to board internals — the library already emits stable markers.
- **Controls**: identify control buttons by accessible name via `getByRole('button', { name })`. Do not add `data-testid` to control buttons.
- **Page-level test ids**: only the live-games grid uses two — `live-game-card` and `live-board-link` — because their structure isn't reachable via accessible labels alone.
- **Error trapping**: install `trapPageErrors(page)` at the top of each test and call the returned `assertNoPageErrors()` as the final synchronous step. Event listeners in the helper only collect; the assertion fails the test in the normal Playwright flow.
- **No flaky waits**: avoid randomized timers, animation completion, or pixel/coordinate-based moves on the SVG.

To add a new example smoke spec, drop a `*.e2e.ts` file under `e2e/chessboard-examples/`. Playwright picks up any `**/*.e2e.{ts,js}` from the project root.

The full smoke contract lives at [openspec/specs/chessboard-examples-smoke/spec.md](../openspec/specs/chessboard-examples-smoke/spec.md) and the hydration marker contract at [openspec/specs/app-hydration-marker/spec.md](../openspec/specs/app-hydration-marker/spec.md).
