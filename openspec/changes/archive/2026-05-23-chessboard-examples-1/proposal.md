## Why

The first interactive chessboard example (`/chessboard/examples/minimal`) is the next route to migrate from the legacy `deploy-site/chessboard/examples/minimal.html` into the SvelteKit/Skeleton/Mirasen site. The legacy page predates the current `@mirasen/chessboard` defaults: it was written against a CDN build and therefore had to pass a renderer factory, a Chessnut piece-URL map, and a long explicit extension list. The current package handles all of that: `createBoard({ element })` with no `extensions` already installs the full default extension set (renderer with built-in Chessnut piece URLs, watermark, selectedSquare, lastMove, activeTarget, legalMoves, events, autoPromote, promotion, annotations). Mirroring the legacy CDN setup in this site would duplicate the library's own defaults — assets, piece URLs, extension list — and bind the site to package-internal version strings. We should not do that. The site should instead consume the library's defaults and only override behavior that is genuinely page-specific (movability, orientation, controls).

## What Changes

- Replace the placeholder `src/routes/chessboard/examples/minimal/+page.svelte` with a real interactive page that mounts a board via the library's defaults — i.e. `createBoard({ element })` (through the existing `useBoard` helper) with **no** explicit `extensions`, **no** explicit `pieceUrls`, and **no** site-side renderer/promotion configuration.
- After mount, set only example-specific runtime behavior: `setMovability({ mode: 'free' })`, orientation toggle, reset position, and random move — using the existing `randomMove` in `src/lib/board/utils.ts`.
- Apply the existing Mirasen/Skeleton visual system to the page (`page-shell`, `site-section`, `kicker`, `section-title`, `section-lead`, `section-actions`, `btn`). Add a small new stylesheet `src/routes/mirasen-examples.css` (imported from `src/routes/layout.css`) with the example-page layout primitives — `.example-layout`, `.example-copy`, `.example-board-area`, `.example-controls`, `.example-board-edge`, `.example-note`. Keep the low-level board sizing rules (`.board-wrap`, `.board`) in `src/routes/board-styles.css`.
- The Minimal page SHALL NOT wrap the example layout (or the board area) in a padded `card` / `<article class="card ...">` container. The legacy "padded board card contains everything" model is rejected because it shrinks the board on mobile.
- On mobile (≤768px), the board itself SHALL render edge-to-edge across the full viewport width via the `.example-board-edge` 100vw breakout pattern. This is load-bearing for chess.com-style mobile drag comparison testing. `.example-controls` and `.example-note` keep the page-shell's horizontal padding so they remain readable.
- Add `<svelte:head>` SEO metadata for `/chessboard/examples/minimal` with a no-trailing-slash canonical and og:url (`https://mirasen.io/chessboard/examples/minimal`), matching the existing Examples-index page pattern.
- Apply the **smallest** widening to `useBoard` that lets a future page (specifically the planned `live-games-grid` route) supply custom `createBoard` options like `extensions: ['renderer', 'lastMove']` or `state`, **without** forcing Minimal/Promotion/chess.js to pass anything beyond what they pass today. Concretely: add an optional `options` argument that defaults to `{}` and is forwarded to `createBoard`. Minimal does not use it.
- Do **not** copy Chessnut SVG assets into `static/`. Do **not** add any piece-asset sync script. Do **not** add `chessnutPieceUrls` / `chessnutPromotionPieceUrls` / `createDefaultExampleExtensions`. Do **not** call `builtInExtensionFactoryMap.renderer({ pieceUrls })` or `builtInExtensionFactoryMap.promotion({ pieceUrls })` for normal examples. Do **not** hardcode any `@mirasen/chessboard@<version>` or asset paths in this site.
- Do **not** change root, Chess Lore, Chessboard overview, the Examples index, or the placeholder routes for `promotion`, `chessjs`, `live-games-grid` in this change.
- Do **not** implement the Promotion, chess.js, or Live Games Grid pages here — only confirm that the small `useBoard` widening will support a future live-grid route without forcing Minimal to do extra work.

## Capabilities

### New Capabilities

- `chessboard-example-shell`: The minimal shared scaffold for example pages — the `useBoard` lifecycle helper (kept narrow but with a small, optional widening for future custom-extension pages) and the small set of example-layout CSS classes shared across example routes. This capability deliberately does **not** include any default-renderer, piece-URL, or default-extension factory: those belong in `@mirasen/chessboard`, not here.
- `chessboard-examples-minimal`: The `/chessboard/examples/minimal` route — what it renders, which interactions it preserves from the legacy page, which controls it exposes, and its SEO metadata. Built on the library's defaults, with no site-side renderer or extension configuration.

### Modified Capabilities

<!-- None. There are no existing specs in openspec/specs/. -->

## Impact

- **Code**:
  - Apply the smallest widening to `src/lib/board/use.svelte.ts` (add an optional 3rd `options?: { extensions?, state? }` argument forwarded to `createBoard`). Existing call shape `useBoard(() => el, (b) => {...})` continues to work unchanged.
  - Replace `src/routes/chessboard/examples/minimal/+page.svelte` with the real interactive page (controls, board mount, SEO). The page does **not** wrap content in an outer `card` and does **not** use `.example-board-panel`.
  - Add a new `src/routes/mirasen-examples.css` containing the example-page layout primitives: `.example-layout`, `.example-copy`, `.example-board-area`, `.example-controls`, `.example-board-edge`, `.example-note`. Wire it into `src/routes/layout.css` via `@import`.
  - Adjust `src/routes/board-styles.css` so `.board-wrap` / `.board` allow the board to fill its container on mobile (no `max-width` clamp narrower than the viewport), enabling the `.example-board-edge` 100vw breakout to result in an edge-to-edge mobile board.
- **Files NOT added** (explicitly out of scope, called out so we do not accidentally re-introduce them):
  - No `scripts/sync-chessboard-pieces.mjs` or any asset-copy script.
  - No `static/chessboard/pieces/...` assets or `.gitignore` entries.
  - No `src/lib/board/examples/pieces.ts`, no `chessnutPieceUrls`, no `chessnutPromotionPieceUrls`.
  - No `src/lib/board/examples/extensions.ts`, no `createDefaultExampleExtensions`, no `createLiveGridExtensions`.
- **APIs**: No external API changes. The only public-shape change inside this site is the optional 3rd argument on `useBoard`.
- **Dependencies**: No new npm dependencies. Continues to use `@mirasen/chessboard` via `file:../chessboard`.
- **SSR**: `createBoard` is browser-only; mounting must remain inside `onMount`. The page must render its layout and SEO without touching `window`.
- **SEO**: Adds canonical/og metadata for the Minimal example route, no trailing slash.
- **Architectural rule (load-bearing)**: The site must not duplicate `@mirasen/chessboard`'s default renderer / promotion / piece setup. Defaults live in the package. Examples that want the defaults pass nothing. The only example that overrides defaults is the future Live Games Grid (renderer + lastMove only, movability disabled), which is enabled by the small `useBoard` widening but is implemented in a later change.
