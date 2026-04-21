import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request } from 'express';
import { z } from 'zod';
import {
	validateBody,
	validateQuery,
	validateRequest,
	validateUuidParam,
} from '@shared/middlewares';

// 🔌 Mock external dependencies
vi.mock('@shared/utils', () => ({
	reconstructQuery: vi.fn(),
}));

vi.mock('@beggy/shared/schemas', () => ({
	ParamsSchema: {
		uuid: {
			parseAsync: vi.fn(),
		},
	},
}));

import { reconstructQuery } from '@shared/utils';
import { ParamsSchema } from '@beggy/shared/schemas';

const mockReq = (overrides: Partial<Request> = {}) =>
	({
		body: {},
		query: {},
		params: {},
		...overrides,
	}) as Request;

describe('validateRequest()', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('body validation', () => {
		it('replaces request body with validated data', async () => {
			// Arrange
			const next = vi.fn();

			const schema = z.object({
				name: z.string(),
			});

			const req = mockReq({ body: { name: 'Beggy' } });

			// Act
			await validateRequest({ body: schema })(req, {} as any, next);

			// Assert
			expect(req.body).toEqual({ name: 'Beggy' });
			expect(next).toHaveBeenCalledOnce();
		});

		it('passes body validation errors to next', async () => {
			// Arrange
			const next = vi.fn();

			const schema = z.object({
				name: z.string(),
			});

			const req = mockReq({ body: { name: 123 } });

			// Act
			await validateRequest({ body: schema })(req, {} as any, next);

			// Assert
			expect(next).toHaveBeenCalledOnce();
			expect(next).toHaveBeenCalledWith(expect.any(Error));
		});
	});

	describe('query validation', () => {
		it('reconstructs and replaces request query with validated data', async () => {
			// Arrange
			const next = vi.fn();

			const schema = z.object({
				page: z.number(),
			});

			const originalQuery = { page: '2', extra: 'x' };

			(reconstructQuery as any).mockReturnValue({ page: 2 });

			const req = mockReq({ query: originalQuery });

			// Act
			await validateRequest({ query: schema })(req, {} as any, next);

			// Assert
			expect(reconstructQuery).toHaveBeenCalledWith(originalQuery);

			expect(req.query).toEqual({ page: 2, extra: 'x' });

			expect(next).toHaveBeenCalledOnce();
		});

		it('passes query validation errors to next', async () => {
			// Arrange
			const next = vi.fn();

			const schema = z.object({
				page: z.number(),
			});

			(reconstructQuery as any).mockReturnValue({ page: 'invalid' });

			const req = mockReq({ query: { page: 'bad' } });

			// Act
			await validateRequest({ query: schema })(req, {} as any, next);

			// Assert
			expect(next).toHaveBeenCalledOnce();
			expect(next).toHaveBeenCalledWith(expect.any(Error));
		});
	});

	describe('params validation', () => {
		it('replaces request params with validated data', async () => {
			// Arrange
			const next = vi.fn();

			const schema = z.object({
				id: z.string(),
			});

			const req = mockReq({
				params: { id: '123' },
			});

			// Act
			await validateRequest({ params: schema })(req, {} as any, next);

			// Assert
			expect(req.params).toEqual({ id: '123' });
			expect(next).toHaveBeenCalledOnce();
		});

		it('passes params validation errors to next', async () => {
			// Arrange
			const next = vi.fn();

			const schema = z.object({
				id: z.string().uuid(),
			});

			const req = mockReq({
				params: { id: 'invalid' },
			});

			// Act
			await validateRequest({ params: schema })(req, {} as any, next);

			// Assert
			expect(next).toHaveBeenCalledOnce();
			expect(next).toHaveBeenCalledWith(expect.any(Error));
		});
	});
});

describe('validateBody()', () => {
	it('replaces request body with validated data', async () => {
		// Arrange
		const next = vi.fn();

		const schema = z.object({ foo: z.string() });
		const req = mockReq({ body: { foo: 'bar' } });

		// Act
		await validateBody(schema)(req, {} as any, next);

		// Assert
		expect(req.body).toEqual({ foo: 'bar' });
		expect(next).toHaveBeenCalledOnce();
	});
});

describe('validateQuery()', () => {
	it('reconstructs and replaces request query with validated data', async () => {
		// Arrange
		const next = vi.fn();

		const schema = z.object({ page: z.number() });

		(reconstructQuery as any).mockReturnValue({ page: 1 });

		const req = mockReq({ query: { page: '1' } });

		// Act
		await validateQuery(schema)(req, {} as any, next);

		// Assert
		expect(req.query).toEqual({ page: 1 });
		expect(next).toHaveBeenCalledOnce();
	});
});

describe('validateUuidParam()', () => {
	it('replaces request params when uuid is valid', async () => {
		// Arrange
		const next = vi.fn();

		(ParamsSchema.uuid.parseAsync as any).mockResolvedValue({
			id: 'uuid',
		});

		const req = mockReq({
			params: { id: 'uuid' },
		});

		// Act
		await validateUuidParam(req, {} as any, next);

		// Assert
		expect(req.params).toEqual({ id: 'uuid' });
		expect(next).toHaveBeenCalledOnce();
	});

	it('passes uuid validation errors to next', async () => {
		// Arrange
		const next = vi.fn();

		(ParamsSchema.uuid.parseAsync as any).mockRejectedValue(
			new Error('invalid uuid')
		);

		const req = mockReq({
			params: { id: 'bad' },
		});

		// Act
		await validateUuidParam(req, {} as any, next);

		// Assert
		expect(next).toHaveBeenCalledOnce();
		expect(next).toHaveBeenCalledWith(expect.any(Error));
	});
});
