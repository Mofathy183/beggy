import { statusCode } from '../config/status.js';
import { ErrorResponse } from '../utils/error.js';
import {
	itemsSchema,
	itemsModifySchema,
	itemsArraySchema,
	itemSchemaForItemId,
	itemSchemaForItemsIds,
	itemSchemaForItemsIdsForDelete,
} from '../api/validators/itemValidator.js';
import {
	userSchema,
	uuidValidator,
	modifyUserSchema,
	roleSchema,
} from '../api/validators/userValidator.js';
import {
	itemAutoFillingSchema,
	bagAutoFillingSchema,
	suitcaseAutoFillingSchema,
	locationPermissionScheme,
} from '../api/validators/featuresValidator.js';
import { bagSchema, bagModifySchema } from '../api/validators/bagValidator.js';
import {
	suitcaseSchema,
	suitcaseModifySchema,
} from '../api/validators/suitcaseValidator.js';

/**
 * if the user not add the required fields in the body request
 * will prevent the request from being processed or continue
 * Validates a request body against a given Joi schema.
 * If validation passes, the request proceeds to the next middleware.
 * If validation fails, an error response is generated.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @param {Object} schema - The Joi schema to validate against.
 */
export const VReqTo = (req, res, next, schema) => {
	const { body } = req;
	// Validate the request body against the schema
	const { error } = schema.validate(body, { abortEarly: false });

	// If no validation errors, proceed to the next middleware
	if (!error) return next();

	// Construct an error object with details of the validation failure
	const JoiError = {
		errors: error.details.map((err) => ({
			field: err.context.key,
			message: err.message,
		})),
	};

	const showError = error.details ? JoiError : error;
	// If validation errors exist, pass an error response to the next middleware
	return next(
		new ErrorResponse(
			showError,
			`Validation failed ${error.message && error.message}`,
			statusCode.badRequestCode
		)
	);
};

/**
 *if the id is not present or not valid
 *will prevent the request from being processed or continue
 * Middleware to validate that a request parameter is a valid UUID.
 * If the validation fails, an error response is generated.
 * If validation passes, the request proceeds to the next middleware.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @param {string} value - The value to validate as a UUID.
 * @param {string} paramName - The name of the parameter being validated.
 */
export const VReqToUUID = (req, res, next, value, paramName) => {
	// Validate the value using the UUID validator
	const { error } = uuidValidator(value);

	// If validation errors exist, pass an error response to the next middleware
	if (error) {
		return next(
			new ErrorResponse(
				`${paramName} must be a valid UUID`,
				'Validation failed',
				statusCode.badRequestCode
			)
		);
	}

	// UUID is valid, continue processing
	next();
};

//* ======================={USER VRequests Validation}========================

/**
 * if req.user is undefined or null means that Facebook authentication failed
 * or if req.error is undefined or null means that user dose not have email to sign-up with
 * Validate that the request object has a user property.
 * If the user property does not exist, an error response is generated.
 * If the user property exists, the request proceeds to the next middleware.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 */
export const VReqUserSocialProfile = (req, res, next) => {
	// If the request object does not have a user property
	if (!req.user) {
		// Generate an error response
		return next(
			new ErrorResponse(
				'Not authorized to access this resource',
				'User not found',
				statusCode.badRequestCode
			)
		);
	}

	// If the user property exists, continue processing
	next();
};

/**
 * Validates a request body for creating a user against the userSchema.
 * If validation passes, the request proceeds to the next middleware.
 * If validation fails, an error response is generated.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 */
export const VReqToCreateUser = (req, res, next) => {
	return VReqTo(req, res, next, userSchema);
};

/**
 * Validates a request body for modifying a user against the modifyUserSchema.
 * If validation passes, the request proceeds to the next middleware.
 * If validation fails, an error response is generated.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 */
export const VReqToModifyUser = (req, res, next) => {
	return VReqTo(req, res, next, modifyUserSchema);
};

/**
 * Validates a request body for creating an item against the itemsSchema.
 * If validation passes, the request proceeds to the next middleware.
 * If validation fails, an error response is generated.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 */

export const VReqToCreateItem = (req, res, next) => {
	return VReqTo(req, res, next, itemsSchema);
};

/**
 * Validates a request body for changing a user's role against the roleSchema.
 * If validation passes, the request proceeds to the next middleware.
 * If validation fails, an error response is generated.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 */

export const VReqToUserRole = (req, res, next) => {
	return VReqTo(req, res, next, roleSchema);
};
//* ======================={USER VRequests Validation}========================

//* ======================={ITEM VRequests Validation}========================

