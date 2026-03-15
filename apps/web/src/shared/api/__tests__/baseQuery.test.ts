import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

const { mockRawBaseQuery, mockSerializeParams, mockNormalizeError } =
	vi.hoisted(() => ({
		mockRawBaseQuery: vi.fn(),
		mockSerializeParams: vi.fn(),
		mockNormalizeError: vi.fn(),
	}));

vi.mock('@reduxjs/toolkit/query/react', async () => {
	const actual = await vi.importActual<
		typeof import('@reduxjs/toolkit/query/react')
	>('@reduxjs/toolkit/query/react');

	return {
		...actual,
		fetchBaseQuery: vi.fn(() => mockRawBaseQuery),
	};
});

vi.mock('@shared/utils', async () => {
	const actual =
		await vi.importActual<typeof import('@shared/utils')>('@shared/utils');

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

import { baseQuery } from '../baseQuery';

describe('baseQuery', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns response data when the request succeeds', async () => {
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

	it('serializes request arguments before executing the request', async () => {
		const args = '/users';
		const serialized = '/users?limit=10';

		mockSerializeParams.mockReturnValueOnce(serialized);

		mockRawBaseQuery.mockResolvedValueOnce({
			data: { ok: true },
		});

		await baseQuery(args, {} as any, {} as any);

		expect(mockSerializeParams).toHaveBeenCalledBefore(mockRawBaseQuery);
	});

	it('returns a normalized error when the request fails', async () => {
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

	it('forwards serialized request arguments to the raw base query', async () => {
		const args = { url: '/users', method: 'POST' };

		mockSerializeParams.mockReturnValueOnce(args);
		mockRawBaseQuery.mockResolvedValueOnce({
			data: { ok: true },
		});

		const result = await baseQuery(args, {} as any, {} as any);

		expect(mockSerializeParams).toHaveBeenCalledWith(args);

		expect(mockRawBaseQuery).toHaveBeenCalledWith(
			args,
			expect.anything(),
			expect.anything()
		);

		expect(result).toEqual({
			data: { ok: true },
		});
	});

	it('never throws errors and always resolves with a result object', async () => {
		mockSerializeParams.mockReturnValueOnce('/test');

		mockRawBaseQuery.mockResolvedValueOnce({
			error: { status: 500, data: {} },
		});

		mockNormalizeError.mockReturnValueOnce({
			statusCode: 500,
			body: {},
		});

		await expect(
			baseQuery('/test', {} as any, {} as any)
		).resolves.toBeDefined();
	});
});
