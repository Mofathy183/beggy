import { type ErrorCode } from '../constants/error.codes.js';
import {
	type OrderByQuerySchemas,
	type QuerySchema,
	type ParamsSchema,
	type PaginationSchema,
} from '../schemas/api.schema.js';
import type * as z from 'zod';
import type { Permissions } from '../types/auth.types.js';
import type { AuthProvider } from '../constants/auth.enums.js';
import type { UserDTO } from '../types/user.types.js';
import type { ProfileDTO } from '../types/profile.types.js';
import type { ISODateString } from './index.js';

/**
 * Lightweight authenticated user identity snapshot.
 *
 * @remarks
 * - Derived from the core `User` domain model
 * - Contains only identity and authorization-relevant fields
 * - Safe to expose to clients via `/auth/me`
 * - Does NOT include authentication secrets or domain relations
 */
export type AuthMeUserDTO = Pick<
	UserDTO,
	'id' | 'email' | 'role' | 'createdAt'
>;

/**
 * Public-facing user profile subset for authenticated sessions.
 *
 * @remarks
 * - Derived from the `Profile` domain model
 * - Contains personalization and UI-facing fields only
 * - Excludes sensitive or rarely-used profile attributes
 * - May be `null` for newly created or incomplete profiles
 */
export type AuthMeProfileDTO = Pick<
	ProfileDTO,
	| 'firstName'
	| 'lastName'
	| 'avatarUrl'
	| 'displayName'
	| 'age'
	| 'city'
	| 'country'
>;

/**
 * Authenticated session context returned by `/auth/me`.
 *
 * @remarks
 * This interface represents a complete identity snapshot for the
 * currently authenticated user and is typically fetched on app startup.
 *
 * Includes:
 * - User identity and account state
 * - Public profile summary for UI personalization
 * - Authorization permissions for client-side access control
 * - Authentication method metadata for account management flows
 *
 * This response intentionally avoids returning domain resources
 * (e.g. bags, items, suitcases) to preserve separation of concerns
 * and minimize payload size.
 */
export interface AuthMeDTO {
	/**
	 * Core authenticated user identity.
	 */
	user: AuthMeUserDTO;

	/**
	 * Public profile information associated with the user.
	 *
	 * @remarks
	 * - May be `null` if the profile has not been created yet
	 * - Should not be assumed to exist on first login or OAuth sign-up
	 */
	profile: AuthMeProfileDTO | null;

	/**
	 * Effective permissions granted to the user.
	 *
	 * @remarks
	 * - Used by the client for feature gating and UI access control
	 * - Must be treated as authoritative over role-based assumptions
	 */
	permissions: Permissions;

	/**
	 * Authentication method metadata for the current user.
	 *
	 * @remarks
	 * - Used to drive account security and settings UI
	 * - Does not expose sensitive authentication data
	 */
	auth: {
		/**
		 * Authentication providers linked to the user account.
		 */
		providers: AuthProvider[];

		/**
		 * Indicates whether a LOCAL (email/password) account exists.
		 */
		hasLocalAuth: boolean;
	};
}

/**
 * Pagination metadata for collection responses.
 *
 * @remarks
 * - Output-only structure (never accepted from clients)
 * - Designed for REST and GraphQL compatibility
 * - Enables frontend pagination UI without extra calculations
 */
export interface PaginationMeta {
	/**
	 * Total number of records matching the current filters (Optional).
	 */
	totalItems?: number;

	/**
	 * Number of items returned in the current page.
	 */
	count: number;

	/**
	 * Current page number (1-based).
	 */
	page: number;

	/**
	 * Maximum number of items per page.
	 */
	limit: number;

	/**
	 * Total number of pages available (Optional).
	 */
	totalPages?: number;

	/**
	 * Indicates whether a next page exists.
	 */
	hasNextPage: boolean;

	/**
	 * Indicates whether a previous page exists.
	 */
	hasPreviousPage: boolean;
}

