## ADDED Requirements

### Requirement: Drag preset control

The chess.js example page SHALL expose a compact control labeled `Drag` with two options, `Desktop` and `Mobile`, that updates the live `@mirasen/chessboard` instance's drag configuration at runtime. Selecting an option SHALL call both `board.setInteractionConfig` and `board.extensions.renderer.setConfig` so that interaction threshold and renderer drag visuals stay consistent.

The page SHALL import `DefaultMainRendererDesktopConfig` and `DefaultMainRendererMobileConfig` from `@mirasen/chessboard/extensions` (via the matching jsDelivr `+esm` URL used by the page) and SHALL pass only the `.drag` subconfig of these defaults into `renderer.setConfig`. The full default config object MUST NOT be passed into `renderer.setConfig`.

The Drag preset SHALL default to `Desktop` on initial page load. The active option SHALL be visually distinguishable from the inactive option.

#### Scenario: Selecting Desktop preset

- **WHEN** the user activates the `Desktop` option of the Drag control
- **THEN** the page calls `board.setInteractionConfig({ drag: { liftedActivation: { thresholdPx: 0 } } })`
- **AND** the page calls `board.extensions.renderer.setConfig({ drag: DefaultMainRendererDesktopConfig.drag })`
- **AND** the `Desktop` option is shown as active and `Mobile` as inactive

#### Scenario: Selecting Mobile preset

- **WHEN** the user activates the `Mobile` option of the Drag control
- **THEN** the page calls `board.setInteractionConfig({ drag: { liftedActivation: { thresholdPx: 5 } } })`
- **AND** the page calls `board.extensions.renderer.setConfig({ drag: DefaultMainRendererMobileConfig.drag })`
- **AND** the `Mobile` option is shown as active and `Desktop` as inactive

#### Scenario: Default preset on load

- **WHEN** the page first loads
- **THEN** the Drag control shows `Desktop` as active
- **AND** no animation, layout, or piece-URL configuration set by the page's existing renderer factory call is overwritten

### Requirement: Animation control

The chess.js example page SHALL expose a compact control labeled `Anim` with two options, `On` and `Off`, that updates the live board's animation duration at runtime by calling `board.extensions.renderer.setConfig({ animation: { durationMs } })`.

The Anim control SHALL default to `On` on initial page load. The active option SHALL be visually distinguishable from the inactive option.

#### Scenario: Turning animation on

- **WHEN** the user activates the `On` option of the Anim control
- **THEN** the page calls `board.extensions.renderer.setConfig({ animation: { durationMs: 180 } })`
- **AND** the `On` option is shown as active

#### Scenario: Turning animation off

- **WHEN** the user activates the `Off` option of the Anim control
- **THEN** the page calls `board.extensions.renderer.setConfig({ animation: { durationMs: 0 } })`
- **AND** subsequent moves play instantly without animated transitions
- **AND** the `Off` option is shown as active

### Requirement: Drag and Anim are runtime preferences, not game state

The `Reset` (formerly `Reset game`) action SHALL reset only the chess.js game state (position, selection, scheduled computer move, status text). It MUST NOT change the active Drag preset or the active Anim option, and MUST NOT issue any `setInteractionConfig` or `renderer.setConfig` call as part of resetting.

#### Scenario: Reset preserves Drag preset

- **WHEN** the user has selected the `Mobile` Drag preset
- **AND** the user activates the `Reset` button
- **THEN** the chess.js game returns to the initial position
- **AND** the Drag control still shows `Mobile` as active
- **AND** no `setInteractionConfig` or `renderer.setConfig({ drag: ... })` call is issued by the reset handler

#### Scenario: Reset preserves Anim setting

- **WHEN** the user has selected the `Off` Anim option
- **AND** the user activates the `Reset` button
- **THEN** the chess.js game returns to the initial position
- **AND** the Anim control still shows `Off` as active
- **AND** no `renderer.setConfig({ animation: ... })` call is issued by the reset handler

