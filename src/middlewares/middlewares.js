import Joi from 'joi';
import { statusCode } from '../config/status.js';
import { ErrorResponse } from '../utils/error.js';
import { Size } from '@prisma/client';
import { stringRegExp } from '../api/validators/authValidator.js';

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
	//* it is like when you prass next page in website
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

export const orderByMiddleware = (req, res, next) => {
	let { sortBy, order } = req.query;

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
					`For "size", order must be one of: ${Object.values(Size).join(', ')}. ` +
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

	// Special validation for "size" field
	if (sortBy === 'size') {
		const sizeSchema = Joi.string()
			.valid(...Object.values(Size))
			.uppercase();
		const { error } = sizeSchema.validate(order);

		if (error) {
			return next(
				new ErrorResponse(
					`Invalid "order" value for size: "${order}".`,
					`Allowed values: ${Object.values(Size).join(', ')}.`,
					statusCode.badRequestCode
				)
			);
		}

		order = order.toUpperCase();
	}
	// Validate "asc" or "desc" for other fields
	else if (!['asc', 'desc'].includes(order.toLowerCase())) {
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

export const searchMiddleware = (req, res, next) => {
	let { search, fields } = req.query;

	// If no search query is provided, continue without filtering
	if (!search) {
		return next();
	}

	search = search.trim(); // Remove extra spaces
	if (!search.length) return next(); // Ignore empty queries

	// Convert search to uppercase for enums (Prisma requires exact matches for enums)
	const searchUpper = search.toUpperCase();

	// Default fields for searching (string and enum)
	const defaultStringFields = ['name', 'color', 'material'];
	const defaultEnumFields = ['category', 'size', 'type', 'wheels'];

	// Allow users to specify search fields (if provided)
	let searchableFields = fields
		? fields.split(',')
		: [...defaultStringFields, ...defaultEnumFields];

	// Separate string and enum fields
	const stringFields = searchableFields.filter((field) =>
		defaultStringFields.includes(field)
	);
	const enumFields = searchableFields.filter((field) =>
		defaultEnumFields.includes(field)
	);

	// Build search filters for string fields (case-insensitive search)
	const stringFilters = stringFields.map((field) => ({
		[field]: {
			contains: search,
			mode: 'insensitive',
		},
	}));

	// Build search filters for enum fields (exact match)
	const enumFilters = enumFields.map((field) => ({
		[field]: searchUpper, // Convert to uppercase for exact match
	}));

	// Combine filters using Prisma's OR condition
	req.searchFilter = [...stringFilters, ...enumFilters];

	next();
};

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
