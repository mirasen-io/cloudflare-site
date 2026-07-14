---
'@mirasen/main-website': minor
---

Migrate Skeleton v4 → v5 (`@skeletonlabs/skeleton` and `@skeletonlabs/skeleton-svelte` bumped to `^5.0.0-next.12`).

Rewrote the `mirasen` theme to the v5 token format: namespaced typography tokens (`--typo-base--*`, `--typo-heading--*`, `--typo-anchor--*`), split anchor-decoration properties, `--color-root-bg-*` for background, added `--color-brand-*` and `--corner-shape-*`, dropped the removed `--default-divide-width`. Color palette preserved 1:1.