/**
 * Validates a request body for creating multiple items against the itemsArraySchema.
 * If validation passes, the request proceeds to the next middleware.
 * If validation fails, an error response is generated.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 */
export const VReqToCreateManyItems = (req, res, next) => {
	return VReqTo(req, res, next, itemsArraySchema);
};

/**
 * Validates a request body for modifying an item against the itemsModifySchema.
 * If validation passes, the request proceeds to the next middleware.
 * If validation fails, an error response is generated.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 */

export const VReqToModifyItem = (req, res, next) => {
	return VReqTo(req, res, next, itemsModifySchema);
};

/**
 * Validates a request body for the presence of a single item ID
 * using the itemSchemaForItemId validation schema.
 * If validation passes, the request proceeds to the next middleware.
 * If validation fails, an error response is generated.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 */

export const VReqToBodyItemId = (req, res, next) => {
	return VReqTo(req, res, next, itemSchemaForItemId);
};

/**
 * Validates a request body for the presence of an array of item IDs
 * using the itemSchemaForItemsIds validation schema.
 * If validation passes, the request proceeds to the next middleware.
 * If validation fails, an error response is generated.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 */
export const VReqToBodyItemsIds = (req, res, next) => {
	return VReqTo(req, res, next, itemSchemaForItemsIds);
};

/**
 * Validates a request body for the presence of an array of item IDs
 * that are to be deleted from a user's bag or suitcase.
 * If validation passes, the request proceeds to the next middleware.
 * If validation fails, an error response is generated.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 */
export const VReqToBodyItemsIdsForDelete = (req, res, next) => {
	return VReqTo(req, res, next, itemSchemaForItemsIdsForDelete);
};

//* ======================={ITEM VRequests Validation}========================

//* ======================={BAG VRequests Validation}========================

/**
 * Validates a request body for creating a bag against the bagSchema.
 * If validation passes, the request proceeds to the next middleware.
 * If validation fails, an error response is generated.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 */
export const VReqToCreateBag = (req, res, next) => {
	return VReqTo(req, res, next, bagSchema);
};

/**
 * Validates a request body for modifying a bag against the bagModifySchema.
 * If validation passes, the request proceeds to the next middleware.
 * If validation fails, an error response is generated.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 */
export const VReqToModifyBag = (req, res, next) => {
	return VReqTo(req, res, next, bagModifySchema);
};

//* ======================={BAG VRequests Validation}========================

//* ======================={SUITCASE VRequests Validation}========================

/**
 * Validates a request body for creating a suitcase against the suitcaseSchema.
 * If validation passes, the request proceeds to the next middleware.
 * If validation fails, an error response is generated.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 */
export const VReqToCreateSuitcase = (req, res, next) => {
	return VReqTo(req, res, next, suitcaseSchema);
};

/**
 * Validates a request body for modifying a suitcase against the suitcaseModifySchema.
 * If validation passes, the request proceeds to the next middleware.
 * If validation fails, an error response is generated.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 */
export const VReqToModifySuitcase = (req, res, next) => {
	return VReqTo(req, res, next, suitcaseModifySchema);
};

//* ======================={SUITCASE VRequests Validation}========================

//* ======================={FEATURES VRequests Validation}========================

/**
 * Validates a request body for auto-filling item fields against the itemAutoFillingSchema.
 * If validation passes, the request proceeds to the next middleware.
 * If validation fails, an error response is generated.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 */
export const VReqToItemAutoFilling = (req, res, next) => {
	return VReqTo(req, res, next, itemAutoFillingSchema);
};

/**
 * Validates a request body for auto-filling bag fields against the bagAutoFillingSchema.
 * If validation passes, the request proceeds to the next middleware.
 * If validation fails, an error response is generated.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 */
export const VReqToBagAutoFilling = (req, res, next) => {
	return VReqTo(req, res, next, bagAutoFillingSchema);
};

/**
 * Validates a request body for auto-filling suitcase fields against the
 * suitcaseAutoFillingSchema.
 *
 * If validation passes, the request proceeds to the next middleware.
 * If validation fails, an error response is generated.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 */
export const VReqToSuitcaseAutoFilling = (req, res, next) => {
	return VReqTo(req, res, next, suitcaseAutoFillingSchema);
};

/**
 * Validates a request body for location permission against the locationPermissionScheme.
 * If validation passes, the request proceeds to the next middleware.
 * If validation fails, an error response is generated.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 */
export const VReqToLocationPermission = (req, res, next) => {
	return VReqTo(req, res, next, locationPermissionScheme);
};
//* ======================={FEATURES VRequests Validation}========================
