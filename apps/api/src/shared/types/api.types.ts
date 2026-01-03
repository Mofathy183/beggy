import { STATUS_CODE } from '@shared/constants';
import { ErrorCode } from '@beggy/shared/constants';
import { Role } from '@beggy/shared/types';

/**
 * HTTP Status Code type derived from STATUS_CODE constants.
 *
 * @remarks
 * This ensures type safety when working with HTTP status codes throughout the application.
 * Use this type instead of `number` for better intellisense and validation.
 *
 * @example
 * ```typescript
 * const status: StatusCode = 200; // OK
 * const notFound: StatusCode = 404;
 * ```
 */
export type StatusCode = (typeof STATUS_CODE)[keyof typeof STATUS_CODE];

/**
 * Pagination metadata for collection responses.
 *
 * @remarks
 * Used to provide context about paginated results including totals, counts, and page information.
 * Follows RESTful pagination best practices.
 *
 * @property total - Total number of records without any filters applied
 * @property count - Number of items in the current page response
 * @property totalFiltered - Total number of records matching current filters
 * @property page - Current page number (1-indexed)
 * @property limit - Maximum items per page
 * @property pages - Total number of pages available
 *
 * @example
 * ```typescript
 * const meta: Meta = {
 *   total: 100,
 *   count: 10,
 *   totalFiltered: 50,
 *   page: 1,
 *   limit: 10,
 *   pages: 5
 * };
 * ```
 */
export interface Meta {
	total: number; // All records without filters
	count: number; // Current page items count
	totalFiltered: number; // All records matching filters
	page: number;
	limit: number;
	pages: number;
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
 * const response: ApiResponse = {
 *   success: true,
 *   message: 'Operation completed successfully',
 *   status: 200,
 *   timestamp: '2024-01-15T10:30:00.000Z'
 * };
 * ```
 */
export interface ApiResponse {
	success: boolean;
	message: string;
	status: StatusCode;
	timestamp: string; // ISO string format
}

/**
 * Success response interface for successful API operations.
 *
 * @template T - Type of the data payload returned in the response
 *
 * @remarks
 * Extends ApiResponse with a `success: true` literal type for TypeScript narrowing.
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
 *   status: 200,
 *   timestamp: '2024-01-15T10:30:00.000Z',
 *   data: { id: 1, name: 'John Doe', email: 'john@example.com' }
 * };
 *
 * // With pagination
 * const paginatedResponse: SuccessResponse<User[]> = {
 *   success: true,
 *   message: 'Users retrieved successfully',
 *   status: 200,
 *   timestamp: '2024-01-15T10:30:00.000Z',
 *   data: usersArray,
 *   meta: { total: 100, count: 10, totalFiltered: 100, page: 1, limit: 10, pages: 10 }
 * };
 * ```
 */
export interface SuccessResponse<T> extends ApiResponse {
	success: true; // TypeScript will narrow this to literal true
	data: T;
	meta?: Meta;
}

/**
 * Error response interface for failed API operations.
 *
 * @remarks
 * Extends ApiResponse with a `success: false` literal type for TypeScript narrowing.
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
 *   status: 404,
 *   timestamp: '2024-01-15T10:30:00.000Z',
 *   code: ErrorCode.NOT_FOUND,
 *   suggestion: 'Check the resource ID and try again'
 * };
 *
 * // With error details for debugging
 * const detailedError: ErrorResponse = {
 *   success: false,
 *   message: 'Validation failed',
 *   status: 400,
 *   timestamp: '2024-01-15T10:30:00.000Z',
 *   error: { field: 'email', reason: 'Invalid format' },
 *   code: ErrorCode.VALIDATION_ERROR,
 *   suggestion: 'Please check all required fields are correctly filled'
 * };
 * ```
 */
export interface ErrorResponse extends ApiResponse {
	success: false; // TypeScript will narrow this to literal false
	error?: unknown; // Error details (optional but useful)
	code: ErrorCode; // Required - good!
	suggestion: string; // Required - good!
}

/**
 * Options for customizing error responses.
 *
 * @remarks
 * Allows overriding default error messages and suggestions while maintaining
 * the core error structure. Use sparingly - prefer the default Beggy-style messages.
 *
 * @property customMessage - Override the default error message
 * @property customSuggestion - Override the default error suggestion
 *
 * @example
 * ```typescript
 * const options: ErrorResponseOptions = {
 *   customMessage: 'Your bag exceeded the weight limit by 5kg',
 *   customSuggestion: 'Try removing some items or redistribute weight between bags'
 * };
 * ```
 */
export interface ErrorResponseOptions {
	customMessage?: string;
	customSuggestion?: string;
}

/**
 * Configuration for paginated API requests.
 *
 * @remarks
 * Use this interface for request parameters when implementing paginated endpoints.
 *
 * @property page - Requested page number (default: 1)
 * @property limit - Items per page (default: 20, max: 100)
 * @property sortBy - Field to sort by
 * @property sortOrder - Sort direction ('asc' or 'desc')
 * @property search - Search query string
 * @property filters - Additional filter criteria
 *
 * @example
 * ```typescript
 * const params: PaginationParams = {
 *   page: 2,
 *   limit: 25,
 *   sortBy: 'createdAt',
 *   sortOrder: 'desc',
 *   search: 'weekend'
 * };
 * ```
 */
export interface PaginationParams {
	page?: number;
	limit?: number;
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
	search?: string;
	filters?: Record<string, any>;
}

export interface SecureTokenPair {
	token: string; // Send to user
	hash: string; // Store in DB
}

export type VerifiedAccessToken = {
	id: string;
	role: Role;
};

export type VerifiedRefreshToken = {
	id: string;
};
