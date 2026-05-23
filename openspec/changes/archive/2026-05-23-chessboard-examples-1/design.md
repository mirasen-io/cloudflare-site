## Context

The legacy `deploy-site/chessboard/examples/minimal.html` was authored against a CDN build of `@mirasen/chessboard@1.3.1` and an older API surface. It explicitly imported `createBoard` and `builtInExtensionFactoryMap`, hand-rolled a Chessnut piece-URL map keyed on the published version, and listed all nine relevant extensions by id. That setup is no longer necessary: the current published package already ships those defaults.

Verified against the locally installed `../chessboard/dist/`:

- `wrapper/factory.js` resolves `extensionsInput = options.extensions ?? DefaultBuiltinChessboardExtensions`, where `DefaultBuiltinChessboardExtensions` (from `extensions/types/wrapper.d.ts`) is the readonly tuple `['renderer', 'watermark', 'selectedSquare', 'lastMove', 'activeTarget', 'legalMoves', 'events', 'autoPromote', 'promotion', 'annotations']`. So `createBoard({ element })` with no other options installs all of those.
- `extensions/first-party/main-renderer/types/internal.js` defines `CHESSNUT_PIECE_URLS` using `new URL('../../../../../assets/pieces/chessnut/<code>.svg', import.meta.url).toString()` and uses it as the renderer's default `pieceUrls`. Because the URLs are resolved through `import.meta.url`, Vite/SvelteKit treats them as standard ES module asset references and bundles them with the site automatically. No site-side asset copy is needed.

The current site has:

- `src/lib/board/use.svelte.ts` — a small lifecycle helper that calls `createBoard({ element: getElement() })` inside `onMount` and runs a `setup` callback after construction. This is exactly the right shape for Minimal (no extensions/state needed).
- `src/lib/board/utils.ts` — already exports `randomMove(board)`.
- `src/routes/board-styles.css` — already declares `.board-wrap` and `.board`.
- `src/routes/mirasen-styles.css` and `src/routes/layout.css` — define the page shell and theme; they should not be touched here.
- A scratch `src/routes/chessboard/examples/minimal/+page.svelte` that uses the helper but renders an unstyled layout and is missing SEO metadata.

The only future example that diverges from the defaults is the planned Live Games Grid route, which intentionally uses a reduced extension set (`renderer + lastMove`) and `setMovability({ mode: 'disabled' })`. This is the single reason `useBoard` needs _any_ widening at all — to let that future page pass `extensions` and/or `state` to `createBoard`. We do that here as a small, additive change so Minimal continues to call the helper exactly as it does today.

## Goals / Non-Goals

**Goals:**

- Land a real, interactive Minimal example at `/chessboard/examples/minimal` that uses the library's defaults and only configures example-specific runtime behavior.
- Keep the page on the existing Mirasen/Skeleton visual system and add only the minimum example-layout CSS.
- Apply the smallest possible widening to `useBoard` that unblocks the future Live Games Grid example without forcing Minimal (or future Promotion / chess.js pages) to pass anything new.

**Non-Goals:**

- Re-create or duplicate any of the library's defaults: no piece-URL maps, no asset copy/sync, no default-extension factory, no renderer or promotion factory wrapping in this site.
- Implement the Promotion, chess.js, or Live Games Grid example pages.
- Restyle existing routes (root, Chess Lore, Chessboard overview, Examples index) or change theme tokens.
- Add new npm dependencies.
- Touch `@mirasen/chessboard` itself. Any default behavior that is missing or wrong is a separate upstream concern.

## Decisions

### 1. Minimal mounts the board with library defaults — no extensions, no state, no piece URLs

The Minimal page calls (through `useBoard`) `createBoard({ element })` with no `extensions` and no `state`. The library installs all default extensions, including the renderer with built-in Chessnut piece URLs resolved via `import.meta.url` from inside `node_modules/@mirasen/chessboard/`. Vite/SvelteKit will bundle and serve those assets as part of the site build. No site-side asset pipeline is added.

After construction, the page calls only:

- `board.setMovability({ mode: 'free' })` — for free movement.
- `board.setOrientation('white' | 'black')` — on the orientation toggle.
- `board.setPosition('start')` and `board.select(null)` — on reset.
- `board.move({ from, to })` via `randomMove(board)` — on random move.

No `builtInExtensionFactoryMap.renderer({ pieceUrls })` or `builtInExtensionFactoryMap.promotion({ pieceUrls })` is constructed in this site for Minimal (or, by the same rule, for the future Promotion and chess.js pages).

