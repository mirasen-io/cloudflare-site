import { expect, test } from '@playwright/test';
import { trapPageErrors } from '../utils/page-errors';

test('chess.js example renders, controls visible, reset preserves status, no runtime errors', async ({
	page
}) => {
	const assertNoPageErrors = trapPageErrors(page);

	await page.goto('/chessboard/examples/chessjs');
	await page.locator('html.app-started').waitFor();

	await expect(
		page.getByRole('heading', { level: 1, name: 'Play against a random-move computer' })
	).toBeVisible();

	const boardRoots = page.locator('[data-chessboard-id="board-root"]');
	await expect(boardRoots).toHaveCount(1);
	await expect(boardRoots.first()).toBeVisible();

	await expect(page.getByRole('button', { name: /^Orientation:/ })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Reset', exact: true })).toBeVisible();
	await expect(page.getByRole('button', { name: /^Auto-queen:/ })).toBeVisible();
	await expect(page.getByRole('button', { name: /^Draw:/ })).toBeVisible();
	await expect(page.getByRole('button', { name: /^Auto-clear:/ })).toBeVisible();

	const dragGroup = page.getByRole('group', { name: 'Drag preset' });
	await expect(dragGroup.getByRole('button', { name: 'Desktop' })).toBeVisible();
	await expect(dragGroup.getByRole('button', { name: 'Mobile' })).toBeVisible();

	const animGroup = page.getByRole('group', { name: 'Animation' });
	await expect(animGroup.getByRole('button', { name: 'On' })).toBeVisible();
	await expect(animGroup.getByRole('button', { name: 'Off' })).toBeVisible();

	const modGroup = page.getByRole('group', { name: 'Draw modifier' });
	for (const name of ['keyboard', 'ctrl', 'shift', 'alt', 'meta']) {
		await expect(modGroup.getByRole('button', { name })).toBeVisible();
	}

	await expect(page.getByText('Your move')).toBeVisible();

	await page.getByRole('button', { name: 'Reset', exact: true }).click();
	await expect(page.getByText('Your move')).toBeVisible();
	await expect(boardRoots.first()).toBeVisible();

	assertNoPageErrors();
});
