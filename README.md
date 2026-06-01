# @mirasen/main-website

The mirasen.io website — SvelteKit + Cloudflare Pages, deployed via Wrangler.

## Development

```sh
npm install
npm run dev
```

## Build & verify

```sh
npm run build
npm run lint
npm run check
npm run test:unit
```

## Local development against in-progress `@mirasen/chessboard`

This project consumes `@mirasen/chessboard` from the npm registry (via the
semver range in [package.json](package.json)). For day-to-day development you
do not need a local checkout of the chessboard repository — `npm install` will
fetch the published tarball.

If you need to test an in-progress change in `@mirasen/chessboard` against
this site **before publishing it**, the [scripts/npm-link.sh](scripts/npm-link.sh)
helper (run automatically as the `postinstall` step) will substitute a
locally-developed copy whenever one is registered as a global npm link.

### One-time setup per developer machine

In your local clone of the chessboard repository:

```sh
cd ../chessboard      # wherever you have it checked out
npm link              # registers @mirasen/chessboard as a global link
```

This is required exactly once per machine. It does not modify either
`package.json`.

### Day-to-day flow

After the one-time setup, every `npm install` (or `npm ci`) in this repo
runs `postinstall → scripts/npm-link.sh`, which links the local
chessboard copy into `node_modules/@mirasen/chessboard`:

```sh
npm install
ls -la node_modules/@mirasen/chessboard
# => symlink → ../../../chessboard
```

Edits in your `chessboard` working tree are immediately visible to this site
(no rebuild step here required beyond what chessboard itself needs).

### Returning to the registry copy

To stop linking and use the published version again:

```sh
npm unlink -g @mirasen/chessboard
npm install
ls -la node_modules/@mirasen/chessboard
# => real directory (not a symlink)
```

### Before committing

Always verify that `package-lock.json` resolves `@mirasen/chessboard` to
a registry URL — not a `file:` path or a symlink fingerprint:

```sh
grep -A 2 '"node_modules/@mirasen/chessboard"' package-lock.json
# expect: "resolved": "https://registry.npmjs.org/@mirasen/chessboard/-/..."
```

If you see a `file:` path, your lockfile captured a linked state.
Unlink (above) and re-run `npm install` before committing.

### Release flow when chessboard changes are needed

The intended order when a fix in `@mirasen/chessboard` is required for
this site:

1. Develop the fix in `../chessboard` with the link active here.
2. Verify locally against this site.
3. Release `@mirasen/chessboard` (changeset publish) so a new version
   is on the registry.
4. Bump the `@mirasen/chessboard` semver range in this repo's
   [package.json](package.json) (Dependabot will normally do this for you;
   manual bump is fine when urgent).
5. Push, merge, deploy.