/**
 * Base interface for all API responses.
 *
 * @remarks
 * All API responses extend this interface to ensure consistency across the application.
 * Includes essential fields for HTTP communication and debugging.
 *
 * @property success - Boolean indicating if the request was successful
 * @property message - Human-readable message (Beggy-style for this application)
 * @property status - HTTP status code
 * @property timestamp - ISO 8601 timestamp of when the response was created
 *
 * @example
 * ```typescript
 * const response: BaseResponse = {
 *   success: true,
 *   message: 'Operation completed successfully',
 *   timestamp: '2024-01-15T10:30:00.000Z'
 * };
 * ```
 */
export interface BaseResponse {
	success: boolean;
	message: string;
	timestamp: ISODateString; // ISO string format
}

/**
 * Success response interface for successful API operations.
 *
 * @template T - Type of the data payload returned in the response
 *
 * @remarks
 * Extends BaseResponse with a `success: true` literal type for TypeScript narrowing.
 * Includes optional metadata for paginated responses.
 *
 * @property success - Always `true` for success responses
 * @property data - The primary response payload
 * @property meta - Optional pagination or additional metadata
 *
 * @example
 * ```typescript
 * const successResponse: SuccessResponse<User> = {
 *   success: true,
 *   message: 'User profile retrieved',
 *   timestamp: '2024-01-15T10:30:00.000Z',
 *   data: { id: 1, name: 'John Doe', email: 'john@example.com' }
 * };
 *
 * // With pagination
 * const paginatedResponse: SuccessResponse<User[]> = {
 *   success: true,
 *   message: 'Users retrieved successfully',
 *   timestamp: '2024-01-15T10:30:00.000Z',
 *   data: usersArray,
 *   meta: { total: 100, count: 10, totalFiltered: 100, page: 1, limit: 10, pages: 10 }
 * };
 * ```
 */
export interface SuccessResponse<T> extends BaseResponse {
	success: true; // TypeScript will narrow this to literal true
	data: T;
	meta?: PaginationMeta;
}

/**
 * Error response interface for failed API operations.
 *
 * @remarks
 * Extends BaseResponse with a `success: false` literal type for TypeScript narrowing.
 * Includes machine-readable error codes and user-friendly suggestions.
 *
 * @property success - Always `false` for error responses
 * @property error - Optional error details for debugging (should be filtered in production)
 * @property code - Machine-readable error code for programmatic handling
 * @property suggestion - User-friendly suggestion for resolving the issue
 *
 * @example
 * ```typescript
 * const errorResponse: ErrorResponse = {
 *   success: false,
 *   message: 'The requested resource was not found',
 *   timestamp: '2024-01-15T10:30:00.000Z',
 *   code: ErrorCode.NOT_FOUND,
 *   suggestion: 'Check the resource ID and try again'
 * };
 *
 * // With error details for debugging
 * const detailedError: ErrorResponse = {
 *   success: false,
 *   message: 'Validation failed',
 *   timestamp: '2024-01-15T10:30:00.000Z',
 *   error: { field: 'email', reason: 'Invalid format' },
 *   code: ErrorCode.VALIDATION_ERROR,
 *   suggestion: 'Please check all required fields are correctly filled'
 * };
 * ```
 */
export interface ErrorResponse extends BaseResponse {
	success: false; // TypeScript will narrow this to literal false
	error?: unknown; // Error details (optional but useful)
	code: ErrorCode; // Required - good!
	suggestion: string; // Required - good!
}

/**
 * Represents validation errors for a single field or a nested structure.
 *
 * - Leaf nodes are arrays of error messages
 * - Nested objects represent structured schema paths
 *
 * Example:
 * ```ts
 * {
 *   name: ["Name is required"],
 *   age: {
 *     min: ["Must be at least 18"],
 *     max: ["Must be under 100"]
 *   }
 * }
 * ```
 */
export type FieldErrorsTree = string[] | { [key: string]: FieldErrorsTree };

/**
 * Standard API response shape for validation errors.
 *
 * This response is returned when request input fails schema validation
 * before reaching business logic or controllers.
 */
export interface ValidationErrorResponse extends BaseResponse {
	success: false; // TypeScript will narrow this to literal false
	/**
	 * Machine-readable error code identifying a validation failure.
	 */
	code: ErrorCode.INVALID_REQUEST_DATA;

	/**
	 * Optional guidance to help clients resolve the validation errors.
	 */
	suggestion?: string;

