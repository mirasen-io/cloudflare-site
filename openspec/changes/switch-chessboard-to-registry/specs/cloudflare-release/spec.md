## MODIFIED Requirements

### Requirement: Release single-repo checkout, build via `npm run build`, deploy `./build/` directly

The release workflow SHALL use a single-repo checkout layout — only this repository is checked out, at the workflow root or at `./site` — and SHALL install dependencies through the kt-workflows wrapper's `install-script` input (not as a separate run step) using prefixes consistent with the wrapper's chosen working directory. The build SHALL run via `npm run build` (with `--prefix site` if invoked from workflow root). `@mirasen/chessboard` SHALL be installed from the npm registry as declared in `package.json`. The release workflow SHALL deploy the resulting SvelteKit build output directly via `cloudflare/wrangler-action@v4`. No intermediate staging script (e.g. `release:stage-deploy`) SHALL be introduced. `wrangler.jsonc` SHALL declare `assets.directory: ./build` (relative to the site directory), and `./deploy-site/` SHALL no longer be on the deployment path.

#### Scenario: Install order

- **WHEN** `release.yml` runs
- **THEN** it executes `npm ci --prefix site` (or `npm ci` if the wrapper runs from `./site`) before any build step
- **AND** there is no `actions/checkout` step targeting `mirasen-io/chessboard` and no `npm ci --prefix chessboard` step

#### Scenario: Build via npm run build

- **WHEN** the build phase runs
- **THEN** it invokes `npm run build --prefix site` (or `npm run build` if the wrapper runs from `./site`) and produces `./site/build/`
- **AND** the workflow does not invoke `npm run build:full` or `npm run build:chessboard`

#### Scenario: Deploy from `./build/`, not `./deploy-site/`

- **WHEN** the deploy step runs
- **THEN** `wrangler.jsonc#assets.directory` is `./build`
- **AND** `cloudflare/wrangler-action@v4` deploys what `vite build` produced
- **AND** no step copies, syncs, or otherwise stages files into `./deploy-site/`
