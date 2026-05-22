## Context

Repo root today is a hand-rolled static site:
- `wrangler.jsonc` `assets.directory = ./deploy-site`
- `deploy-site/index.html` + `chessboard/`, `chess-lore/`, `assets/`, `favicon.ico`, `sitemap.xml`
- Root `package.json` declares `wrangler ^4.93.0`, `chess.js ^1.4.0`, `@mirasen/chessboard ^1.2.4`
- Root `openspec/` contains this in-flight change and `specs/chessjs-example-controls/`
- `scripts/` contains repo automation
- `.claude/` contains project-level Claude config

A working SvelteKit replacement exists under `artifacts/main-web/`:
- SvelteKit 2 + Svelte 5 + Skeleton UI v4 + Tailwind v4
- `@sveltejs/adapter-static` → `build/`
- Vitest + Playwright already wired
- Has its own `.git`, `.claude/`, `openspec/` (independent of root)
- Currently a Skeleton demo with `/` and `/demo` — no chess content

`/artifacts` is already in root `.gitignore`, so leaving `artifacts/main-web/` in place is safe — it stays as an untracked local backup.

The user will migrate `deploy-site/` routes into SvelteKit incrementally in follow-up changes, leaning on `skeleton.dev` components. So this change is intentionally a narrow scaffold-promotion: get the SvelteKit project to the root, leave the legacy site running, do nothing destructive.

## Goals / Non-Goals

**Goals:**
- The SvelteKit project lives at the repo root: `npm install`, `npm run dev`, `npm run build`, `npm run check`, `npm run lint`, `npm run test:unit` all work from the root.
- The live site is unchanged: `wrangler dev` and any existing deploy path still serve `deploy-site/`.
- `artifacts/main-web/` remains on disk and untracked.
- Root `openspec/`, root `.claude/`, `scripts/`, `wrangler.jsonc`, `deploy-site/` are untouched.

**Non-Goals:**
- Porting any route from `deploy-site/` to SvelteKit.
- Switching the deploy/Wrangler target to `./build`.
- Removing or modifying `deploy-site/`.
- Merging `package.json` (we replace wholesale, per user direction).
- Touching `artifacts/main-web/openspec/` or root `openspec/`.
- Configuring Cloudflare GitHub Actions deploy.
- Preserving git history from `artifacts/main-web/.git` (no subtree merge).

## Decisions

### D1. Replace `package.json` with SvelteKit base, then re-add `wrangler` and `chess.js`
Take `artifacts/main-web/package.json` as the base and overwrite the root file. Then add `wrangler ^4.93.0` to `devDependencies` and `chess.js ^1.4.0` to `dependencies` (the pre-migration root versions). Drop `@mirasen/chessboard`. Regenerate `package-lock.json` via `npm install`.
**Why**: explicit user direction. `wrangler` is needed locally for `npx wrangler dev` against `deploy-site/` (the deploy continues to point there); declaring it in `devDependencies` keeps `npm` install reproducible. `chess.js` is kept as a runtime dep because the legacy `deploy-site/chessboard/` page or upcoming SvelteKit ports may consume it. `@mirasen/chessboard` is dropped because it isn't requested back; if a follow-up route needs it, that change re-adds it explicitly. **Alternative**: copy verbatim and never re-add — rejected, breaks `wrangler` workflow. **Alternative**: full merge — rejected, the user prefers a fresh manifest with two explicit adds rather than a merge of unrelated metadata fields.

### D2. Copy, don't move; don't touch `artifacts/main-web/.git`
Use `cp -R` for every transferred file. `artifacts/main-web/` stays in place as a local backup. We do not pull in its `.git`, `.claude/`, `openspec/`, `node_modules/`, `build/`, or `.svelte-kit/`.
**Why**: `/artifacts` is gitignored; keeping the source tree intact gives a free rollback point until the user is confident. Not pulling in a parallel `.git` keeps history clean. Not pulling in `artifacts/main-web/openspec/` is an explicit user instruction — root `openspec/` stays authoritative until the user re-inits it manually after this change.

### D3. `.gitignore` is a sensible union
Final root `.gitignore` is the union of root + `artifacts/main-web/.gitignore`. Required entries:
- Wrangler/env: `.wrangler`, `.dev.vars*`, `!.dev.vars.example`, `.env*`, `!.env.example`
- Node/build: `node_modules`, `dist`, `coverage*`, `/build`, `/.svelte-kit`, `.output`, `.vercel`, `.netlify`
- Vite/Playwright: `vite.config.js.timestamp-*`, `vite.config.ts.timestamp-*`, `test-results`
- OS: `.DS_Store`, `Thumbs.db`
- Claude: `.claude/settings.local.json`, `.claude/cache/`, `.claude/sessions/`
- **`/artifacts`** — load-bearing for keeping the backup untracked

