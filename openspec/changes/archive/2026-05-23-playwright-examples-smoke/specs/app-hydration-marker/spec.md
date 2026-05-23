## ADDED Requirements

### Requirement: Hydration marker on `<html>` set from root layout `onMount`

The site SHALL signal "SvelteKit hydration completed" by adding the class `app-started` to the root `<html>` element from the root layout's `onMount` callback. The marker MUST be a class on `document.documentElement` (not on `<body>`, not a `data-*` attribute), and it MUST NOT appear in server-rendered HTML.

#### Scenario: Marker is set during browser hydration

- **WHEN** the root layout (`src/routes/+layout.svelte`) mounts in a browser
- **THEN** its `onMount` callback SHALL execute `document.documentElement.classList.add('app-started')`
- **AND** the `<html>` element SHALL match the selector `html.app-started` after hydration

#### Scenario: Marker is absent in SSR output

- **WHEN** the page is rendered on the server
- **THEN** the rendered HTML SHALL NOT include `app-started` on `<html>`
- **AND** no DOM mutation SHALL occur during SSR (the marker is set only inside `onMount`)

#### Scenario: Marker is the canonical hydration signal for tests

- **WHEN** an automated test needs to wait for SvelteKit hydration to finish
- **THEN** it SHALL wait for the selector `html.app-started`
- **AND** it SHALL NOT use timers, `domcontentloaded`, or `pageshow` as a substitute hydration signal

#### Scenario: Marker is not used as a styling hook

- **WHEN** site CSS is authored or modified
- **THEN** no rule SHALL depend on `html.app-started` for visual styling
- **AND** the marker SHALL exist solely as a DOM signal for tests and external automation

#### Scenario: Marker survives client-side navigation

- **WHEN** the user navigates between routes within the SvelteKit app after initial hydration
- **THEN** the `app-started` class SHALL remain on `<html>` (the root layout's `onMount` runs once and the class is never removed)
