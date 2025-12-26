import SuccessResponse from '../utils/successResponse.js';

/**
 * Middleware for handling both success and error responses.
 * Formats and returns the response as JSON based on whether it is an error or success response.
 *
 * @param {Object} sucORerr - The success or error response object.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function in the stack.
 * @throws {ErrorResponse} If an error response is encountered.
 * @returns {Object} The success or error response in JSON format.
 */
export const AppResponse = (sucORerr, req, res, next) => {
	//? if there a success response
	if (sucORerr instanceof SuccessResponse) {
		return res.status(sucORerr.status).json({
			success: true,
			status: sucORerr.statement,
			statusCode: sucORerr.statusCode,
			message: sucORerr.message,
			data: sucORerr.data,
			meta: sucORerr.meta,
		});
	}

	//? if there a error response
	//* handle it here
	console.log(sucORerr.stack);
	return res.status(sucORerr.statusCode).json({
		success: false,
		status: sucORerr.statement,
		statusCode: sucORerr.statusCode,
		message: sucORerr.message,
		error: sucORerr.error,
		stack: sucORerr.stack,
	});
};
