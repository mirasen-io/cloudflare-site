---
'@mirasen/main-website': minor
---

AppBar collapses primary links into a hamburger menu on viewports below `md` (768px).

The four links in `AppBar.Trail` (Chess Lore, Chessboard, GitHub, npm) used to wrap onto a second row on phone-portrait widths next to the brand, producing a cramped two-row header. Below `md` they now hide behind a `lucide`-iconed trigger that opens a Skeleton v4 `Menu` (Zag-backed: outside-click, `Esc`, focus management, ARIA all out of the box). At `md` and above behavior is unchanged. Brand area in `AppBar.Lead` is untouched at every width.

Both presentations render in the same SSR pass — selection is purely CSS — so the static `adapter-static` output stays viewport-independent and there is no first-paint flash. A single `NavConfig.links` array drives both views; active-state helpers (`aria-current="page"` + `font-bold`) are reused verbatim.

Keyboard activation (`Enter`/`Space`) inside `Menu.Item` is intercepted by Zag and does not fire the nested `<a>`'s default navigation, so an `onSelect` handler routes those events through `goto()` for internal links and `window.open(..., '_blank', 'noopener,noreferrer')` for external ones. Mouse click, middle-click, ⌘-click, right-click, and screen-reader semantics still flow through the native `<a href>` — only keyboard activation goes through the handler.

Adds `@lucide/svelte@next` (Svelte 5 build, currently on the `next` dist-tag per the [official guide](https://lucide.dev/guide/svelte/getting-started)) — single icon import, tree-shaken to just the menu glyph in the production bundle.
