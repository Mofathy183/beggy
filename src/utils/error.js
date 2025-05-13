import { statusStatement } from '../config/status.js';
import { logger } from '../middlewares/appMiddleware.js';

/**
 * Create an error object with the given error, path, and message.
 *
 * @param {Error} error - The error object.
 * @param {string} path - The path of the error.
 * @param {string} [message='error'] - The message of the error.
 * @returns {Object} - An object containing the error.
 */
const errorHandler = (error, path, message = 'error') => {
	return {
		message: message || error.message,
		error,
		path,
	};
};

/**
 * Custom ErrorHandler class to represent structured errors
 * and route them through the appropriate internal handler.
 *
 * This class extends the native Error object and adds:
 * - A name to identify the error source (e.g., 'prisma', 'custom')
 * - The original error object
 * - An optional HTTP status code
 * - Internal logging using Pino
 */
class ErrorHandler extends Error {
	/**
	 * Constructs a new ErrorHandler instance.
	 *
	 * @param {string} name - A short name to identify the error handler source (e.g., 'prisma', 'validation').
	 * @param {Object} error - The original error object to be handled.
	 * @param {string} message - A human-readable error message.
	 * @param {number} [status] - Optional HTTP status code to be returned (e.g., 400, 500).
	 */
	constructor(name, error, message, status = undefined) {
		super(message);
		this.name = name;
		this.error = error;
		this.status = status;

		// Capture the stack trace for debugging
		Error.captureStackTrace(this, this.constructor);

		// Handle and log the error immediately
		this.handle();
	}

	/**
	 * Handles the error internally using the generic error handler.
	 * Automatically logs the error using Pino.
	 *
	 * @private
	 * @returns {Object} An object containing structured error information.
	 */
	handle() {
		// Pass error to the centralized error handler
		const errObj = errorHandler(this.error, this.stack, this.message);

		// Create a log entry
		const logDetails = {
			message: errObj.message || 'An unknown error occurred',
			error: errObj.error || this.error,
			stack: this.stack || 'No stack available',
		};

		// Log the error using Pino
		logger.error(
			logDetails,
			`Error handled by: ${this.name} error handler`
		);

		// Return error object in case it's used by future extensions
		return errObj;
	}
}

/**
 * Custom error class used to send structured error responses
 * from Express middleware to the client.
 *
 * This class is typically used with `next()` to format errors
 * consistently across the app.
 */
class ErrorResponse extends Error {
	/**
	 * Constructs a new ErrorResponse instance.
	 *
	 * @param {Object} error - The raw error object (e.g., validation error, Prisma error).
	 * @param {string} message - A human-readable message to display in the response.
	 * @param {number} status - The HTTP status code to send (e.g., 400, 500).
	 */
	constructor(error, message, status) {
		super(message);

		/**
		 * The raw error object passed in for context.
		 * @type {Object}
		 */
		this.error = error;

		/**
		 * The human-readable message to be shown in the response.
		 * @type {string}
		 */
		this.message = message;

		/**
		 * The HTTP status code to send in the response.
		 * @type {number}
		 */
		this.statusCode = status;

		/**
		 * The textual HTTP status description (e.g., "Bad Request").
		 * Pulled from a status statement utility object.
		 * @type {string}
		 */
		this.statement = statusStatement[this.statusCode] || 'Unknown Status';

		// Capture the stack trace specific to this class for debugging
		Error.captureStackTrace(this, this.constructor);
	}
}

/**
 * Sends a standardized error response using Express's `next()` middleware
 * if the provided object is an instance of ErrorHandler.
 *
 * @param {Function} next - Express `next()` function to pass errors to global error handler.
 * @param {*} error - The result returned from a service. Can be an ErrorHandler or any other type.
 * @returns {null} Returns null if an ErrorHandler is handled, allowing caller to return early.
 */
export const sendServiceResponse = (next, error) => {
	// Check if the response from service is an instance of ErrorHandler
	if (error instanceof ErrorHandler) {
		// Wrap it in ErrorResponse and pass to Express error middleware
		return next(
			new ErrorResponse(
				error.error, // Short code or type of the error
				error.message, // Human-readable message
				error.status // HTTP status code
			)
		);
	}

	// No error, let the controller continue
	return null;
};

export { ErrorResponse, ErrorHandler };
