import { statusCode, statusStatment } from '../config/status.js';

const errorHandler = (error, path, message = 'error') => {
	return {
		message: message || error.message,
		error,
		path,
	};
};

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

//* handle Prisma errors
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
	constructor(name, error, message) {
		super(message);
		this.name = name;
		this.error = error;

		//* Capture the stack trace for this error instance
		Error.captureStackTrace(this, this.constructor);

		this.whichError();

		console.log(this.whichError());
	}

	whichError() {
		if (this.name === 'prisma') {
			console.log('Prisma');
			return prismaErrorHandler(
				this.error,
				this.stack, //* you can use this.stack becouce it's already set by captureStackTrace
				this.message
			);
		} else {
			return errorHandler(this.error, this.stack, this.message);
		}
	}
}

class ErrorResponse extends Error {
	constructor(error, message, status) {
		super(message);
		this.error = error;
		this.statusCode = status || 500;
		this.message = message;
		this.statment = statusStatment[this.statusCode];

		Error.captureStackTrace(this, this.constructor);
	}
}

export default { ErrorResponse, ErrorHandler };
