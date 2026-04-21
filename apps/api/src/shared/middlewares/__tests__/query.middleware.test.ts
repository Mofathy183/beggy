import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as z from 'zod';
import { prepareListQuery } from '@shared/middlewares';

// Mock PaginationSchema (CRITICAL for isolation)
vi.mock('@beggy/shared/schemas', async () => {
	const actual = await vi.importActual<any>('@beggy/shared/schemas');

	return {
		...actual,
		PaginationSchema: {
			pagination: {
				parseAsync: vi.fn(),
			},
		},
	};
});

import { PaginationSchema } from '@beggy/shared/schemas';

const mockReq = (query: any = {}) =>
	({
		query: { ...query },
	}) as any;

describe('prepareListQuery()', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('pagination', () => {
		it('attaches normalized pagination data', async () => {
			// Arrange
			const next = vi.fn();

			(PaginationSchema.pagination.parseAsync as any).mockResolvedValue({
				page: 2,
				limit: 10,
			});

			const req = mockReq({ page: '2', limit: '10' });

			// Act
			await prepareListQuery()(req, {} as any, next);

			// Assert
			expect(req.pagination).toEqual({
				page: 2,
				limit: 10,
				offset: 10,
			});

			expect(next).toHaveBeenCalledOnce();
		});

		it('uses default pagination values when pagination is missing', async () => {
			// Arrange
			const next = vi.fn();

			(PaginationSchema.pagination.parseAsync as any).mockResolvedValue(
				{}
			);

			const req = mockReq({});

			// Act
			await prepareListQuery()(req, {} as any, next);

			// Assert
			expect(req.pagination).toEqual({
				page: 1,
				limit: 10,
				offset: 0,
			});
		});

		it('skips pagination when disabled', async () => {
			// Arrange
			const next = vi.fn();

			const req = mockReq({ page: '2', limit: '10' });

			// Act
			await prepareListQuery({ pagination: false })(req, {} as any, next);

			// Assert
			expect(req.pagination).toBeUndefined();
			expect(next).toHaveBeenCalledOnce();
		});

		it('passes pagination validation errors to next', async () => {
			// Arrange
			const next = vi.fn();

			(PaginationSchema.pagination.parseAsync as any).mockRejectedValue(
				new Error('invalid pagination')
			);

			const req = mockReq({ page: '-1', limit: '9999' });

			// Act
			await prepareListQuery()(req, {} as any, next);

			// Assert
			expect(next).toHaveBeenCalledOnce();
			expect(next).toHaveBeenCalledWith(expect.any(Error));
		});
	});

	describe('orderBy', () => {
		const orderBySchema = z.object({
			orderBy: z.enum(['createdAt']),
			direction: z.enum(['asc', 'desc']),
		});

		it('attaches normalized orderBy data', async () => {
			// Arrange
			const next = vi.fn();

			const req = mockReq({
				orderBy: 'createdAt',
				direction: 'desc',
			});

			(PaginationSchema.pagination.parseAsync as any).mockResolvedValue(
				{}
			);

			// Act
			await prepareListQuery({ orderBySchema })(req, {} as any, next);

			// Assert
			expect(req.orderBy).toEqual({
				orderBy: 'createdAt',
				direction: 'desc',
			});

			expect(next).toHaveBeenCalledOnce();
		});

		it('skips orderBy when schema is not provided', async () => {
			// Arrange
			const next = vi.fn();

			const req = mockReq({
				orderBy: 'createdAt',
				direction: 'desc',
			});

			(PaginationSchema.pagination.parseAsync as any).mockResolvedValue(
				{}
			);

			// Act
			await prepareListQuery()(req, {} as any, next);

			// Assert
			expect(req.orderBy).toBeUndefined();
			expect(next).toHaveBeenCalledOnce();
		});

		it('passes orderBy validation errors to next', async () => {
			// Arrange
			const next = vi.fn();

			const req = mockReq({
				orderBy: 'invalid',
				direction: 'nope',
			});

			(PaginationSchema.pagination.parseAsync as any).mockResolvedValue(
				{}
			);

			// Act
			await prepareListQuery({ orderBySchema })(req, {} as any, next);

			// Assert
			expect(next).toHaveBeenCalledOnce();
			expect(next).toHaveBeenCalledWith(expect.any(Error));
		});
	});

	describe('query cleanup', () => {
		it('removes internal query params from request query', async () => {
			// Arrange
			const next = vi.fn();

			(PaginationSchema.pagination.parseAsync as any).mockResolvedValue(
				{}
			);

			const req = mockReq({
				page: '1',
				limit: '10',
				orderBy: 'createdAt',
				direction: 'asc',
				search: 'bag',
			});

			// Act
			await prepareListQuery()(req, {} as any, next);

			// Assert
			expect(req.query).toEqual({
				search: 'bag',
			});
		});
	});
});
