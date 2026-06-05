## Context

`src/lib/components/AppBar.svelte` wraps `@skeletonlabs/skeleton-svelte`'s `AppBar` and renders the link list inside `AppBar.Trail` as a `<nav>` with `flex flex-wrap items-center gap-4`. With four links — two text-only internal (`Chess Lore`, `Chessboard`) and two icon-bearing external (`GitHub`, `npm`) — the wrap kicks in on phone-portrait widths and the header becomes two cramped rows next to a `size-12` brand. The `NavConfig` shape in `src/lib/nav/links.ts` already discriminates internal vs. external links, so any responsive treatment can iterate over the same single source.

Project facts:

- Skeleton **v4** Svelte (`^4.15.2`), Svelte **5** (rune-based), Tailwind v4.
- AppBar provides only structural slots (`Toolbar`, `Lead`, `Headline`, `Trail`); responsive collapse is the integrator's job — Skeleton docs explicitly point at Tailwind breakpoint utilities for this.
- Skeleton ships `Menu` (Zag-backed) with `Menu.Trigger` / `Menu.Positioner` / `Menu.Content` / `Menu.Item`, with built-in outside-click, `Esc`, focus management, and ARIA.
- Adapter is `@sveltejs/adapter-static` — output is prerendered, so the navigation must work without JS for the read state and degrade gracefully if the menu fails to mount.

## Goals / Non-Goals

**Goals:**

