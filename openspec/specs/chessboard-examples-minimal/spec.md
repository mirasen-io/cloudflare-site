# chessboard-examples-minimal Specification

## Purpose

Defines the `/chessboard/examples/minimal` route: an interactive Mirasen Chessboard example mounted entirely on the library's defaults, with orientation, reset, and random-move controls, the Mirasen/Skeleton visual system (no outer card), full-viewport-width board on mobile, polished desktop layout, correct SEO metadata, local package consumption, and SSR-safe Svelte 5 runes-correct implementation.

## Requirements

### Requirement: Minimal example mounts a board using library defaults only

The route `/chessboard/examples/minimal` SHALL render an interactive Mirasen Chessboard built entirely on the library's defaults. It MUST NOT supply `extensions`, `state`, `pieceUrls`, or any renderer/promotion factory configuration from the site.

#### Scenario: Page mounts the board via the default useBoard call shape

- **WHEN** a visitor navigates to `/chessboard/examples/minimal`
- **THEN** the page SHALL mount the board by calling `useBoard(() => boardEl, (b) => b.setMovability({ mode: 'free' }))` with no third `options` argument
- **AND** the resulting `createBoard` call SHALL receive only `{ element }`

#### Scenario: No site-side renderer or promotion configuration

- **WHEN** the Minimal page's bundle is inspected
- **THEN** it SHALL NOT contain a call to `builtInExtensionFactoryMap.renderer({ pieceUrls: ... })`
- **AND** SHALL NOT contain a call to `builtInExtensionFactoryMap.promotion({ pieceUrls: ... })`
- **AND** SHALL NOT contain a `pieceUrls` object literal mapping piece codes to URLs

#### Scenario: Default extensions provide the expected behaviors

