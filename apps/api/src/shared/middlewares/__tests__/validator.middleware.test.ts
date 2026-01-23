import { describe, it, expect, vi } from 'vitest';
import type { Request } from 'express';
import { z } from 'zod';
import {
	validateBody,
	validateQuery,
	validateRequest,
	validateUuidParam,
} from '@shared/middlewares';

const mockNext = vi.fn();

const mockReq = (overrides: Partial<Request> = {}) =>
	({
		body: {},
		query: {},
		params: {},
		...overrides,
	}) as Request;

describe('validateRequest', () => {
	describe('body validation', () => {
		it('replaces request body with validated data', async () => {
			const schema = z.object({
				name: z.string(),
			});

			const req = mockReq({ body: { name: 'Beggy' } });

			await validateRequest({ body: schema })(req, {} as any, mockNext);

			expect(req.body).toEqual({ name: 'Beggy' });
			expect(mockNext).toHaveBeenCalledOnce();
		});

		it('passes body validation errors to next', async () => {
			const schema = z.object({
				name: z.string(),
			});

			const req = mockReq({ body: { name: 123 } });

			await validateRequest({ body: schema })(req, {} as any, mockNext);

			expect(mockNext).toHaveBeenCalledOnce();
			expect((mockNext as any).mock.calls[0][0]).toBeInstanceOf(Error);
		});
	});

	describe('query validation', () => {
		it('replaces request query with validated data', async () => {
			const schema = z.object({
				page: z.coerce.number(),
			});

			const req = mockReq({ query: { page: '2' } });

			await validateRequest({ query: schema })(req, {} as any, mockNext);

			expect(req.query).toEqual({ page: 2 });
			expect(mockNext).toHaveBeenCalledOnce();
		});
	});

	describe('params validation', () => {
		it('replaces request params with validated data', async () => {
			const schema = z.object({
				id: z.string().uuid(),
			});

			const req = mockReq({
				params: { id: '550e8400-e29b-41d4-a716-446655440000' },
			});

			await validateRequest({ params: schema })(req, {} as any, mockNext);

			expect(req.params).toEqual({
				id: '550e8400-e29b-41d4-a716-446655440000',
			});
			expect(mockNext).toHaveBeenCalledOnce();
		});
	});
});

describe('validateBody', () => {
	it('replaces request body with validated data', async () => {
		const schema = z.object({ foo: z.string() });
		const req = mockReq({ body: { foo: 'bar' } });

		await validateBody(schema)(req, {} as any, mockNext);

		expect(req.body).toEqual({ foo: 'bar' });
	});
});

describe('validateQuery', () => {
	it('replaces request query with validated data', async () => {
		const schema = z.object({ page: z.coerce.number() });
		const req = mockReq({ query: { page: '1' } });

		await validateQuery(schema)(req, {} as any, mockNext);

		expect(req.query).toEqual({ page: 1 });
	});
});

describe('validateUuidParam', () => {
	it('allows requests with a valid uuid param', async () => {
		const req = mockReq({
			params: { id: '550e8400-e29b-41d4-a716-446655440000' },
		});

		await validateUuidParam(req, {} as any, mockNext);

		expect(req.params).toHaveProperty('id');
		expect(mockNext).toHaveBeenCalledOnce();
	});
});