- Below `md` (768px), collapse the four links into a hamburger-triggered dropdown anchored at the right of `AppBar.Trail`.
- At `md` and above, preserve today's inline behavior bit-for-bit (same DOM order, same active-state styling).
- Single source of truth: `NavConfig.links` drives both presentations — no duplicate config, no duplicate routing rules.
- `aria-current="page"` and a font-bold visual marker for the active internal route in both presentations.
- External links open in a new tab with `rel="noopener noreferrer"` (today's contract) in both presentations.
- Brand area in `AppBar.Lead` remains untouched at every breakpoint.
- No JS-driven viewport detection: SSR/static output is identical regardless of viewport; only Tailwind classes gate visibility, so first paint is correct.

**Non-Goals:**

- Replacing AppBar with Skeleton's `Navigation.Bar` / `Rail` / `Sidebar` (those are full navigation shells, not collapse targets).
- Restructuring `NavConfig` or `links.ts`.
- Animations / theme polish beyond Skeleton defaults.
- Localization of the trigger's accessible label (single `aria-label` string is fine for the current site).

## Decisions

### D1 — Use Skeleton `Menu` (Zag) for the dropdown, not a hand-rolled `<details>` or `Popover`

**Choice:** `Menu.Trigger` + `Menu.Positioner` + `Menu.Content` + `Menu.Item` from `@skeletonlabs/skeleton-svelte`.

**Why:** Free keyboard navigation (arrows, Home/End, typeahead), focus trap, outside-click and `Esc` close, anchored positioning, and ARIA roles — all behavior Zag already implements correctly. Hand-rolling these is a meaningful surface to get wrong. `Popover` would be a step lower in the stack (positioning + open state, no roving tabindex) and would force us to wire up arrow keys ourselves.

**Alternatives considered:** `<details>/<summary>` (no positioning, no focus mgmt, looks crude); custom `Popover` wrapper (more code, no real benefit); Skeleton `Navigation.Bar` at the bottom of the viewport (different UX shape, larger refactor, steals vertical space on mobile).

### D2 — Tailwind `md:` breakpoint to switch presentations, no JS viewport detect

**Choice:** Two siblings in `AppBar.Trail`: a `<nav class="hidden md:flex …">` for desktop and a `<div class="md:hidden">` containing the `Menu` for mobile. Both render server-side; CSS hides the off-mode one.

**Why:** No layout flash on first paint, no `window` access during prerender, identical static output for the static adapter. Trivially correct under SSR + hydration.

**Alternatives considered:** `matchMedia` + reactive `$state` (introduces hydration mismatch risk and hides nothing during the first paint); CSS `@container` queries (overkill — viewport width is the right axis here).

### D3 — Native `<a href>` inside `Menu.Item`, with `onSelect` fallback held in reserve

**Choice (initial):** Render the same `<a>` markup we use today as the _child_ of `Menu.Item`, including `target="_blank"` / `rel="…"` for external links. Do not pass an `onSelect` handler.

**Why:** Native anchors give us free middle-click, ⌘-click, right-click → open in new tab, and screen-reader semantics. Skeleton's docs show items with `value` / `<Menu.ItemText>` but do not forbid an embedded anchor.

**Risk:** Zag's `menu` machine binds `Enter`/`Space` on `role="menuitem"` to its own selection logic, which may `preventDefault` and _not_ trigger native `<a>` navigation. Middle-click and ⌘-click usually still work because Zag listens for `click`, not `auxclick`/`mousedown` with modifier keys — but this is unverified.

**Mitigation:** Verification task in `tasks.md` exercises:

1. Mouse left-click on internal link → navigates.
2. `Enter` on focused item → navigates.
3. Middle-click / ⌘-click on external link → opens in new tab without closing the menu unexpectedly.

If any of these fail, fall back to `onSelect` dispatching:

- internal → `goto(resolve(link.href))` from `$app/navigation`,
- external → `window.open(link.href, '_blank', 'noopener,noreferrer')`,

while still rendering the `<a href>` so right-click and screen-reader announcements stay sensible. The signature of the AppBar's props does not change either way; this is purely an internal swap.

### D4 — `@lucide/svelte` for the hamburger icon

**Choice:** Add `@lucide/svelte@next` as a runtime dependency, import `Menu` (lucide's icon, not Skeleton's `Menu` component — they collide in name; alias on import) for the trigger glyph.

**Why:** Tree-shakeable per-icon imports, consistent with future icon needs (we currently inline `<img>` SVGs from `assets/`, which doesn't scale). One icon today, infrastructure for more tomorrow.

**Package name:** Lucide's Svelte bindings live at `@lucide/svelte` per the [official guide](https://lucide.dev/guide/svelte/getting-started). The legacy `lucide-svelte` package is deprecated. The Svelte 5–compatible release is currently published under the `next` dist-tag, so the install is `npm install @lucide/svelte@next` and the `package.json` range should be `"^X.Y.Z"` matching whatever `npm install --save` resolves from `next` at install time.

**Alternatives considered:** Inline SVG (zero-dep, fine for one icon, but every future icon repeats the work); Unicode `☰` (font-dependent, looks cheap, not stylable beyond color/size).

**Naming collision:** Skeleton exports `Menu`, lucide exports `Menu`. Resolve via `import { Menu as MenuIcon } from '@lucide/svelte';` at the top of `AppBar.svelte`.

### D5 — Active-state styling reused verbatim across both presentations

**Choice:** Extract the `isInternalActive` + `accessibleName` helpers (already in the file) and call them from both the desktop `<nav>` and the mobile `Menu` items. Active items get `aria-current="page"` and `font-bold`.

**Why:** One mental model; no risk of the two views drifting on what "active" looks like.

### D6 — Trigger labelling

**Choice:** `<Menu.Trigger aria-label="Open navigation menu" class="md:hidden …">`. Visible content is the lucide `MenuIcon`; the icon is `aria-hidden`.

**Why:** Icon-only buttons need an accessible name. `aria-expanded` is supplied by Zag.

## Risks / Trade-offs

- **[Risk]** Native `<a>` keyboard activation inside `Menu.Item` may not navigate (D3). → **Mitigation:** verification task; documented `onSelect` fallback.
- **[Risk]** Skeleton `Menu` styling may not match the current `AppBar` palette out of the box. → **Mitigation:** rely on default Skeleton presets first; only add classes if visually broken. Not blocking.
- **[Risk]** Adding `@lucide/svelte` adds one runtime dep; tree-shaking depends on Vite + the package's `sideEffects` config. → **Mitigation:** verify final bundle does not include the full icon set after `vite build` (spot-check `dist/`).
- **[Risk]** `@lucide/svelte@next` is a pre-release dist-tag — minor versions can ship breaking changes without a major bump. → **Mitigation:** pin to the resolved version (caret range is fine while on `next`); revisit when Lucide promotes Svelte 5 support to `latest`.
- **[Risk]** AppBar consumers already pass `links` arrays with up to N items; the menu's vertical list assumes "small N." → **Trade-off:** acceptable — every current `NavConfig` has 4 links; we're not designing for runaway growth here.
- **[Risk]** `Menu.Positioner` portals into `<body>` (Zag default). On a static-prerendered page that hydrates to enable interactivity, this is fine, but the menu is non-functional with JS off. → **Trade-off:** acceptable — desktop nav (`<nav>`) is the no-JS read state below `md`'s media query the menu trigger is hidden anyway when JS doesn't promote interactivity… wait, actually CSS hides the desktop nav below `md` regardless of JS. **Caveat:** without JS, mobile users see the trigger but it does nothing. **Mitigation:** progressive enhancement is acceptable for a marketing site whose target audience has JS; document but don't engineer around it.

## Migration Plan

This is an internal refactor of one component file plus a dep addition; no data, no public API.

- **Deploy:** standard PR → main → static deploy. No flag; rollout is atomic.
- **Rollback:** revert the PR; `links.ts` and `+layout.svelte` were never touched.

## Open Questions

- None blocking. The `<a>`-vs-`onSelect` outcome (D3) is captured as a verification task and a documented fallback path; either resolution keeps the public component API identical.
