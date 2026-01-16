import { ErrorCode, ErrorMessages } from '@beggy/shared/constants';
import { ErrorResponseOptions } from '@beggy/shared/types';
import { STATUS_CODE } from '@shared/constants';
import type { StatusCode } from '@shared/types';

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
	/**
	 * @param code        Domain-level error code (used for messages & frontend logic)
	 * @param status      HTTP status code for the response
	 * @param cause       Optional underlying error (preserved for debugging/logging)
	 * @param options     Optional overrides for message and suggestion
	 */
	constructor(
		public readonly code: ErrorCode, //* Stable, machine-readable error identifier
		public readonly status: StatusCode, //* HTTP status code to be used by the error handler
		override cause?: unknown,
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
	 */
	notFound: (
		code: ErrorCode,
		cause?: unknown,
		options?: ErrorResponseOptions
	) => new AppError(code, STATUS_CODE.NOT_FOUND, cause, options),

	/**
	 * Client sent invalid or malformed data.
	 */
	badRequest: (
		code: ErrorCode,
		cause?: unknown,
		options?: ErrorResponseOptions
	) => new AppError(code, STATUS_CODE.BAD_REQUEST, cause, options),

	/**
	 * Authentication is required or failed.
	 */
	unauthorized: (
		code: ErrorCode,
		cause?: unknown,
		options?: ErrorResponseOptions
	) => new AppError(code, STATUS_CODE.UNAUTHORIZED, cause, options),

	/**
	 * User is authenticated but not allowed to perform this action.
	 */
	forbidden: (
		code: ErrorCode,
		cause?: unknown,
		options?: ErrorResponseOptions
	) => new AppError(code, STATUS_CODE.FORBIDDEN, cause, options),

	conflict: (
		code: ErrorCode,
		cause?: unknown,
		options?: ErrorResponseOptions
	) => new AppError(code, STATUS_CODE.CONFLICT, cause, options),

	/**
	 * Unhandled or unexpected server error.
	 */
	serverError: (
		code: ErrorCode,
		cause?: unknown,
		options?: ErrorResponseOptions
	) => new AppError(code, STATUS_CODE.INTERNAL_ERROR, cause, options),
};
