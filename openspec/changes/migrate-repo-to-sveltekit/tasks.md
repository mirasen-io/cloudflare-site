## 1. Pre-flight

- [ ] 1.1 Confirm working tree is clean on branch `migrate/sk` (`git status` reports no uncommitted changes other than this openspec change)
- [ ] 1.2 Confirm `artifacts/main-web/` exists and contains `src/`, `static/`, `svelte.config.js`, `vite.config.ts`, `tsconfig.json`, `eslint.config.js`, `playwright.config.ts`, `.prettierrc`, `.prettierignore`, `.npmrc`, `AGENTS.md`, `package.json`, `.claude/`
- [ ] 1.3 Confirm `deploy-site/` contains exactly `index.html`, `chessboard/`, `chess-lore/`, `assets/`, `favicon.ico`, `sitemap.xml`

## 2. Copy SvelteKit scaffold to repo root

- [ ] 2.1 Copy `artifacts/main-web/src/` → `./src/` (recursive, do not follow symlinks)
- [ ] 2.2 Copy `artifacts/main-web/static/` → `./static/` (recursive — should bring in at least `robots.txt`)
- [ ] 2.3 Copy these top-level files from `artifacts/main-web/` to repo root: `svelte.config.js`, `vite.config.ts`, `tsconfig.json`, `eslint.config.js`, `playwright.config.ts`, `.prettierrc`, `.prettierignore`, `.npmrc`, `AGENTS.md`
- [ ] 2.4 Verify NOT copied: `node_modules`, `build`, `.svelte-kit`, `.git`, `.claude`, `openspec`, `package-lock.json`, `README.md`, `.DS_Store`, `.vscode`

## 3. Merge `package.json` and regenerate lockfile

- [ ] 3.1 Take `artifacts/main-web/package.json` as the base
- [ ] 3.2 Add `chess.js` and `@mirasen/chessboard` (with their existing root caret ranges) to `dependencies`
- [ ] 3.3 Add `wrangler` (with its existing root caret range) to `devDependencies`
- [ ] 3.4 Preserve `repository`, `author`, `bugs`, `homepage` fields from the previous root `package.json` if non-empty; keep `name`, `version`, `private`, `type`, `scripts` from the SvelteKit base
- [ ] 3.5 Write merged `package.json` to repo root
- [ ] 3.6 Remove root `node_modules/` and previous `package-lock.json`; run `npm install` to regenerate the lockfile

## 4. Merge `.gitignore`

- [ ] 4.1 Build the union of root `.gitignore` and `artifacts/main-web/.gitignore`
- [ ] 4.2 Ensure these entries are present: `.wrangler`, `.dev.vars*`, `!.dev.vars.example`, `.env*`, `!.env.example`, `node_modules`, `dist`, `build`, `coverage*`, `.svelte-kit`, `.DS_Store`, `.claude/settings.local.json`, `.claude/cache/`, `.claude/sessions/`
- [ ] 4.3 Ensure `/artifacts` (or `artifacts/`) is present so `artifacts/main-web/` stays untracked
- [ ] 4.4 Verify with `git check-ignore -v artifacts/main-web` that the path is ignored

## 5. Repoint Wrangler

- [ ] 5.1 In `wrangler.jsonc`, change `assets.directory` from `./deploy-site` to `./build`
- [ ] 5.2 Leave `compatibility_date`, `compatibility_flags`, `observability`, `name` unchanged
- [ ] 5.3 Confirm the file still parses (no trailing-comma issues, valid JSONC)

## 6. Overlay legacy static content into `static/`

- [ ] 6.1 Copy `deploy-site/chessboard/` → `static/chessboard/` (recursive)
- [ ] 6.2 Copy `deploy-site/chess-lore/` → `static/chess-lore/` (recursive)
- [ ] 6.3 Copy `deploy-site/assets/` → `static/assets/` (recursive)
- [ ] 6.4 Copy `deploy-site/favicon.ico` → `static/favicon.ico`
- [ ] 6.5 Copy `deploy-site/sitemap.xml` → `static/sitemap.xml`
- [ ] 6.6 Confirm `deploy-site/index.html` was NOT copied (root path is owned by `src/routes/+page.svelte`)

## 7. Port Claude permissions (best effort)

- [ ] 7.1 Read `artifacts/main-web/.claude/settings.json` if present
- [ ] 7.2 Identify any `permissions.allow` / `permissions.deny` / `hooks` entries not already in the root `.claude/settings.json`
- [ ] 7.3 If any are useful, merge them into root `.claude/settings.json` (do NOT overwrite existing entries; do NOT copy `cache/`, `sessions/`, `settings.local.json`)
- [ ] 7.4 If nothing useful is present, skip this group and note it

## 8. Build, preview, and verify URL stability

- [ ] 8.1 Run `npm run build` and confirm it exits 0
- [ ] 8.2 List `build/` and confirm it contains `index.html`, `chessboard/`, `chess-lore/`, `assets/`, `favicon.ico`, `sitemap.xml`
- [ ] 8.3 Start `npm run preview` and verify the following URLs return 200 with expected content: `/`, `/chessboard/`, `/chess-lore/`, `/sitemap.xml`, `/favicon.ico`
- [ ] 8.4 Stop preview and run `npx wrangler dev` against `./build`; verify the same URLs again
- [ ] 8.5 Stop wrangler

## 9. Toolchain checks

- [ ] 9.1 Run `npm run check` — must exit 0
- [ ] 9.2 Run `npm run lint` — must exit 0
- [ ] 9.3 Run `npm run test:unit -- --run` — must exit 0

## 10. Remove legacy site

- [ ] 10.1 Only after groups 8 and 9 are green: `rm -rf deploy-site/`
- [ ] 10.2 Re-run `npm run build` and `npx wrangler dev` once more to confirm the site still works without `deploy-site/`

## 11. Final repo hygiene

- [ ] 11.1 Run `git status` — confirm `deploy-site/` removed, SvelteKit files added, `package.json`/`package-lock.json`/`.gitignore`/`wrangler.jsonc` modified
- [ ] 11.2 Confirm `artifacts/main-web/` is NOT listed in `git status` (still ignored)
- [ ] 11.3 Stage changes (do not commit unless explicitly asked) and report a summary diff to the user
