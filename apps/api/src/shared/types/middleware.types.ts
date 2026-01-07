import { ZodType } from 'zod';
import { OrderDirection, PaginationParams } from '@beggy/shared/types';

/**
 * Normalized order-by instruction produced by query middleware.
 *
 * @remarks
 * - API-internal type
 * - Represents validated query metadata
 * - Safe to consume in controllers and services
 */
export interface OrderBy {
	/**
	 * Field name to order by.
	 *
	 * @remarks
	 * - Derived from the `orderBy` query parameter
	 * - Guaranteed to be validated by Zod
	 */
	orderBy: string;

	/**
	 * Sorting direction.
	 *
	 * @remarks
	 * - Defaults to `ASC`
	 * - Explicit `DESC` must be requested
	 */
	direction: OrderDirection;
}

/**
 * API-only normalized pagination parameters.
 *
 * @remarks
 * - Extends the shared pagination input coming from `@beggy/shared`
 * - Represents a **validated, normalized, and computed** pagination state
 * - Contains values ready for direct consumption by repositories or services
 * - Never exposed directly to API clients
 *
 * @example
 * ```ts
 * req.pagination = {
 *   page: 2,
 *   limit: 10,
 *   offset: 10
 * }
 * ```
 */
export interface NormalizedPagination extends PaginationParams {
	/**
	 * Zero-based offset calculated from `page` and `limit`.
	 *
	 * @remarks
	 * - Computed internally as `(page - 1) * limit`
	 * - Intended for database queries (e.g. SQL OFFSET, Prisma skip)
	 * - Always consistent with the validated pagination input
	 */
	offset: number;
}

/**
 * Configuration options for the `prepareListQuery` middleware.
 *
 * @remarks
 * - Controls how list-related query metadata is extracted and normalized
 * - Allows enabling/disabling pagination per route
 * - Allows injecting an entity-specific order-by schema
 */
export type ListQueryOptions = {
	/**
	 * Enables pagination parsing and normalization.
	 *
	 * @remarks
	 * - When enabled, `page` and `limit` are extracted from `req.query`
	 * - Parsed values are attached to `req.pagination`
	 * - When disabled, pagination parameters are ignored
	 *
	 * @default true
	 */
	pagination?: boolean;

	/**
	 * Zod schema used to validate and parse order-by query parameters.
	 *
	 * @remarks
	 * - When provided, `orderBy` and `direction` are extracted from `req.query`
	 * - Parsed values are attached to `req.orderBy`
	 * - When omitted, ordering parameters are ignored
	 * - Intended to be entity-specific (users, items, bags, etc.)
	 */
	orderBySchema?: ZodType<OrderBy>;
};
