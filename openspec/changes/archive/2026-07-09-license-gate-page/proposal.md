## Why

`@mirasen/license-gate` (see `../license-gate`) is a released open-source npm dev tool by Mirasen — a strict, local, default-deny license policy gate for npm projects, workspaces, and monorepos. It currently has no presence on `mirasen.io`. Package visitors land on npm and GitHub only, with no Mirasen-branded landing page explaining what it is, how it fits, or how to try it in one paste.

The site already publishes one product landing page (`/chessboard`) in a consistent visual language and metadata shape (hero → overview → why-it-matters → spotlight → status, plus `SoftwareSourceCode` JSON-LD). License Gate deserves the same page-level home so a first-time visitor can grasp the tool, its scope boundaries, and how to run it — without turning Mirasen into a "chess learning + npm compliance tooling" hybrid brand.

The change is website/content only. The `@mirasen/license-gate` package is not modified.

## What Changes

- Add a `/license-gate` route rendering a single landing page in the same visual language as `/chessboard` (`page-shell` / `hero` / `site-section` / `card-grid` / `spotlight` / `section-actions`), extended with **one compact Quick Start `<pre><code>` block** because the tool's value is primarily CLI behavior.
- Page sections: (1) Hero, (2) Overview cards, (3) Quick Start, (4) How it works / policy model, (5) What it will not do, (6) Links.
- Add a page-local `licenseGateNav` in `src/lib/nav/links.ts` (brand + GitHub/npm pointing at `mirasen-io/license-gate` and `@mirasen/license-gate`, plus the existing internal peers). Wire it via `src/routes/license-gate/+layout.ts` following the `chessboardNav` pattern.
- Add a **small, secondary** "Engineering tools" mention on the home page (`/`) — one card below the existing Chess Lore and Chessboard narrative — pointing at `/license-gate`. It is deliberately not styled as an equal third product pillar.
- Add `svelte:head` metadata (title, description, canonical, OG) and a `SoftwareSourceCode` JSON-LD block scoped to Mirasen License Gate.
- Add one `<url>` entry for `https://mirasen.io/license-gate` to the existing hand-authored `static/sitemap.xml`. Do **not** create a `src/routes/sitemap.xml/+server.ts` endpoint — the static file is the current repo pattern and is copied verbatim by `@sveltejs/adapter-static`.
- Add one Changesets entry `.changeset/license-gate-page.md` declaring a `patch` bump for the private `@mirasen/main-website` package. Do not manually edit `package.json` version or `CHANGELOG.md`.

## Explicitly preserved behavior

- **No global top-nav addition.** `rootNav.links` and `chessboardNav.links` are not changed to include License Gate. The primary product narrative (Chess Lore, Chessboard) stays intact in the top-level navigation.
- **`/chessboard` is unchanged** except for shared nav code touched to add the new `licenseGateNav` export.
- **Home page narrative remains chess-learning-first.** The new mention sits below the existing sections as a subordinate "engineering tools" note, not as a third hero-height product block.
- **No package changes.** `@mirasen/license-gate` behavior, README, and CLI surface are untouched. The landing page describes the shipped tool.
- **No overclaims.** No wording implying legal compliance guarantees, enterprise governance, or broad package-manager support. JSON-LD does not use vocabulary implying legal services.
- **`static/robots.txt` is unchanged.** It does not currently declare a `Sitemap:` directive, so there is no consistency requirement to preserve.
- **No manual version-artifact edits.** `package.json` `version` and `CHANGELOG.md` are untouched — the Changesets version PR handles that separately.

## Capabilities

### New Capabilities

- `license-gate-page`: contract for the `/license-gate` landing page — its section skeleton, Quick Start snippet contract, GitHub/npm targets, page-local nav wiring, home-page secondary mention, and required metadata / JSON-LD.

### Modified Capabilities

<!-- none -->

## Impact

- **New code**: `src/routes/license-gate/+page.svelte`, `src/routes/license-gate/+layout.ts`, `.changeset/license-gate-page.md`.
- **Modified code**: `src/lib/nav/links.ts` (add `licenseGateNav` export; `rootNav.links` and `chessboardNav.links` untouched); `src/routes/+page.svelte` (add small secondary "Engineering tools" mention below existing sections); `static/sitemap.xml` (one added `<url>` block for the License Gate canonical).
- **Untouched**: `src/lib/components/AppBar.svelte`; existing `/chessboard` page and its nav wiring; `/chess-lore` page; footer; layout CSS; `static/robots.txt`; `package.json` `version`; `CHANGELOG.md`.
- **Dependencies**: none. Uses existing `page-shell` / `hero` / `site-section` / `card` / `spotlight` / `numbered-list` / `theme-list` classes.
- **Risk**: low. Content-only route addition following an established page skeleton. Secondary risks: (a) the Quick Start `<pre><code>` block may need small CSS tweaks if no existing style rules cover fenced code inside `.card` — mitigated by verification task. (b) The home-page secondary mention could visually compete with the Chess Lore / Chessboard blocks if placed as a same-size card; mitigated by explicit design decisions in `design.md` about placement and weight and the `max-w-2xl` cap. (c) The sitemap edit is a one-line append; risk is limited to accidentally reordering existing entries or introducing duplicates — mitigated by build-verification greps and a `uniq -d` check.
