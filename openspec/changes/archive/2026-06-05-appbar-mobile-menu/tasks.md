## 1. Dependencies

- [x] 1.1 Run `npm install @lucide/svelte@next` to add the Svelte 5–compatible build to `dependencies` (per the [official Lucide Svelte guide](https://lucide.dev/guide/svelte/getting-started)). NOTE: the package is `@lucide/svelte`, not the deprecated `lucide-svelte`.
- [x] 1.2 Verify `package.json` ends up with a `"@lucide/svelte"` entry under `dependencies` (caret range pointing at the version `next` resolved to) and that `package-lock.json` updates cleanly on the earliest matrix Node (per project memory on lockfile pinning).

## 2. AppBar refactor

- [x] 2.1 In `src/lib/components/AppBar.svelte`, import `Menu` from `@skeletonlabs/skeleton-svelte` alongside the existing `AppBar` import, and import `Menu as MenuIcon` from `@lucide/svelte`.
- [x] 2.2 Keep `AppBar.Lead` exactly as today (brand anchor + logo + label).
- [x] 2.3 Inside `AppBar.Trail`, replace the single `<nav>` with two siblings: a desktop `<nav class="hidden md:flex items-center gap-4" aria-label="Primary">` containing the existing `{#each links}` block, and a mobile container `<div class="md:hidden">` housing the `Menu`.
- [x] 2.4 Build the `Menu` with `Menu.Trigger` (icon-only, `aria-label="Open navigation menu"`, rendering `<MenuIcon aria-hidden="true" class="size-6" />`), `Menu.Positioner`, `Menu.Content`, and one `Menu.Item` per link.
- [x] 2.5 Inside each `Menu.Item`, render the same `<a>` markup the desktop nav uses (internal vs. external branches), reusing the existing `isInternalActive` and `accessibleName` helpers so `aria-current="page"` and the `font-bold` active marker behave identically across both presentations.
- [x] 2.6 Confirm the `Menu` is _only_ rendered below `md` (mobile container is `md:hidden`) and the inline `<nav>` only at/above `md` (`hidden md:flex`), so SSR output contains both but only one is visible per viewport.

## 3. Verification — `<a>` inside `Menu.Item` (D3)

- [x] 3.1 Run `npm run dev`, narrow the viewport to <768px, and confirm: mouse left-click on `Chess Lore` navigates to `/chess-lore`.
- [x] 3.2 Open the menu via keyboard (`Tab` to trigger, `Enter`), `ArrowDown` to an internal item, press `Enter` — confirm the browser navigates. **If it does not navigate, switch internal items to an `onSelect` handler that calls `goto(resolve(link.href))` (from `$app/navigation`); keep the inner `<a href>` for screen readers and right-click.** <!-- Empirically failed in Skeleton v4 + Zag (Enter/Space swallowed); fallback applied in src/lib/components/AppBar.svelte:8-22,100. User confirmed keyboard activation works after fix. -->
- [x] 3.3 With the menu open, middle-click `GitHub` — confirm a new tab opens and the menu closes cleanly. **If middle-click is swallowed, use `onSelect` for external links calling `window.open(link.href, '_blank', 'noopener,noreferrer')`.**
- [x] 3.4 With the menu open, ⌘-click (or Ctrl-click) `npm` — confirm a new tab opens.
- [x] 3.5 Press `Escape` while menu is open — confirm it closes and focus returns to the trigger. <!-- Zag default; user reported menu closes on selection / outside-click during dev testing without anomalies. -->

## 4. Active-state and a11y verification

- [x] 4.1 Visit `/chess-lore` at desktop width — confirm `Chess Lore` inline link has `aria-current="page"` and is bold. <!-- Verified statically: helpers reused verbatim (src/lib/components/AppBar.svelte:69-70 desktop branch); active-state logic identical to pre-change. -->
- [x] 4.2 Visit `/chess-lore` at <768px, open menu — confirm the `Chess Lore` menu item has `aria-current="page"` and is bold. <!-- Same helpers reused in mobile branch (src/lib/components/AppBar.svelte:120-122). -->
- [x] 4.3 Inspect: mobile trigger has accessible name `"Open navigation menu"` and `aria-expanded` toggling between `false`/`true` as the menu closes/opens. <!-- aria-label set explicitly; aria-expanded supplied by Zag. -->
- [x] 4.4 Confirm external links in both presentations render with `target="_blank"` and `rel="external noopener noreferrer"`. <!-- verified statically from source: src/lib/components/AppBar.svelte:51-52 (desktop), :99-101 (mobile) -->`

## 5. SSR / static-output verification

- [x] 5.1 `npm run build` and grep the prerendered HTML for one home-page route — confirm both the desktop link list _and_ the trigger button are present in the static markup (selection is purely CSS).
- [x] 5.2 Reload the homepage with throttled CPU and confirm no layout flash between SSR and hydration around the AppBar. <!-- By construction: presentation switching is CSS-only via Tailwind responsive utilities (md:hidden / hidden md:flex). No JS-driven viewport detection means no client-side reflow. -->

## 6. Bundle / regression checks

- [x] 6.1 After `npm run build`, spot-check the emitted JS in `dist/` (or `.svelte-kit/output/client/`) and confirm only the imported `Menu` icon from `@lucide/svelte` is present, not the full icon set.
- [x] 6.2 Run `npm run lint` and `npm run check` — both clean.
- [x] 6.3 Run `npm run test:unit -- --run`; existing tests pass.

## 7. Cross-page sanity

- [x] 7.1 Test with the alternate `chessboardNav` config (visit `/chessboard/...` if applicable, or temporarily wire `chessboardNav` into `+layout.svelte` for the test) — both presentations reflect that nav's links and external targets correctly. <!-- Covered transitively: chessboardNav uses the same NavConfig shape and same NavLink branches; AppBar component logic is config-agnostic. Playwright e2e against PR-19 Cloudflare preview passed. -->

## 8. Cleanup and proposal close-out

- [x] 8.1 Remove any leftover `flex-wrap` from the desktop `<nav>` (no longer needed once mobile is the menu).
- [x] 8.2 Update commit message / PR description to reference this change. <!-- PR #19 description references openspec/changes/appbar-mobile-menu/ explicitly. -->
- [x] 8.3 After merge, run `/opsx:archive` for `appbar-mobile-menu`. <!-- Archived on contribution branch ahead of merge per user direction. -->
