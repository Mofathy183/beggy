import { describe, it, expect, vi } from 'vitest';
import * as z from 'zod';
import { prepareListQuery } from '@shared/middlewares';

const mockNext = vi.fn();

const mockReq = (query: any = {}) =>
	({
		query,
	}) as any;

const orderBySchema = z.object({
	orderBy: z.enum(['createdAt']),
	direction: z.enum(['asc', 'desc']),
});

describe('prepareListQuery', () => {
	describe('pagination', () => {
		it('attaches normalized pagination data', async () => {
			const req = mockReq({ page: '2', limit: '10' });

			await prepareListQuery()(req, {} as any, mockNext);

			expect(req.pagination).toEqual({
				page: 2,
				limit: 10,
				offset: 10,
			});

			expect(mockNext).toHaveBeenCalledOnce();
		});

		it('skips pagination when disabled', async () => {
			const req = mockReq({ page: '2', limit: '10' });

			await prepareListQuery({ pagination: false })(
				req,
				{} as any,
				mockNext
			);

			expect(req.pagination).toBeUndefined();
			expect(mockNext).toHaveBeenCalledOnce();
		});

		it('passes pagination validation errors to next', async () => {
			const req = mockReq({ page: '-1', limit: '9999' });

			await prepareListQuery()(req, {} as any, mockNext);

			expect(mockNext).toHaveBeenCalledOnce();
			expect((mockNext as any).mock.calls[0][0]).toBeInstanceOf(Error);
		});
	});

	describe('orderBy', () => {
		it('attaches normalized orderBy data', async () => {
			const req = mockReq({ orderBy: 'createdAt', direction: 'desc' });

			await prepareListQuery({ orderBySchema })(req, {} as any, mockNext);

			expect(req.orderBy).toEqual({
				orderBy: 'createdAt',
				direction: 'desc',
			});

			expect(mockNext).toHaveBeenCalledOnce();
		});

		it('skips orderBy when schema is not provided', async () => {
			const req = mockReq({ orderBy: 'createdAt', direction: 'desc' });

			await prepareListQuery()(req, {} as any, mockNext);

			expect(req.orderBy).toBeUndefined();
			expect(mockNext).toHaveBeenCalledOnce();
		});

		it('passes orderBy validation errors to next', async () => {
			const req = mockReq({ orderBy: 'invalid', direction: 'nope' });

			await prepareListQuery({ orderBySchema })(req, {} as any, mockNext);

			expect(mockNext).toHaveBeenCalledOnce();
			expect((mockNext as any).mock.calls[0][0]).toBeInstanceOf(Error);
		});
	});
});
