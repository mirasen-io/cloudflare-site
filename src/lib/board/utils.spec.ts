import type { Chessboard, MoveRequestInput } from '@mirasen/chessboard';
import { describe, expect, it } from 'vitest';
import { algebraic, fileOf, randomMove, rankOf } from './utils';

describe('algebraic', () => {
	it('maps square index 0 to a1', () => {
		expect(algebraic(0)).toBe('a1');
	});

	it('maps square index 63 to h8', () => {
		expect(algebraic(63)).toBe('h8');
	});

	it('wraps to the next rank at index 8', () => {
		expect(algebraic(8)).toBe('a2');
	});
});

describe('fileOf', () => {
	it('returns "a" for index 0', () => {
		expect(fileOf(0)).toBe('a');
	});

	it('returns "h" for index 63', () => {
		expect(fileOf(63)).toBe('h');
	});

	it('returns "a" again at index 8 (next rank, file resets)', () => {
		expect(fileOf(8)).toBe('a');
	});
});

describe('rankOf', () => {
	it('returns 1 for index 0', () => {
		expect(rankOf(0)).toBe(1);
	});

	it('returns 8 for index 63', () => {
		expect(rankOf(63)).toBe(8);
	});

	it('returns 2 for index 8', () => {
		expect(rankOf(8)).toBe(2);
	});
});

describe('randomMove', () => {
	function fakeBoardWithSinglePieceAt(squareIndex: number): {
		readonly board: Chessboard;
		readonly moves: MoveRequestInput[];
	} {
		const pieces = new Array(64).fill(0) as number[];
		// Any non-zero pieceCode is fine — randomMove only checks `> 0`.
		pieces[squareIndex] = 1;

		const moves: MoveRequestInput[] = [];

		const board = {
			getSnapshot() {
				return { state: { board: { pieces } } };
			},
			move(input: MoveRequestInput) {
				moves.push(input);
			}
		} as unknown as Chessboard;

		return { board, moves };
	}

	it('moves from the only occupied square to a different square', () => {
		const sourceIndex = 12; // e2
		const { board, moves } = fakeBoardWithSinglePieceAt(sourceIndex);

		randomMove(board);

		expect(moves).toHaveLength(1);
		const move = moves[0];
		expect(move.from).toBe(algebraic(sourceIndex));
		expect(move.to).not.toBe(move.from);
	});

	it('keeps the from-square stable across many invocations on a single-piece board', () => {
		const sourceIndex = 35; // d5
		const { board, moves } = fakeBoardWithSinglePieceAt(sourceIndex);
		const expectedFrom = algebraic(sourceIndex);

		for (let i = 0; i < 20; i += 1) randomMove(board);

		expect(moves).toHaveLength(20);
		for (const move of moves) {
			expect(move.from).toBe(expectedFrom);
			expect(move.to).not.toBe(expectedFrom);
		}
	});
});
