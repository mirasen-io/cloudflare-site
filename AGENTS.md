## Project Configuration

- **Language**: TypeScript
- **Package Manager**: npm
- **Add-ons**: prettier, eslint, vitest, playwright, tailwindcss, enhanced-img, sveltekit-adapter, ai-tools

## Validation Workflow

- Run `npm run format` after code or configuration changes. Preserve generated skills and existing specification archives using the repository's formatting exclusions.
- Run `npm run lint`, `npm run check`, and `npm run build` after a coherent block of work or a dependency/configuration change, not after every small edit.
- Run existing tests when behavior they cover changes or when the user requests verification. Preserve the existing unit and end-to-end suites.
- Browser inspection does not require generating new automated tests; create tests only when the task calls for them.
- In the final response, briefly report formatting and the checks actually run, including any unavailable checks.

## Browser Verification

Browser checks are for verifying a meaningful visual state, not part of the routine edit loop.

- Use the project's own CLI: `./node_modules/.bin/playwright-cli`, not a global install. Check `--help` instead of guessing commands. If the dependency is not installed, say so; do not install it silently or change `package.json` for verification.
- Start `npm run dev` in the background, wait for the URL Vite reports, and use that URL. Do not run `npm run build` just to look at a page. Stop the server you started when done, and never leave duplicate servers on different ports.
- Restart the dev server when routing, layout, assets, config, dependencies, or generated files changed, HMR fails, or the output looks stale. Always perform a fresh restart before final visual verification, then reload the target routes.
- Keep it token-efficient:
  - Do not take screenshots after routine edits.
  - Prefer `playwright-cli find` to locate nodes in a large page.
  - Prefer snapshots of an element or selector over full-page snapshots, and limit snapshot depth.
  - Use `--raw` when only the value is needed.
  - Read saved snapshot files only when their content is needed.
- A browser skill provides usage guidance; verify that its executable is actually available. If browser tooling cannot be used, report visual verification as unavailable and avoid claims that depend on it.
- Use named browser sessions and close only the sessions you started.
- Keep CLI output (`.playwright-cli/`, screenshots) temporary and untracked; remove routine output when finished. Retain requested migration comparison evidence only under ignored `artifacts/`.

### Final Visual Comparison

- Use the rendered local site as implementation evidence. For migrations, compare against the existing rendered site at matching viewport sizes and interaction states.
- Inspect representative wide and narrow widths, plus intermediate widths where the layout meaningfully changes. Exercise materially different views and states, including expanded menus, controls, and navigation between views.
- Check composition, alignment, spacing, typography, colors, surfaces, imagery, repeated components, scrolling, overflow, and continued access to navigation. Preserve state across view switches where the product requires it.
- Capture the regions or states needed for comparison. DOM snapshots do not replace visual inspection, and screenshot counts are neither a coverage target nor a limit.
- Fix meaningful visible discrepancies with targeted edits, then recheck the affected views, states, and widths. Avoid chasing meaningless subpixel differences or changing unrelated copy and behavior.
- For substantial repeated UI changes, compare the first coherent slice before propagating its visual treatment to other views.
- Report the routes, states, and viewport sizes actually checked. Claim pixel-perfect fidelity only when the rendered output was compared visually.

---

You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

## Available Svelte MCP Tools:

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.
