import cors from 'cors';
import rateLimit from 'express-rate-limit';
import pino from 'pino';
import PinoHttp from 'pino-http';
import pinoPretty from 'pino-pretty';
// import { ErrorResponse } from '../utils/error.js';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerOptions from '../../../docs/swaggerDef.doc';

import type { Request, Response, NextFunction } from 'express';
import { doubleCsrf } from 'csrf-csrf';
import { envConfig } from '@config';
import { STATUS_CODE, ErrorCode } from '@shared/constants';
import { apiResponseMap } from '@shared/utils';

const { csrf, core: coreConfig } = envConfig;

export const swaggerSpec = swaggerJSDoc(swaggerOptions);

export const corsMiddleware = cors({
	origin: coreConfig.origin,
	credentials: true, // ✅ This line is required for cookies
	methods: ['POST', 'GET', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
});

//* Apply middleware rate limit for all requests
export const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // limit each IP to 100 requests per windowMs
	message: 'Too many requests from this IP, please try again later.',
});

// Create the pretty stream for human-readable logs
const prettyStream = pinoPretty({
	translateTime: 'yyyy-mm-dd HH:MM:ss.l o',
	colorize: true,
	levelFirst: true,
	ignore: 'pid,hostname,req.headers,req.remotePort,req.remoteAddress,res.headers',
	messageFormat: '{msg}',
});

// Configure pino logger with the pretty stream to print logs to the console
export const logger = pino(
	{
		level: 'info',
		serializers: {
			req: (req) => ({
				method: req.method,
				url: req.url,
			}),
			res: (res) => ({
				statusCode: res.statusCode,
			}),
		},
	},
	prettyStream // Using pino-pretty as a transport to output to the console
);

// Attach the logger to HTTP requests automatically using pino-http
export const pinoHttpLogger: (
	req: Request,
	res: Response,
	next: NextFunction
) => void = PinoHttp({
	logger, // Now correctly passed as part of the options object
	customLogLevel: (_req: Request, res: Response, err) => {
		if (res.statusCode >= 500 || err) {
			return 'error';
		} else if (res.statusCode >= 400) {
			return 'warn';
		} else if (res.statusCode >= 300) {
			return 'silent'; // Usually don't log redirects unless needed
		}
		return 'info';
	},
	customSuccessMessage: (req: Request, res: Response, responseTime) => {
		return `${req.method} ${req.url} completed with ${res.statusCode} in ${responseTime}ms`;
	},
	customErrorMessage: (req: Request, res: Response, _err) => {
		return `${req.method} ${req.url} failed with ${res.statusCode}`;
	},
	// Remove customLevels - it's not a valid option for pino-http
	// Instead use customAttributesKeys to customize logged fields if needed
	customAttributeKeys: {
		req: 'request',
		res: 'response',
		err: 'error',
		responseTime: 'timeTaken',
	},
	// Add serializers for request/response objects
	serializers: {
		req: (req) => ({
			method: req.method,
			url: req.url,
			headers: req.headers,
		}),
		res: (res) => ({
			statusCode: res.statusCode,
		}),
		err: pino.stdSerializers.err,
	},
});

/**
 * Middleware to log the request method, URL, and status code
 * Logs the request method, URL, and status code for each request.
 * @function loggerMiddleware
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function in the stack.
 */
export const loggerMiddleware = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	// Log only method, URL, and status code
	logger.info({
		method: req.method,
		url: req.url,
		statusCode: res.statusCode, // Log the status code
	});
	next();
};

//*==========================={CSRF Middleware}=====================================
/**
 * Initialize CSRF protection with our config
 * This creates all the middleware and utilities we need
 */
const csrfUtilities = doubleCsrf(csrf);

/**
 * Export the two main things we need:
 * 1. doubleCsrfProtection - Validates CSRF tokens on requests
 * 2. generateCsrfToken - Creates tokens AND sets them as cookies
 */
export const {
	doubleCsrfProtection, // Use this to protect routes
	generateCsrfToken, // Use this to set CSRF cookies
} = csrfUtilities;

/**
 * Simple middleware to set CSRF cookie on every response
 *
 * Why we need this:
 * - CSRF works by comparing cookie token with header token
 * - This middleware ensures the cookie is always set
 * - Without it, CSRF validation has nothing to compare
 *
 * How it works:
 * - generateCsrfToken() automatically sets cookie with our config
 * - We just need to call it on each request
 */
export const injectCsrfToken = (
	req: Request,
	res: Response,
	next: NextFunction
): void => {
	generateCsrfToken(req, res); // This sets the CSRF cookie
	next(); // Move to next middleware
};

//*==========================={Route Error Handler}=====================================
/**
 * Middleware for handling requests to undefined routes.
 * If the route does not exist, it returns a 404 error response.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function in the stack.
 */
export const routeErrorHandler = (
	req: Request,
	res: Response,
	_next: NextFunction
) => {
	// Create error details object
	const errorDetails = {
		requestedPath: req.path,
		method: req.method,
		hint: `The route '${req.path}' doesn't seem to be on our packing map. 
            Check the endpoint URL or refer to the API documentation.`,
	};

	// Log the 404 for monitoring (optional but recommended)
	console.warn('404 Route Not Found:', errorDetails);

	// Return the error response
	return res
		.status(STATUS_CODE.NOT_FOUND)
		.json(apiResponseMap.notFound(ErrorCode.ROUTE_NOT_FOUND, errorDetails));
};
