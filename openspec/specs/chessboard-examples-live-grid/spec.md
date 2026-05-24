# chessboard-examples-live-grid Specification

## Purpose

Defines the `/chessboard/examples/live-games-grid` route: a twelve-board grid where each card mounts an independent Mirasen Chessboard via `useBoard`, runs its own `chess.js` engine on its own randomized timer, and links to the interactive chess.js example.

## Requirements

### Requirement: Live games grid route mounts twelve independent boards via useBoard

The route `/chessboard/examples/live-games-grid` SHALL render twelve independent Mirasen Chessboard instances. Each instance SHALL be mounted via the existing `useBoard` helper from `src/lib/board/use.svelte` using the third-argument options pass-through with `extensions` set to a reduced extension list. The page MUST NOT call `createBoard` directly, MUST NOT introduce a new shared multi-board abstraction, and MUST NOT change the `useBoard` API.

#### Scenario: Twelve boards render

- **WHEN** a visitor navigates to `/chessboard/examples/live-games-grid`
- **THEN** the page SHALL render exactly twelve `.live-card` elements, each containing a `.live-card__board` element that hosts a mounted board
- **AND** each board SHALL be a distinct `Chessboard` instance with its own DOM root

#### Scenario: Each card uses useBoard with reduced extensions

- **WHEN** a card mounts its board
- **THEN** it SHALL invoke `useBoard(() => boardEl, setup, { extensions: ['renderer', 'lastMove'] as const })`
- **AND** the `setup` callback SHALL call `b.setMovability({ mode: 'disabled' })` on the resulting board
- **AND** the page SHALL NOT call `createBoard` directly anywhere in its source

#### Scenario: No new shared multi-board abstraction is introduced

- **WHEN** the live-grid page is implemented
- **THEN** `src/lib/board/use.svelte.ts` SHALL NOT change as part of this work
- **AND** there SHALL NOT be a new `useLiveBoard`, `useMultiBoard`, `createLiveBoardOrchestrator`, or any equivalent helper added to `src/lib/`
- **AND** the live-grid page MAY define a private `LiveCard.svelte` component co-located in `src/routes/chessboard/examples/live-games-grid/` that owns one card's lifecycle

### Requirement: Live boards opt out of all interaction-related default extensions

Each live-grid board SHALL be constructed with the extension tuple `['renderer', 'lastMove'] as const` and no others. The boards MUST NOT receive `selectedSquare`, `activeTarget`, `legalMoves`, `events`, `autoPromote`, `promotion`, `annotations`, or `watermark`. The boards MUST NOT have any selection, drag affordance, legal-target preview, promotion UI, annotations, or watermark visible.

#### Scenario: Reduced extension tuple

- **WHEN** a card mounts its board
- **THEN** the `useBoard` call's `options.extensions` SHALL be exactly `['renderer', 'lastMove'] as const` (string-form built-in identifiers)
- **AND** the call SHALL NOT pass `'selectedSquare'`, `'activeTarget'`, `'legalMoves'`, `'events'`, `'autoPromote'`, `'promotion'`, `'annotations'`, or `'watermark'`

#### Scenario: Movability is disabled

- **WHEN** the `setup` callback runs for a card
- **THEN** it SHALL call `b.setMovability({ mode: 'disabled' })`
- **AND** the page SHALL NOT call `setMovability` with any other mode anywhere in its source

#### Scenario: No interaction visuals

- **WHEN** a visitor clicks or drags a piece on a live-grid card
- **THEN** the board SHALL NOT show a selection ring, a legal-target dot, a promotion picker, or any annotation
- **AND** the board SHALL NOT respond to right-click annotation gestures

### Requirement: Live boards do not duplicate legacy CDN or piece-URL configuration

The live-grid page MUST NOT reproduce the legacy deploy-site piece-URL configuration. It MUST NOT pass any `pieceUrls` map, MUST NOT call `builtInExtensionFactoryMap.renderer({ pieceUrls })`, MUST NOT contain a hardcoded `@mirasen/chessboard` package version string, and MUST NOT reference a CDN URL for the package's pieces. The default `'renderer'` built-in extension already serves the package's bundled Chessnut SVGs.

