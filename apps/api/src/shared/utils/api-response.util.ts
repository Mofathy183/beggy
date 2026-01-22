import { STATUS_CODE } from '@shared/constants';
import {
	ErrorCode,
	SuccessMessages,
	ErrorMessages,
	ErrorSuggestions,
} from '@beggy/shared/constants';
import { PaginationMeta, ErrorResponseOptions } from '@beggy/shared/types';
import type {
	StatusCode,
	HttpSuccessResponse,
	HttpErrorResponse,
} from '@shared/types';

/**
 * Core response factory for creating standardized API responses.
 *
 * @remarks
 * This factory ensures consistent response formatting across the entire application.
 * It automatically includes timestamps and leverages the Beggy-style messaging system
 * for a cohesive user experience.
 *
 * @example
 * ```typescript
 * // Create a success response
 * const response = createResponse.success(
 *   userData,
 *   'PROFILE_UPDATED',
 *   200,
 *   meta
 * );
 *
 * // Create an error response
 * const error = createResponse.error(
 *   ErrorCode.VALIDATION_ERROR,
 *   400,
 *   validationErrors,
 *   { customMessage: 'Please check your input' }
 * );
 * ```
 */
export const createResponse = {
	/**
	 * Creates a standardized success response with Beggy-style messaging.
	 *
	 * @template T - The type of data being returned
	 * @param data - The response payload data
	 * @param msgKey - Key from SuccessMessages for consistent Beggy-style messaging
	 * @param status - HTTP status code (should be 2xx)
	 * @param meta - Optional pagination or metadata
	 * @returns A properly formatted SuccessResponse object
	 *
	 * @example
	 * ```typescript
	 * createResponse.success(
	 *   { id: 1, name: 'Weekend Bag' },
	 *   'BAG_CREATED',
	 *   201
	 * );
	 * ```
	 */
	success: <T>(
		data: T,
		msgKey: keyof typeof SuccessMessages,
		status: StatusCode,
		meta?: PaginationMeta
	): HttpSuccessResponse<T> => ({
		success: true,
		status,
		message: SuccessMessages[msgKey], // Always use constant
		data,
		meta,
		timestamp: new Date().toISOString(),
	}),

	/**
	 * Creates a standardized error response with Beggy-style messaging and suggestions.
	 *
	 * @param code - Machine-readable error code for programmatic handling
	 * @param status - HTTP status code (4xx or 5xx)
	 * @param error - Optional detailed error information for debugging
	 * @param options - Optional customization for messages and suggestions
	 * @returns A properly formatted ErrorResponse object
	 *
	 * @remarks
	 * Always defaults to using ErrorMessages and ErrorSuggestions from constants
	 * unless overridden by options. This maintains the Beggy personality.
	 *
	 * @example
	 * ```typescript
	 * createResponse.error(
	 *   ErrorCode.BAG_NOT_FOUND,
	 *   404,
	 *   { bagId: '123' },
	 *   { customSuggestion: 'Check your archived bags' }
	 * );
	 * ```
	 */
	error: (
		code: ErrorCode,
		status: StatusCode,
		error?: unknown,
		options?: ErrorResponseOptions
	): HttpErrorResponse => ({
		success: false,
		message: options?.customMessage || (ErrorMessages[code] as string),
		status,
		error,
		code,
		suggestion:
			options?.customSuggestion || (ErrorSuggestions[code] as string),
		timestamp: new Date().toISOString(),
	}),
};

/**
 * Pre-configured response helpers for common HTTP status codes.
 *
 * @remarks
 * These methods enforce proper status code usage and reduce boilerplate.
 * Use these instead of createResponse directly for better consistency.
 *
 * @example
 * ```typescript
 * // In a controller
 * return res.status(200).json(
 *   apiResponseMap.ok(bags, 'BAGS_FETCHED', meta)
 * );
 * ```
 */
