import { statusCode } from '../config/status.js';
import { ErrorResponse } from '../utils/error.js';
import { productStringRegExp } from '../api/validators/itemValidator.js';
import { stringRegExp } from '../api/validators/authValidator.js';

/**
 * Middleware for paginating results based on query parameters.
 * Validates page and limit query parameters and calculates the offset.
 * Attaches pagination details to the request object.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function in the stack.
 * @throws {ErrorResponse} If page or limit is not an integer or out of range.
 */
export const paginateMiddleware = (req, res, next) => {
	const { page = 1, limit = 10 } = req.query;
	const MAX_LIMIT = 10; // Maximum items per page

	// Validate page and limit
	const parsedPage = Number(page);
	const parsedLimit = Number(limit);

	if (!Number.isInteger(parsedPage) || !Number.isInteger(parsedLimit)) {
		return next(
			new ErrorResponse(
				`Invalid page (${page}) or limit (${limit})`,
				'Page and limit must be integers',
				statusCode.badRequestCode
			)
		);
	}

	// Check if page and limit are within range
	if (parsedPage < 1 || parsedLimit < 1 || parsedLimit > MAX_LIMIT) {
		return next(
			new ErrorResponse(
				`Page (${page}) or limit (${limit}) out of range`,
				`Page must be at least 1, and limit must be between 1 and ${MAX_LIMIT}`,
				statusCode.badRequestCode
			)
		);
	}

	// Calculate offset
	//* it is like when you press next page in website
	//* will skip the 10 thing you already seen in the previous page
	//* and show the next page with 10 now things
	const offset = (parsedPage - 1) * parsedLimit;

	// Attach pagination info to req object
	req.pagination = {
		page: parsedPage,
		limit: parsedLimit,
		offset,
	};

	next();
};

/**
 * Middleware for ordering results based on query parameters.
 * Validates the "sortBy" and "order" query parameters and constructs the Prisma ordering object.
 * Attaches the ordering details to the request object.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function in the stack.
 * @throws {ErrorResponse} If "sortBy" or "order" is invalid or missing.
 */
export const orderByMiddleware = (req, res, next) => {
	let { order = undefined, sortBy = undefined } = req.query;

	// List of allowed sort fields
	const allowedSortFields = [
		'size',
		'capacity',
		'quantity',
		'maxWeight',
		'weight',
		'volume',
		'createdAt',
	];

	// If neither sortBy nor order is provided, just continue without sorting
	if (!sortBy && !order) {
		return next();
	}

	// If one is missing but not the other, return an error
	if (!sortBy || !order) {
		return next(
			new ErrorResponse(
				`Both "sortBy" and "order" must be provided.`,
				`Valid "sortBy" fields: ${allowedSortFields.join(', ')}. ` +
					`For others, order must be "asc" or "desc".`,
				statusCode.badRequestCode
			)
		);
	}

	// Validate sorting field
	if (!allowedSortFields.includes(sortBy)) {
		return next(
			new ErrorResponse(
				`Invalid sortBy field: "${sortBy}".`,
				`Allowed fields: ${allowedSortFields.join(', ')}.`,
				statusCode.badRequestCode
			)
		);
	}

	// Validate "asc" or "desc" for other fields
	if (!['asc', 'desc'].includes(order.toLowerCase())) {
		return next(
			new ErrorResponse(
				`Invalid "order" value: "${order}".`,
				`Allowed values: "asc" or "desc".`,
				statusCode.badRequestCode
			)
		);
	}

	// Prisma expects { field: order } format
	req.orderBy = { [sortBy]: order };

	next(); // Ensure the request moves forward
};

/**
 * Middleware to filter results based on search query parameters.
 * Validates and constructs search filters based on the "field" and "search" query parameters.
 * Attaches the search filter to the request object.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function in the stack.
 * @throws {ErrorResponse} If the search query or field is invalid.
 */
export const searchMiddleware = (req, res, next) => {
	let { field = undefined, search = undefined } = req.query;

	// If no search query is provided, continue without filtering
	if (!search && !field) {
		return next();
	}

	if (!search.length && !field.length) return next(); // Ignore empty queries

	const searchRegExp = /^[A-Za-z_-]+$/;
	const fieldRegExp = /^[A-Za-z]+$/;

	//* to separate the search values and make it array
	search = String(search)
		.split(',')
		.map((s) => String(s).trim());
	//* convert fields to string
	field = String(field).trim();

	if (!fieldRegExp.test(field))
		return next(
			new ErrorResponse(
				`Invalid fields query.`,
				'Fields query must be a string',
				statusCode.badRequestCode
			)
		);

	// Convert search to uppercase for enums (Prisma requires exact matches for enums)
	const searchUpper = search.map((s) => String(s).toUpperCase().trim());

	// Default fields for searching (string and enum)
	const defaultStringFields = ['name', 'color', 'brand'];
	const defaultEnumFields = [
		'category',
		'size',
		'type',
		'wheels',
		'material',
		'features',
	];

	if (defaultStringFields.includes(field)) {
		if (!search.every((s) => productStringRegExp.test(s)))
			return next(
				new ErrorResponse(
					`Invalid search query.`,
					'Search query must be a string and can contain (-) or digits up until 3 digits',
					statusCode.badRequestCode
				)
			);
	}

	if (defaultEnumFields.includes(field)) {
		if (!search.every((s) => searchRegExp.test(s)))
			return next(
				new ErrorResponse(
					`Invalid search query.`,
					'Search query must be a string and can contain (_) or (-)',
					statusCode.badRequestCode
				)
			);
	}

	let filter;

	if (field === 'features') {
		//* For Fields Are save in database as Array
		filter = {
			[field]: {
				hasSome: searchUpper, // Convert to uppercase for exact match
			},
		};
	} else if (defaultStringFields.includes(field)) {
		//* For Fields Are Not save in database as Array and Not Enum
		filter = {
			[field]: {
				in: search, // Convert to uppercase for exact match
			},
		};
	} else {
		//* For Fields Are save in database as Array and Enum
		filter = {
			[field]: {
				in: searchUpper, // Convert to uppercase for exact match
			},
		};
	}

	req.searchFilter = filter;

	next();
};

