## Why

The repository root currently hosts a hand-rolled static Cloudflare Workers site (`deploy-site/`) that we want to retire. A prepared SvelteKit 2 + Svelte 5 + Skeleton UI v4 + Tailwind v4 replacement already exists as a backup copy under `artifacts/main-web/`, but lives outside the deploy pipeline. Promoting it to the repo root unblocks future work (real SvelteKit routes, component reuse, CI deploy via Cloudflare GitHub Actions) while preserving every public URL the legacy site exposes today.

## What Changes

- Promote the SvelteKit project (`src/`, `static/`, `svelte.config.js`, `vite.config.ts`, `tsconfig.json`, `eslint.config.js`, `playwright.config.ts`, `.prettierrc`, `.prettierignore`, `.npmrc`, `AGENTS.md`) from `artifacts/main-web/` into the repo root by copying — no git-history merge, no subtree.
- Merge `package.json`: take SvelteKit stack from `artifacts/main-web/package.json` as base; add `wrangler` to `devDependencies` and keep `chess.js` + `@mirasen/chessboard` in `dependencies` (still consumed by the legacy `chessboard/` page served from `static/`). Regenerate `package-lock.json` via `npm install`.
- Merge `.gitignore`: union of both files (`/node_modules`, `/build`, `/.svelte-kit`, `.DS_Store`, `.env*`, wrangler entries, `.claude/...`); keep `/artifacts` so `artifacts/main-web/` stays local-only.
- Repoint `wrangler.jsonc` `assets.directory` from `./deploy-site` to `./build` (the `adapter-static` output dir).
- Copy static legacy content from `deploy-site/{chessboard,chess-lore,assets,favicon.ico,sitemap.xml}` into `static/`, preserving paths so the same URLs continue to work. **Do NOT** copy `deploy-site/index.html` — `src/routes/+page.svelte` replaces it.
- **BREAKING**: Delete `deploy-site/` after the migration succeeds.
- Port any useful permission entries from `artifacts/main-web/.claude/settings.json` into the root `.claude/settings.json`. Leave `artifacts/main-web/` itself untouched (it stays as a local backup, ignored by git).

Out of scope: rewriting `chessboard/` and `chess-lore/` as SvelteKit routes (they remain legacy static under `static/`), the Cloudflare GitHub Actions deploy pipeline (separate change), new content/styling, and removing or moving `artifacts/main-web/`.

## Capabilities

### New Capabilities

- `web-app-shell`: SvelteKit 2 + Svelte 5 + Skeleton UI v4 + Tailwind v4 application shell at the repo root, built with `@sveltejs/adapter-static` into `build/`, fronted by Cloudflare Workers via `wrangler.jsonc`. Defines the build/preview workflow, the static-asset overlay (legacy `chessboard/`, `chess-lore/`, `assets/`, `favicon.ico`, `sitemap.xml` served from `static/`), and the URL-stability contract for legacy paths.

### Modified Capabilities

<!-- None: chessjs-example-controls is unrelated to the deploy/build shell; this change does not alter its requirements. -->

## Impact

- **Code**: repo root layout fully replaced; `deploy-site/` removed; new top-level SvelteKit files; `package.json`, `package-lock.json`, `.gitignore`, `wrangler.jsonc` rewritten.
- **Dependencies**: full SvelteKit/Svelte 5/Skeleton/Tailwind/Vitest/Playwright stack pulled in at root; `wrangler`, `chess.js`, `@mirasen/chessboard` retained.
- **Build & deploy**: `npm run build` now produces `build/`; `wrangler dev`/CI deploy must point at `./build`. Local-only deploy command unchanged in spirit; CI wiring deferred.
- **URLs**: `/`, `/chessboard/`, `/chess-lore/`, `/sitemap.xml`, `/favicon.ico`, `/assets/*` must continue to resolve. `/` becomes the SvelteKit-rendered Skeleton demo page; legacy paths come from `static/`.
- **Tooling**: `npm run check`, `npm run lint`, `npm run test:unit`, `npx wrangler dev` are the new local-verification commands.
- **Filesystem**: `artifacts/main-web/` remains as the local backup and stays git-ignored.
