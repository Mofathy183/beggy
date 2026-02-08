import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { baseQuery } from '../baseQuery';

const mockRawBaseQuery = vi.fn();

vi.mock('@reduxjs/toolkit/query/react', async () => {
	const actual = await vi.importActual<
		typeof import('@reduxjs/toolkit/query/react')
	>('@reduxjs/toolkit/query/react');

	return {
		...actual,
		fetchBaseQuery: vi.fn(() => mockRawBaseQuery),
	};
});

vi.mock('@/env', () => ({
	env: {
		API_URL: 'https://api.example.com',
	},
}));

describe('baseQuery', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns data when request succeeds', async () => {
		mockRawBaseQuery.mockResolvedValueOnce({
			data: { id: 1, name: 'Test' },
		});

		const result = await baseQuery('/test', {} as any, {} as any);

		expect(result).toEqual({
			data: { id: 1, name: 'Test' },
		});
	});

	it('returns error when request fails', async () => {
		const error: FetchBaseQueryError = {
			status: 400,
			data: { message: 'Bad request' },
		};

		mockRawBaseQuery.mockResolvedValueOnce({ error });

		const result = await baseQuery('/test', {} as any, {} as any);

		expect(result).toEqual({ error });
	});

	it('does not throw when an error occurs', async () => {
		mockRawBaseQuery.mockResolvedValueOnce({
			error: { status: 500, data: {} },
		});

		await expect(
			baseQuery('/test', {} as any, {} as any)
		).resolves.toBeDefined();
	});
});
