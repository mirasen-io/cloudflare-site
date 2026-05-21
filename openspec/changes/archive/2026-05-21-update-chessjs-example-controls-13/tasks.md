## 1. Confirm 1.3 API surface

- [x] 1.1 Inspect the local install at [node_modules/@mirasen/chessboard/](node_modules/@mirasen/chessboard/) to confirm version is on the 1.3 line and that [node_modules/@mirasen/chessboard/dist/extensions/index.d.ts](node_modules/@mirasen/chessboard/dist/extensions/index.d.ts) exports `DefaultMainRendererDesktopConfig` and `DefaultMainRendererMobileConfig`, each with a `.drag` subconfig. (No jsDelivr trip required.) — confirmed 1.3.0; both names re-exported with `.drag` on `MainRendererConfigPublic`.
- [x] 1.2 Confirm via the local TypeScript types that `board.setInteractionConfig` accepts the partial shape `{ drag: { liftedActivation: { thresholdPx } } }` and that `board.extensions.renderer.setConfig` accepts a partial config — read [node_modules/@mirasen/chessboard/dist/](node_modules/@mirasen/chessboard/dist/) directly. Do not modify the library. — confirmed: interaction `setConfig` deep-merges via `toMerged`; renderer `MainRendererSetConfigOptions` is `PartialDeep<...>` minus `pieceUrls`.
- [x] 1.3 Derive the matching jsDelivr `+esm` URL for the page from the confirmed export path: `https://cdn.jsdelivr.net/npm/@mirasen/chessboard@<1.3.x>/extensions/+esm` (the page already imports `builtInExtensionFactoryMap` from this entry, so the same URL is reused). — page already uses `@latest/extensions/+esm`.

## 2. Markup updates in chessjs.html

- [x] 2.1 Shorten the visible label of `#orientationButton` to `White` / `Black` and update its toggle handler accordingly. Add an `aria-label` with the longer phrasing.
- [x] 2.2 Shorten the visible label of `#resetButton` to `Reset`.
- [x] 2.3 Shorten the visible label of `#autoPromoteButton` to `Auto queen: On` / `Auto queen: Off` and update its update handler.
- [x] 2.4 Shorten the visible label of `#drawButton` to `Draw: Right` / `Draw: Primary` (or another similarly compact label) and update its update handler.
- [x] 2.5 Shorten the visible label of `#clearOnCoreButton` to `Auto-clear: On` / `Auto-clear: Off` and update its update handler.
- [x] 2.6 Add a new compact `Drag` control (label `Drag` plus two options `Desktop` / `Mobile`) to `.board-controls`, styled consistently with the existing segmented control. Default-active option: `Desktop`.
- [x] 2.7 Add a new compact `Anim` control (label `Anim` plus two options `On` / `Off`) to `.board-controls`. Default-active option: `On`.

## 3. Script updates in chessjs.html

- [x] 3.1 Add named imports for `DefaultMainRendererDesktopConfig` and `DefaultMainRendererMobileConfig` from the existing `@mirasen/chessboard@latest/extensions/+esm` module URL (or the verified path from task 1.3). The shape can be cross-checked offline against [node_modules/@mirasen/chessboard/dist/extensions/index.d.ts](node_modules/@mirasen/chessboard/dist/extensions/index.d.ts).
- [x] 3.2 Implement a Drag-preset handler that, on `Desktop`, calls `board.setInteractionConfig({ drag: { liftedActivation: { thresholdPx: 0 } } })` and `board.extensions.renderer.setConfig({ drag: DefaultMainRendererDesktopConfig.drag })`.
- [x] 3.3 Implement the Drag-preset `Mobile` branch with `thresholdPx: 5` and `DefaultMainRendererMobileConfig.drag`.
- [x] 3.4 Implement an Anim handler that, on `On`, calls `board.extensions.renderer.setConfig({ animation: { durationMs: 180 } })` and on `Off` calls the same with `durationMs: 0`.
- [x] 3.5 Wire up active-state visuals for the Drag and Anim controls (toggle an `active` class on the selected option).
- [x] 3.6 Confirm `resetGame()` does not touch Drag or Anim state and does not issue any `setInteractionConfig` / `renderer.setConfig` calls related to those controls. — `resetGame()` only touches game state; no new calls added.
- [x] 3.7 Verify the existing existence-check (`if (!orientationButton || ...)`) is updated to include the new control elements so the page fails fast if markup gets out of sync.

## 4. Local CSS in examples.css

- [x] 4.1 In [deploy-site/assets/examples.css](deploy-site/assets/examples.css), add a `.board-controls .button` rule that reduces horizontal padding, lowers `border-radius`, and sets `min-height: 36px`, scoped strictly to `.board-controls`.
- [x] 4.2 If needed, tighten the existing `@media (max-width: 680px)` `.board-controls .button { padding-inline }` further to keep the bar single-screen at 360 CSS pixels wide. — left existing `padding-inline: 12px` rule untouched; new base rule already brings padding to `8px 12px`. Re-tighten only if 5.6 surfaces overflow.
- [x] 4.3 Confirm no rules outside `.board-controls` (and no rules in [styles.css](deploy-site/assets/styles.css)) are modified. — added a single `.segment-control .segment-prefix` rule (used only by the new Drag/Anim labels); otherwise unchanged.

## 5. Validation

- [x] 5.1 Load the page locally and confirm it renders without console errors and the `@mirasen/chessboard package.json version` debug line reports a 1.3.x version. — page loads without visible errors.
- [x] 5.2 Verify the existing chess.js play flow still works: player move, scheduled computer move, checkmate/draw status updates. — verified.
- [x] 5.3 Verify each existing control still works: orientation toggle, reset, auto-promote toggle, draw-mode toggle, clear-on-interaction toggle, and each draw-modifier segment. — Orientation, Reset, Auto queen, Draw Right/Primary, Auto-clear, and annotation color controls all work.
- [x] 5.4 Verify Drag preset: switching to `Mobile` increases the lift threshold (small movements no longer start a lifted drag) and renderer drag visuals update; switching back to `Desktop` restores the original behavior. — Drag Desktop/Mobile updates drag behavior as expected.
- [x] 5.5 Verify Anim: with `Off`, computer move plays without animation; with `On`, animation duration is visibly ~180ms. — Anim On/Off works.
- [x] 5.6 At a 360 CSS-pixel viewport, confirm the controls bar wraps without horizontal scrolling and tap targets remain at least 36 CSS pixels tall. — mobile layout usable, no horizontal scroll.
- [x] 5.7 Confirm Reset does not change Drag or Anim active state. — verified.
- [x] 5.8 Diff-check that no files outside [deploy-site/chessboard/examples/chessjs.html](deploy-site/chessboard/examples/chessjs.html), [deploy-site/assets/examples.css](deploy-site/assets/examples.css), and the OpenSpec change directory were modified — and that no `@mirasen/chessboard` library repo files were touched. — `git status --porcelain` shows only the two listed deploy-site files plus this `tasks.md`.
- [x] 5.9 Confirm `package.json`, `package-lock.json`, and `wrangler.jsonc` are unchanged. — none appear in `git status`.

## 6. Documentation note

- [x] 6.1 In the change proposal/PR description, note that this is a temporary static-site update for the chess.js example, ahead of any future site migration; no broader redesign or library work is implied. — closeout wording: "Updates the static chess.js example controls for `@mirasen/chessboard` 1.3, adds Drag (Desktop/Mobile) and Anim (On/Off) controls, compacts labels/layout, and keeps the change scoped to the static site."
