import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { coreConfig } from '../config/env.js';
import { statusCode } from '../config/status.js';
import ErrorResponse from '../utils/error.js';
import SuccessResponse from '../utils/successResponse.js';

export const croeMiddleware = cors({
	origin: coreConfig.origin,
	method: 'POST, GET, PUT, DELETE, OPTIONS, PATCH',
});

// export const logger = (req, res, next) => {
// 	const tiemstamps = new Date().toISOString();
// 	console.log(`${tiemstamps}\n${req.method}\n${res.url}`);
// 	next();
// };

export const errorMiddlewareHandler = (err, req, res, next) => {
	return next(
		new ErrorResponse(
			err.message || 'Internal Server Error',
			err.status || statusCode.internalServerErrorCode
		)
	);
};

//* Apply middleware rate limit for all requests
export const limter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // limit each IP to 100 requests per windowMs
	message: 'Too many requests from this IP, please try again later.',
});

//* for not idintfication routes
export const routeErrorHandler = (req, res, next) => {
	return next(
		new ErrorResponse(
			'Request to undefined route was not found',
			'Route Not Found \n' + req.originalUrl,
			statusCode.notFoundCode
		)
	);
};

//* handle error and success response came from ErrorResponse and SuccessResponse
export const AppResponse = (sucORerr, req, res, next) => {
	//? if there a success response
	if (sucORerr instanceof SuccessResponse) {
		//* handle it here
		const data = sucORerr.isNumber
			? { deleteCount: sucORerr.date }
			: sucORerr.data;

		return res.status(sucORerr.status).json({
			success: true,
			status: sucORerr.statment,
			message: sucORerr.message,
			data: data,
			token: sucORerr.token,
		});
	}

	//? if there a error response
	else if (sucORerr instanceof ErrorResponse) {
		//* handle it here
		console.log(sucORerr.stack);
		return res.status(sucORerr.statusCode).json({
			success: false,
			status: sucORerr.statment,
			message: sucORerr.message,
			error: sucORerr.error,
			stack: sucORerr.stack,
		});
	}
};
