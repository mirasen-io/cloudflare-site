## ADDED Requirements

### Requirement: Each example route has a Playwright smoke spec

The site SHALL maintain one Playwright smoke spec per real chessboard example route under `e2e/chessboard-examples/`, covering `/chessboard/examples/minimal`, `/chessboard/examples/promotion`, `/chessboard/examples/chessjs`, and `/chessboard/examples/live-games-grid`. Specs SHALL be matched by the existing Playwright config's `**/*.e2e.{ts,js}` test pattern.

#### Scenario: Smoke specs exist per route

- **WHEN** the smoke suite is checked in
- **THEN** there SHALL be exactly one `.e2e.ts` file per example route under `e2e/chessboard-examples/`
- **AND** each spec SHALL navigate to its route and exercise the assertions defined for that route

#### Scenario: Specs run via existing test command

- **WHEN** `npm run test:e2e` is executed
- **THEN** Playwright SHALL discover and run all four example smoke specs without changes to `playwright.config.ts`

### Requirement: Every smoke spec waits for the `app-started` hydration marker

Every example smoke spec SHALL wait for the selector `html.app-started` after navigation and before any board or control assertion. Specs MUST NOT rely on timers, `domcontentloaded`, `networkidle`, or arbitrary sleeps as a hydration signal.

#### Scenario: Hydration wait precedes board assertions

- **WHEN** a smoke spec navigates to its example route
- **THEN** the spec SHALL await `page.locator('html.app-started').waitFor()` (or equivalent) before asserting board mount, controls, or status text

### Requirement: Board mount is asserted via `[data-chessboard-id="board-root"]`

Smoke specs SHALL assert that a Mirasen Chessboard instance has mounted by querying the renderer's existing `data-chessboard-id="board-root"` attribute. Specs MUST NOT introduce parallel `data-testid` markers on board internals (the SVG root, board root, squares, pieces, drag layer, animation layer, promotion overlay, or annotation primitives).

#### Scenario: Single-board pages assert one board root

- **WHEN** the minimal, promotion, or chess.js smoke spec runs
- **THEN** it SHALL assert that exactly one element matching `[data-chessboard-id="board-root"]` is visible inside the page's `.board-wrap` (or equivalent scoped container)

#### Scenario: Live-games grid asserts twelve board roots

- **WHEN** the live-games-grid smoke spec runs
- **THEN** it SHALL assert that `page.locator('[data-chessboard-id="board-root"]')` resolves to exactly 12 elements
- **AND** it SHALL assert that there are exactly 12 elements matching `[data-testid="live-game-card"]`

#### Scenario: No site-side test markers on board internals

- **WHEN** an example page or component is modified
- **THEN** it SHALL NOT add a `data-testid` attribute to the SVG board root, square, piece, drag, animation, promotion overlay, or annotation elements
- **AND** smoke specs SHALL NOT depend on coordinate-based pixel positions to identify squares or pieces

### Requirement: Page-level test selectors on live-game cards

The `LiveCard.svelte` component SHALL expose two `data-testid` selectors that are not derivable from accessible labels alone:

- `data-testid="live-game-card"` on the root `<article>` element.
- `data-testid="live-board-link"` on the overlay `<a>` element.

These selectors SHALL be the only `data-testid` attributes added by this change.

#### Scenario: Card and link selectors are present

- **WHEN** the live-games-grid page renders
- **THEN** every `<article class="live-card">` SHALL carry `data-testid="live-game-card"`
- **AND** every `<a class="live-card__overlay">` SHALL carry `data-testid="live-board-link"`

#### Scenario: Overlay link points to chess.js example

- **WHEN** the live-games-grid smoke spec clicks the first `[data-testid="live-board-link"]`
- **THEN** the browser SHALL navigate to `/chessboard/examples/chessjs`
- **AND** the destination page SHALL match `html.app-started` after hydration

### Requirement: Controls are asserted by accessible button name

Smoke specs SHALL identify control buttons via `page.getByRole('button', { name: ... })`. Specs MUST NOT add `data-testid` attributes to control buttons or rely on class names for control selection.

#### Scenario: Minimal example controls

- **WHEN** the minimal smoke spec runs
- **THEN** it SHALL assert visibility of buttons whose accessible names match: `/^Orientation:/`, `Reset position`, `Random move`

#### Scenario: Promotion example controls

- **WHEN** the promotion smoke spec runs
- **THEN** it SHALL assert visibility of buttons whose accessible names match: `/^Orientation:/`, `Reset position`, `/^Auto-queen:/`

#### Scenario: chess.js example controls

- **WHEN** the chess.js smoke spec runs
- **THEN** it SHALL assert visibility of buttons whose accessible names match: `/^Orientation:/`, `Reset`, `/^Auto-queen:/`, `/^Draw:/`, `/^Auto-clear:/`, and segmented buttons `Desktop`, `Mobile`, `On`, `Off`, `keyboard`, `ctrl`, `shift`, `alt`, `meta`
- **AND** it SHALL assert that the text `Your move` is visible after hydration

### Requirement: Per-route interaction smoke

Each smoke spec SHALL perform exactly one user interaction sized to exercise the route's main code path without introducing flake.

