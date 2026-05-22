## 1. Pre-flight

- [x] 1.1 Confirm working tree is clean on branch `migrate/sk` (no uncommitted changes other than this in-flight openspec change)
- [x] 1.2 Confirm `artifacts/main-web/` exists and contains at minimum `src/`, `static/`, `svelte.config.js`, `vite.config.ts`, `tsconfig.json`, `eslint.config.js`, `playwright.config.ts`, `.prettierrc`, `.prettierignore`, `.npmrc`, `AGENTS.md`, `package.json`, `package-lock.json`, `.gitignore`
- [x] 1.3 Confirm `deploy-site/`, `wrangler.jsonc`, `scripts/`, root `openspec/`, root `.claude/` are intact and will NOT be touched by this change

## 2. Copy SvelteKit scaffold to repo root

- [x] 2.1 Copy `artifacts/main-web/src/` → `./src/` (recursive)
- [x] 2.2 Copy `artifacts/main-web/static/` → `./static/` (recursive — should bring in at least `robots.txt`)
- [x] 2.3 Copy these top-level files from `artifacts/main-web/` to repo root: `svelte.config.js`, `vite.config.ts`, `tsconfig.json`, `eslint.config.js`, `playwright.config.ts`, `.prettierrc`, `.prettierignore`, `.npmrc`, `AGENTS.md`
- [x] 2.4 Verify NOT copied: `node_modules`, `build`, `.svelte-kit`, `.git`, `.claude`, `openspec`, `README.md`, `.DS_Store`, `.vscode`, `.gitignore` (gitignore is handled separately in step 4)

## 3. Replace `package.json` and regenerate lockfile

- [x] 3.1 Remove root `node_modules/` and root `package-lock.json`
- [x] 3.2 Overwrite root `package.json` with `artifacts/main-web/package.json` verbatim
- [x] 3.3 Add `"wrangler": "^4.93.0"` to `devDependencies` in the new root `package.json`
- [x] 3.4 Add `"chess.js": "^1.4.0"` to `dependencies` in the new root `package.json`
- [x] 3.5 Verify root `package.json` does NOT contain `@mirasen/chessboard` (the user will re-add it later via a `file:...` reference)
- [x] 3.6 Run `npm install` at the root to regenerate `package-lock.json`

## 4. Merge `.gitignore`

- [x] 4.1 Build the union of the previous root `.gitignore` and `artifacts/main-web/.gitignore`
- [x] 4.2 Ensure these entries are present: wrangler/env (`.wrangler`, `.dev.vars*`, `!.dev.vars.example`, `.env*`, `!.env.example`), node/build (`node_modules`, `dist`, `coverage*`, `/build`, `/.svelte-kit`, `.output`, `.vercel`, `.netlify`), Vite/Playwright (`vite.config.js.timestamp-*`, `vite.config.ts.timestamp-*`, `test-results`), OS (`.DS_Store`, `Thumbs.db`), Claude (`.claude/settings.local.json`, `.claude/cache/`, `.claude/sessions/`)
- [x] 4.3 Ensure `/artifacts` is present so `artifacts/main-web/` stays untracked
- [x] 4.4 Verify with `git check-ignore -v artifacts/main-web` that the path is ignored

## 5. Smoke-check the SvelteKit project

- [x] 5.1 Run `npm run dev` briefly; confirm the server starts and `/` and `/demo` respond
- [x] 5.2 Stop the dev server
- [x] 5.3 Run `npm run build` and confirm it produces `build/index.html` and the SvelteKit asset bundle

## 6. Toolchain checks

- [x] 6.1 Run `npm run check` — must exit 0
- [x] 6.2 Run `npm run lint` — must exit 0
- [x] 6.3 Run `npm run test:unit -- --run` — must exit 0

## 7. Confirm legacy intact

- [x] 7.1 Diff `wrangler.jsonc` against pre-migration state — must be byte-identical (still pointing at `./deploy-site`)
- [x] 7.2 Diff `scripts/`, root `openspec/` (modulo this in-flight change), root `.claude/` against pre-migration state — must be unchanged
- [x] 7.3 Diff `deploy-site/` listing — must be unchanged
- [x] 7.4 Run `npx wrangler dev` and confirm it still serves the legacy site (`/` returns the previous `deploy-site/index.html`); stop wrangler

## 8. Final repo hygiene

- [x] 8.1 Confirm `artifacts/main-web/` is on disk and NOT listed by `git status` (still ignored)
- [x] 8.2 Run `git status` and verify the change set is: new SvelteKit files added at the root, `package.json` and `package-lock.json` modified, `.gitignore` modified, `build/` and `.svelte-kit/` ignored
- [x] 8.3 Stage changes (do NOT commit unless explicitly asked) and report a concise summary diff to the user
