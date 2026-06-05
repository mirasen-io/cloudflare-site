## Why

The site AppBar renders four primary links (Chess Lore, Chessboard, GitHub, npm) directly in `AppBar.Trail` with `flex-wrap`. On narrow viewports (≤ ~390px, e.g. iPhone portrait) the links wrap onto a second row alongside icon-bearing external links, producing a cramped, visually broken header. We need the same set of links to remain reachable on mobile without compromising the brand area or stealing vertical space.

## What Changes

- Below the `md` breakpoint (768px), the inline links collapse behind a hamburger trigger placed at the right end of `AppBar.Trail`.
- At and above `md`, behavior is unchanged: links render inline as today.
- The hamburger opens a Skeleton v4 `Menu` (Zag-based) anchored to the trigger; items render the same set of links from `NavConfig.links`, with `aria-current="page"` + bold styling for the active internal route, and external links opening in a new tab.
- Brand (logo + label) in `AppBar.Lead` is untouched at every breakpoint.
- Add `@lucide/svelte@next` as a runtime dep for the menu icon (tree-shaken to a single icon import; `@lucide/svelte` is the current Lucide Svelte package, with the Svelte 5–compatible build on the `next` dist-tag).
- No JS-based viewport detection; presentation is driven entirely by Tailwind responsive utilities so SSR output is stable.

## Capabilities

### New Capabilities

- `site-navigation`: contract for how the primary site navigation (brand + links from `NavConfig`) is presented across breakpoints, including the responsive collapse to a menu on narrow viewports.

### Modified Capabilities

<!-- none -->

## Impact

- **Code**: `src/lib/components/AppBar.svelte` (refactor); `package.json` (+ `@lucide/svelte`).
- **Untouched**: `src/lib/nav/links.ts`, `src/routes/+layout.svelte`, all consumers passing a `NavConfig`.
- **Dependencies**: + `@lucide/svelte@next` (runtime).
- **Risk**: Skeleton `Menu` is built on Zag; native `<a href>` inside `Menu.Item` may not navigate via keyboard `Enter` or middle-click. Mitigated by an explicit verification task; if it fails, fall back to `onSelect` → `goto()` for internal links and `window.open(..., '_blank', 'noopener,noreferrer')` for external. Captured in design.md.