/**
 * Middleware to validate and process email verification query parameters.
 * Ensures both 'token' and 'type' are provided and valid strings.
 * Converts the 'type' to uppercase and attaches it to the request object.
 *
 * @param {Request} req - The request object containing the query parameters.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function in the stack.
 * @throws {ErrorResponse} If token or type is missing, invalid, or incorrect.
 */
export const verifyEmailQueryMiddleware = (req, res, next) => {
	const { token, type } = req.query;

	// Check if both token and type are present
	if (!token || !type)
		return next(
			new ErrorResponse(
				'Missing token or type',
				'Failed to verify user email',
				statusCode.badRequestCode
			)
		);

	// Validate that token and type are strings
	if (typeof token !== 'string' || typeof type !== 'string')
		return next(
			new ErrorResponse(
				'Invalid token or type',
				'Failed to verify user email',
				statusCode.badRequestCode
			)
		);

	// Ensure type is either 'change_email' or 'email_verification'
	if (type !== 'change_email' && type !== 'email_verification')
		return next(
			new ErrorResponse(
				'Invalid type',
				'type must be change_email or email_verification',
				statusCode.badRequestCode
			)
		);

	// Convert type to uppercase for further processing
	const upperCaseType = type.toUpperCase();

	// Attach verified token and type to the request object
	req.verified = {
		token,
		type: upperCaseType,
	};

	next();
};

/**
 * Middleware to retrieve and store the user's IP address.
 * Retrieves the IP from the "x-forwarded-for" header or socket address.
 * Stores the user's IP in the session.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function in the stack.
 * @throws {ErrorResponse} If unable to retrieve the user's IP.
 */
export const userIpMiddleware = (req, res, next) => {
	const userIp = req.headers['x-forwarded-for']
		? req.headers['x-forwarded-for'].split(',')[0].trim() // Get first IP from proxy chain
		: req.socket.remoteAddress; // Fallback to direct IP

	if (!userIp)
		return next(
			new ErrorResponse(
				'Unable to get user Ip',
				'Internal Server Error',
				statusCode.serverErrorCode
			)
		);

	req.session.userIp = userIp;

	next();
};

/**
 * Middleware to validate and store the user's location permission.
 * Ensures that the "locationPermission" is provided and is set to "granted".
 * Stores the location permission in the session.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function in the stack.
 * @throws {ErrorResponse} If location permission is not provided or is denied.
 */
export const locationPermissionMiddleware = (req, res, next) => {
	const locationPermission = req.body.permission;

	if (!locationPermission)
		return next(
			new ErrorResponse(
				'Location permission not provided',
				'Unauthorized',
				statusCode.badRequestCode
			)
		);

	//* locationPermission must be granted that means you can you ip to get location
	//* Or denied that means can not use ip to get location
	if (locationPermission !== 'granted')
		return next(
			new ErrorResponse(
				'Location permission denied',
				'Unauthorized',
				statusCode.unauthorizedCode
			)
		);

	req.session.locationPermission = locationPermission;

	next();
};

/**
 * Middleware to filter users based on first name and last name query parameters.
 * Validates that the first name and last name are strings and do not contain special characters.
 * Constructs a search filter based on the validated parameters.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function in the stack.
 * @throws {ErrorResponse} If first name or last name is not a string or contains invalid characters.
 */
export const searchForUsersMiddleware = (req, res, next) => {
	const { firstName, lastName } = req.query;

	if (!firstName && !lastName) return next(); // Skip middleware if no query params

	if (
		(firstName && typeof firstName !== 'string') ||
		(lastName && typeof lastName !== 'string')
	) {
		return next(
			new ErrorResponse(
				'firstName and lastName must be strings',
				'Invalid input',
				statusCode.badRequestCode
			)
		);
	}

	if (
		(firstName &&
			(!stringRegExp.test(firstName) || firstName.trim().length === 0)) ||
		(lastName &&
			(!stringRegExp.test(lastName) || lastName.trim().length === 0))
	) {
		return next(
			new ErrorResponse(
				'firstName and lastName cannot contain special characters or be empty',
				'Invalid input',
				statusCode.badRequestCode
			)
		);
	}

	// Construct search filter dynamically
	const searchFilter = [];
	if (firstName)
		searchFilter.push({
			firstName: { contains: firstName, mode: 'insensitive' },
		});
	if (lastName)
		searchFilter.push({
			lastName: { contains: lastName, mode: 'insensitive' },
		});

	req.searchFilter = searchFilter.length > 0 ? searchFilter : undefined;

	next();
};