#### Scenario: No pieceUrls in the live-grid source

- **WHEN** the live-grid page bundle is inspected
- **THEN** it SHALL NOT contain a `pieceUrls` object literal mapping any of `wK`, `wQ`, `wR`, `wB`, `wN`, `wP`, `bK`, `bQ`, `bR`, `bB`, `bN`, `bP` to a URL
- **AND** SHALL NOT contain a `chessnutBaseUrl` constant or any equivalent base-URL string
- **AND** SHALL NOT call `builtInExtensionFactoryMap.renderer(...)` with any options

#### Scenario: No CDN or version-pinned references

- **WHEN** the live-grid page source is searched
- **THEN** it SHALL NOT contain the substring `cdn.jsdelivr.net`
- **AND** SHALL NOT contain any string matching `@mirasen/chessboard@` followed by a version

#### Scenario: No piece-asset pipeline

- **WHEN** the change lands
- **THEN** the site SHALL NOT add a script that copies pieces from `@mirasen/chessboard/assets/pieces/**`
- **AND** SHALL NOT introduce a `static/chessboard/pieces/` directory or any equivalent piece-asset destination

### Requirement: Each live board runs an independent chess.js engine on a randomized timer

Each card SHALL own a private `chess.js` `Chess` instance and a private `setTimeout`-based scheduler that picks a random legal move from `chess.js`, applies it to the engine, then mirrors the move on the board via `toBoardMove(...)` from `@mirasen/chessboard/adapters/chessjs`. The schedulers MUST NOT share game state across cards.

#### Scenario: Per-card chess.js instance

- **WHEN** a card mounts in the browser
- **THEN** it SHALL construct a fresh `new Chess()` inside its browser-only mount path and use it as the only source of truth for that card's legal moves and game-end status
- **AND** the page SHALL NOT share a `Chess` instance, FEN string, or move list across cards

#### Scenario: Tick flow checks for game end before and after each move

- **WHEN** the scheduler fires a tick
- **THEN** the card SHALL first call `getEndLabel(chess)` (returning `Checkmate` / `Draw` / `Game over` / `null` in that priority order)
- **AND** if the result is non-null the card SHALL set `statusText` to that label and call `scheduleReset()` and SHALL NOT mutate the engine or the board
- **AND** otherwise the card SHALL call `chess.moves({ verbose: true })`
- **AND** if the legal-move list is empty the card SHALL set `statusText` to `getEndLabel(chess) ?? defaultStatus` and call `scheduleReset()` and SHALL NOT call `chess.move` or `board.move`
- **AND** otherwise the card SHALL pick one move uniformly at random from the legal-move list
- **AND** SHALL call `chess.move(selectedMove)` to apply it to the engine
- **AND** SHALL call `board.move(toBoardMove(appliedMove))` to mirror it on the board
- **AND** SHALL **immediately** call `getEndLabel(chess)` again on the post-move position
- **AND** if the post-move result is non-null the card SHALL set `statusText` to that label and call `scheduleReset()` (and SHALL NOT call `scheduleNext`)
- **AND** otherwise the card SHALL call `scheduleNext(rand(MOVE_DELAY_MIN_MS, MOVE_DELAY_MAX_MS))`

#### Scenario: Game-ending status is not delayed by one tick

- **WHEN** a card's selected random move is itself the move that ends the game (checkmate, stalemate, or any other game-over condition)
- **THEN** the card SHALL set the corresponding status label and schedule a reset within the same tick callback that applied the move
- **AND** the card SHALL NOT schedule another `tick` after a game-ending move
- **AND** the status label SHALL be visible to the visitor without waiting for the next `[MOVE_DELAY_MIN_MS, MOVE_DELAY_MAX_MS]` interval to elapse

#### Scenario: Independent timers

- **WHEN** twelve cards are mounted
- **THEN** each card SHALL hold its own `setTimeout` id reference (no shared `Set` or page-level timer table)
- **AND** the next-move delay SHALL be drawn fresh per tick from `[MOVE_DELAY_MIN_MS, MOVE_DELAY_MAX_MS] = [500, 3000]` milliseconds
- **AND** the very first tick after mount SHALL be scheduled with a delay drawn from `[0, INITIAL_DELAY_MAX_MS] = [0, 2500]` milliseconds so cards do not move in lock-step

