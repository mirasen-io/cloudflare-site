## ADDED Requirements

### Requirement: Brand area is constant across breakpoints

The site AppBar SHALL render the brand entry from `NavConfig.brand` (logo image and label, when present) in the leading slot of the toolbar at every viewport width, with the link target, accessible name, and visual unchanged regardless of viewport size.

#### Scenario: Brand is unaffected by responsive collapse

- **WHEN** the viewport is below 768px
- **THEN** the brand logo and label are still rendered in the leading slot exactly as on a desktop viewport, and clicking the brand navigates to `NavConfig.brand.href`.

#### Scenario: Brand accessible name is preserved

- **WHEN** the AppBar renders at any viewport width
- **THEN** the brand anchor exposes the same accessible name derived from `brand.ariaLabel`, falling back to `brand.label` when no explicit `ariaLabel` is set.

### Requirement: Inline links presentation at and above the medium breakpoint

At viewport widths of 768px and above, the AppBar SHALL render every entry in `NavConfig.links` as an inline anchor inside the trailing slot, in the order supplied by the `links` array.

#### Scenario: Links render inline on desktop widths

- **WHEN** the viewport is at least 768px wide
- **THEN** all `NavConfig.links` entries are visible simultaneously as inline anchors inside `AppBar.Trail`, and the hamburger trigger is not visible.

#### Scenario: Active internal link is marked

- **WHEN** the current pathname matches an internal link's `href` according to its `activeMatch` rule (`exact` or `prefix`)
- **THEN** that link's anchor carries `aria-current="page"` and is rendered with the bold visual treatment.

#### Scenario: External links open in a new tab

- **WHEN** the user activates an external link in the inline presentation
- **THEN** the browser opens the link in a new browsing context with `rel` containing `noopener` and `noreferrer`.

### Requirement: Collapsed menu presentation below the medium breakpoint

At viewport widths below 768px, the AppBar SHALL hide the inline link list and instead expose a single hamburger-iconed trigger at the trailing edge of the toolbar that opens a dropdown menu containing the same `NavConfig.links` entries in the same order.

#### Scenario: Trigger replaces inline links on narrow viewports

- **WHEN** the viewport is narrower than 768px
- **THEN** the inline link list is not visible, and a single icon-only trigger is rendered in `AppBar.Trail` with an accessible name describing it as the navigation menu opener.

#### Scenario: Activating the trigger opens the menu

- **WHEN** the user clicks or activates the trigger via keyboard (`Enter` or `Space`)
- **THEN** a dropdown menu appears anchored to the trigger and the trigger reports `aria-expanded="true"`.

#### Scenario: Menu items match the link list one-to-one

- **WHEN** the menu is open
- **THEN** for every entry in `NavConfig.links` there is exactly one corresponding menu item rendered in the same order, with the same label text and the same accessible name as the inline presentation would use.

#### Scenario: Active internal link is marked inside the menu

- **WHEN** the menu is open and the current pathname matches an internal link's `activeMatch` rule
- **THEN** that menu item carries `aria-current="page"` and is rendered with the bold visual treatment, matching the inline presentation's marker.

#### Scenario: External menu items open in a new tab

- **WHEN** the user activates an external entry from the open menu
- **THEN** the browser opens the link in a new browsing context with `rel` containing `noopener` and `noreferrer`.

#### Scenario: Menu closes on outside click and on Escape

- **WHEN** the menu is open and the user presses `Escape` or clicks outside the menu surface
- **THEN** the menu closes and focus returns to the trigger.

### Requirement: Single source of truth for links

The component SHALL derive both the inline presentation and the collapsed-menu presentation from the same `NavConfig.links` array, with no per-presentation duplication of link data, ordering, or active-state logic in calling code.

#### Scenario: Updating the link list updates both presentations

- **WHEN** a caller passes an updated `NavConfig` whose `links` array differs from a prior render
- **THEN** both the inline (≥768px) and the menu (<768px) presentations reflect the same updated list, in the same order, on the next render — without any caller-side duplication.

### Requirement: Stable server-rendered output across viewports

The AppBar SHALL produce identical HTML during server-side rendering regardless of the requesting client's viewport, so that prerendered output served by the static adapter renders correctly on first paint without a layout flash.

#### Scenario: Prerendered HTML is viewport-independent

- **WHEN** the AppBar is rendered during static prerendering
- **THEN** the emitted HTML contains both the inline-link markup and the trigger markup, and the visible presentation is selected entirely by CSS responsive utilities at the client.
