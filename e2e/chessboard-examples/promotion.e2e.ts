import { expect, test } from '@playwright/test';
import { trapPageErrors } from '../utils/page-errors';

test('promotion example renders, auto-queen toggles, no runtime errors', async ({ page }) => {
	const assertNoPageErrors = trapPageErrors(page);

	await page.goto('/chessboard/examples/promotion');
	await page.locator('html.app-started').waitFor();

	await expect(page.getByRole('heading', { level: 1, name: 'Promotion flow' })).toBeVisible();

	const boardRoots = page.locator('[data-chessboard-id="board-root"]');
	await expect(boardRoots).toHaveCount(1);
	await expect(boardRoots.first()).toBeVisible();

	await expect(page.getByRole('button', { name: /^Orientation:/ })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Reset position' })).toBeVisible();

	const autoQueenButton = page.getByRole('button', { name: /^Auto-queen:/ });
	await expect(autoQueenButton).toBeVisible();
	await expect(autoQueenButton).toHaveText('Auto-queen: off');

	await autoQueenButton.click();
	await expect(autoQueenButton).toHaveText('Auto-queen: on');

	await autoQueenButton.click();
	await expect(autoQueenButton).toHaveText('Auto-queen: off');

	assertNoPageErrors();
});