- **WHEN** the board has mounted with library defaults
- **THEN** the visitor SHALL be able to drag pieces and use release-targeting to move them
- **AND** the board SHALL show last-move highlighting after a move
- **AND** the visitor SHALL be able to draw circles and arrows via right-click annotations (provided by the library's default `annotations` extension)
- **AND** the page SHALL NOT need to install or configure any extension itself to obtain these behaviors

### Requirement: Minimal example exposes orientation, reset, and random-move controls

The Minimal example SHALL provide a control row above the board styled with the existing `.btn` primitive.

#### Scenario: Free movement

- **WHEN** the board has mounted
- **THEN** the page SHALL call `setMovability({ mode: 'free' })` so any piece may move to any square

#### Scenario: Orientation toggle

- **WHEN** a visitor clicks the orientation button
- **THEN** the board SHALL flip between white and black orientation
- **AND** the button label SHALL reflect the current orientation (e.g. `Orientation: white` ↔ `Orientation: black`)

#### Scenario: Reset position

- **WHEN** a visitor clicks the reset button
- **THEN** the board SHALL call `setPosition('start')`
- **AND** the board SHALL clear any current selection via `select(null)`

#### Scenario: Random move

- **WHEN** a visitor clicks the random-move button
- **THEN** the page SHALL call `randomMove(board.current)` from `src/lib/board/utils.ts`
- **AND** the board SHALL move a randomly chosen existing piece to a different randomly chosen square via `board.move({ from, to })`

### Requirement: Minimal example uses the Mirasen/Skeleton visual system

The Minimal example SHALL be visually consistent with the rest of the site by reusing the existing semantic classes.

#### Scenario: Page shell and section structure

- **WHEN** the Minimal page renders
- **THEN** it SHALL wrap content in `<main class="page-shell">`
- **AND** SHALL use `site-section` to scope the example, with `kicker`, `section-title`, `section-lead`, and `section-actions` styling the copy block
- **AND** the page SHALL NOT wrap the example layout (or the board area) inside a padded `card` / `<article class="card ...">` container — the legacy "padded board card contains everything" model is explicitly rejected

#### Scenario: Buttons use the .btn primitive

- **WHEN** the control row renders
- **THEN** every control button SHALL carry the `btn` class with an appropriate Skeleton preset (e.g. `preset-tonal` or `preset-filled-primary-500`)

#### Scenario: Example-specific layout uses the central CSS

- **WHEN** the page lays out the copy column and the board area
- **THEN** it SHALL use the example-shell layout classes published in `mirasen-examples.css` — `.example-layout`, `.example-copy`, `.example-board-area`, `.example-controls`, `.example-board-edge`, `.example-note` — together with the low-level board sizing classes from `board-styles.css` — `.board-wrap`, `.board`
- **AND** the page SHALL NOT define page-scoped duplicates of those rules in a `<style>` block
- **AND** the page SHALL NOT use the deprecated `.example-board-panel` class (which previously implied a padded card around the board)

#### Scenario: Mobile board occupies the full viewport width

- **WHEN** a visitor opens the Minimal page on a mobile viewport (≤ 768px wide)
- **THEN** the chessboard SHALL render edge-to-edge across the full viewport width via the `.example-board-edge` class — no horizontal padding from the page-shell, no card padding, and no `max-width` clamp narrower than the viewport SHALL be applied to the board itself
- **AND** the `.example-controls` row above the board and the `.example-note` below the board SHALL remain inside the page-shell's horizontal padding so they stay readable and away from the screen edge
- **AND** this behavior SHALL be load-bearing for the mobile drag comparison against chess.com — making the board narrower than the viewport on mobile is a regression

#### Scenario: Desktop layout remains polished

- **WHEN** a visitor opens the Minimal page on a desktop viewport (> 768px wide)
- **THEN** the page SHALL render `.example-layout` as a two-column grid with copy on the left and the board area on the right
- **AND** `.example-board-edge` SHALL NOT break out to viewport width on desktop
- **AND** the board SHALL respect a reasonable maximum size (e.g. via `.board-wrap` `width: min(100%, 640px)`) so it does not become unreasonably large

#### Scenario: No port of legacy deploy-site CSS

- **WHEN** the Minimal example is implemented
- **THEN** the page SHALL NOT import or include rules ported wholesale from `deploy-site/assets/examples.css`
- **AND** in particular SHALL NOT reintroduce a padded board-card model around the board area

### Requirement: Minimal example exposes correct SEO metadata

The Minimal example SHALL declare SEO metadata via `<svelte:head>` consistent with the existing Examples-index page.

#### Scenario: Canonical and og:url have no trailing slash

- **WHEN** the Minimal page renders
- **THEN** it SHALL emit `<link rel="canonical" href="https://mirasen.io/chessboard/examples/minimal">` (no trailing slash)
- **AND** SHALL emit `<meta property="og:url" content="https://mirasen.io/chessboard/examples/minimal">` (no trailing slash)
- **AND** SHALL emit a `<title>`, `<meta name="description">`, `<meta property="og:title">`, `<meta property="og:description">`, and `<meta property="og:type" content="website">`

### Requirement: Minimal example consumes @mirasen/chessboard locally, not via CDN

The Minimal example MUST consume `@mirasen/chessboard` through the local package import only.

#### Scenario: No CDN imports

- **WHEN** the Minimal page's compiled bundle is inspected
- **THEN** it SHALL NOT contain references to `cdn.jsdelivr.net`, `unpkg.com`, or any other CDN host for `@mirasen/chessboard` or its assets
- **AND** the page source SHALL NOT contain a hardcoded `@mirasen/chessboard@<version>` string

### Requirement: Minimal example is SSR-safe and Svelte 5 runes-correct

The Minimal example SHALL render correctly under SvelteKit SSR and SHALL follow Svelte 5 runes conventions.

#### Scenario: Renders without window on the server

- **WHEN** the Minimal page is server-rendered
- **THEN** rendering SHALL NOT throw and SHALL NOT touch `window`, `document`, or any DOM API
- **AND** the page's static markup and `<svelte:head>` metadata SHALL be present in the SSR output

#### Scenario: Reactive state uses runes

- **WHEN** the Minimal page tracks UI state (e.g. current orientation for the button label)
- **THEN** that state SHALL be declared with `$state` (or `$state.raw` for the board instance)
- **AND** the page SHALL NOT use legacy reactive `let` / `$:` patterns
