## Context

The static chess.js play example at [deploy-site/chessboard/examples/chessjs.html](deploy-site/chessboard/examples/chessjs.html) is a single self-contained HTML page that loads `@mirasen/chessboard` from jsDelivr `+esm`. It currently exposes five button controls (orientation, reset, auto-promote, draw mode, clear-on-interaction) and a segmented draw-modifier control inside `.board-controls`. Buttons inherit `padding: 13px 18px` and `border-radius: 16px` from the global `.button` rule in [deploy-site/assets/styles.css](deploy-site/assets/styles.css#L153). On narrow viewports `.board-controls .button { flex: 1 1 auto; padding-inline: 12px }` already kicks in (see [examples.css](deploy-site/assets/examples.css#L160-L167)), but with current verbose labels (e.g. `Auto promote to queen: off`, `Annotations: right-click`) the bar still wraps awkwardly.

`@mirasen/chessboard` 1.3 ships runtime configuration entry points that this example does not yet exercise:
- `board.setInteractionConfig({ drag: { liftedActivation: { thresholdPx } } })` — controls how far a press must move before drag becomes a "lifted" drag.
- `board.extensions.renderer.setConfig({ ... })` — accepts a partial config; the library exposes `DefaultMainRendererDesktopConfig` and `DefaultMainRendererMobileConfig` from `@mirasen/chessboard/extensions` whose `.drag` subconfig packages the renderer-side drag visuals for each preset.
- `animation.durationMs` on the renderer config controls move animation timing.

The page already imports from `@mirasen/chessboard@latest/extensions/+esm` (it pulls `builtInExtensionFactoryMap`), so adding the two `Default*RendererConfig` named imports from the same URL is the natural extension point.

Stakeholders: visitors to mirasen.io trying the chess.js demo (especially on phones) and the Mirasen team validating 1.3 runtime APIs against a public surface.

## Goals / Non-Goals

**Goals:**
- Make Drag preset (Desktop / Mobile) and animation duration directly try-able from the example controls in a way that mirrors how a 1.3 integrator would call the API.
- Keep all existing controls working and visible on narrow viewports without horizontal scrolling, by shortening labels and locally tightening padding/min-width.
- Keep the change strictly local to the chess.js example: only [chessjs.html](deploy-site/chessboard/examples/chessjs.html) and `.board-controls`-scoped rules in [examples.css](deploy-site/assets/examples.css).

**Non-Goals:**
- Migrating the static site to SvelteKit or any framework.
- Redesigning the example layout, copy, or non-control sections.
- Modifying the `@mirasen/chessboard` library repo (code, README, changelog, package.json).
- Touching other example pages ([minimal.html](deploy-site/chessboard/examples/minimal.html), [promotion.html](deploy-site/chessboard/examples/promotion.html), [live-games-grid.html](deploy-site/chessboard/examples/live-games-grid.html)) or shared button rules in [styles.css](deploy-site/assets/styles.css).
- Persisting Drag/Anim preferences across page loads.

## Decisions

### 1. Drag preset surface: a two-button compact control labeled "Drag"

Two `<button class="button" data-value="desktop|mobile">` elements wrapped in a `.segment-control`-styled container, or two simple buttons with an active state — whichever matches the visual treatment of the existing `.segment-control`. Click handler maps:
- `desktop` → `setInteractionConfig({ drag: { liftedActivation: { thresholdPx: 0 } } })` + `renderer.setConfig({ drag: DefaultMainRendererDesktopConfig.drag })`
- `mobile` → `setInteractionConfig({ drag: { liftedActivation: { thresholdPx: 5 } } })` + `renderer.setConfig({ drag: DefaultMainRendererMobileConfig.drag })`

**Why a preset toggle, not separate threshold + visuals controls:** the two values move together in real integrations; a single "Drag: Desktop/Mobile" preset is the minimum surface that demonstrates the API and keeps the bar compact. Alternative considered: three-segment control with a "Custom" option exposing `thresholdPx` — rejected as out of scope for a temporary update.

**Why import only `.drag` from the default configs:** passing the full `DefaultMainRendererDesktopConfig` into `renderer.setConfig` would overwrite unrelated subconfigs (animation, piece URLs, etc.) the page already configured via the `renderer` factory. Only `.drag` is what changes between presets.

### 2. Anim control: a two-button compact control labeled "Anim"

Same shape as Drag. Click handler maps:
- `on` → `renderer.setConfig({ animation: { durationMs: 180 } })`
- `off` → `renderer.setConfig({ animation: { durationMs: 0 } })`

180ms is a reasonable lively default; 0 disables animation. Alternatives considered: a slider — rejected, too much surface for a demo control.

### 3. Label compaction

Replace verbose labels in-place. Updated text for each button (final wording is editable during implementation as long as it stays compact):
- `Reset game` → `Reset`
- `Orientation: white` / `black` → `White` / `Black`
- `Auto promote to queen: on/off` → `Auto queen: On/Off`
- `Clear on interaction: on/off` → `Clear: On/Off`
- `Annotations: right-click` / `primary` → `Draw: Right` / `Draw: Primary`

The segmented draw-modifier labels (`keyboard`, `ctrl`, `shift`, `alt`, `meta`) are already compact and stay as-is.

### 4. CSS scope: `.board-controls`-only padding/min-width tightening

Add a small block to [examples.css](deploy-site/assets/examples.css), e.g.:
```css
.board-controls .button {
  padding: 8px 12px;
  border-radius: 12px;
  min-height: 36px;
  font-size: 0.85rem;
}
```
(exact values determined during implementation by visual testing). Keep the existing `@media (max-width: 680px)` `.board-controls .button { flex: 1 1 auto; padding-inline: 12px }` block, possibly reducing `padding-inline` further. Do not touch the global `.button` rule in [styles.css](deploy-site/assets/styles.css).

**Why local-only:** the global `.button` rule is shared by the home page hero CTAs, example index, and other examples. Changing it would have site-wide regressions outside the scope of this change.

### 5. Drag/Anim preferences are not reset by Reset

The `resetGame()` function in [chessjs.html](deploy-site/chessboard/examples/chessjs.html#L390-L397) only touches game state (`chess`, board position, selection, status). The new control state lives outside the chess game and SHALL NOT be cleared by `resetGame()`. Drag preset and animation control state persist within the page session.

### 6. Default state on page load

- Drag preset: **Desktop** active by default (matches current behavior — no threshold has been configured, and the default renderer drag visuals are desktop-style).
- Anim: **On** active by default (matches current default `durationMs`).

This avoids any visual change on first paint compared to today.

## Risks / Trade-offs

- [Risk] `@mirasen/chessboard@latest` may resolve to a version newer than 1.3 with breaking changes to `setInteractionConfig` / `renderer.setConfig`. → Mitigation: verify in the page's existing debug log (it already logs `package.json version`); pin to `@1` if drift is observed during validation. Pinning is out of scope unless validation surfaces an actual break.
- [Risk] `DefaultMainRendererDesktopConfig` / `DefaultMainRendererMobileConfig` might not be exported from the `extensions` entry. → Mitigation: confirm by inspecting the published extensions module before implementation; if names differ, use the actual exported names — do not modify the library.
- [Risk] Compacted labels could be ambiguous (e.g. `Draw: Right`). → Mitigation: keep `aria-label` attributes with the longer phrasing on each button so screen readers and tooltips remain unambiguous.
- [Risk] Tap targets shrink below recommended 44×44pt on iOS if padding is reduced too aggressively. → Mitigation: keep `min-height: 36px` (or larger) and verify on a narrow viewport before declaring the change done.
- [Trade-off] Two more controls add cognitive load for first-time visitors. Accepted because demonstrating 1.3 runtime APIs is a stated goal.

## Migration Plan

This is a static-site update; "deploy" means merging to `main` and the next site publish. Rollback is a revert of the two changed files.

## Open Questions

- Exact import path for `DefaultMainRendererDesktopConfig` / `DefaultMainRendererMobileConfig` — confirm against the published `@mirasen/chessboard@1.3` `extensions` entry during implementation. If they live at a sub-path, adjust the jsDelivr URL accordingly; do not invent a path.
- Final wording for `Draw: Right` vs `Draw: RClick` — pick during implementation based on width measured in browser.