### Requirement: Compact control labels

The chess.js example page SHALL display compact labels for board controls so the control bar fits common mobile viewports without horizontal scrolling. Each button's accessible name (visible text or `aria-label`) SHALL remain meaningful.

#### Scenario: Reset label is compact

- **WHEN** the page is rendered
- **THEN** the reset button's visible label reads `Reset`

#### Scenario: Orientation label is compact

- **WHEN** the orientation is white
- **THEN** the orientation button's visible label reads `White`
- **WHEN** the orientation is black
- **THEN** the orientation button's visible label reads `Black`

#### Scenario: Auto-promote label is compact

- **WHEN** auto-promote-to-queen is on
- **THEN** the auto-promote button's visible label reads `Auto queen: On`
- **WHEN** auto-promote-to-queen is off
- **THEN** the auto-promote button's visible label reads `Auto queen: Off`

#### Scenario: Clear-on-interaction label is compact

- **WHEN** clear-on-core-interaction is on
- **THEN** the clear button's visible label reads `Auto-clear: On`
- **WHEN** clear-on-core-interaction is off
- **THEN** the clear button's visible label reads `Auto-clear: Off`

#### Scenario: Annotation draw-mode label is compact

- **WHEN** annotation drawing is bound to the right mouse button
- **THEN** the draw-mode button's visible label reads `Draw: Right` (or another similarly compact understandable label)
- **WHEN** annotation drawing is bound to the primary mouse button
- **THEN** the draw-mode button's visible label reads `Draw: Primary` (or another similarly compact understandable label)

### Requirement: Mobile-friendly controls layout

Locally scoped CSS in [deploy-site/assets/examples.css](deploy-site/assets/examples.css) SHALL reduce horizontal padding and any inherited `min-width` for buttons inside `.board-controls` so all controls (existing plus the new Drag and Anim controls) wrap onto multiple rows on a 360 CSS-pixel-wide viewport without producing horizontal scroll on the example page. Tap targets SHALL retain a minimum height of 36 CSS pixels.

The shared `.button` rule in [deploy-site/assets/styles.css](deploy-site/assets/styles.css) MUST NOT be modified by this change. Other example pages MUST NOT be visually affected.

#### Scenario: No horizontal scroll on a 360px viewport

- **WHEN** the chess.js example page is rendered at 360 CSS pixels wide
- **THEN** the page's body does not scroll horizontally
- **AND** all buttons in `.board-controls` are reachable by tapping without panning

#### Scenario: Tap targets stay usable

- **WHEN** any button inside `.board-controls` is rendered
- **THEN** its computed height is at least 36 CSS pixels

#### Scenario: Other example pages unaffected

- **WHEN** styles.css and the other examples (`minimal.html`, `promotion.html`, `live-games-grid.html`, the example index) are rendered
- **THEN** their button sizing and padding are unchanged compared to before this change

### Requirement: Library and dependency boundaries

This change SHALL NOT modify the `@mirasen/chessboard` library repository (source, README, changelog, package files). It SHALL NOT add, remove, upgrade, or downgrade any npm dependency of the cloudflare-site repo, and SHALL NOT modify the build system, beyond standard OpenSpec scaffolding for the change itself. The example SHALL continue to load `@mirasen/chessboard` from jsDelivr `+esm`.

#### Scenario: No library repo files changed

- **WHEN** the change is implemented
- **THEN** no files under any `@mirasen/chessboard` library checkout are modified by this change

#### Scenario: No dependency or build changes

- **WHEN** the change is implemented
- **THEN** [package.json](package.json), [package-lock.json](package-lock.json), and [wrangler.jsonc](wrangler.jsonc) are unchanged
- **AND** the page continues to import `@mirasen/chessboard` and its `extensions` entry from `cdn.jsdelivr.net/npm/@mirasen/chessboard@latest/.../+esm`
