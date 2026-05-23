## 1. Page scaffolding

- [ ] 1.1 Replace `src/routes/chessboard/examples/live-games-grid/+page.svelte` placeholder with the new implementation: `<svelte:head>` metadata (title, description, canonical, og tags) using the canonical strings from the spec, and a `<main class="page-shell live-grid-page">` containing an intro section and a `<section class="live-grid-section">` with a `<div class="live-grid">` populated by an `{#each metaPresets as meta, i (i)}` over twelve `<LiveCard>` instances.
- [ ] 1.2 Define the `metaPresets` array (12 entries) at the top of `+page.svelte` (or in a co-located `meta.ts`) in canonical order: Aurora/Quartz, Cobalt/Saffron, Indigo/Lumen, Onyx/Cinder, Pyrite/Verdant, Mistral/Argent, Cinnabar/Halite, Petrichor/Selene, Tundra/Solstice, Vermillion/Slate, Marigold/Obsidian, Zephyr/Cerise, with their ratings and time-control labels exactly as listed in the spec.
- [ ] 1.3 Render the intro: `<p class="kicker">Live games grid</p>`, `<h1>12 boards. 12 engines. Zero shared clocks.</h1>`, `<p class="section-lead">Each board runs its own chess.js engine on its own randomized timer. Click any board to open the interactive chess.js example.</p>`, plus a `.section-actions` row with a primary `Open the chess.js example` button (`href = resolve('/chessboard/examples/chessjs')`) and a secondary `All examples` button (`href = resolve('/chessboard/examples')`).
- [ ] 1.4 Use `resolve` from `$app/paths` for both intro action `href`s.

## 2. LiveCard component

- [ ] 2.1 Create `src/routes/chessboard/examples/live-games-grid/LiveCard.svelte` that takes `{ meta, index }` props and owns: `boardEl: HTMLDivElement`, a `chess: Chess` binding declared at component scope but **not** initialized to `new Chess()` until inside the browser-only mount path (Decision 8 — `chess`, `board`, and `timeoutId` all begin life together inside the `useBoard` `setup` callback), `timeoutId: ReturnType<typeof setTimeout> | null = null`, `gameVersion = 0`, `statusText = $state(meta.time)`, plus a `defaultStatus = meta.time`.
- [ ] 2.2 Mount the board in `LiveCard` via `useBoard(() => boardEl, setup, { extensions: ['renderer', 'lastMove'] as const })`. Inside `setup`: assign `chess = new Chess()`, call `b.setMovability({ mode: 'disabled' })`, schedule the first tick with `scheduleNext(rand(0, INITIAL_DELAY_MAX_MS))`, and return a teardown function that calls `clearTimer()` and increments `gameVersion`.
- [ ] 2.3 Implement `clearTimer()` (clears `timeoutId` and nulls it), `scheduleNext(delay)` (calls `clearTimer()` then sets `timeoutId = setTimeout(tick, delay)`), and `scheduleReset()` (calls `clearTimer()` then sets `timeoutId = setTimeout(reset, rand(RESET_DELAY_MIN_MS, RESET_DELAY_MAX_MS))`).
- [ ] 2.4 Implement `tick()` with the required sequence so a game-ending move shows its label *immediately* on the same tick:
    1. Capture `const v = gameVersion` at entry; if `v !== gameVersion` later (stale-timer guard), return without mutating anything.
    2. Call `getEndLabel(chess)`. If non-null, set `statusText = label`, call `scheduleReset()`, return.
    3. Compute `const moves = chess.moves({ verbose: true })`. If `moves.length === 0`, set `statusText = getEndLabel(chess) ?? defaultStatus`, call `scheduleReset()`, return.
    4. Pick `selectedMove = moves[Math.floor(Math.random() * moves.length)]`; call `const applied = chess.move(selectedMove)`.
    5. Call `board.current?.move(toBoardMove(applied))` (using `toBoardMove` from `@mirasen/chessboard/adapters/chessjs`).
    6. **Immediately** call `getEndLabel(chess)` again on the post-move position. If non-null (the move just applied was the game-ending move), set `statusText = label`, call `scheduleReset()`, return.
    7. Otherwise call `scheduleNext(rand(MOVE_DELAY_MIN_MS, MOVE_DELAY_MAX_MS))`.
