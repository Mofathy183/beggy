import { ErrorCode, ErrorMessages } from '@beggy/shared/constants';
import type { FieldErrorsTree } from '@beggy/shared/types';
import { STATUS_CODE } from '@shared/constants';
import type { StatusCode, ErrorResponseOptions } from '@shared/types';

/**
 * AppError
 * ----------
 * Central application error used across services and controllers.
 *
 * This error is:
 * - Thrown from the service layer
 * - Passed through controllers using `next(error)`
 * - Interpreted in the error-handling middleware
 */
export class AppError extends Error {
	public readonly originalCause?: unknown;

	/**
	 * @param code        Domain-level error code (used for messages & frontend logic)
	 * @param status      HTTP status code for the response
	 * @param cause       Optional underlying error (preserved for debugging/logging)
	 * @param options     Optional overrides for message and suggestion
	 */
	constructor(
		public readonly code: ErrorCode, //* Stable, machine-readable error identifier
		public readonly status: StatusCode, //* HTTP status code to be used by the error handler
		cause?: unknown,
		public readonly options?: ErrorResponseOptions
	) {
		/**
		 * Resolve the final error message.
		 * Priority:
		 * 1. Custom message (if provided)
		 * 2. Predefined message from ErrorMessages
		 */
		const message = options?.customMessage ?? ErrorMessages[code];

		/**
		 * Call the base Error constructor.
		 * If a cause is provided and is an Error, preserve it using
		 * the standard `cause` property.
		 */
		super(message, cause instanceof Error ? { cause } : undefined);

		this.name = 'AppError';

		/**
		 * Errors should be immutable after creation to avoid
		 * accidental mutation across layers.
		 */
		Object.freeze(this);
	}
}

/**
 * appErrorMap
 * ------------
 * Small factory helpers for creating AppError instances
 * with predefined HTTP status codes and response strategies.
 *
 * This keeps services expressive and avoids repeating
 * status codes and apiResKey values.
 */
export const appErrorMap = {
	/**
	 * Resource was not found.
	 *
	 * @remarks
	 * - Used when a requested entity does not exist
	 * - Common for lookup, read, update, or delete operations
	 */
	notFound: (
		code: ErrorCode,
		cause?: unknown,
		options?: ErrorResponseOptions
	) => new AppError(code, STATUS_CODE.NOT_FOUND, cause, options),

	/**
	 * Client sent invalid or malformed data.
	 *
	 * @remarks
	 * - Validation failures
	 * - Missing or incorrect request payload
	 * - Schema or constraint violations
	 */
	badRequest: (
		code: ErrorCode,
		cause?: unknown,
		options?: ErrorResponseOptions
	) => new AppError(code, STATUS_CODE.BAD_REQUEST, cause, options),

	/**
	 * Invalid request payload (schema / contract violation).
	 *
	 * @remarks
	 * This error represents **transport-level validation failures**,
	 * not domain or business rule errors.
	 *
	 * Typical sources:
	 * - Zod schema parsing failures
	 * - Malformed request bodies
	 * - Invalid query or path parameter shapes
	 *
	 * This error is expected to:
	 * - Always map to HTTP 400 (Bad Request)
	 * - Carry structured, field-level error details
	 * - Be safely exposed to API consumers (UI-friendly)
	 *
	 * @param code - Must always be INVALID_REQUEST_DATA
	 * @param fieldErrors - Structured field-level validation errors
	 * @param options - Optional message/suggestion overrides
	 */
	invalidRequest: (
		fieldErrors: FieldErrorsTree,
		options?: ErrorResponseOptions
	) =>
		new AppError(
			ErrorCode.INVALID_REQUEST_DATA,
			STATUS_CODE.BAD_REQUEST,
			fieldErrors,
			options
		),

	/**
	 * Authentication is required or failed.
	 *
	 * @remarks
	 * - Missing authentication credentials
	 * - Invalid or expired tokens
	 */
	unauthorized: (
		code: ErrorCode,
		cause?: unknown,
		options?: ErrorResponseOptions
	) => new AppError(code, STATUS_CODE.UNAUTHORIZED, cause, options),

	/**
	 * User is authenticated but not allowed to perform this action.
	 *
	 * @remarks
	 * - Authorization failures
	 * - Insufficient permissions or role restrictions
	 */
	forbidden: (
		code: ErrorCode,
		cause?: unknown,
		options?: ErrorResponseOptions
	) => new AppError(code, STATUS_CODE.FORBIDDEN, cause, options),

	/**
	 * Request could not be completed due to a state conflict.
	 *
	 * @remarks
	 * - Resource already exists
	 * - Duplicate unique fields (email, username, etc.)
	 * - Invalid state transitions
	 *   (e.g. activating an already active account)
	 */
	conflict: (
		code: ErrorCode,
		cause?: unknown,
		options?: ErrorResponseOptions
	) => new AppError(code, STATUS_CODE.CONFLICT, cause, options),

	/**
	 * Unhandled or unexpected server error.
	 *
	 * @remarks
	 * - Fallback for non-recoverable conditions
	 * - Should generally not be thrown directly in services
	 * - Reserved for truly exceptional scenarios
	 */
	serverError: (
		code: ErrorCode,
		cause?: unknown,
		options?: ErrorResponseOptions
	) => new AppError(code, STATUS_CODE.INTERNAL_ERROR, cause, options),
};
