import { statusCode } from '../config/status.js';
import { ErrorResponse } from '../utils/error.js';
import {
	itemsSchema,
	itemsModifySchema,
	itemsArraySchema,
} from '../api/validators/itemValidator.js';
import {
	userSchema,
	uuidValidator,
	modifyUserSchema,
	roleSchema,
} from '../api/validators/userValidator.js';
import { bagSchema, bagModifySchema } from '../api/validators/bagValidator.js';
import {
	suitcaseSchema,
	suitcaseModifySchema,
} from '../api/validators/suitcaseValidator.js';

// //? if the user not add the required fields in the body request
// //! will prevent the request from being processed or continue
export const VReqTo = (req, res, next, schema) => {
	const { body } = req;
	const { error } = schema.validate(body, { abortEarly: false });

	//? check if there an error
	//* if there is not an error will continue the request
	if (!error) return next();

	//* if there is an error will send bad request with the error message
	return next(
		new ErrorResponse(error, 'Validation failed', statusCode.badRequestCode)
	);
};

//? if the id is not present or not valid
//! will prevent the request from being processed or continue
export const VReqToUUID = (req, res, next, value, paramName) => {
	const { error } = uuidValidator(value);

	if (error) {
		return next(
			new ErrorResponse(
				`${paramName} must be a valid UUID`,
				'Validation failed',
				statusCode.badRequestCode
			)
		);
	}

	next(); // UUID is valid, continue processing
};

//* ======================={USER VRequests Validation}========================

//? if req.user if undfind or null means that Facebook authentication failed
export const VReqUser = (req, res, next) => {
	if (!req.user)
		return next(
			new ErrorResponse(
				'Not authorized to access this resource',
				'User not found',
				statusCode.unauthorizedCode
			)
		);

	next();
};

export const VReqToCreateUser = (req, res, next) => {
	return VReqTo(req, res, next, userSchema);
};

export const VReqToModifyUser = (req, res, next) => {
	return VReqTo(req, res, next, modifyUserSchema);
};

export const VReqToCreateItem = (req, res, next) => {
	return VReqTo(req, res, next, itemsSchema);
};

export const VReqToUserRole = (req, res, next) => {
	return VReqTo(req, res, next, roleSchema);
};
//* ======================={USER VRequests Validation}========================

//* ======================={ITEM VRequests Validation}========================

export const VReqToCreateManyItems = (req, res, next) => {
	return VReqTo(req, res, next, itemsArraySchema);
};

export const VReqToModifyItem = (req, res, next) => {
	return VReqTo(req, res, next, itemsModifySchema);
};

//* ======================={ITEM VRequests Validation}========================

//* ======================={BAG VRequests Validation}========================
export const VReqToCreateBag = (req, res, next) => {
	return VReqTo(req, res, next, bagSchema);
};

export const VReqToModifyBag = (req, res, next) => {
	return VReqTo(req, res, next, bagModifySchema);
};

//* ======================={BAG VRequests Validation}========================

//* ======================={BAG VRequests Validation}========================
export const VReqToCreateSuitcase = (req, res, next) => {
	return VReqTo(req, res, next, suitcaseSchema);
};

export const VReqToModifySuitcase = (req, res, next) => {
	return VReqTo(req, res, next, suitcaseModifySchema);
};

//* ======================={BAG VRequests Validation}========================
