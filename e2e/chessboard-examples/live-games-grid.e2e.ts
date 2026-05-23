import { expect, test } from '@playwright/test';
import { trapPageErrors } from '../utils/page-errors';

test('live-games grid renders 12 cards, link navigates to chess.js, no runtime errors', async ({
	page
}) => {
	const assertNoPageErrors = trapPageErrors(page);

	await page.goto('/chessboard/examples/live-games-grid');
	await page.locator('html.app-started').waitFor();

	await expect(
		page.getByRole('heading', {
			level: 1,
			name: '12 boards. 12 engines. Zero shared clocks.'
		})
	).toBeVisible();

	const cards = page.getByTestId('live-game-card');
	await expect(cards).toHaveCount(12);

	const boardRoots = page.locator('[data-chessboard-id="board-root"]');
	await expect(boardRoots).toHaveCount(12);

	const firstCard = cards.first();
	await expect(firstCard).toContainText('Bot Aurora');
	await expect(firstCard).toContainText('1842');

	const firstLink = page.getByTestId('live-board-link').first();
	await expect(firstLink).toHaveAttribute('href', /\/chessboard\/examples\/chessjs$/);

	await firstLink.click();
	await page.waitForURL(/\/chessboard\/examples\/chessjs$/);
	await page.locator('html.app-started').waitFor();
	expect(page.url()).toMatch(/\/chessboard\/examples\/chessjs$/);

	assertNoPageErrors();
});
