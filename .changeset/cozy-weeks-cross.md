---
'@mirasen/main-website': major
---

Add GitHub Actions validation and Cloudflare release deployment workflows.

This release introduces the production workflow setup for the SvelteKit/Cloudflare Mirasen site:

- add CI validation for lint, type checking, build, and tests;
- add CodeQL analysis;
- add Dependabot auto-merge and scheduled auto-release workflows;
- add contribution branch sync/reset workflows;
- add a Changesets-driven release workflow that creates GitHub releases;
- deploy released builds to Cloudflare through `cloudflare/wrangler-action`;
- deploy the SvelteKit build output from `./build`;
- preserve no-trailing-slash canonical URL behavior through Cloudflare Workers Static Assets `html_handling`;
- keep the local sibling `../chessboard` dependency workflow supported in CI.

The site release flow now treats GitHub Actions as the source of truth for validation and release deployment.
