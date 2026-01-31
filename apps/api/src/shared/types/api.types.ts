import { type STATUS_CODE } from '@shared/constants';
import { type SuccessResponse, type ErrorResponse } from '@beggy/shared/types';

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
 * HTTP-specific success response wrapper.
 *
 * @remarks
 * This interface extends the shared {@link SuccessResponse} contract by
 * adding an explicit HTTP status code.
 *
 * It exists **only** in the API layer and should never be shared with
 * frontend or domain packages.
 *
 * Purpose:
 * - Bridges the gap between transport-level HTTP concerns
 *   and shared API response contracts
 * - Keeps HTTP semantics (status codes) out of `@beggy/shared`
 * - Allows consistent typing for Express/Fastify responses
 *
 * Architectural rule:
 * - Use {@link SuccessResponse} in shared logic and services
 * - Use {@link HttpSuccessResponse} only at the controller boundary
 *
 * @template T - Type of the successful response payload
 *
 * @example
 * ```ts
 * const response: HttpSuccessResponse<UserDto> = {
 *   success: true,
 *   message: 'User retrieved successfully',
 *   status: 200,
 *   timestamp: new Date().toISOString(),
 *   data: user,
 * };
 * ```
 */
export interface HttpSuccessResponse<T> extends SuccessResponse<T> {
	/**
	 * HTTP status code associated with the response.
	 *
	 * @remarks
	 * This value represents the actual HTTP status sent to the client
	 * (e.g. 200, 201, 204).
	 *
	 * Status codes are intentionally excluded from shared response
	 * contracts to avoid coupling non-HTTP consumers (e.g. frontend,
	 * GraphQL, or future transports).
	 */
	status: StatusCode;
}

/**
 * HTTP-specific error response wrapper.
 *
 * @remarks
 * Extends the shared {@link ErrorResponse} by attaching an HTTP status code.
 *
 * This interface represents the final error shape sent over HTTP
 * and should only be constructed at the controller or middleware level.
 *
 * Purpose:
 * - Keeps error semantics consistent across the API
 * - Allows centralized HTTP error handling
 * - Prevents leaking transport concerns into shared or domain layers
 *
 * Architectural rule:
 * - Shared layers should return {@link ErrorResponse}
 * - Controllers adapt it into {@link HttpErrorResponse}
 *
 * @example
 * ```ts
 * const error: HttpErrorResponse = {
 *   success: false,
 *   message: 'Unauthorized access',
 *   status: 401,
 *   timestamp: new Date().toISOString(),
 *   code: ErrorCode.UNAUTHORIZED,
 *   suggestion: 'Please log in and try again',
 * };
 * ```
 */
export interface HttpErrorResponse extends ErrorResponse {
	/**
	 * HTTP status code associated with the error response.
	 *
	 * @remarks
	 * Used by the HTTP server to set the correct response status
	 * while keeping error details standardized across the system.
	 */
	status: StatusCode;
}