### Requirement: Finished games display a status label and reset after a randomized delay

When a card's `chess.js` instance reports the game is over, the card SHALL display a status label, then reset to a fresh game after a randomized delay. The status label SHALL be one of `Checkmate`, `Draw`, or `Game over` matching the engine's report. The reset delay SHALL be drawn uniformly at random from `[RESET_DELAY_MIN_MS, RESET_DELAY_MAX_MS] = [1500, 3000]` milliseconds.

#### Scenario: Status label on game end

- **WHEN** `chess.isCheckmate()` returns true
- **THEN** the card's `.live-card__status` element SHALL display the text `Checkmate`

#### Scenario: Draw label

- **WHEN** `chess.isCheckmate()` returns false **AND** `chess.isDraw()` returns true
- **THEN** the card's `.live-card__status` element SHALL display the text `Draw`

#### Scenario: Generic game-over label

- **WHEN** `chess.isCheckmate()` and `chess.isDraw()` both return false **AND** `chess.isGameOver()` returns true
- **THEN** the card's `.live-card__status` element SHALL display the text `Game over`

#### Scenario: Reset after randomized delay

- **WHEN** the card has displayed its game-end label
- **THEN** the card SHALL schedule a reset using `setTimeout` with a delay drawn uniformly at random from `[1500, 3000]` ms
- **AND** on reset the card SHALL replace its `Chess` instance with `new Chess()`
- **AND** SHALL call `board.setPosition(chess.fen())` to refresh the board to the starting position
- **AND** SHALL restore the status label to the card's default (the time-control text from its meta preset)
- **AND** SHALL schedule the next move with a delay drawn from `[0, INITIAL_DELAY_MAX_MS] = [0, 2500]` ms

### Requirement: Stale timers and stale board references must not mutate state

The card SHALL guard against stale timer firings using a per-card `gameVersion` counter (or equivalent monotonic generation token) that is incremented on every reset and on unmount. The card SHALL clear its current `setTimeout` id before scheduling any new tick or reset. On unmount, all timers SHALL be cleared and the board SHALL be destroyed via `useBoard`'s built-in teardown path.

#### Scenario: Per-card gameVersion guard

- **WHEN** a scheduled tick callback fires
- **THEN** before mutating the engine or the board, the callback SHALL compare the `gameVersion` value captured at scheduling time against the current `gameVersion` value
- **AND** if the values differ, the callback SHALL return without calling `chess.move`, `board.move`, or `board.setPosition`

#### Scenario: clearTimer before scheduling

- **WHEN** the card schedules a next tick or a reset
- **THEN** it SHALL first clear any pending `setTimeout` via `clearTimeout(timeoutId)` and set the stored `timeoutId` to `null`
- **AND** the card SHALL hold at most one outstanding `setTimeout` id at any time

#### Scenario: Teardown clears timers

- **WHEN** the card unmounts (route navigation away, page reload, hot-module replacement)
- **THEN** the teardown function returned by the `useBoard` setup callback SHALL clear the card's pending `setTimeout` id (if any)
- **AND** SHALL increment `gameVersion` so any in-flight callback that fires after teardown returns early
- **AND** `useBoard`'s `onDestroy` SHALL then call `board.destroy()` on the card's board

#### Scenario: Re-entry creates fresh state

- **WHEN** a visitor navigates away from `/chessboard/examples/live-games-grid` and returns
- **THEN** twelve fresh boards SHALL mount with twelve fresh `Chess` instances and twelve fresh timer states
- **AND** the browser console SHALL NOT log errors during the unmount or remount

### Requirement: Twelve fixed bot meta presets render in their canonical order

The page SHALL render its twelve cards from a fixed array of meta presets, in the canonical order below. Each preset SHALL provide a top player name, top player rating, bottom player name, bottom player rating, and time-control label. The page SHALL display these strings in each card's player rows and default status label.

The canonical order is:

