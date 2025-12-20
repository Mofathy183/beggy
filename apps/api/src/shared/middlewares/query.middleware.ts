import { statusCode } from '../config/status.js';
import type { PrismaClient } from '../generated/client/index.js';
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
		'size', //* in Bags and Suitcases
		'capacity', //* in Bags and Suitcases
		'quantity', //* in Items
		'maxWeight', //* in Bags and Suitcases
		'weight', //* in Bags, Suitcases and Items
		'volume', //* In Items
		'createdAt', //* in All
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
 * @middleware searchMiddleware
 * @description
 * Middleware to build a dynamic Prisma search filter based on query parameters.
 * It distinguishes between fields that require strict matching (AND with uppercased values)
 * and fields that allow looser matching (OR without case transformation).
 *
 * @queryparam {string} [name] - Bag name to match exactly (case-sensitive, OR condition).
 * @queryparam {string} [brand] - Brand name to match exactly (case-sensitive, OR condition).
 * @queryparam {string} [color] - Color to match exactly (case-sensitive, OR condition).
 * @queryparam {string} [category] - Category to match exactly (uppercased, AND condition).
 * @queryparam {string} [size] - Size to match exactly (uppercased, AND condition).
 * @queryparam {string} [type] - Type to match exactly (uppercased, AND condition).
 * @queryparam {string} [wheels] - Wheels type to match exactly (uppercased, AND condition).
 * @queryparam {string} [material] - Material to match exactly (uppercased, AND condition).
 * @queryparam {string} [features] - Comma-separated list of features to partially match (uppercased, AND condition).
 *
 * @validations
 * - All query parameters must be strings.
 * - All fields must match the provided regular expression (stringRegExp).
 * - `features` must be a comma-separated string and each feature must match the regex.
 *
 * @adds
 * Adds a `searchFilter` object to the `req` object with the structure:
 * ```
 * req.searchFilter = {
 *   AND: [...], // fields with uppercased strict matching
 *   OR: [...]   // fields with regular case-sensitive loose matching
 * }
 * ```
 *
 * @usage
 * Used to dynamically filter bags based on provided query parameters in Prisma's `findMany()`.
 * Example usage in a route handler:
 * ```
 * const bags = await prisma.bags.findMany({
 *   where: req.searchFilter
 * });
 * ```
 *
 * @param {Request} req - Express request object containing query parameters
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 */
export const searchMiddleware = (req, res, next) => {
	const {
		//* field that will not be upper case
		name,
		brand,
		color,
		//* field that will not be upper case
		//* field that will be upper case
		category,
		size,
		type,
		wheels,
		material,
		features, //* an array of upper case features
		//* field that will be upper case
	} = req.query;
	// Check if any search query is provided

	if (
		!name &&
		!brand &&
		!color &&
		!category &&
		!size &&
		!type &&
		!wheels &&
		!material &&
		!features
	)
		return next();

	const featuresArray = features ? features.split(',') : [];

	// Validate that all search queries are strings
	if (
		(name && typeof name !== 'string') ||
		(brand && typeof brand !== 'string') ||
		(color && typeof color !== 'string') ||
		(category && typeof category !== 'string') ||
		(size && typeof size !== 'string') ||
		(type && typeof type !== 'string') ||
		(wheels && typeof wheels !== 'string') ||
		(material && typeof material !== 'string') ||
		(featuresArray && !Array.isArray(featuresArray))
	) {
		return next(
			new ErrorResponse(
				'Invalid search query',
				'Search queries must be strings or an array',
				statusCode.badRequestCode
			)
		);
	}
	// Validate that the search queries do not contain special characters
	if (
		(name && !stringRegExp.test(name)) ||
		(brand && !stringRegExp.test(brand)) ||
		(color && !stringRegExp.test(color)) ||
		(category && !productStringRegExp.test(category)) ||
		(size && !productStringRegExp.test(size)) ||
		(type && !productStringRegExp.test(type)) ||
		(wheels && !productStringRegExp.test(wheels)) ||
		(material && !productStringRegExp.test(material)) ||
		(featuresArray.length > 0 &&
			!featuresArray.every((f) => productStringRegExp.test(f)))
	) {
		return next(
			new ErrorResponse(
				'Invalid search query',
				'Search queries cannot contain special characters',
				statusCode.badRequestCode
			)
		);
	}

	// Construct search filter dynamically
	const orFilter = []; //* the Filter that will be used in the OR condition
	const andFilter = []; //* the Filter that will be used in the AND condition

	if (name) orFilter.push({ name: { equals: name.trim() } });

	if (brand) orFilter.push({ brand: { equals: brand.trim() } });

	if (color) orFilter.push({ color: { equals: color.trim() } });

	if (category)
		andFilter.push({ category: { equals: category.trim().toUpperCase() } });

	if (size) andFilter.push({ size: { equals: size.trim().toUpperCase() } });

	if (type) andFilter.push({ type: { equals: type.trim().toUpperCase() } });

	if (wheels)
		andFilter.push({ wheels: { equals: wheels.trim().toUpperCase() } });

	if (material)
		andFilter.push({ material: { equals: material.trim().toUpperCase() } });

	if (featuresArray.length > 0) {
		andFilter.push({
			features: {
				hasSome: featuresArray.map((f) => f.trim().toUpperCase()),
			},
		});
	}

	req.searchFilter = {};

	if (orFilter.length > 0) req.searchFilter.OR = orFilter;
	if (andFilter.length > 0) req.searchFilter.AND = andFilter;

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

	req.searchFilter = {
		AND: searchFilter.length > 0 ? searchFilter : undefined,
	};

	next();
};
