# chessboard-example-shell Specification

## Purpose

Defines the shared example-page shell for `/chessboard/examples/*` routes: the `useBoard` lifecycle helper contract, the architectural rule that the site does not duplicate `@mirasen/chessboard` library defaults, and the example-page layout CSS contract.

## Requirements

### Requirement: useBoard supports the library default board with no caller configuration

The site SHALL expose a `useBoard` helper at `src/lib/board/use.svelte.ts` that mounts a `@mirasen/chessboard` board on `onMount` and destroys it on `onDestroy`, and that, when called with no extension or state configuration, results in a board constructed via `createBoard({ element })` only — letting the package install its own default extensions.

#### Scenario: Default board call shape

- **WHEN** an example page calls `useBoard(() => boardEl, (b) => { b.setMovability({ mode: 'free' }); })`
- **THEN** the helper SHALL invoke `createBoard({ element: boardEl })` with no `extensions` and no `state`
- **AND** the resulting board SHALL receive whatever default extension set the package installs when `extensions` is omitted (i.e. the package's `DefaultBuiltinChessboardExtensions`)
- **AND** the helper SHALL invoke the provided `setup` callback exactly once with the constructed board

#### Scenario: Board is browser-only

- **WHEN** the host page is rendered on the server
- **THEN** the helper SHALL NOT call `createBoard` and SHALL NOT touch the DOM
- **AND** the page's static markup, copy, and `<svelte:head>` metadata SHALL still render

#### Scenario: Teardown

- **WHEN** the host component unmounts
- **THEN** the helper SHALL invoke any teardown function returned by the `setup` callback
- **AND** SHALL invoke `board.destroy()`

### Requirement: useBoard accepts an optional options argument for custom createBoard config

The `useBoard` helper SHALL accept an optional third argument carrying `extensions` and/or `state`, forwarded as-is to `createBoard`. When the argument is omitted or `undefined`, the helper MUST behave exactly as the no-config case — i.e. `createBoard` MUST be called without `extensions` or `state` so the package's defaults apply.

#### Scenario: Omitted options uses package defaults

- **WHEN** a caller calls `useBoard(getElement, setup)` with no third argument
- **THEN** the helper SHALL NOT pass `extensions` or `state` to `createBoard`
- **AND** the call SHALL be indistinguishable from `createBoard({ element })`

#### Scenario: Custom extensions are forwarded

- **WHEN** a caller calls `useBoard(getElement, setup, { extensions: ['renderer', 'lastMove'] as const })`
- **THEN** the underlying `createBoard` call SHALL receive that exact `extensions` value
- **AND** the returned board's typed `extensions` surface SHALL reflect that tuple

#### Scenario: Custom initial state is forwarded

- **WHEN** a caller calls `useBoard(getElement, setup, { state: { interaction: { movability: { mode: 'disabled' } } } })`
- **THEN** the underlying `createBoard` call SHALL receive that `state` value at construction

### Requirement: useBoard widening does not force existing call sites to change

The new optional `options` argument MUST be purely additive to the helper's existing two-argument call shape. Existing call sites that pass only `(getElement, setup)` MUST keep working unchanged.

#### Scenario: Existing two-argument call shape continues to compile and run

- **WHEN** `src/routes/chessboard/examples/minimal/+page.svelte` calls `useBoard(() => boardEl, (b) => b.setMovability({ mode: 'free' }))`
- **THEN** TypeScript SHALL accept the call without requiring a third argument
- **AND** runtime behavior SHALL be unchanged from the no-options case

### Requirement: Site does not duplicate the library's default board configuration

This site MUST NOT reproduce the library's default renderer, default piece-URL map, or default extension list. Defaults belong to `@mirasen/chessboard`. The site only configures behavior that is genuinely page-specific.

#### Scenario: No site-side default extension factory

- **WHEN** the example shell is implemented
- **THEN** there SHALL NOT be a `createDefaultExampleExtensions`, `createMinimalExampleExtensions`, or any equivalent factory that re-lists the package defaults

#### Scenario: No site-side piece-URL helper

- **WHEN** the example shell is implemented
- **THEN** there SHALL NOT be a `chessnutPieceUrls`, `chessnutPromotionPieceUrls`, or any equivalent helper in this site's source
- **AND** the site SHALL NOT call `builtInExtensionFactoryMap.renderer({ pieceUrls })` or `builtInExtensionFactoryMap.promotion({ pieceUrls })` for normal example pages

#### Scenario: No site-side asset pipeline for chessboard pieces

- **WHEN** the example shell is implemented
- **THEN** the site SHALL NOT contain a script that copies `@mirasen/chessboard/assets/pieces/**` into `static/`
- **AND** the site SHALL NOT add a `static/chessboard/pieces/` directory or any equivalent piece-asset destination
- **AND** `package.json` SHALL NOT add a `predev`/`prebuild`/`prepare` script for syncing chessboard piece assets

#### Scenario: No hardcoded package version or asset path

- **WHEN** the example shell is implemented
- **THEN** the site source SHALL NOT contain a string of the form `@mirasen/chessboard@<version>`
- **AND** SHALL NOT contain a hardcoded reference to a path inside the `@mirasen/chessboard` package's `assets/` tree

### Requirement: Reusable example-layout CSS lives in mirasen-examples.css

Reusable example-page layout CSS SHALL live in `src/routes/mirasen-examples.css`, imported from `src/routes/layout.css`. The lower-level board sizing rules (`.board-wrap`, `.board`) SHALL remain in `src/routes/board-styles.css`. Example-page layout classes SHALL be limited to layout primitives shared between example pages.

#### Scenario: Available example layout classes

- **WHEN** an example page renders board markup
- **THEN** it SHALL be free to use the existing semantic classes from the Mirasen/Skeleton system: `page-shell`, `site-section`, `kicker`, `section-title`, `section-lead`, `section-actions`, `btn`
- **AND** it MAY additionally use example-specific layout classes from `mirasen-examples.css`: `.example-layout`, `.example-copy`, `.example-board-area`, `.example-controls`, `.example-board-edge`, `.example-note`
- **AND** it MAY use the low-level board sizing classes from `board-styles.css`: `.board-wrap`, `.board`

#### Scenario: Mobile board edge-to-edge breakout

- **WHEN** the viewport width is at most 768px
- **THEN** the `.example-board-edge` element SHALL break out of the page-shell's horizontal padding and span the full viewport width using the `width: 100vw; margin-left: calc(50% - 50vw); margin-right: calc(50% - 50vw)` pattern
- **AND** the `.board` inside SHALL remain a perfect square via `aspect-ratio: 1 / 1`
- **AND** `.board-wrap` SHALL NOT impose a `max-width` that would shrink the board below the viewport width on mobile

#### Scenario: Controls and note keep page-content padding on mobile

- **WHEN** the viewport width is at most 768px
- **THEN** `.example-controls` and `.example-note` SHALL remain inside the page-shell's horizontal padding (i.e. they SHALL NOT use the 100vw breakout) so the surrounding page padding keeps them readable and away from the screen edge
- **AND** only the `.example-board-edge` element SHALL break out to the viewport edge

#### Scenario: Desktop layout

- **WHEN** the viewport width is greater than 768px
- **THEN** `.example-layout` SHALL render as a two-column grid with the copy column on the left and the board area on the right
- **AND** `.example-board-edge` SHALL NOT break out — it SHALL behave as a transparent centering wrapper around `.board-wrap`
- **AND** `.board-wrap` SHALL impose a reasonable maximum size (e.g. `min(100%, 640px)`) so the board does not become unreasonably large on wide screens

#### Scenario: No theme token mutations

- **WHEN** the example CSS is added
- **THEN** it SHALL NOT redefine or override values of the `--mirasen-*` theme tokens declared in `src/routes/mirasen-styles.css`

#### Scenario: No legacy CSS port

- **WHEN** building the example layout
- **THEN** rules in `deploy-site/assets/examples.css` SHALL NOT be ported wholesale; only layout primitives needed by the Mirasen-styled examples are added — and explicitly without the legacy "padded board card" model
