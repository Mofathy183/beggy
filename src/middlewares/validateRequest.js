import { statusCode } from '../config/status.js';
import { ErrorResponse } from '../utils/error.js';
import {
	userSchema,
	itemsSchema,
	uuidValidator,
} from '../api/validators/validators.js';

// //? if the user not add the required fields in the body request
// //! will prevent the request from being processed or continue
export const VReqTo = (req, res, next, schema) => {
	const { body } = req;
	const { error } = schema.validate(body);

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
export const VReqToUUID = (req, res, next) => {
	const { id } = req.params;
	const isValid = uuidValidator(id);

	if (isValid) return next();

	return next(
		new ErrorResponse(
			'Invalid UUID',
			'Validation failed',
			statusCode.badRequestCode // HTTP status code for Bad Request
		)
	);
};

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

export const VReqToCreateItem = (req, res, next) => {
	return VReqTo(req, res, next, itemsSchema);
};
