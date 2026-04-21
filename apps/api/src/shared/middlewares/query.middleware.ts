import type { Request, Response, NextFunction } from 'express';
import { PaginationSchema } from '@beggy/shared/schemas';
import type { ListQueryOptions, OrderBy } from '@shared/types';

/**
 * Middleware factory for normalizing list query parameters.
 *
 * @param options - Configuration controlling pagination and ordering behavior
 * @returns Express middleware
 *
 * @remarks
 * - Extracts and validates pagination (`page`, `limit`)
 * - Extracts and validates ordering (`orderBy`, `direction`)
 * - Attaches normalized data to `req.pagination` and `req.orderBy`
 *
 * Does not apply business filters or handle errors.
 */
export const prepareListQuery =
	(options: ListQueryOptions = {}) =>
	async (req: Request, _res: Response, next: NextFunction) => {
		const {
			/**
			 * Enables pagination parsing and normalization.
			 *
			 * @default true
			 * @remarks
			 * Most list endpoints rely on pagination, so it is enabled by default.
			 */
			pagination = true,

			/**
			 * Optional Zod schema used to validate and normalize
			 * order-by parameters.
			 */
			orderBySchema,
		} = options;

		try {
			/**
			 * Parse and normalize pagination parameters.
			 *
			 * @remarks
			 * - Extracts `page` and `limit` from the query string
			 * - Applies defaults and validation via Zod
			 * - Computes the derived `offset` value
			 * - Attaches the result to `req.pagination`
			 */
			if (pagination) {
				const { page, limit } = req.query;

				const parsed = await PaginationSchema.pagination.parseAsync({
					page: page !== undefined ? Number(page) : undefined,
					limit: limit !== undefined ? Number(limit) : undefined,
				});

				const pageNum = parsed.page ?? 1;
				const limitNum = parsed.limit ?? 10;

				req.pagination = {
					page: pageNum,
					limit: limitNum,
					offset: (pageNum - 1) * limitNum,
				};
			}

			/**
			 * Parse and normalize order-by parameters.
			 *
			 * @remarks
			 * - Extracts `orderBy` and `direction` from the query string
			 * - Validates them against the provided schema
			 * - Attaches the normalized result to `req.orderBy`
			 */
			if (orderBySchema) {
				const { orderBy, direction } = req.query;

				req.orderBy = (await orderBySchema.parseAsync({
					orderBy,
					direction,
				})) as OrderBy;
			}

			delete req.query.page;
			delete req.query.limit;
			delete req.query.orderBy;
			delete req.query.direction;

			next();
		} catch (error: unknown) {
			/**
			 * Forward validation errors to the global error handler.
			 */
			next(error);
		}
	};