	/**
	 * Structured validation errors mapped by field name.
	 *
	 * Supports deeply nested schemas and array-based errors.
	 */
	fieldErrors: Record<string, FieldErrorsTree>;
}

/**
 * Pagination request parameters.
 *
 * @remarks
 * - Inferred directly from {@link PaginationSchema}
 * - Represents validated pagination input passed to service layer
 * - Always contains resolved defaults (`page` and `limit`)
 *
 * @property page - Current page number (1-based)
 * @property limit - Number of items per page
 *
 * @example
 * ```ts
 * const params: PaginationParams = {
 *   page: 2,
 *   limit: 25,
 * };
 * ```
 */
export type PaginationParams = z.infer<typeof PaginationSchema.pagination>;

// ─────────────────────────────────────────────
// Schemas with identical input & output
// (No transforms → input === payload)
//
// Frontend uses Input types only
// Services only accept Payload types
// ─────────────────────────────────────────────

// ==================================================
// API SCHEMA
// ==================================================
// Zod-inferred input types for bag-related self-service actions.
// These types represent the exact payload shape accepted by the API

// ==================================================
// FILTER QUERY
// ==================================================

/**
 * User filtering query input.
 *
 * @remarks
 * - Derived directly from Zod schema
 * - Used for validating and typing User list filters
 * - Supports role, status, and creation date filtering
 */
export type UserFilterInput = z.infer<typeof QuerySchema.userFilter>;

/**
 * Profile filtering query input.
 *
 * @remarks
 * - Derived directly from Zod schema
 * - Used for validating and typing Profile list filters
 */
export type ProfileFilterInput = z.infer<typeof QuerySchema.profileFilter>;

/**
 * Bag filtering query input.
 *
 * @remarks
 * - Includes capacity, weight, and metadata filters
 * - Input shape matches API payload exactly
 */
export type BagFilterInput = z.infer<typeof QuerySchema.bagFilter>;

/**
 * Suitcase filtering query input.
 *
 * @remarks
 * - Supports dimensional and attribute-based filtering
 * - Safe to reuse across web and API layers
 */
export type SuitcaseFilterInput = z.infer<typeof QuerySchema.suitcaseFilter>;

/**
 * Item filtering query input.
 *
 * @remarks
 * - Includes boolean, enum, and numeric range filters
 * - No transformations applied (input === output)
 */
export type ItemFilterInput = z.infer<typeof QuerySchema.itemFilter>;

// ==================================================
// ORDERBY QUERY
// ==================================================

/**
 * User "order by" query input.
 *
 * @remarks
 * - Restricts ordering to allowed, indexed user fields
 * - Prevents sorting by sensitive or internal-only columns
 */
export type UserOrderByInput = z.infer<typeof OrderByQuerySchemas.userOrderBy>;

/**
 * Profile "order by" query input.
 *
 * @remarks
 * - Restricts ordering to allowed, indexed fields
 * - Direction defaults are handled at schema level
 */
export type ProfileOrderByInput = z.infer<
	typeof OrderByQuerySchemas.profileOrderBy
>;

/**
 * Bag "order by" query input.
 *
 * @remarks
 * - Prevents ordering by non-exposed columns
 * - Ensures predictable sorting behavior
 */
export type BagOrderByInput = z.infer<typeof OrderByQuerySchemas.bagOrderBy>;

/**
 * Suitcase "order by" query input.
 *
 * @remarks
 * - Shared contract between frontend and API
 * - Eliminates manual sort validation
 */
export type SuitcaseOrderByInput = z.infer<
	typeof OrderByQuerySchemas.suitcaseOrderBy
>;

/**
 * Item "order by" query input.
 *
 * @remarks
 * - Typed strictly from schema
 * - Guards against unsafe ordering fields
 */
export type ItemOrderByInput = z.infer<typeof OrderByQuerySchemas.itemOrderBy>;

// ==================================================
// PARAMS
// ==================================================

/**
 * Route parameter input.
 *
 * @remarks
 * - Represents validated path parameters (e.g. :id)
 * - Ensures only valid UUIDs reach the service layer
 */
export type ParamsInput = z.infer<typeof ParamsSchema.uuid>;
