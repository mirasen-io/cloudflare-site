## Why

The static chess.js play example at [deploy-site/chessboard/examples/chessjs.html](deploy-site/chessboard/examples/chessjs.html) was authored against an earlier `@mirasen/chessboard` API and does not exercise the 1.3 runtime configuration surface for drag presets and animation duration. Visitors on phones cannot try the mobile drag preset, cannot toggle animations, and cannot easily fit the existing controls on a narrow viewport because button labels are long and inherit large horizontal padding from the shared `.button` rule. This is a temporary static-site update to bring the demo in line with the released 1.3 library before any future site migration.

## What Changes

- Add a compact **Drag** preset control to [chessjs.html](deploy-site/chessboard/examples/chessjs.html) with two options (`Desktop`, `Mobile`) that drive both `board.setInteractionConfig({ drag: { liftedActivation: { thresholdPx } } })` and `board.extensions.renderer.setConfig({ drag: ... })` using `DefaultMainRendererDesktopConfig.drag` / `DefaultMainRendererMobileConfig.drag`.
- Add a compact **Anim** control with two options (`On`, `Off`) that drive `board.extensions.renderer.setConfig({ animation: { durationMs } })` (180 / 0).
- Compact existing button labels in this example only:
  - `Reset game` → `Reset`
  - `Orientation: white` / `Orientation: black` → `White` / `Black`
  - `Auto promote to queen: on/off` → `Auto queen: On/Off`
  - `Clear on interaction: on/off` → `Auto-clear: On/Off`
  - `Annotations: right-click` / `primary` → `Draw: Right` / `Draw: Primary` (or similarly compact).
- Locally tighten board-controls button padding/min-width in [examples.css](deploy-site/assets/examples.css) under `.board-controls .button` so labels fit on mobile without horizontal scrolling, while keeping tap targets usable.
- Import `DefaultMainRendererDesktopConfig` and `DefaultMainRendererMobileConfig` from `@mirasen/chessboard/extensions` via the matching jsDelivr `+esm` URL already used by this page; pass only the `.drag` subconfig into `renderer.setConfig`.
- Drag and animation control state are page runtime preferences and **must not** be reset by the existing **Reset** game action.

## Capabilities

### New Capabilities

- `chessjs-example-controls`: Behavior of the static chess.js play example's control panel — labels, the Drag preset control, the Anim control, the segmented draw-modifier control, and how each control maps to `@mirasen/chessboard` 1.3 runtime configuration calls. Mobile-layout compaction rules for these controls also live here.

### Modified Capabilities

<!-- None: openspec/specs/ has no existing specs to modify. -->

## Impact

- Files changed: [deploy-site/chessboard/examples/chessjs.html](deploy-site/chessboard/examples/chessjs.html), [deploy-site/assets/examples.css](deploy-site/assets/examples.css) (scoped `.board-controls` rules only).
- No changes to other example pages, no changes to [deploy-site/assets/styles.css](deploy-site/assets/styles.css), no changes to the `@mirasen/chessboard` library repo (README, changelog, package files).
- No build-system or dependency changes; the page continues to load the library from jsDelivr `+esm`.
- No SvelteKit migration and no broader redesign.
- Externally: relies on `@mirasen/chessboard@1.3` runtime APIs (`setInteractionConfig`, `extensions.renderer.setConfig`) and on `DefaultMainRendererDesktopConfig` / `DefaultMainRendererMobileConfig` exports from `@mirasen/chessboard/extensions`. Treated as an external API reference; not modified by this change.