**Alternatives considered:**

- Pre-supply Chessnut piece URLs in this site for "stability". Rejected: the URLs already come from the package via `import.meta.url`, and duplicating them couples the site to a package-internal asset path.
- Pass an explicit `extensions: [...]` list "for clarity". Rejected: it duplicates the package's `DefaultBuiltinChessboardExtensions` and silently drifts when the package adds or reorders defaults.

### 2. Smallest possible `useBoard` widening — additive, optional, and unused by Minimal

The current signature is:

```ts
useBoard(
  getElement: () => HTMLElement,
  setup: (board: Chessboard) => (() => void) | void
): { readonly current: Chessboard | null }
```

We add a third optional argument:

```ts
useBoard<TExt extends readonly ChessboardExtensionInput[] = readonly ChessboardExtensionInput[]>(
  getElement: () => HTMLElement,
  setup: (board: Chessboard<TExt>) => (() => void) | void,
  options?: {
    readonly extensions?: TExt;
    readonly state?: RuntimeStateInitOptions;
  }
): { readonly current: Chessboard<TExt> | null }
```

Internally, `createBoard({ element: getElement(), ...options })` runs in `onMount`. `options` is forwarded only when present; passing `undefined` is equivalent to passing nothing — `createBoard` then uses `DefaultBuiltinChessboardExtensions`.

Minimal calls `useBoard(() => boardEl, (b) => { b.setMovability({ mode: 'free' }); })` exactly as today. No third argument.

The future Live Games Grid will pass `useBoard(() => boardEl, (b) => { b.setMovability({ mode: 'disabled' }); }, { extensions: ['renderer', 'lastMove'] as const })`.

**Alternatives considered:**

- Replace `setup` with a single config object (`{ extensions, state, setup }`). Rejected: forces Minimal to change call shape for no benefit, and is a larger surface to spec and review.
- Defer the widening to the change that builds the live-grid page. Rejected: the user's instruction explicitly asks us to propose the smallest widening here so the helper shape is settled before later examples are written. Adding an optional argument is genuinely additive — it does not affect Minimal.

### 3. Page layout reuses the existing Mirasen/Skeleton primitives, but does NOT wrap the example in a card

The page wraps content in `<main class="page-shell">` and structures the copy block with `site-section`, `kicker`, `section-title`, `section-lead`, and `section-actions`. Buttons use the `btn` primitive with appropriate Skeleton presets (`preset-tonal`, optionally `preset-filled-primary-500` for a primary control). The Examples-index page (`src/routes/chessboard/examples/+page.svelte`) is the visual reference for typography and rhythm.

The Minimal page deliberately does **not** wrap the example layout (or the board area) in a padded `card` / `<article class="card ...">` container. The legacy "padded board card contains everything" model from `deploy-site/` is rejected because card padding shrinks the board on mobile, which breaks the chess.com-style mobile drag comparison that Minimal exists to enable.

### 4. Example-layout CSS lives in `src/routes/mirasen-examples.css`; mobile board breaks out edge-to-edge

Add a new stylesheet `src/routes/mirasen-examples.css`, imported from `src/routes/layout.css`, containing the example-page layout primitives:

- `.example-layout` — two-column grid (copy column + board area), collapsing to a single column at the existing 768px breakpoint defined in `mirasen-styles.css`.
- `.example-copy` — vertical flex stack for the copy block (kicker / title / lead / actions).
- `.example-board-area` — vertical flex stack containing the controls row, the board edge wrapper, and the note.
- `.example-controls` — flex-wrap row of `.btn` buttons.
- `.example-board-edge` — the _only_ element allowed to break out of the page-shell on mobile. On desktop it is a transparent flex-center wrapper around `.board-wrap`. On mobile (≤768px) it uses the standard breakout pattern:

  ```css
  width: 100vw;
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
  ```

  This cancels the page-shell's 16px gutters and any other ancestor padding, so the board renders edge-to-edge across the full viewport width — matching how chess.com sizes its mobile board.

- `.example-note` — small muted helper text under the board.

Keep the low-level board sizing rules in `src/routes/board-styles.css`:

- Desktop: `.board-wrap { width: min(100%, 640px); margin: 0 auto; }` so the board has a sensible maximum and is centered.
- Mobile (≤768px): `.board-wrap { width: 100%; max-width: none; margin: 0; }` so the board fills its container — which is now the 100vw `.example-board-edge` — without a max-width clamp narrower than the viewport.
- `.board { width: 100%; aspect-ratio: 1 / 1; overflow: visible; }` is unchanged.

