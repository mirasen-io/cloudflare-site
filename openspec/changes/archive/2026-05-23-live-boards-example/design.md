## Context

The new SvelteKit/Skeleton site has migrated three of the four chessboard examples (`minimal`, `promotion`, `chessjs`) from the legacy static `deploy-site/` HTML pages. All three use the library's full default extension set through the existing two-argument `useBoard(getElement, setup)` shape.

`/chessboard/examples/live-games-grid` still ships as a placeholder card. The legacy `deploy-site/chessboard/examples/live-games-grid.html` is the reference implementation:

- 12 `<article class="live-card">` elements in a CSS grid (`auto-fill, minmax(220px, 1fr)`).
- Each card mounts a `createBoard({ element, extensions: [renderer({pieceUrls}), 'lastMove'] })` instance.
- Each card runs its own `chess.js` engine, picks a random legal move on a `setTimeout` of 500–3000 ms, applies it via `toBoardMove(...)`, updates the status label, and reschedules.
- When the engine reports `isCheckmate` / `isDraw` / `isGameOver`, the card displays the label, then resets after 1500–3000 ms and starts again.
- Initial first-move delay is randomized 0–2500 ms so the 12 boards do not move in lock-step.
- Each card has bot names + ratings above and below the board, time-control / status text in accent, and an absolutely-positioned `<a class="live-card__overlay" href="/chessboard/examples/chessjs">` covering the board.

Current site state worth carrying forward:

- `useBoard` (in `src/lib/board/use.svelte.ts`) already supports an optional `options.extensions` (and `options.state`) pass-through. The default call shape (no options) is what minimal/promotion/chessjs use; the `options.extensions` shape is the natural escape hatch for the live grid.
- Default renderer (`builtInExtensionFactoryMap.renderer` with no options) ships its own Chessnut piece URLs from the package's bundled assets — verified in `chessboard/src/extensions/first-party/main-renderer/types/internal.ts`. There is no need to pass a `pieceUrls` map from this site, and the existing `chessboard-example-shell` capability explicitly forbids it.
- `chess.js` and `@mirasen/chessboard` (with `adapters/chessjs`'s `toBoardMove`) are already installed.
- `mirasen-examples.css` already houses example-page primitives. `board-styles.css` is for low-level shared sizing (`.board-wrap`, `.board`).

Constraints from the proposal that drive the design:

- No CDN URL strings, no version pins, no `static/chessboard/pieces/` mirror, no `pieceUrls` literal.
- No new shared abstraction unless it pays for itself outside this page.
- Svelte 5 runes; SSR-safe; tear down all 12 boards and all timers on unmount.
- Balanced 12-board grid — never 5+5+2 or 7+5.

## Goals / Non-Goals

**Goals:**

- Replace the placeholder with a real, working live-games-grid page that mirrors the legacy demo in behavior (12 boards, 12 engines, randomized timers, automatic reset).
- Use the existing `useBoard` API as-is; only `options.extensions = ['renderer', 'lastMove']` plus a per-board `setMovability({ mode: 'disabled' })` differ from a default-shape call.
- Keep timer/lifecycle correctness rigorous: every `setTimeout` is tracked and cleared on unmount; per-board `gameVersion` (or equivalent) prevents stale timers from mutating a freshly-reset game.
- Keep the responsive layout simple and predictable: 12 boards laid out as 4×3 / 3×4 / 2×6 / 1×12 via plain CSS media queries, with no JS measurement.
- Land all new CSS in `src/routes/mirasen-examples.css` — no theme-token edits, no `board-styles.css` changes, no wholesale port from `deploy-site/assets/examples.css`.

**Non-Goals:**

- A reusable "multi-board" abstraction. The page owns its 12-instance orchestration locally.
- A CSS framework for live cards. Just enough rules to render the grid and cards cleanly.
- Implementing a real chess engine. Random legal-move selection is the whole policy.
- Full parity with Lichess's live-games board layout (used as visual reference only).
- Carrying over the legacy CDN/version-pinned piece URL config or the `chessnutBaseUrl` constant.

## Decisions

### Decision 1 — Use `useBoard` per board, with `options.extensions`

Render the 12 cards with `{#each metaPresets as meta, i (i)}` and call `useBoard(...)` once per `<LiveCard>` child component. Each call passes `options.extensions = ['renderer', 'lastMove']` and the `setup` callback calls `b.setMovability({ mode: 'disabled' })` and starts the per-board chess.js loop.

**Rationale:**

- `useBoard` already supports this exact shape (`use.svelte.ts:23-32` overload signature). No helper changes needed.
- Each `<LiveCard>` has its own `boardEl`, its own `onMount`/`onDestroy` (via `useBoard`'s lifecycle), its own `chess.js` instance, and its own timer state — naturally avoiding shared mutable game state. This is the cleanest mapping to Svelte 5's component model.
- Component-scoped lifecycle removes the temptation to write a 12-element parallel state array in the page.

**Alternatives considered:**

- **Single page-level `onMount` that creates 12 boards with raw `createBoard`.** Rejected — duplicates the lifecycle work `useBoard` already does, and we'd write our own `onDestroy` loop over a `Chessboard[]` to call `destroy()` on each. No upside.
- **Add a new `useLiveBoard` helper.** Rejected as premature abstraction — there is exactly one consumer. If a second multi-instance page appears later, factor then. The proposal explicitly forbids broad framework abstraction.
- **Loop `useBoard` 12 times in the page itself.** Rejected — `useBoard` registers `onMount`/`onDestroy`, which is awkward inside an `{#each}` loop body (would run for the page, not per iteration). A small `<LiveCard>` component is the idiomatic Svelte-5 fix.

### Decision 2 — Reduced extension set: `['renderer', 'lastMove']`, movability disabled

Pass exactly two extensions: `'renderer'` (string form, no options — picks up the package's built-in Chessnut piece URLs) and `'lastMove'` (string form, no options). Then call `b.setMovability({ mode: 'disabled' })` once in the `setup` callback.

**Rationale:**

- This matches the legacy demo's intent (renderer + lastMove + disabled movability) without any of its CDN / version baggage.
- Omitting `selectedSquare`, `activeTarget`, `legalMoves`, `events`, `autoPromote`, `promotion`, `annotations`, and `watermark` keeps each board cheap and visually clean — 12 instances on screen at once should not paint interaction affordances they can't use.
- String-form extension input (`'renderer'`) hits the public API in `wrapper/types.ts` (`ChessboardExtensionInput = BuiltInExtensionId | BuiltInExtensionInitOptions | AnyExtensionDefinition`) and keeps the call free of `builtInExtensionFactoryMap` imports.

**Alternatives considered:**

- **Pass `builtInExtensionFactoryMap.renderer({ pieceUrls })` to control assets.** Rejected — the existing `chessboard-example-shell` capability forbids this site from constructing a `pieceUrls` map; the package's default renderer already serves the Chessnut SVGs.
- **Use the default extension set then disable everything via setters.** Rejected — wasteful and noisy. The whole point of opting out is to not install extensions you'll immediately silence.
- **Include `events` so we could hook into board events for diagnostics.** Rejected — the loop is fully driven by `chess.js` + a setTimeout. There's nothing to listen for.

### Decision 3 — One `<LiveCard>` component per board, owning its game loop

Create a small inline component (or co-located `LiveCard.svelte`) that takes `meta` and `index` props and owns: its `boardEl` ref, its `chess.js` game, its `useBoard(...)` call, its current `setTimeout` id, and its monotonic `gameVersion` counter.

The component exposes only its DOM. The page just renders the grid and lets each `<LiveCard>` orchestrate itself.

**Rationale:**

- Encapsulates per-board state — no `Array<Live>` table at page scope, no risk of cross-board reference leaks.
- Uses Svelte's standard mount/unmount per component instance: when the route is left, every `<LiveCard>` runs its own `onDestroy`, which is where `useBoard` calls `board.destroy()` and the local `clearTimeout` fires.
- Keeps the `+page.svelte` file readable: it becomes a list of bot pairs and a grid container.

**Alternatives considered:**

- **Inline `{#each ...}` with raw refs and a parallel state array in the page.** Rejected — error-prone (stale-closure timers, leaked DOM nodes, manually-correlated indices), and `useBoard` cannot be called inside an each block.
- **Render the LiveCard component inline within `+page.svelte` (defined in the same file via `<script context="module">` or a local component).** Rejected for clarity — a separate file (`src/routes/chessboard/examples/live-games-grid/LiveCard.svelte`) keeps the page small. (Implementation detail; the spec does not pin file count.)

### Decision 4 — Timer & lifecycle correctness via per-card `gameVersion`

Each `<LiveCard>` keeps a small set of mutable per-card state, all of which is created together inside the browser-only mount path (the `useBoard` `setup` callback or an equivalent `onMount`):

- `let timeoutId: ReturnType<typeof setTimeout> | null = null;`
- `let gameVersion = 0;`
- `let chess: Chess` — assigned to a fresh `new Chess()` inside the mount path (not at module top level and not as a top-of-component default; see Decision 8).

Helper `clearTimer()` clears `timeoutId` and nulls it. Every scheduling helper (`scheduleNext`, `scheduleReset`) calls `clearTimer()` first.

`reset()` increments `gameVersion`, clears the timer, replaces `chess` with `new Chess()`, calls `board.current.setPosition(chess.fen())`, restores the default status, then `scheduleNext(rand(0, INITIAL_DELAY_MAX_MS))`.

`tick()` is structured so a game-ending move shows its label _immediately_, without waiting one more move-delay interval:

1. Capture `const v = gameVersion` at entry. If `v !== gameVersion` later, return without mutating anything (stale-timer guard).
2. Call `getEndLabel(chess)`. If non-null, set `statusText = label`, call `scheduleReset()`, return.
3. Compute `moves = chess.moves({ verbose: true })`. If empty, set `statusText = getEndLabel(chess) ?? defaultStatus`, call `scheduleReset()`, return.
4. Pick one move uniformly at random; call `const applied = chess.move(selected)`.
5. Mirror it on the board: `board.current?.move(toBoardMove(applied))`.
6. **Immediately** call `getEndLabel(chess)` again. If non-null (i.e. the move just applied was the game-ending move), set `statusText = label`, call `scheduleReset()`, return.
7. Otherwise call `scheduleNext(rand(MOVE_DELAY_MIN_MS, MOVE_DELAY_MAX_MS))`.

Cleanup happens in two layers:

1. `useBoard` returns the per-card teardown from `setup` — that teardown calls `clearTimer()` and increments `gameVersion`.
2. `useBoard`'s `onDestroy` then calls `board.destroy()` after the teardown runs.

**Rationale:**

- Mirrors the existing `chessjs` example's pattern (`+page.svelte:38-41, 87-92, 158-160` — `gameVersion`, `clearComputerTimeout`, scheduled-version comparison) — proven correct for this site, so we re-use the idiom rather than inventing something new.
- Belt-and-suspenders: even if a stray `setTimeout` fires after `onDestroy` (e.g. during teardown), the `gameVersion` guard prevents it from calling into a destroyed board. Cleanly returns early; no error.
- The post-move end check (step 6) avoids the user-visible glitch where a checkmate move shows no label until the _next_ tick, ~500–3000 ms later, by which time the engine has already had its game-end status sit silent. With the post-move check, the label flips on the same tick that delivered the mating move.

**Alternatives considered:**

- **Track timers in a top-of-page `Set<NodeJS.Timeout>` and clear all on page unmount.** Rejected — couples timer state to the page rather than the card, which makes per-card reset fiddly. Keeping timers per-card is the natural slot.
- **Use `requestAnimationFrame`-driven scheduler.** Rejected — no animation-frame alignment is needed; `setTimeout` matches the legacy timing model.

### Decision 5 — Balanced responsive grid via explicit breakpoints

Render the grid as `display: grid; grid-template-columns: repeat(<N>, minmax(0, 1fr));` with `<N>` switched at media-query breakpoints:

```
default (mobile, < ~560px):   1 column   → 12 rows of 1
small (≥ ~560px, < ~960px):   2 columns  → 6 rows of 2
medium (≥ ~960px, < ~1320px): 3 columns  → 4 rows of 3
large (≥ ~1320px):            4 columns  → 3 rows of 4
```

(Exact pixel breakpoints will be tuned during implementation against a typical card minimum width of ~220–260px so the live-card aspect-ratio'd board never gets too small. The pattern, not the numbers, is the contract.)

**Rationale:**

- 12 has divisors 1, 2, 3, 4, 6, 12 — every column count we want produces a balanced rectangular layout. No 5+5+2 or 7+5 lines; no auto-fill ambiguity.
- Plain CSS only — no `ResizeObserver`, no JS measurement, no client-only hydration mismatch risk.
- Cards stay the same size _within a breakpoint_ because we use `1fr` columns and `aspect-ratio: 1 / 1` on the inner board wrap. They scale across breakpoints but stay visually consistent at each.

**Alternatives considered:**

- **`grid-template-columns: repeat(auto-fill, minmax(220px, 1fr))` (legacy approach).** Rejected — at intermediate widths it produces 5×3 (with 3 leftover) or 7×2 (with 5 leftover) layouts. Visually unbalanced; the proposal explicitly rules this out.
- **`auto-fit` with `min(220px, 1fr)`.** Same problem; doesn't solve the unbalanced-row issue.
- **JS measurement of viewport width to pick column count.** Rejected — adds a hydration mismatch risk and complexity for no visual gain over breakpoints.

### Decision 6 — CSS lives in `mirasen-examples.css`

All new selectors land in `src/routes/mirasen-examples.css`, namespaced under `:where([data-theme='mirasen'] ...)` to follow the existing low-specificity pattern in that file. Required selectors:

- `.live-grid-page` (page-shell-level wider max-width: `min(1600px, 96vw)`)
- `.live-grid-intro` (max-width 760px), `.live-grid-section`
- `.live-grid` (the responsive grid container; column count varies by breakpoint)
- `.live-card`, `.live-card__row`, `.live-card__row--top`, `.live-card__row--bottom`
- `.live-card__player-name`, `.live-card__player-rating`, `.live-card__status`
- `.live-card__board-wrap` (`aspect-ratio: 1 / 1; position: relative;`), `.live-card__board` (`position: absolute; inset: 0;`), `.live-card__overlay` (`position: absolute; inset: 0; z-index: 2;`)
- A small-viewport block that shrinks `.live-grid` gap and `.live-card` padding.

**No** changes to `board-styles.css` (live-card boards do not use `.board`/`.board-wrap`). **No** changes to `mirasen-styles.css` or `mirasen-theme.css` (no token edits). **No** port from `deploy-site/assets/examples.css` (the styles above are written from scratch against the existing Mirasen theme variables — `--mirasen-line`, `--mirasen-panel`, `--mirasen-text`, `--mirasen-muted`, `--mirasen-accent`/etc — using the _same_ tokens minimal/promotion/chessjs use).

**Rationale:** keeps the layered CSS contract that `chessboard-example-shell` already establishes — `mirasen-examples.css` owns example-page primitives, `board-styles.css` owns shared low-level board sizing, and the two do not overlap.

### Decision 7 — Page wider than other example pages

The live-grid page applies `max-width: min(1600px, 96vw)` at the page-shell level (via `.live-grid-page`) instead of the default `.page-shell` width used by minimal/promotion/chessjs. This is necessary so 4-column rows can actually appear on wide displays without the boards being squashed.

The intro section (kicker, h1, lead, action buttons) is independently capped at `max-width: 760px` so the intro reads at a comfortable line length even when the surrounding wrap is wide.

**Rationale:** the legacy page also widens for the same reason; the existing `.page-shell` is sized for two-column copy + board layouts, not 4-column grids.

### Decision 8 — Game runtime is created in the browser-only mount path

Each card's mutable game runtime — its `Chess` instance, its `Chessboard` instance, its `setTimeout` scheduler, and the cleanup that tears them down — is created together inside the browser-only mount path (the `useBoard` `setup` callback). The card SHALL NOT instantiate `new Chess()` at module top level. The card SHALL NOT instantiate `new Chess()` as a top-of-`<script>` default that would also run during SSR; instead the `chess` binding is declared (`let chess: Chess`) at component scope and assigned inside the mount path.

This is a **lifecycle hygiene rule, not a hard correctness claim about chess.js SSR safety.** `new Chess()` is likely SSR-safe (it does not touch the DOM or any browser-only API). But:

- The live game runtime has no useful meaning on the server — there's no animation, no timer, no movement.
- Keeping each `Chess` instance, board instance, timer, and cleanup in the _same_ mount/destroy lifecycle makes the 12-board grid easier to reason about. Every card has exactly one place where its runtime begins, and exactly one place where it ends.
- Server-rendered output renders the static card skeleton (player rows, default status text from `meta.time`, board-wrap container, overlay link) directly from `metaPresets`. Engines, boards, and timers all start after hydration.

**Rationale:** ensures the grid follows the rule "if a piece of state has a meaningful lifetime tied to a DOM element, instantiate it in the same mount path that creates the DOM element" — which already holds for `useBoard` and the `setTimeout` scheduler. Pulling `new Chess()` into the same mount path keeps the per-card mental model uniform.

**Alternatives considered:**

- **`let chess = new Chess()` at the top of `<script>`.** Rejected — runs on the server, holds a useless engine in the SSR render, and creates two lifecycle origins per card (component init for `chess`, mount for `board`/`timer`). Not buggy, just sloppy.
- **Module-level singleton `chess` constants array.** Rejected — would force shared state across cards (the proposal explicitly forbids this) and breaks the per-card model.

## Risks / Trade-offs

- **12 simultaneous SVG renders, each animated.** → Mitigation: each board uses only `renderer + lastMove`, no extension layers. Default 180 ms animation duration is fine for 12 boards. If anyone reports jank on low-end devices we can pass `animation: { durationMs: 0 }` per board, but this is _not_ required up front.
- **Timer leaks on hot reload / fast route changes.** → Mitigation: per-card `clearTimer()` in the teardown returned by `setup`, plus `gameVersion` guard inside `tick()`. The same idiom protects the chess.js example today.
- **Renderer default piece URLs change in a future package version.** → Acceptable. The whole point of using defaults is to follow the package; if its bundled SVGs change we follow. The existing shell capability already documents this trade-off.
- **CSS breakpoints are width-only, not container-query-based.** → Trade-off: simple and predictable, but a constrained-width parent (e.g. an embedded preview) would not switch column counts even when the live-grid container is narrow. Acceptable — there's no embedding case.
- **Hydration / SSR.** → Mitigation per Decision 8: each card's mutable game runtime (`Chess`, board, timer, cleanup) is created in the same browser-only mount path; static markup (cards, names, ratings, default status text, overlay link) renders server-side from `metaPresets`. No hydration mismatch. This is a hygiene rule rather than a correctness claim — `new Chess()` is likely SSR-safe in itself, but a server-side engine is useless and adds a second lifecycle origin per card.
- **Game-over status visibility.** → Mitigation per Decision 4: `tick()` re-checks `getEndLabel(chess)` _immediately_ after applying a move and flips to the game-over label on the same tick that delivered the mating move. Without this, a checkmate would not display until the next tick fired ~500–3000 ms later.
- **Overlay link covers the board.** → Trade-off: the board is non-interactive by design (`movability: disabled`), so the overlay swallowing pointer events is correct. Keyboard focus on the overlay shows a focus ring (`outline: 2px solid var(--mirasen-accent)` or similar) so users can tab to it. Screen readers get a labelled link describing which game it opens.
- **Shared CSS impact.** → All new rules are scoped via `:where([data-theme='mirasen'] .live-* ...)`. They cannot leak into other example pages.

## Migration Plan

This is a placeholder-to-real migration; there is no schema change, no data migration, no flag.

1. Implement the page and CSS per the Tasks doc.
2. `npm run lint && npm run check && npm run build` must pass.
3. Manual smoke at `/chessboard/examples/live-games-grid`:
   - 12 boards visible.
   - Each board is animating; their move timings are visibly _not_ synchronized.
   - At least one board, given enough time, ends a game and shows "Checkmate" / "Draw" / "Game over" before resetting.
   - Resize the window through the breakpoints; rows stay balanced (1×12 → 2×6 → 3×4 → 4×3).
   - Click on a card: navigates to `/chessboard/examples/chessjs`.
   - Tab to a card: focus ring visible on the overlay link.
   - Navigate away and back: no console errors, no leaked timers, page mounts fresh.

Rollback: revert the commit. The placeholder page returns; no other surface is affected.

## Open Questions

- Exact pixel breakpoints (560 / 960 / 1320 are starting points). To be tuned during implementation against a target minimum card width of ~220–260px so the inner `aspect-ratio: 1 / 1` board never falls below ~190px on its narrow side.
- Whether to render bot meta presets from a `const` array in the page or a co-located `meta.ts`. Implementation detail; the spec only pins the 12 names/ratings/time-controls.
- Whether `<LiveCard>` lives at `src/routes/chessboard/examples/live-games-grid/LiveCard.svelte` or inside `+page.svelte` as a named local component. Implementation detail; preferred answer: separate file for readability.
