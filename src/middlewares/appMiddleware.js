import cors from 'cors';
import rateLimit from 'express-rate-limit';
import CSRF from 'csrf';
import { coreConfig } from '../config/env.js';
import { statusCode } from '../config/status.js';
import { ErrorResponse } from '../utils/error.js';
import SuccessResponse from '../utils/successResponse.js';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerOptions from '../docs/swaggerDef.js';

export const swaggerSpec = swaggerJSDoc(swaggerOptions);

export const corsMiddleware = cors({
	origin: coreConfig.origin,
	methods: ['POST', 'GET', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
});

//* Apply middleware rate limit for all requests
export const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // limit each IP to 100 requests per windowMs
	message: 'Too many requests from this IP, please try again later.',
});

//*==========================={CSRF Middleware}=====================================

//* CSRF protection to Verify the CSRF token
export const verifyCSRF = (req, res, next) => {
	const verifyCSRFToken = new CSRF();

	const csrfToken = req.headers['x-csrf-token'];
	const secret = req.headers['x-csrf-secret'];

	if (!csrfToken || !secret)
		return next(
			new ErrorResponse(
				'Missing CSRF token or secret',
				'CSRF token or secret missing',
				statusCode.badRequestCode
			)
		);

	if (!verifyCSRFToken.verify(secret, csrfToken))
		return next(
			new ErrorResponse(
				'Invalid CSRF token',
				'CSRF token is invalid, tampered, or doesn’t match the secret',
				statusCode.forbiddenCode
			)
		);

	next();
};

//* this will check if the request method in the safe method
//* if not will return csrfProtection to check if the request contains csrf token and secret
export const csrfMiddleware = (req, res, next) => {
	const safeMethods = ['GET', 'OPTIONS', 'HEAD'];

	//? if the method not safe
	//* must use csrf to verify the CSRF token
	if (!safeMethods.includes(req.method)) {
		return verifyCSRF(req, res, next);
	}

	next();
};

//* for not identification routes
export const routeErrorHandler = (req, res, next) => {
	return next(
		new ErrorResponse(
			'Request to undefined route was not found',
			`Route Not Found (${req.originalUrl})`,
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