1. Bot Aurora (1842) vs Bot Quartz (1790), `1+0`
2. Bot Cobalt (2014) vs Bot Saffron (1976), `3+2`
3. Bot Indigo (1655) vs Bot Lumen (1702), `5+0`
4. Bot Onyx (2188) vs Bot Cinder (2154), `1+1`
5. Bot Pyrite (1490) vs Bot Verdant (1521), `10+0`
6. Bot Mistral (1901) vs Bot Argent (1888), `2+1`
7. Bot Cinnabar (1733) vs Bot Halite (1768), `0:30`
8. Bot Petrichor (2057) vs Bot Selene (2032), `3+0`
9. Bot Tundra (1610) vs Bot Solstice (1644), `5+3`
10. Bot Vermillion (2229) vs Bot Slate (2205), `1+0`
11. Bot Marigold (1586) vs Bot Obsidian (1570), `15+10`
12. Bot Zephyr (1955) vs Bot Cerise (1942), `3+2`

#### Scenario: Card order matches the canonical preset order

- **WHEN** the page renders
- **THEN** the twelve `.live-card` elements SHALL appear in the canonical order above
- **AND** the first card SHALL show "Bot Aurora" / "1842" and "Bot Quartz" / "1790"
- **AND** the last card SHALL show "Bot Zephyr" / "1955" and "Bot Cerise" / "1942"

#### Scenario: Player names and ratings render in their rows

- **WHEN** a card renders
- **THEN** the top row SHALL contain the top player's name in `.live-card__player-name` and rating in `.live-card__player-rating`
- **AND** the bottom row SHALL contain the bottom player's name and rating in the same classes
- **AND** the top row SHALL also contain a `.live-card__status` element initialized with the preset's time-control text

### Requirement: Each card has an overlay link to the chess.js example

Each card SHALL include an absolutely-positioned `<a class="live-card__overlay">` covering its `.live-card__board-wrap`. The overlay's `href` SHALL be the resolved path for `/chessboard/examples/chessjs`. The overlay SHALL carry an `aria-label` that identifies which game it opens (e.g. "Open the chess.js example — game 3: Bot Lumen vs Bot Indigo").

#### Scenario: Click opens the chess.js example

- **WHEN** a visitor clicks anywhere on a card's board
- **THEN** the browser SHALL navigate to `/chessboard/examples/chessjs`

#### Scenario: Keyboard focus reaches the overlay

- **WHEN** a visitor tabs through the page
- **THEN** each `.live-card__overlay` SHALL be reachable via the `Tab` key in the canonical card order
- **AND** the focused overlay SHALL display a visible focus indicator distinct from the default browser outline

#### Scenario: Accessible label

- **WHEN** assistive technology inspects an overlay link
- **THEN** the link SHALL expose an `aria-label` that includes the destination, the card index, and the two bot names
- **AND** the link SHALL be inside the card's DOM as the last child of `.live-card__board-wrap` (so the SVG board is read first)

### Requirement: Page intro copy and metadata match the canonical strings

The page SHALL render an intro section above the grid containing the kicker `Live games grid`, the H1 `12 boards. 12 engines. Zero shared clocks.`, and the lead `Each board runs its own chess.js engine on its own randomized timer. Click any board to open the interactive chess.js example.`. The page SHALL include the action buttons `Open the chess.js example` (linking to `/chessboard/examples/chessjs`) and `All examples` (linking to `/chessboard/examples`). The `<svelte:head>` SHALL declare the canonical metadata.

#### Scenario: Intro structure

- **WHEN** the page renders
- **THEN** there SHALL be a `<p class="kicker">Live games grid</p>`
- **AND** there SHALL be an `<h1>` whose text content is exactly `12 boards. 12 engines. Zero shared clocks.`
- **AND** there SHALL be a lead paragraph whose text content is exactly `Each board runs its own chess.js engine on its own randomized timer. Click any board to open the interactive chess.js example.`

#### Scenario: Action buttons

- **WHEN** the intro renders
- **THEN** there SHALL be a primary button with text `Open the chess.js example` whose `href` resolves to `/chessboard/examples/chessjs`
- **AND** there SHALL be a secondary button with text `All examples` whose `href` resolves to `/chessboard/examples`

#### Scenario: Page metadata

