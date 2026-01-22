import { ZodType } from 'zod';
import type {
	Action,
	OrderDirection,
	Role,
	Subject,
} from '@beggy/shared/constants';
import { PaginationParams } from '@beggy/shared/types';
import { PureAbility } from '@casl/ability';

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
export interface PaginationPayload extends PaginationParams {
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
 * Authentication token pair used for session management.
 *
 * @remarks
 * - Access token is short-lived and used for request authentication
 * - Refresh token is long-lived and used to obtain new access tokens
 * - Token storage strategy (cookies/headers) is handled elsewhere
 */
export interface AuthTokens {
	accessToken: string;
	refreshToken: string;
}

/**
 * Minimal authenticated user payload derived from a verified access token.
 *
 * @remarks
 * - Trusted data source: signed JWT
 * - Not a full user entity
 * - Safe to attach to the request lifecycle
 */
export interface AuthUser {
	/**
	 * Unique identifier of the authenticated user.
	 */
	id: string;

	/**
	 * Role assigned to the user, used for authorization decisions.
	 */
	role: Role;

	/**
	 * Token issuance timestamp (epoch seconds).
	 *
	 * @remarks
	 * Used for token freshness checks or session invalidation logic.
	 */
	issuedAt: number;
}

/**
 * Application-wide CASL ability type.
 *
 * @remarks
 * - Restricts abilities to known {@link Action} and {@link Subject} unions
 * - Shared across middleware, services, and guards
 * - Prevents invalid authorization checks at compile time
 */
export type AppAbility = PureAbility<[Action, Subject]>;

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
	orderBySchema?: ZodType;
};