export const apiResponseMap = {
	/**
	 * Creates a 200 OK response.
	 *
	 * @template T - Type of response data
	 * @param data - Response payload
	 * @param msgKey - Success message key
	 * @param meta - Optional pagination metadata
	 * @returns SuccessResponse with 200 status
	 *
	 * @example
	 * ```typescript
	 * apiResponseMap.ok(users, 'USERS_FETCHED', { page: 1, limit: 10 })
	 * ```
	 */
	ok: <T>(
		data: T,
		msgKey: keyof typeof SuccessMessages,
		meta?: PaginationMeta
	) => createResponse.success(data, msgKey, STATUS_CODE.OK, meta),

	/**
	 * Creates a 201 Created response.
	 *
	 * @template T - Type of response data
	 * @param data - The newly created resource
	 * @param msgKey - Success message key (defaults to item-specific messages)
	 * @returns SuccessResponse with 201 status
	 *
	 * @example
	 * ```typescript
	 * apiResponseMap.created(newBag, 'BAG_CREATED')
	 * ```
	 */
	created: <T>(data: T, msgKey: keyof typeof SuccessMessages) =>
		createResponse.success(data, msgKey, STATUS_CODE.CREATED),

	/**
	 * Creates a 204 No Content success response.
	 *
	 * @param msgKey - Success message key describing the completed action
	 * @returns SuccessResponse with 204 status and no data payload
	 *
	 * @remarks
	 * - Intended for operations that do not return a resource
	 *   (e.g. DELETE, bulk actions, command-style endpoints)
	 * - Explicitly sets `data` to `null` to maintain a consistent response shape
	 *   across the API while still signaling "no result"
	 * - Represents the semantic intent of "no content", even if the transport
	 *   layer chooses how strictly to enforce HTTP 204 rules
	 *
	 * Usage guidelines:
	 * - Use for delete operations or side-effect-only actions
	 * - Do NOT use for endpoints that are expected to return data
	 * - Controllers may choose to omit sending a response body for strict
	 *   HTTP 204 compliance
	 *
	 * @example
	 * ```typescript
	 * apiResponseMap.noContent('USERS_DELETED')
	 * ```
	 */
	noContent: (msgKey: keyof typeof SuccessMessages) =>
		createResponse.success(
			null,
			msgKey,
			STATUS_CODE.NO_CONTENT
		),

	/**
	 * Creates a 404 Not Found response.
	 *
	 * @param code - Specific ErrorCode for the not found scenario
	 * @param error - Optional error details (e.g., requested ID)
	 * @param options - Custom message/suggestion overrides
	 * @returns ErrorResponse with 404 status
	 *
	 * @example
	 * ```typescript
	 * apiResponseMap.notFound(
	 *   ErrorCode.BAG_NOT_FOUND,
	 *   { requestedId: '123' }
	 * )
	 * ```
	 */
	notFound: (
		code: ErrorCode,
		error?: unknown,
		options?: ErrorResponseOptions
	) => createResponse.error(code, STATUS_CODE.NOT_FOUND, error, options),

	/**
	 * Creates a 400 Bad Request response.
	 *
	 * @param code - Specific ErrorCode for the bad request
	 * @param error - Validation errors or invalid parameters
	 * @param options - Custom message/suggestion overrides
	 * @returns ErrorResponse with 400 status
	 *
	 * @example
	 * ```typescript
	 * apiResponseMap.badRequest(
	 *   ErrorCode.VALIDATION_ERROR,
	 *   { field: 'email', reason: 'Invalid format' }
	 * )
	 * ```
	 */
	badRequest: (
		code: ErrorCode,
		error?: unknown,
		options?: ErrorResponseOptions
	) => createResponse.error(code, STATUS_CODE.BAD_REQUEST, error, options),

	/**
	 * Creates a 401 Unauthorized response.
	 *
	 * @param code - Specific ErrorCode for authorization failure
	 * @param error - Optional details about the auth failure
	 * @param options - Custom message/suggestion overrides
	 * @returns ErrorResponse with 401 status
	 *
	 * @remarks
	 * Use for authentication failures (no/invalid credentials)
	 *
	 * @example
	 * ```typescript
	 * apiResponseMap.unauthorized(ErrorCode.TOKEN_EXPIRED)
	 * ```
	 */
	unauthorized: (
		code: ErrorCode,
		error?: unknown,
		options?: ErrorResponseOptions
	) => createResponse.error(code, STATUS_CODE.UNAUTHORIZED, error, options),

	/**
	 * Creates a 500 Internal Server Error response.
	 *
	 * @param code - Specific ErrorCode for the server error
	 * @param error - Error details for debugging (filter in production)
	 * @param options - Custom message/suggestion overrides
	 * @returns ErrorResponse with 500 status
	 *
	 * @remarks
	 * Use for unexpected server errors. Consider logging these errors.
	 *
	 * @example
	 * ```typescript
	 * apiResponseMap.serverError(
	 *   ErrorCode.DATABASE_ERROR,
	 *   error.stack
	 * )
	 * ```
	 */
	serverError: (
		code: ErrorCode,
		error?: unknown,
		options?: ErrorResponseOptions
	) => createResponse.error(code, STATUS_CODE.INTERNAL_ERROR, error, options),

	/**
	 * Creates a "forbidden" error response (403).
	 *
	 * @param code - Specific forbidden error code
	 * @param error - Optional details about the restriction
	 * @param options - Custom message/suggestion overrides
	 * @returns ErrorResponse with 403 status
	 */
	forbidden: (
		code: ErrorCode,
		error?: unknown,
		options?: ErrorResponseOptions
	) => createResponse.error(code, 403 as StatusCode, error, options),
};
