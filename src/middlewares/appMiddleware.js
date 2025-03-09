import cors from 'cors';
import rateLimit from 'express-rate-limit';
import csurf from 'csurf';
import { coreConfig } from '../config/env.js';
import { statusCode } from '../config/status.js';
import { ErrorResponse } from '../utils/error.js';
import SuccessResponse from '../utils/successResponse.js';

export const corsMiddleware = cors({
	origin: coreConfig.origin,
	method: 'POST, GET, PUT, DELETE, OPTIONS, PATCH',
});

export const csrfMiddleware = (error, req, res, next) => {
    if (error.code === 'EBADCSRFTOKEN') {
        return next(
            new ErrorResponse(
                error,
                'Invalid CSRF token',
                statusCode.forbiddenCode // HTTP status code for forbidde
            )
        );
    }

    return next(error);
};


//* CSRF protection
export const csrfProtection = csurf({ cookie: true });


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
		return res.status(sucORerr.status).json({
			success: true,
			status: sucORerr.statment,
			message: sucORerr.message,
			data: sucORerr.data,
			meta: sucORerr.meta,
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
