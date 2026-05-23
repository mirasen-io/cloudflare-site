## ADDED Requirements

### Requirement: useBoard supports multi-instance pages on the same route

The `useBoard` helper SHALL support being called once per board on pages that mount multiple board instances simultaneously. Each call SHALL produce an independent `Chessboard` instance with its own lifecycle, its own `onMount`, and its own `onDestroy`. The helper MUST NOT require any new API surface to support this — it is a documented capability of the existing options pass-through.

#### Scenario: Twelve concurrent useBoard calls

- **WHEN** a page mounts twelve `useBoard(getElement, setup, { extensions: [...] })` calls (one per `<LiveCard>` component)
- **THEN** the helper SHALL produce twelve independent `Chessboard` instances, each bound to its own `getElement()` result
- **AND** each instance's `setup` callback SHALL be invoked exactly once with its own board
- **AND** each instance's teardown function (if returned by `setup`) SHALL run exactly once when its host component unmounts
- **AND** each instance's `board.destroy()` SHALL be called by `useBoard`'s `onDestroy` exactly once

#### Scenario: No cross-instance state

- **WHEN** twelve `useBoard` calls run concurrently on the same route
- **THEN** the `current` getters of each call SHALL return that call's own board
- **AND** the helper SHALL NOT introduce any module-level state shared across calls

### Requirement: Reduced extension tuple is the supported escape hatch from library defaults

When an example page needs to opt out of the package's default extensions, it SHALL do so by passing `options.extensions` to the existing `useBoard` helper. The site MUST NOT introduce a separate "reduced board" helper, "live board" helper, or any alternative factory. The string-form built-in identifiers (e.g. `'renderer'`, `'lastMove'`) are the canonical way to install built-ins without options.

#### Scenario: Reduced tuple via string-form built-ins

- **WHEN** an example page calls `useBoard(getElement, setup, { extensions: ['renderer', 'lastMove'] as const })`
- **THEN** the underlying `createBoard` call SHALL receive `{ element, extensions: ['renderer', 'lastMove'] }`
- **AND** the resulting board SHALL only carry the renderer and lastMove extensions — none of the other library defaults
- **AND** the `setup` callback SHALL be free to call `b.setMovability({ mode: 'disabled' })` (or any other allowed setter) on the resulting board

#### Scenario: No alternative reduced-board helper

- **WHEN** the example shell capability is implemented
- **THEN** the site SHALL NOT define `useReducedBoard`, `useLiveBoard`, `createReducedBoard`, or any equivalent factory beside `useBoard`
- **AND** all example pages that need a reduced extension set SHALL use `useBoard` with `options.extensions`
