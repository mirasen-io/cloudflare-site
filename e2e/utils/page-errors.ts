import type { Page } from '@playwright/test';

// Allowed console.error patterns. Start empty. Add an entry only with a
// comment naming the third-party source of the noise and the text being
// suppressed.
const ALLOWED_CONSOLE_ERRORS: readonly RegExp[] = [];

export function trapPageErrors(page: Page): () => void {
	const pageErrors: Error[] = [];
	const consoleErrors: string[] = [];

	page.on('pageerror', (err) => {
		pageErrors.push(err);
	});

	page.on('console', (msg) => {
		if (msg.type() !== 'error') return;
		const text = msg.text();
		if (ALLOWED_CONSOLE_ERRORS.some((pattern) => pattern.test(text))) return;
		consoleErrors.push(text);
	});

	return function assertNoPageErrors(): void {
		if (pageErrors.length === 0 && consoleErrors.length === 0) return;

		const lines: string[] = [];

		if (pageErrors.length > 0) {
			lines.push(`Captured ${pageErrors.length} uncaught page error(s):`);
			for (const err of pageErrors) {
				lines.push(`  - ${err.message}`);
				if (err.stack) {
					const stackLines = err.stack.split('\n').slice(1, 4);
					for (const stackLine of stackLines) {
						lines.push(`    ${stackLine.trim()}`);
					}
				}
			}
		}

		if (consoleErrors.length > 0) {
			lines.push(`Captured ${consoleErrors.length} console.error message(s):`);
			for (const text of consoleErrors) {
				lines.push(`  - ${text}`);
			}
		}

		throw new Error(lines.join('\n'));
	};
}
