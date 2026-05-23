## 1. Smallest possible useBoard widening

- [x] 1.1 Update `src/lib/board/use.svelte.ts` to add an optional third argument `options?: { readonly extensions?: TExt; readonly state?: RuntimeStateInitOptions }` (typed against `ChessboardExtensionInput` / `RuntimeStateInitOptions` from `@mirasen/chessboard`). Make the helper generic over `TExt` so the returned `Chessboard<TExt>` typing flows through when callers do supply `extensions`.
- [x] 1.2 In the body of `onMount`, build the init payload as `{ element: getElement(), ...(options ?? {}) }` so that an omitted/`undefined` `options` argument is indistinguishable from passing only `{ element }` to `createBoard` (i.e. the package's `DefaultBuiltinChessboardExtensions` apply).
- [x] 1.3 Confirm by review that the existing call shape `useBoard(getElement, setup)` (no third argument) still type-checks and runs with no behavior change.
- [x] 1.4 Confirm by `grep -r 'useBoard' src/` that no current call site needs to change.

## 2. Example-page layout CSS in mirasen-examples.css

- [x] 2.1 Create `src/routes/mirasen-examples.css` containing the example-page layout primitives:
  - `.example-layout` — two-column grid (copy column + board area).
  - `.example-copy` — vertical flex stack for kicker / title / lead / actions.
  - `.example-board-area` — vertical flex stack for controls + board edge + note.
  - `.example-controls` — flex-wrap row of `.btn` buttons.
  - `.example-board-edge` — transparent flex-center wrapper around `.board-wrap` on desktop; the _only_ element allowed to break out to viewport width on mobile.
  - `.example-note` — small muted helper text under the board.
- [x] 2.2 Wire `mirasen-examples.css` into `src/routes/layout.css` via `@import './mirasen-examples.css';` (placed next to the existing `mirasen-styles.css` and `board-styles.css` imports).
- [x] 2.3 At `max-width: 768px`, collapse `.example-layout` to a single column AND make `.example-board-edge` break out to the full viewport width using:
  ```css
  width: 100vw;
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
  ```
  This cancels the page-shell's 16px gutters so the board renders edge-to-edge on mobile.
- [x] 2.4 Adjust `src/routes/board-styles.css` so `.board-wrap` lets the board fill its container on mobile:
  - Desktop: `.board-wrap { width: min(100%, 640px); margin: 0 auto; }` for a sensible centered max-size.
  - Mobile (≤768px): `.board-wrap { width: 100%; max-width: none; margin: 0; }` so the breakout produces an edge-to-edge board with no max-width clamp narrower than the viewport.
  - Keep `.board { width: 100%; aspect-ratio: 1 / 1; overflow: visible; }` unchanged.
- [x] 2.5 Confirm `.example-controls` and `.example-note` remain inside the page-shell's horizontal padding (i.e. they are NOT inside `.example-board-edge` and do NOT use the breakout) so they stay readable away from the screen edge on mobile.
- [x] 2.6 Confirm by review that no `--mirasen-*` theme token is redefined or overridden, and that no rules from `deploy-site/assets/examples.css` are ported wholesale (in particular, no padded board-card model).

## 3. Minimal example page

- [x] 3.1 Replace `src/routes/chessboard/examples/minimal/+page.svelte` with a Mirasen/Skeleton-styled page that wraps content in `<main class="page-shell"><section class="site-section"><div class="example-layout">…`, with the copy block in `.example-copy` and the board block in `.example-board-area`. The page MUST NOT wrap content in an outer `<article class="card ...">` and MUST NOT use the deprecated `.example-board-panel` class.
- [x] 3.2 In the script block, import only `useBoard` from `$lib/board/use.svelte` and `randomMove` from `$lib/board/utils`. Do **not** import `builtInExtensionFactoryMap`, do **not** import or define any `pieceUrls` / `chessnutPieceUrls` / `createDefaultExampleExtensions`, and do **not** add any new files under `src/lib/board/examples/`.
- [x] 3.3 Mount the board with `useBoard(() => boardEl, (b) => { b.setMovability({ mode: 'free' }); })` — no third argument.
- [x] 3.4 Implement orientation toggle (current orientation in `$state`; button label updates accordingly; calls `board.current.setOrientation(...)`).
- [x] 3.5 Implement reset position handler that calls `setPosition('start')` then `select(null)`.
- [x] 3.6 Implement random-move handler that delegates to `randomMove(board.current)`.
- [x] 3.7 Structure the example body, top-to-bottom inside `.example-board-area`:
  1. `.example-controls` — orientation / reset / random buttons styled with `.btn`.
  2. `.example-board-edge > .board-wrap > .board` — the board, allowed to break out to 100vw on mobile via `.example-board-edge`.
  3. `.example-note` — small muted helper text.
     Use the two-column `.example-layout` grid at desktop (copy on the left, `.example-board-area` on the right). On mobile, the layout collapses to one column and the board breaks out edge-to-edge.
- [x] 3.8 Add `<svelte:head>` SEO: title, description, canonical and og:url both set to `https://mirasen.io/chessboard/examples/minimal` (no trailing slash), og:title, og:description, og:type=website.
- [x] 3.9 Verify Svelte 5 runes correctness: orientation in `$state`, board instance via `$state.raw` (already done by `useBoard`), no `$:` reactive blocks.

## 4. Validation

- [x] 4.1 Run `npm run lint` and resolve any prettier/eslint issues.
- [x] 4.2 Run `npm run check` and resolve any svelte-check / TypeScript issues — pay special attention to the optional generic `TExt` flow through `useBoard` (Minimal must compile with no type assertions).
- [x] 4.3 Run `npm run build` and confirm it succeeds.
- [ ] 4.4 Run `npm run dev` and manually verify on `/chessboard/examples/minimal`:
  - Page renders SSR-first; board mounts on the client with the library's default Chessnut renderer (pieces show without any site-side asset configuration).
  - **On a mobile viewport (≤768px)**, the board occupies the full viewport width edge-to-edge — comparable to chess.com's mobile board sizing — while the controls row above and the note below remain inside the page-shell padding.
  - On desktop (>768px), the board sits in the right column at a reasonable max size with copy on the left.
  - Drag-to-move works; release-targeting works; right-click annotations work; orientation toggle flips the board and updates the label; reset returns to start position and clears selection; random move moves a piece between two distinct squares.
- [x] 4.5 View source on the rendered page and confirm canonical and og:url are exactly `https://mirasen.io/chessboard/examples/minimal` (no trailing slash) and that no CDN URLs or `@mirasen/chessboard@<version>` strings appear in the bundle.

## 5. Out-of-scope confirmation (architectural rule)

- [x] 5.1 Confirm by `git status` / file listing that **no** new files exist under `src/lib/board/examples/` (no `pieces.ts`, no `extensions.ts`, no factory module).
- [x] 5.2 Confirm by `git status` that **no** new file `scripts/sync-chessboard-pieces.mjs` (or any chessboard-asset sync script) exists.
- [x] 5.3 Confirm by `git status` that `static/chessboard/` does not exist and that `package.json` has not added a `predev` / `prebuild` / `prepare` script for syncing chessboard assets.
- [x] 5.4 Confirm by `git diff` that the following files are unchanged: `src/routes/+page.svelte`, `src/routes/chess-lore/`, `src/routes/chessboard/+page.svelte`, `src/routes/chessboard/examples/+page.svelte`, `src/routes/chessboard/examples/promotion/+page.svelte`, `src/routes/chessboard/examples/chessjs/+page.svelte`, `src/routes/chessboard/examples/live-games-grid/+page.svelte`, `src/routes/mirasen-styles.css`. (`src/routes/layout.css` IS modified — it now `@import`s `mirasen-examples.css`.)
- [x] 5.5 Confirm by review that the diff contains no `pieceUrls` literal, no `builtInExtensionFactoryMap.renderer({...})` call, no `builtInExtensionFactoryMap.promotion({...})` call, and no string of the form `@mirasen/chessboard@<version>`.
- [x] 5.6 Confirm by review that no new npm dependencies were added to `package.json`.
