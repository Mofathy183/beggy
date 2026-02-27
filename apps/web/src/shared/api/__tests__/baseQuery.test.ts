import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { baseQuery } from '../baseQuery';

const mockRawBaseQuery = vi.fn();
const mockSerializeParams = vi.fn();
const mockNormalizeError = vi.fn();

vi.mock('@reduxjs/toolkit/query/react', async () => {
	const actual = await vi.importActual<
		typeof import('@reduxjs/toolkit/query/react')
	>('@reduxjs/toolkit/query/react');

	return {
		...actual,
		fetchBaseQuery: vi.fn(() => mockRawBaseQuery),
	};
});

vi.mock('@shared/utils', () => {
	const actual =
		vi.importActual<typeof import('@shared/utils')>('@shared/utils');

	return {
		...actual,
		serializeParams: (...args: unknown[]) => mockSerializeParams(...args),
		normalizeError: (...args: unknown[]) => mockNormalizeError(...args),
	};
});

vi.mock('@/env', () => ({
	env: {
		API_URL: 'https://api.example.com',
	},
}));

describe('baseQuery()', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns data when the request succeeds', async () => {
		const args = '/test';
		const serializedArgs = '/test?x=1';

		mockSerializeParams.mockReturnValueOnce(serializedArgs);

		mockRawBaseQuery.mockResolvedValueOnce({
			data: { id: 1 },
		});

		const result = await baseQuery(args, {} as any, {} as any);

		expect(mockSerializeParams).toHaveBeenCalledWith(args);
		expect(mockRawBaseQuery).toHaveBeenCalledWith(
			serializedArgs,
			expect.anything(),
			expect.anything()
		);

		expect(result).toEqual({
			data: { id: 1 },
		});
	});

	it('returns normalized error when the request fails', async () => {
		const rawError: FetchBaseQueryError = {
			status: 400,
			data: { message: 'Bad request' },
		};

		const normalizedError = {
			statusCode: 400,
			body: { message: 'Bad request' },
		};

		mockSerializeParams.mockReturnValueOnce('/test');
		mockRawBaseQuery.mockResolvedValueOnce({ error: rawError });
		mockNormalizeError.mockReturnValueOnce(normalizedError);

		const result = await baseQuery('/test', {} as any, {} as any);

		expect(mockNormalizeError).toHaveBeenCalledWith(rawError);

		expect(result).toEqual({
			error: normalizedError,
		});
	});

	it('resolves even when the request fails', async () => {
		mockSerializeParams.mockReturnValueOnce('/test');

		mockRawBaseQuery.mockResolvedValueOnce({
			error: { status: 500, data: {} },
		});

		mockNormalizeError.mockReturnValueOnce({
			statusCode: 500,
			body: {} as any,
		});

		await expect(
			baseQuery('/test', {} as any, {} as any)
		).resolves.toBeDefined();
	});

	it('forwards fetch arguments unchanged', async () => {
		const args = { url: '/users', method: 'POST' };

		mockSerializeParams.mockReturnValueOnce(args);
		mockRawBaseQuery.mockResolvedValueOnce({ data: { ok: true } });

		const result = await baseQuery(args, {} as any, {} as any);

		expect(mockSerializeParams).toHaveBeenCalledWith(args);
		expect(result).toEqual({ data: { ok: true } });
	});
});
