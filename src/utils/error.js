import { statusCode, statusStatement } from '../config/status.js';
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
 * Template for prisma errors.
 *
 * @param {string} name - The name of the error.
 * @param {string} code - The code of the error.
 * @param {string} message - The message of the error.
 * @param {string} target - The target of the error.
 * @param {number} status - The status of the error.
 * @param {string} path - The path of the error.
 * @param {string} type - The type of the error.
 * @returns {Object} - An object containing the error.
 */
const prismaErrorTemplate = (
	name,
	code,
	message,
	target,
	status,
	path,
	type
) => {
	return {
		status,
		type,
		message,
		name,
		code,
		target,
		path,
	};
};

/**
 * @description
 * handle Prisma errors
 * This function will handle the Prisma errors based on different error codes
 * @param {Object} error - The error object from Prisma
 * @param {String} path - The path of the route where the error happened
 * @param {String} message - The message of the error
 * @returns {Object} - The error object with the correct status code and message
 */
const prismaErrorHandler = (error, path, message) => {
	const { name, code, meta } = error;

	if (name === 'PrismaClientKnownRequestError') {
		switch (code) {
			case 'P2002':
				return prismaErrorTemplate(
					name,
					code,
					message,
					'Unique constraint violation',
					meta.target,
					statusCode.badRequestCode,
					path
				);
			case 'P2003':
				return prismaErrorTemplate(
					name,
					code,
					'Foreign key constraint violation',
					message,
					meta.target,
					statusCode.unprocessableEntityCode,
					path
				);
			case 'P2013':
				return prismaErrorTemplate(
					name,
					code,
					'Missing required argument for field ',
					message,
					meta.target,
					statusCode.badRequestCode,
					path
				);
			case 'P2025':
				return prismaErrorTemplate(
					name,
					code,
					'Record not found',
					message,
					meta.target,
					statusCode.notFoundCode,
					path
				);
			default:
				return prismaErrorTemplate(
					name,
					code,
					'Database error',
					message,
					meta.target,
					statusCode.internalServerErrorCode,
					path
				);
		}
	}

	return prismaErrorTemplate(
		name,
		code,
		'Database error',
		message,
		meta.target,
		statusCode.internalServerErrorCode,
		path
	);
};

class ErrorHandler extends Error {
	/**
	 * Constructs a new ErrorHandler instance.
	 *
	 * @param {string} name - The name of the error.
	 * @param {Object} error - The error object.
	 * @param {string} message - The error message.
	 *
	 * @returns {void}
	 */
	constructor(name, error, message) {
		super(message);
		this.name = name;
		this.error = error;

		// Capture the stack trace for this error instance
		Error.captureStackTrace(this, this.constructor);

		// Call the error handler to handle the error
		this.handle();
	}

	/**
	 * Handle the error based on the error name.
	 *
	 * If the error name is 'prisma', it will call the prismaErrorHandler.
	 * Otherwise, it will call the errorHandler.
	 *
	 * @returns {Object} - An object containing the error.
	 *
	 * @private
	 */
	handle() {
		const errObj =
			this.name === 'prisma'
				? prismaErrorHandler(this.error, this.message, this.stack)
				: errorHandler(this.error, this.stack, this.message);

		// Structure the error log
		const logDetails = {
			message: errObj.message || 'An unknown error occurred',
			error: errObj.error || this.error,
			stack: this.stack || 'No stack available',
		};

		// Log the error using pino
		logger.error(
			logDetails,
			`Error handled by: ${this.name} error handler`
		);

		// Return the error object for further handling if needed
		return errObj;
	}
}

class ErrorResponse extends Error {
	/**
	 * Constructs a new ErrorResponse instance.
	 *
	 * @param {Object} error - The error object.
	 * @param {string} message - The error message.
	 * @param {number} [status] - The HTTP status code of the error.
	 *
	 * @returns {void}
	 */
	constructor(error, message, status) {
		super(message);
		/**
		 * The error object itself.
		 * @type {Object}
		 */
		this.error = error;

		/**
		 * The error message.
		 * @type {string}
		 */
		this.message = message;

		/**
		 * The HTTP status code of the error.
		 * @type {number}
		 */
		this.statusCode = status;

		/**
		 * The HTTP status statement of the error.
		 * @type {string}
		 */
		this.statement = statusStatement[this.statusCode];

		// Capture the stack trace for this error instance
		Error.captureStackTrace(this, this.constructor);
	}
}

export { ErrorResponse, ErrorHandler };
