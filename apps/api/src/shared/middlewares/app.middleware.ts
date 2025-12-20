import cors from 'cors';
import rateLimit from 'express-rate-limit';
import CSRF from 'csrf';
import pino from 'pino';
import PinoHttp from 'pino-http';
import pinoPretty from 'pino-pretty';
import { coreConfig } from '../config/env.js';
import { statusCode } from '../config/status.js';
import { ErrorResponse } from '../utils/error.js';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerOptions from '../../docs/swaggerDef.doc.js';


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
	translateTime: 'yyyy-mm-dd HH:MM:ss.l o', // Custom time format
	colorize: true,
	levelFirst: true,
	ignore: 'pid,hostname,req.headers,req.remotePort,req.remoteAddress,res.headers', // Ignore PID and hostname in logs
	messageFormat: '{msg}', // Custom message format for log entries
});

// Configure pino logger with the pretty stream to print logs to the console
export const logger = pino(
	{
		level: 'info', // Set default log level
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
export const pinoHttpLogger = PinoHttp({
	logger,
	customLogLevel: (res) => {
		if (res.statusCode >= 400) {
			return 'error'; // Log errors for status codes 400+
		} else if (res.statusCode >= 300) {
			return 'warn'; // Log warnings for status codes 300+
		}
		return 'info'; // Default log level for other status codes
	},
	customSuccessMessage: (req, res) => {
		// Log only the method, URL, and status code for successful requests
		return `${req.method} ${req.url} ( ${res.statusCode} )`;
	},
	customErrorMessage: (req, res) => {
		// Log only the method, URL, and status code for failed requests
		return `${req.method} ${req.url} ( ${res.statusCode} )`;
	},
	customLevels: (req, res) => {
		return `${req.method} ${req.url} ( ${res.statusCode} )`;
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
export const loggerMiddleware = (req, res, next) => {
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
 * CSRF protection middleware to verify the CSRF token.
 * Verifies the CSRF token and secret provided in the request headers.
 * If missing or invalid, an error response is returned.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function in the stack.
 * @throws {ErrorResponse} If the CSRF token or secret is missing or invalid.
 */
export const verifyCSRF = (req, res, next) => {
	const verifyCSRFToken = new CSRF();

	const csrfToken = req.headers['x-csrf-token'];
	const secret = req.cookies['X-CSRF-Secret'];

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

/**
 * Middleware to check if the request method is safe.
 * If the request method is not safe (i.e., not GET, OPTIONS, or HEAD),
 * it invokes the CSRF verification process to ensure security.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function in the stack.
 */
export const csrfMiddleware = (req, res, next) => {
	const safeMethods = ['GET', 'OPTIONS', 'HEAD'];

	//? if the method not safe
	//* must use csrf to verify the CSRF token
	if (!safeMethods.includes(req.method)) {
		return verifyCSRF(req, res, next);
	}

	next();
};

/**
 * Middleware for handling requests to undefined routes.
 * If the route does not exist, it returns a 404 error response.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function in the stack.
 * @throws {ErrorResponse} If the route is not found, it returns a 404 error.
 */
export const routeErrorHandler = (req, res, next) => {
	return next(
		new ErrorResponse(
			'Request to undefined route was not found',
			`Route Not Found (${req.originalUrl})`,
			statusCode.notFoundCode
		)
	);
};
