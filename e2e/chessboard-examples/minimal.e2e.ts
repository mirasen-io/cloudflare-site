import { expect, test } from '@playwright/test';
import { trapPageErrors } from '../utils/page-errors';

test('minimal example renders, controls work, no runtime errors', async ({ page }) => {
	const assertNoPageErrors = trapPageErrors(page);

	await page.goto('/chessboard/examples/minimal');
	await page.locator('html.app-started').waitFor();

	await expect(page.getByRole('heading', { level: 1, name: 'Move pieces freely' })).toBeVisible();

	const boardRoots = page.locator('[data-chessboard-id="board-root"]');
	await expect(boardRoots).toHaveCount(1);
	await expect(boardRoots.first()).toBeVisible();

	await expect(page.getByRole('button', { name: /^Orientation:/ })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Reset position' })).toBeVisible();
	const randomMoveButton = page.getByRole('button', { name: 'Random move' });
	await expect(randomMoveButton).toBeVisible();

	await randomMoveButton.click();
	await expect(boardRoots.first()).toBeVisible();

	assertNoPageErrors();
});
