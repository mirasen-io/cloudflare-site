## Why

`/chessboard/examples/live-games-grid` currently ships as a placeholder that says the page "is being migrated." The real Live Games Grid is one of the most distinctive Mirasen Chessboard demos — twelve independent boards, each running its own chess.js engine on its own randomized timer — and the new SvelteKit/Skeleton site does not yet host it. We need the page to do real work, demonstrate multi-instance orchestration, and route visitors to the interactive `chessjs` example.

This page is also intentionally _not_ like the other example routes. Minimal, Promotion, and chess.js use the library's default extension set through `useBoard`. The live grid wants a deliberately reduced setup (renderer + lastMove only, movability disabled) so each card is cheap, non-interactive, and visually clean — making it the natural place to formalize the "reduced-extensions" path through the existing `useBoard` API.

## What Changes

- Add a new capability `chessboard-examples-live-grid` covering the real `/chessboard/examples/live-games-grid` route.
- Replace the placeholder `+page.svelte` with a real implementation that mounts 12 independent boards, each driven by its own `chess.js` instance and its own randomized timer.
- Use the existing `useBoard` `options.extensions` pass-through (one `useBoard` call per board) to install only the `renderer` and `lastMove` built-in extensions. No new shared abstraction is introduced.
- Disable movability per board (`setMovability({ mode: 'disabled' })`) so live cards do not respond to interaction; an overlay `<a>` per card routes clicks to `/chessboard/examples/chessjs`.
- Preserve old deploy-site tuning constants: `BOARD_COUNT = 12`, `MOVE_DELAY_MIN_MS = 500`, `MOVE_DELAY_MAX_MS = 3000`, `RESET_DELAY_MIN_MS = 1500`, `RESET_DELAY_MAX_MS = 3000`, `INITIAL_DELAY_MAX_MS = 2500`.
- Preserve the 12 fixed bot-pair meta presets (Aurora/Quartz, Cobalt/Saffron, …, Zephyr/Cerise) with their ratings and time-control labels, displayed above and below each board.
- Show in-card status — default to the time-control string, then "Checkmate" / "Draw" / "Game over" when the engine reports the game ended, then reset after a randomized delay.
- Add a balanced responsive grid that prefers 4×3 / 3×4 / 2×6 / 1×12 layouts via explicit CSS breakpoints (no `auto-fill`, no JS measurement).
- Add live-grid page styles to `src/routes/mirasen-examples.css` (page wrap, intro, grid, card panel, overlay link, mobile gap shrink, full-width on small screens). No theme token changes; no port of `deploy-site/assets/examples.css`.
- Update the page metadata to the final title/description/canonical URL.
- **Modified** `chessboard-example-shell` capability: clarify (with a new requirement) that the existing `useBoard` options-pass-through is the supported way to opt out of library defaults, and that nothing new is needed to support a multi-instance page.

## Capabilities

### New Capabilities

- `chessboard-examples-live-grid`: the `/chessboard/examples/live-games-grid` route — its reduced-extension board setup, multi-instance lifecycle and timer-cleanup contract, randomized self-driving game loop with reset behavior, balanced responsive grid layout, fixed bot meta presets, click-through to `/chessboard/examples/chessjs`, page metadata, and the rule that this page does not reproduce legacy CDN/version-pinned piece URL configuration.

### Modified Capabilities

- `chessboard-example-shell`: add an explicit requirement that the existing `useBoard` options pass-through (`{ extensions, state }`) is the supported escape hatch for example pages that need to opt out of library defaults, with the live grid as the canonical multi-instance consumer. No change to the default call shape used by Minimal / Promotion / chess.js.

## Impact

- **New file**: `src/routes/chessboard/examples/live-games-grid/+page.svelte` (real implementation; replaces placeholder).
- **Modified file**: `src/routes/mirasen-examples.css` — adds `.live-grid-page`, `.live-grid-intro`, `.live-grid-section`, `.live-grid`, `.live-card`, `.live-card__row`, `.live-card__player-name`, `.live-card__player-rating`, `.live-card__status`, `.live-card__board-wrap`, `.live-card__board`, `.live-card__overlay`, plus the responsive breakpoint rules. No changes to existing rules.
- **Unchanged**: `src/lib/board/use.svelte.ts` — the helper already supports `options.extensions` pass-through; no API change is required. `src/routes/board-styles.css` is not touched (live-card boards use their own absolutely-positioned `.live-card__board` wrapper, not `.board`/`.board-wrap`).
- **Dependencies**: uses already-installed `chess.js` and `@mirasen/chessboard` (including its `adapters/chessjs` `toBoardMove` helper). No new dependencies.
- **No assets**: no SVG copying, no `static/chessboard/pieces/`, no `predev`/`prebuild` script. The default `renderer` factory carries its own piece URLs from the package's bundled assets.
- **No CDN / no version pinning**: no `https://cdn.jsdelivr.net/npm/@mirasen/chessboard@<version>/...` strings, no `chessnutBaseUrl` constant, no `pieceUrls` literal in this site's source.
- **SSR / lifecycle hygiene**: each card's mutable game runtime (`Chess` instance, board instance, `setTimeout` scheduler, and cleanup) is created together in the browser-only mount path via `useBoard`'s `setup` callback. Static card skeletons (names, ratings, default status text, board-wrap container, overlay link) render server-side from the meta presets; engines/boards/timers start after hydration. This is a lifecycle hygiene rule rather than a hard claim that `new Chess()` is SSR-unsafe — it is likely SSR-safe, just not useful on the server, and co-locating runtime state with the mount path keeps the 12-board grid uniform.
- **Validation**: `npm run lint`, `npm run check`, and `npm run build` should all pass after implementation. Manual smoke against `/chessboard/examples/live-games-grid` confirms 12 boards, balanced rows at common widths, independent animation, automatic reset on game end, and overlay click navigation.