- **WHEN** the page is requested
- **THEN** the document `<title>` SHALL be `Live games grid — Mirasen Chessboard examples`
- **AND** the `<meta name="description">` SHALL be `Twelve independent Mirasen Chessboard boards running chess.js games on randomized timers.`
- **AND** the `<link rel="canonical">`, `<meta property="og:url">` SHALL both be `https://mirasen.io/chessboard/examples/live-games-grid` (no trailing slash)
- **AND** the `<meta property="og:title">` SHALL match the document title and `<meta property="og:description">` SHALL match the meta description
- **AND** the `<meta property="og:type">` SHALL be `website`

### Requirement: Responsive grid uses balanced explicit column counts

The `.live-grid` container SHALL render its twelve cards as a CSS grid whose column count is set explicitly per breakpoint so that the twelve cards always lay out as `1×12`, `2×6`, `3×4`, or `4×3`. The grid MUST NOT use `auto-fit` or `auto-fill` repeat patterns that could yield unbalanced rows (e.g. `5+5+2`, `7+5`, `4+4+4` interleaved with stragglers, or any other non-rectangular layout).

#### Scenario: Mobile single-column

- **WHEN** the viewport width is below the small breakpoint
- **THEN** `.live-grid` SHALL render exactly `1` column, producing a `1 × 12` layout

#### Scenario: Tablet two-column

- **WHEN** the viewport width is at the small breakpoint and below the medium breakpoint
- **THEN** `.live-grid` SHALL render exactly `2` columns, producing a `2 × 6` layout

#### Scenario: Medium three-column

- **WHEN** the viewport width is at the medium breakpoint and below the large breakpoint
- **THEN** `.live-grid` SHALL render exactly `3` columns, producing a `3 × 4` layout

#### Scenario: Wide four-column

- **WHEN** the viewport width is at the large breakpoint or above
- **THEN** `.live-grid` SHALL render exactly `4` columns, producing a `4 × 3` layout

#### Scenario: Cards are equal-sized within a breakpoint

- **WHEN** any breakpoint is active
- **THEN** every `.live-card` in `.live-grid` SHALL share the same width (via `1fr` columns)
- **AND** every `.live-card__board-wrap` SHALL maintain `aspect-ratio: 1 / 1`

#### Scenario: No JS layout measurement

- **WHEN** the grid layout is computed
- **THEN** the page SHALL NOT use `ResizeObserver`, `window.matchMedia` listeners, or any other JS measurement to set the grid's column count
- **AND** the column count SHALL be determined entirely by CSS media queries

### Requirement: Live grid page uses a wider page-shell than other example pages

The live-grid page SHALL apply a page-shell with a wider maximum width than the standard `.page-shell` used by minimal/promotion/chessjs, sized at `min(1600px, 96vw)`. The intro section SHALL independently cap its content width at `760px` so the kicker, H1, lead, and actions read at a comfortable line length even on wide displays.

#### Scenario: Page-shell width

- **WHEN** the viewport is wider than 1600px
- **THEN** the live-grid page wrap SHALL be at most 1600px wide
- **AND** SHALL be horizontally centered within the viewport

#### Scenario: Intro line length

- **WHEN** the viewport is wide enough that the page wrap exceeds 760px
- **THEN** the intro section SHALL constrain its content width to 760px
- **AND** the grid section SHALL still use the full page-wrap width

#### Scenario: Mobile uses full available width

- **WHEN** the viewport width is at or below the small breakpoint
- **THEN** the live-grid page SHALL use the full available viewport width (no `min(1600px, ...)` clamp shrinking it below 100%)
- **AND** `.live-grid` gap SHALL shrink, and `.live-card` padding SHALL shrink, so cards remain readable on small screens

### Requirement: Live grid CSS lives in mirasen-examples.css and uses Mirasen theme tokens

All live-grid-specific selectors SHALL be added to `src/routes/mirasen-examples.css` under the existing `:where([data-theme='mirasen'] ...)` namespacing pattern. Colors, borders, spacing, and typography SHALL come from existing `--mirasen-*` theme tokens. The change MUST NOT redefine any `--mirasen-*` token. The change MUST NOT modify `src/routes/board-styles.css`, `src/routes/mirasen-styles.css`, or `src/routes/mirasen-theme.css`. The change MUST NOT port the legacy `deploy-site/assets/examples.css` rules wholesale.