#### Scenario: Minimal — random move click

- **WHEN** the minimal smoke spec clicks the `Random move` button
- **THEN** the page SHALL not raise a `pageerror` or browser `console.error`
- **AND** `[data-chessboard-id="board-root"]` SHALL remain visible

#### Scenario: Promotion — auto-queen toggle

- **WHEN** the promotion smoke spec clicks the `/^Auto-queen:/` button
- **THEN** the button's accessible name SHALL flip between `Auto-queen: off` and `Auto-queen: on`

#### Scenario: chess.js — reset

- **WHEN** the chess.js smoke spec clicks the `Reset` button
- **THEN** the status text `Your move` SHALL remain visible
- **AND** `[data-chessboard-id="board-root"]` SHALL remain visible

#### Scenario: Live-games grid — link navigation

- **WHEN** the live-games-grid smoke spec clicks the first `[data-testid="live-board-link"]`
- **THEN** `page.url()` SHALL end with `/chessboard/examples/chessjs`
- **AND** the destination page SHALL satisfy `html.app-started`

### Requirement: Page errors and console errors fail the test via explicit assertion

Smoke specs SHALL capture uncaught page errors and unallowed browser `console.error` calls, and SHALL fail the test via an explicit assertion call inside the normal Playwright test flow. Implementation SHALL live in `e2e/utils/page-errors.ts` and be applied to every smoke spec.

#### Scenario: Helper signature returns an assertion finalizer

- **WHEN** a smoke spec installs the helper
- **THEN** it SHALL call `const assertNoPageErrors = trapPageErrors(page)` at the start of the test (or in a `beforeEach` that hands the finalizer to the test)
- **AND** the helper SHALL return a synchronous `() => void` finalizer that throws if any errors were captured
- **AND** the spec SHALL call `assertNoPageErrors()` at the end of the test body (or in an `afterEach`) so the assertion runs in the normal Playwright test flow

#### Scenario: Event listeners only collect; they do not throw

- **WHEN** the helper registers `page.on('pageerror', ...)` and `page.on('console', ...)`
- **THEN** those listeners SHALL only push captured values into local arrays scoped to the helper invocation
- **AND** those listeners SHALL NOT throw, call `expect(...)`, or otherwise attempt to fail the test asynchronously
- **AND** failure SHALL happen exclusively inside the returned finalizer, on the synchronous test-flow stack

#### Scenario: Uncaught page error fails the test with a useful message

- **WHEN** a route raises an uncaught exception during a smoke spec
- **THEN** the helper SHALL record the `Error` via `page.on('pageerror', ...)`
- **AND** when `assertNoPageErrors()` runs, the thrown error message SHALL include the count of captured page errors and each captured error's `message` (and a stack excerpt where available)

#### Scenario: Unallowed console error fails the test with a useful message

- **WHEN** a smoke spec triggers a browser `console.error` whose text is not matched by any entry in `ALLOWED_CONSOLE_ERRORS`
- **THEN** the helper SHALL push the rendered text into a local array
- **AND** when `assertNoPageErrors()` runs, the thrown error message SHALL include the count of captured console errors and each captured message text

#### Scenario: Allowlist is empty by default and only grows with documented entries

- **WHEN** the helper is first introduced
- **THEN** `ALLOWED_CONSOLE_ERRORS` SHALL be an empty array
- **AND** any future addition to `ALLOWED_CONSOLE_ERRORS` SHALL include an inline code comment naming the third-party source of the noise and the text being suppressed

### Requirement: Smoke specs avoid randomized-timer waits

Smoke specs SHALL NOT wait on randomized timers, animation completion, or game-state changes that depend on `Math.random()` or stochastic intervals. The live-games-grid spec in particular SHALL NOT wait for any move to be applied to any board.

#### Scenario: Live-games grid does not wait for moves

- **WHEN** the live-games-grid smoke spec runs
- **THEN** it SHALL assert structural facts (12 cards, 12 board roots, link target) immediately after hydration
- **AND** it SHALL NOT wait for `LiveCard`'s `tick()` or `reset()` timeouts to fire
- **AND** it SHALL NOT assert any specific status-text value beyond what is statically rendered

### Requirement: Demo route is removed once smoke specs are in place

The legacy SvelteKit demo route at `src/routes/demo/` and its sole Playwright test SHALL be removed once the four example smoke specs exist, because the new specs cover (and exceed) the demo test's smoke purpose. Removal SHALL include `src/routes/demo/+page.svelte`, `src/routes/demo/playwright/+page.svelte`, `src/routes/demo/playwright/page.svelte.e2e.ts`, and the now-empty `src/routes/demo/` directory.

#### Scenario: Demo route is gone

- **WHEN** this change is applied
- **THEN** the directory `src/routes/demo/` SHALL no longer exist
- **AND** no `*.e2e.ts` file under `src/routes/` SHALL remain

#### Scenario: No production link to demo route

- **WHEN** the demo route is removed
- **THEN** no entry in `src/lib/nav/links.ts` SHALL reference `/demo` or `/demo/playwright`
- **AND** no example page SHALL link to the demo route