**Why**: a strict union covers both worlds, with `/artifacts` explicitly preserved.

### D4. Don't touch `wrangler.jsonc`, `deploy-site/`, `scripts/`, `openspec/`, `.claude/`
Per user direction. Live deploy keeps serving `deploy-site/`; the SvelteKit project at the root is for `npm run dev` / `npm run build` only at this stage.
**Why**: minimum-risk migration. Switching the deploy target while the new site is still a Skeleton demo would visibly break the live site. Re-init of `openspec/` is a manual follow-up the user wants to do themselves.

### D5. No conflict between SvelteKit `static/` and legacy `deploy-site/`
The SvelteKit project's `static/` (currently just `robots.txt`) is the only `static/` at the root. We do **not** copy any legacy assets into it. If a SvelteKit `dev`/`build` happens to expose a route that also exists under `deploy-site/`, that's irrelevant — `wrangler` still serves `deploy-site/`, and `npm run dev`/`preview` only matter for incremental development.
**Why**: separation of concerns. Mixing legacy static into SvelteKit `static/` was the previous plan; with the new approach it's pure noise.

## Risks / Trade-offs

- **[Risk]** `npm install` against the SvelteKit base + the two re-added entries pulls a slightly different lockfile shape than the original SvelteKit project's lockfile. → **Mitigation**: regenerate `package-lock.json` from scratch in this change; future installs are deterministic against the new lock.
- **[Risk]** Dropping `@mirasen/chessboard` makes it unavailable at the root. → **Mitigation**: nothing in the SvelteKit scaffold imports it; the legacy `deploy-site/chessboard/` is plain static HTML/JS served by Cloudflare and does not consume root `node_modules`. A future port that needs it adds it back explicitly.
- **[Risk]** Two `package.json` files coexist — root (now SvelteKit) and `artifacts/main-web/package.json` (still there as backup) — which can confuse tooling. → **Mitigation**: `artifacts/` is gitignored and lives outside any `npm` workspace; tooling at the root doesn't see it.
- **[Trade-off]** Wholesale replace loses the previous `repository`/`author` metadata. → Acceptable: it can be added back trivially, and the SvelteKit `package.json` already reflects the project.
- **[Trade-off]** Two openspec folders coexist on disk (root + `artifacts/main-web/openspec/`). → Acceptable: `artifacts/` is gitignored, root is authoritative; the user will re-init root `openspec/` after archiving this change.

## Migration Plan

1. **Pre-flight**: `git status` clean on `migrate/sk` (modulo this in-flight openspec change). Confirm `artifacts/main-web/` exists and has the expected files.
2. **Copy SvelteKit scaffold** from `artifacts/main-web/` to root: `src/`, `static/`, `svelte.config.js`, `vite.config.ts`, `tsconfig.json`, `eslint.config.js`, `playwright.config.ts`, `.prettierrc`, `.prettierignore`, `.npmrc`, `AGENTS.md`.
3. **Replace `package.json`** with `artifacts/main-web/package.json`. Then add `wrangler ^4.93.0` to `devDependencies` and `chess.js ^1.4.0` to `dependencies`. Remove the old root `node_modules/` and `package-lock.json`.
4. **Merge `.gitignore`** per D3. Verify `git check-ignore -v artifacts/main-web` reports the path as ignored.
5. **`npm install`** at the root (regenerates `package-lock.json`).
6. **Verify**: `npm run dev` starts the dev server (smoke check `/` and `/demo`). `npm run build` produces `build/`. `npm run check`, `npm run lint`, `npm run test:unit` all pass.
7. **Confirm legacy intact**: `wrangler.jsonc` still says `./deploy-site`; `deploy-site/` is unchanged; `scripts/` is unchanged; root `openspec/` is unchanged; root `.claude/` is unchanged; `artifacts/main-web/` is on disk and `git status` doesn't list it.

**Rollback**: `git restore .` and `git clean -fd` undo all changes; `artifacts/main-web/` is untouched on disk so the SvelteKit source is still available.

## Open Questions

- After this change, does the user want a follow-up that re-adds `wrangler` to `devDependencies` so existing scripts in `scripts/` keep working? (Resolved out-of-band: user will inspect and decide.)