- [ ] 2.5 Implement `reset()` that increments `gameVersion`, calls `clearTimer()`, replaces `chess = new Chess()`, calls `board.current?.setPosition(chess.fen())`, restores `statusText = defaultStatus`, then `scheduleNext(rand(0, INITIAL_DELAY_MAX_MS))`.
- [ ] 2.6 Define module-local constants in `LiveCard.svelte`: `BOARD_COUNT = 12`, `MOVE_DELAY_MIN_MS = 500`, `MOVE_DELAY_MAX_MS = 3000`, `RESET_DELAY_MIN_MS = 1500`, `RESET_DELAY_MAX_MS = 3000`, `INITIAL_DELAY_MAX_MS = 2500`. (BOARD_COUNT is used by the page; keep it co-located with metadata or inline the literal `12` in the page.)
- [ ] 2.7 Define helper `rand(min, max)` returning `min + Math.random() * (max - min)` and `getEndLabel(game)` returning `"Checkmate"` / `"Draw"` / `"Game over"` / `null` based on `chess.js` predicates, ordered: checkmate → draw → game over.
- [ ] 2.8 Render the card markup: `<article class="live-card">` containing `<div class="live-card__row live-card__row--top">` (player-name + player-rating + status), then `<div class="live-card__board-wrap">` containing `<div bind:this={boardEl} class="live-card__board"></div>` and `<a class="live-card__overlay" href={resolve('/chessboard/examples/chessjs')} aria-label={`Open the chess.js example — game ${index + 1}: ${meta.bottomName} vs ${meta.topName}`}></a>`, then `<div class="live-card__row live-card__row--bottom">` (player-name + player-rating). The status `<span class="live-card__status">` renders `{statusText}` and uses `aria-live="off"` (matches legacy demo's quiet pattern; live regions on 12 cards would be noisy).

## 3. CSS in mirasen-examples.css

- [ ] 3.1 Add a `.live-grid-page` selector under the existing `:where([data-theme='mirasen'] ...)` namespacing pattern in `src/routes/mirasen-examples.css`. Apply `max-width: min(1600px, 96vw)` and horizontal centering at the page-shell scope (override `.page-shell`'s default width when combined with `.live-grid-page`).
- [ ] 3.2 Add `.live-grid-intro` (max-width: 760px, bottom margin), styled to match existing kicker/h1/lead/section-actions inside it (no token redefinition; reuse `--mirasen-text`, `--mirasen-muted`, etc).
- [ ] 3.3 Add `.live-grid-section` (full-width container) and `.live-grid` (`display: grid; gap: 16px; grid-template-columns: repeat(1, minmax(0, 1fr))` as the mobile default).
- [ ] 3.4 Add `.live-card` (compact panel: `position: relative; display: flex; flex-direction: column; gap: 6px; padding: 10px; border: 1px solid var(--mirasen-line); border-radius: 14px; background: var(--mirasen-panel); min-width: 0`).
- [ ] 3.5 Add `.live-card__row`, `.live-card__row--top`, `.live-card__row--bottom`, `.live-card__player-name` (truncating with `overflow: hidden; text-overflow: ellipsis; white-space: nowrap`), `.live-card__player-rating` (muted, `font-variant-numeric: tabular-nums`), and `.live-card__status` (uppercase, accent color via `--mirasen-accent` or its tonal variant, `font-size: 11px; letter-spacing: 0.06em`).
- [ ] 3.6 Add `.live-card__board-wrap` (`position: relative; aspect-ratio: 1 / 1; border-radius: 6px; overflow: hidden`), `.live-card__board` (`position: absolute; inset: 0`), and `.live-card__board svg` (`display: block; width: 100%; height: 100%`).
- [ ] 3.7 Add `.live-card__overlay` (`position: absolute; inset: 0; z-index: 2; display: block; border-radius: inherit`) and `.live-card__overlay:focus-visible` (`outline: 2px solid var(--mirasen-accent); outline-offset: 2px`).
- [ ] 3.8 Add a small-viewport breakpoint (`@media (max-width: 560px)`) that shrinks `.live-grid` gap (e.g. `12px`), `.live-card` padding (e.g. `8px`), and lets `.live-grid-page` use the full available viewport width (drop the `min(1600px, 96vw)` clamp under that breakpoint, or set `max-width: 100%`).
- [ ] 3.9 Add the responsive column-count rules: `@media (min-width: 560px) { .live-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }`, `@media (min-width: 960px) { .live-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }`, `@media (min-width: 1320px) { .live-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }`. Tune the exact pixel values during smoke-testing so the inner board never falls below ~190px wide; the column-count progression (1→2→3→4) is the contract.
- [ ] 3.10 Verify (via search) that no `--mirasen-*` token is redefined in any file as part of this change, and that `src/routes/board-styles.css`, `src/routes/mirasen-styles.css`, and `src/routes/mirasen-theme.css` are untouched.

## 4. Imports and types

- [ ] 4.1 Import `Chess` from `chess.js` inside `LiveCard.svelte`.
- [ ] 4.2 Import `toBoardMove` from `@mirasen/chessboard/adapters/chessjs` inside `LiveCard.svelte`.
- [ ] 4.3 Import `useBoard` from `$lib/board/use.svelte` inside `LiveCard.svelte`.
- [ ] 4.4 Import `resolve` from `$app/paths` inside `LiveCard.svelte` (for the overlay `href`) and in `+page.svelte` (for the action buttons).
- [ ] 4.5 Confirm `LiveCard.svelte` does NOT import `builtInExtensionFactoryMap`, `DefaultBuiltinChessboardExtensions`, or any `pieceUrls`-related symbol.

## 5. Validation

- [ ] 5.1 Run `npm run lint` and fix any prettier/eslint failures introduced by the new files.
- [ ] 5.2 Run `npm run check` (svelte-check) and fix any type errors. Pay attention to the typed extension tuple — `extensions: ['renderer', 'lastMove'] as const` — so `b.extensions` is correctly inferred to expose only `renderer` and `lastMove`.
- [ ] 5.3 Run `npm run build` and confirm the route compiles into the static build output without warnings related to live-games-grid.

## 6. Manual smoke test

- [ ] 6.1 Start `npm run dev`, open `/chessboard/examples/live-games-grid`, confirm 12 cards render with the canonical bot pairs and time-control labels.
- [ ] 6.2 Watch for ~30 seconds: confirm boards animate independently (timings are visibly out of sync) and that pieces move on each board.
- [ ] 6.3 Resize the window from a phone-width to a wide-desktop width: confirm the column count progresses 1 → 2 → 3 → 4 and that each layout produces balanced rows (12 / 6 / 4 / 3 rows respectively).
- [ ] 6.4 Wait until at least one card ends a game and confirm the status flips to `Checkmate` / `Draw` / `Game over` on the same tick that delivered the mating/stalemating move (the label should appear with the move, not after another 500–3000 ms move-delay), then resets to the time-control label and resumes moving after the reset delay.
- [ ] 6.5 Click on a card's board: confirm navigation to `/chessboard/examples/chessjs`. Use the browser back button to return.
- [ ] 6.6 Tab through the page: confirm focus ring lands on each card overlay in canonical order.
- [ ] 6.7 Navigate away to `/chessboard/examples` and back to `/chessboard/examples/live-games-grid` several times. Confirm no console errors, no leaked timers, and that boards mount fresh each time.
- [ ] 6.8 Inspect a live-card board in DevTools: confirm there is no selection ring, no legal-target dot, no annotation overlay, and no watermark. Confirm right-click does not produce annotations.
- [ ] 6.9 Search the built output (or the page source) for the strings `cdn.jsdelivr.net`, `chessnutBaseUrl`, and `pieceUrls` — none should appear in the live-games-grid page bundle.