`.example-controls` and `.example-note` deliberately stay inside the page-shell's horizontal padding (i.e. they do _not_ use the breakout). Only the board itself escapes; controls and note stay readable and away from the screen edge.

These rules are written to be reused unchanged by the future Promotion and chess.js pages (which will use the same `.example-layout` shape) and by the intro section of Live Games Grid (which will use a different content area entirely; the breakout pattern can apply there too).

**Alternatives considered:**

- Put example-layout CSS in `board-styles.css` alongside `.board-wrap` / `.board`. Rejected after acceptance review: example-page layout is a different concern than board-element sizing, and a dedicated `mirasen-examples.css` mirrors the existing `mirasen-styles.css` / `mirasen-theme.css` split.
- Wrap the example in an outer `card`. Rejected: the card's padding shrinks the board below viewport width on mobile, defeating the chess.com comparison test that Minimal is built to enable.
- Add the breakout to `.board-wrap` itself. Rejected: that would couple the breakout to every board on the site, including future read-only previews where breaking out is unwanted. Putting the breakout on a dedicated `.example-board-edge` keeps the contract narrow.

### 5. SSR / runes correctness

`createBoard` touches the DOM and must not run on the server. `useBoard` already constructs in `onMount` and tears down in `onDestroy`; the new optional argument does not change that. The page renders its layout, copy, and `<svelte:head>` metadata fully on the server (good for SEO) and only initializes the board on the client. UI state (current orientation for the button label) is held in `$state`. The board instance is stored as `$state.raw` so it is not deeply proxied.

## Risks / Trade-offs

- **[Risk] A future contributor reaches for the legacy CDN-style setup** → Mitigation: the proposal and Minimal page itself should make the "just call `createBoard({ element })`" pattern obvious. The spec for `chessboard-examples-minimal` explicitly forbids site-side renderer/promotion/piece-URL configuration.
- **[Risk] The library default extension list changes upstream** → Mitigation: that is intentional. Minimal opting into "whatever the library defaults are" is the correct coupling. If a default needs to change, that is a package-side change, not a site change.
- **[Risk] `useBoard`'s widening leaks into Minimal's call site by force of habit** → Mitigation: the spec requires Minimal to call `useBoard` with no `options` argument. Code review.
- **[Risk] `100vw` includes the scrollbar width on browsers with persistent scrollbars, causing horizontal overflow** → Mitigation: the breakout only activates at ≤768px, where mobile browsers do not render persistent scrollbars in the typical case. If horizontal overflow ever surfaces, the fix is one rule (`overflow-x: clip`) on the page body or root container; not added preemptively.
- **[Risk] A future example reuses `.example-board-edge` in a context where breakout is undesirable** → Mitigation: the class is named for its purpose (edge-to-edge); contributors who want a contained board should use `.board-wrap` directly without the edge wrapper.
- **[Trade-off] Small surface duplicated across future example pages** (each page repeats the same layout markup) → Acceptable. Component-level abstraction is premature with one real example; revisit when 2–3 example pages exist.

## Migration Plan

1. Apply the small `useBoard` widening (additive 3rd argument).
2. Add `src/routes/mirasen-examples.css` with the example-layout primitives (`.example-layout`, `.example-copy`, `.example-board-area`, `.example-controls`, `.example-board-edge`, `.example-note`) and import it from `src/routes/layout.css`.
3. Adjust `src/routes/board-styles.css` so `.board-wrap` allows the board to fill its container on mobile (no max-width below viewport).
4. Replace `src/routes/chessboard/examples/minimal/+page.svelte` with the real page, using the new layout classes and _no_ outer `card` wrapper.
5. Run `npm run lint`, `npm run check`, `npm run build` and verify in `npm run dev` that the page renders, the board mounts with default Chessnut pieces from the package, the mobile breakout produces a viewport-width board, and the controls behave as specified.
6. Promotion, chess.js, and Live Games Grid are migrated in follow-up changes (out of scope here). They will reuse the same `.example-layout` / `.example-board-edge` shell; only Live Games Grid will use the optional `useBoard` `options` argument.

## Open Questions

- None blocking. The library defaults are confirmed to be sufficient for Minimal; the smallest `useBoard` widening unblocks Live Games Grid; no upstream changes to `@mirasen/chessboard` are required by this site change.
