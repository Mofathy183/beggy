import { verifyToken } from '../utils/jwt.js';
import { UserModel } from '../../prisma/prisma.js';
import { passwordChangeAfter } from '../utils/userHelper.js';
import { storeSession } from '../utils/authHelper.js';
import { statusCode } from '../config/status.js';
import { VReqTo } from './validateRequest.js';
import {
	loginSchema,
	singUpSchema,
	forgotPasswordScheme,
	resetPasswordScheme,
	updatePasswordScheme,
	updateUserDataSchema,
} from '../api/validators/authValidator.js';
import ErrorResponse from '../utils/error.js';

export const headersMiddleware = async (req, res, next) => {
	if (
		!req.headers.authorization &&
		!req.headers.authorization.startsWith('Bearer ')
	) {
		return next(
			new ErrorResponse(
				"Header 'Authorization' is required",
				"Authorization must start with 'Bearer ' and be a valid JWT token",
				statusCode.unauthorizedCode
			)
		);
	}

	//* there two cases are vailed by VReqToAuthToken
	const token = req.headers.authorization.split(' ')[1];
	const isAuthenticated = verifyToken(token);

	//? check if the id in the token is the same as the user has
	const userAuth = await UserModel.findUnique({
		where: { id: isAuthenticated.id },
	});

	if (!userAuth || userAuth.error)
		return next(
			new ErrorResponse(
				'User not found' || userAuth.error,
				'User not found in the database. Please login again',
				statusCode.unauthorizedCode
			)
		);

	//? check if the user changed their password after login
	const passwordHasChanged = passwordChangeAfter(
		userAuth,
		isAuthenticated.iat
	);

	//? if the user has changed their password, return an error message and unauthorized status code
	if (passwordHasChanged)
		return next(
			new ErrorResponse(
				'User has changed their password',
				'User has changed their password. Please login again',
				statusCode.unauthorizedCode
			)
		);

	storeSession(userAuth.id, userAuth.role, req);
	next();
};

//* check if the user has the required role to do that action
export const checkRoleMiddleware = (...roles) => {
	return (req, res, next) => {
		try {
			const { userRole } = req.session;
			const hasRole = roles.some((role) => userRole === role);

			if (!hasRole)
				return next(
					new ErrorResponse(
						'User does not have the required role',
						'User does not have the required role',
						statusCode.forbiddenCode
					)
				);

			next();
		} catch (error) {
			return next(
				new ErrorResponse(
					error,
					'Failed to check if user has the required role',
					'Failed to check user role'
				)
			);
		}
	};
};

export const confirmDeleteMiddleware = (req, res, next) => {
	const { confirmDelete } = req.body;

	// Check if the `confirmDelete` flag is set to true
	if (!confirmDelete) {
		return next(
			new ErrorResponse(
				'Confirm delete flag is required',
				'Confirm delete flag is required to delete',
				statusCode.badRequestCode
			)
		);
	}

	next();
};

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

//*====================={Request Validations}====================
export const VReqToSignUp = (req, res, next) => {
	return VReqTo(req, res, next, singUpSchema);
};

//* check for the request body in Login (ValidateRequest === VReq)
export const VReqToLogin = (req, res, next) => {
	return VReqTo(req, res, next, loginSchema);
};

//* check for the request body in forgot password request (ValidateRequest === VReq)
export const VReqToForgotPassword = (req, res, next) => {
	return VReqTo(req, res, next, forgotPasswordScheme);
};

//* check for the request body in reset password request (ValidateRequest === VReq)
export const VReqToResetPassword = (req, res, next) => {
	return VReqTo(req, res, next, resetPasswordScheme);
};

//* check for the request body in update password request (ValidateRequest === VReq)
export const VReqToUpdatePassword = (req, res, next) => {
	return VReqTo(req, res, next, updatePasswordScheme);
};

//* check for the request body in update user date request (ValidateRequest === VReq)
export const VReqToUpdateUserData = (req, res, next) => {
	return VReqTo(req, res, next, updateUserDataSchema);
};

//? if the token in params to reset password is not present or not valid
//! will prevent the request from being
export const VReqToResetToken = (req, res, next) => {
	const { token } = req.params;

	if (token) return next();

	return next(
		new ErrorResponse(
			'Invalid token',
			'Validation failed',
			statusCode.badRequestCode // HTTP status code for Bad Request
		)
	);
};

//? if the token in headers is not present or not valid
//! will prevent the request from being
export const VReqToHeaderToken = (req, res, next) => {
	const token = req.headers.authorization?.split(' ')[1];

	const isAuth = verifyToken(token);

	if (token && isAuth) return next();

	return next(
		new ErrorResponse(
			'Header "Authorization" is required',
			'Authorization must start with "Bearer " and be a valid JWT token',
			statusCode.unauthorizedCode
		)
	);
};

//*====================={Request Validations}====================
