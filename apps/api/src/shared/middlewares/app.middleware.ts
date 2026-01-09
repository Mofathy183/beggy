import cors from 'cors';
import rateLimit from 'express-rate-limit';
import pino from 'pino';
import pinoHttp from 'pino-http';
import pinoPretty from 'pino-pretty';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerOptions from '@doc';

import type { Request, Response, NextFunction } from 'express';
import { doubleCsrf } from 'csrf-csrf';
import { envConfig, env } from '@config';
import { STATUS_CODE } from '@shared/constants';
import { ErrorCode } from '@beggy/shared/constants';
import { apiResponseMap, createResponse } from '@shared/utils';

const { csrf, core: coreConfig } = envConfig;

export const swaggerSpec = swaggerJSDoc(swaggerOptions);

/**
 * CORS middleware configuration.
 *
 * @remarks
 * Enables cross-origin requests from trusted origins and
 * allows cookie-based authentication to work correctly.
 *
 * CORS is handled at the transport level and intentionally
 * does not follow the API response contract, as blocked
 * requests never reach the application layer.
 */
export const corsMiddleware = cors({
	origin: coreConfig.origin,
	credentials: true, // Required for cookies / session-based auth
	methods: ['POST', 'GET', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
});

/**
 * Global rate-limiting middleware.
 *
 * @remarks
 * Protects the API from abuse by limiting the number of
 * requests per IP within a fixed time window.
 *
 * When the limit is exceeded, the response is normalized
 * to match the API's standard HTTP error response shape.
 */
export const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15-minute rolling window
	max: 100, // Max requests per IP per window
	standardHeaders: true, // Send rate-limit info via standard headers
	handler: (_req: Request, res: Response) => {
		const response = createResponse.error(
			ErrorCode.RATE_LIMITED,
			STATUS_CODE.TOO_MANY_REQUESTS
		);

		return res.status(STATUS_CODE.TOO_MANY_REQUESTS).json(response);
	},
});

/**
 * Application logger.
 *
 * @remarks
 * - Uses structured JSON logs in production
 * - Uses pretty, human-readable logs in development
 * - Logging level is environment-aware
 *
 * This logger is intended for:
 * - Application events
 * - Errors
 * - Business logic diagnostics
 *
 * HTTP request logging is handled separately by {@link pinoHttpLogger}.
 */
export const logger = pino(
	{
		level: env.NODE_ENV === 'production' ? 'info' : 'debug',
	},
	env.NODE_ENV !== 'production'
		? pinoPretty({
				translateTime: 'yyyy-mm-dd HH:MM:ss.l o',
				colorize: true,
				levelFirst: true,
				ignore: 'pid,hostname',
			})
		: undefined
);

/**
 * HTTP request/response logger middleware.
 *
 * @remarks
 * - Automatically logs incoming HTTP requests and responses
 * - Log level is derived from response status code
 * - Payload is intentionally minimal to avoid sensitive data leakage
 *
 * Intended usage:
 * ```ts
 * app.use(pinoHttpLogger);
 * ```
 */
export const pinoHttpLogger = pinoHttp({
	logger,

	/**
	 * Determines log level based on response status.
	 */
	customLogLevel: (_req, res, err) => {
		if (res.statusCode >= 500 || err) return 'error';
		if (res.statusCode >= 400) return 'warn';
		if (res.statusCode >= 300) return 'silent';
		return 'info';
	},

	/**
	 * Message logged for successful requests.
	 */
	customSuccessMessage: (req, res, responseTime) =>
		`${req.method} ${req.url} ${res.statusCode} ${responseTime}ms`,

	/**
	 * Message logged for failed requests.
	 */
	customErrorMessage: (req, res) =>
		`${req.method} ${req.url} ${res.statusCode}`,

	/**
	 * Custom attribute names for structured logs.
	 */
	customAttributeKeys: {
		req: 'request',
		res: 'response',
		err: 'error',
		responseTime: 'timeTaken',
	},

	/**
	 * Serializers limit logged data to essential fields only.
	 */
	serializers: {
		req: (req) => ({
			method: req.method,
			url: req.url,
		}),
		res: (res) => ({
			statusCode: res.statusCode,
		}),
		err: pino.stdSerializers.err,
	},
});

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
export const RouteNotFoundHandler = (
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
