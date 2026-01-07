import type { Request, Response, NextFunction } from 'express';
import { PaginationSchema } from '@beggy/shared/schemas';
import { ListQueryOptions } from '@shared/types';

/**
 * Middleware factory for preparing list-query metadata
 * (pagination and ordering).
 *
 * @remarks
 * This middleware is responsible for **normalizing list-related query
 * parameters** before they reach controllers or services.
 *
 * It:
 * - Extracts pagination parameters (`page`, `limit`) when enabled
 * - Extracts ordering parameters (`orderBy`, `direction`) when a schema is provided
 * - Validates all extracted values using Zod schemas
 * - Computes derived values (e.g. `offset`)
 * - Attaches normalized data to the request object
 *
 * This middleware intentionally:
 * - Does NOT perform business-level filtering
 * - Does NOT mutate `req.query` beyond reading from it
 * - Does NOT format or handle errors
 * - Delegates all error handling to the global error handler
 *
 * @param options - Configuration controlling pagination and ordering behavior
 *
 * @example
 * ```ts
 * router.get(
 *   '/users',
 *   prepareListQuery({
 *     orderBySchema: OrderByQuerySchemas.userOrderBy,
 *   }),
 *   validateQuery(userFilterSchema),
 *   userController.list
 * );
 * ```
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
					page,
					limit,
				});

				req.pagination = {
					...parsed,
					offset: (parsed.page - 1) * parsed.limit,
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

				req.orderBy = await orderBySchema.parseAsync({
					orderBy,
					direction,
				});
			}

			next();
		} catch (error: unknown) {
			/**
			 * Forward validation errors to the global error handler.
			 */
			next(error);
		}
	};