#### Scenario: Selectors live in mirasen-examples.css

- **WHEN** the change lands
- **THEN** `src/routes/mirasen-examples.css` SHALL define rules for at least: `.live-grid-page`, `.live-grid-intro`, `.live-grid-section`, `.live-grid`, `.live-card`, `.live-card__row`, `.live-card__row--top`, `.live-card__row--bottom`, `.live-card__player-name`, `.live-card__player-rating`, `.live-card__status`, `.live-card__board-wrap`, `.live-card__board`, `.live-card__overlay`
- **AND** these rules SHALL be wrapped under the `:where([data-theme='mirasen'] ...)` selector pattern

#### Scenario: Theme tokens are reused, not redefined

- **WHEN** live-grid CSS is added
- **THEN** all color, border, surface, and accent values SHALL be expressed via existing `--mirasen-*` custom properties (e.g. `var(--mirasen-line)`, `var(--mirasen-panel)`, `var(--mirasen-text)`, `var(--mirasen-muted)`, `var(--mirasen-accent)` or its variants)
- **AND** SHALL NOT redefine, override, or shadow any `--mirasen-*` token in any file

#### Scenario: board-styles.css and theme files are untouched

- **WHEN** the change lands
- **THEN** `src/routes/board-styles.css` SHALL NOT change as part of this work
- **AND** `src/routes/mirasen-styles.css` SHALL NOT change as part of this work
- **AND** `src/routes/mirasen-theme.css` SHALL NOT change as part of this work

#### Scenario: Legacy CSS is not ported

- **WHEN** the change is reviewed
- **THEN** the diff SHALL NOT contain a wholesale copy of any rule block from `deploy-site/assets/examples.css`
- **AND** `body.live-grid-page .wrap`-style legacy `body`-tag selectors SHALL NOT appear in `mirasen-examples.css`

### Requirement: Each card initializes its mutable game runtime in the browser-only mount path

Each card's mutable game runtime — its `chess.js` instance, its board, its `setTimeout` scheduler, and the cleanup that tears them all down — SHALL be created in the same browser-only mount/destroy lifecycle. The page SHALL NOT call `createBoard`, schedule timers, or touch the DOM at module-evaluation time. The card SHALL NOT instantiate its mutable `Chess` engine on the server, even though doing so would likely be SSR-safe; the live game runtime is not useful on the server, and keeping each `Chess` instance, board instance, timer, and teardown together in one mount/destroy path makes the twelve-board grid easier to reason about.

This is a lifecycle hygiene rule for the live grid, not a hard correctness claim about `chess.js` SSR safety. Server-rendered output SHALL render the static card skeletons (names, ratings, default status text, board-wrap container, overlay link) directly from the `metaPresets` data, and engines/boards/timers SHALL start after hydration.

#### Scenario: SSR markup is complete

- **WHEN** the page is rendered on the server
- **THEN** the response HTML SHALL contain the intro section (kicker, h1, lead, action buttons), the twelve `.live-card` skeletons (player rows with names/ratings, default status text, board wrap, overlay link), and the `<svelte:head>` metadata
- **AND** the response HTML SHALL NOT contain any rendered SVG board (boards mount client-side after hydration)

#### Scenario: Game runtime is created in the browser-only mount path

- **WHEN** a card mounts (i.e. inside the `useBoard` `setup` callback or a co-located `onMount`-equivalent that runs only in the browser)
- **THEN** the card SHALL create its `Chess` instance, install its movability, schedule its first tick, and store its `timeoutId` together within that same mount path
- **AND** the teardown returned from the same mount path SHALL clear the `timeoutId` and increment `gameVersion`
- **AND** the page SHALL NOT call `createBoard`, schedule `setTimeout`/`setInterval`, or read `document.*` / `window.*` at module top level

#### Scenario: Server output reflects metadata only

- **WHEN** the page module is evaluated on the server
- **THEN** the static card skeletons SHALL render from the `metaPresets` data (names, ratings, default status text from `meta.time`, board-wrap container, overlay link)
- **AND** no `Chess` engine state, FEN string, or move list SHALL appear in the server response
- **AND** the absence of a server-side `Chess` instance SHALL NOT change the rendered skeleton
