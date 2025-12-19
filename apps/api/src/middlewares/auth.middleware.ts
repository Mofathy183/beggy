import { verifyRefreshToken, verifyToken } from '../utils/jwt.js';
import type { PrismaClient } from '../generated/client/index.js';
import prisma from '../../prisma/prisma.js';
import { AbilityBuilder } from '@casl/ability';
import { createPrismaAbility } from '@casl/prisma';
import { passwordChangeAfter } from '../utils/userHelper.js';
import { storeSession } from '../utils/authHelper.js';
import { statusCode } from '../config/status.js';
import { VReqTo } from './validate-request.middleware.js';
import {
	loginSchema,
	singUpSchema,
	emailScheme,
	resetPasswordScheme,
	updatePasswordScheme,
	updateUserDataSchema,
	confirmDeleteSchema,
} from '../api/validators/authValidator.js';
import { ErrorResponse } from '../utils/error.js';

/**
 * Middleware to authenticate a user from the verified JWT payload in `req.auth`.
 *
 * - Assumes `req.auth` is already populated by a previous middleware (access or refresh token verification).
 * - Validates the existence of the user in the database.
 * - Checks if the user has changed their password after the token was issued.
 * - Stores the user's ID and role in the request session.
 *
 * @async
 * @function headersMiddleware
 * @param {Request} req - Express request object with `req.auth` populated.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 * @returns {Promise<void>}
 *
 * @throws {ErrorResponse} - If the user is not found or password has changed after token issue time.
 */
export const headersMiddleware = async (req, res, next) => {
	try {
		const { id, iat } = req.auth;

		// Fetch the user by ID
		const user = await prisma.user.findUnique({ where: { id } });

		// If user does not exist
		if (!user) {
			return next(
				new ErrorResponse(
					'User not found',
					'User not found in the database. Please login again.',
					statusCode.unauthorizedCode
				)
			);
		}

		// If Prisma returns error somehow (defensive, in case of future API changes)
		if (user?.error) {
			return next(
				new ErrorResponse(
					user.error,
					`Failed to retrieve user: ${user.error.message}`,
					statusCode.internalServerErrorCode
				)
			);
		}

		// Check if user changed password after token was issued
		const passwordChanged = passwordChangeAfter(user.passwordChangeAt, iat);

		if (passwordChanged) {
			return next(
				new ErrorResponse(
					'Password recently changed',
					'Please log in again, your credentials have been reset.',
					statusCode.unauthorizedCode
				)
			);
		}

		// Store user info in session
		storeSession(user.id, user.role, req);

		// Continue to next middleware
		next();
	} catch (error) {
		next(
			new ErrorResponse(
				'Internal Server Error',
				error.message || 'Unexpected error in headersMiddleware',
				statusCode.internalServerErrorCode
			)
		);
	}
};

/**
 * Defines the abilities for a given role.
 *
 * @async
 * @function defineAbilitiesFor
 * @param {string} role - The role for which to define the abilities.
 * @returns {Promise<Ability>} - The ability builder for the given role.
 */
const defineAbilitiesFor = async (role) => {
	// Ability builder
	const { can, build } = new AbilityBuilder(createPrismaAbility);

	// Get the permissions for the role from the database
	const permissions = await prisma.roleOnPermission.findMany({
		where: { role: role },
		include: { permission: true },
	});

	// Add the permissions to the ability builder
	permissions.forEach((perm) => {
		let { action, subject } = perm.permission;
		can(action, subject);
	});

	// Return the ability builder
	return build();
};

/**
 * Middleware to check if the user has the required permission for the given action and subject.
 *
 * @async
 * @function checkPermissionMiddleware
 * @param {string} action - The action to check (e.g. 'read', 'create', 'update', 'delete').
 * @param {string} subject - The subject to check (e.g. 'user', 'bag', 'item').
 * @returns {Promise<void>} Returns nothing but passes control to the next middleware or throws an error.
 *
 * @throws {ErrorResponse} - If the user does not have the required permission.
 * @throws {ErrorResponse} - If an error occurs while checking user permissions.
 */
export const checkPermissionMiddleware =
	(action, subject) => async (req, res, next) => {
		try {
			// Get the user's role from the session
			const { userRole } = req.session;

			// Define the abilities for the user's role
			// Ability builder
			const { can, build } = new AbilityBuilder(createPrismaAbility);

			// Get the permissions for the role from the database
			const permissions = await prisma.roleOnPermission.findMany({
				where: { role: userRole },
				include: { permission: true },
			});

			// Add the permissions to the ability builder
			permissions.forEach((perm) => {
				let { action: permAction, subject: permSubject } =
					perm.permission;
				can(permAction, permSubject);
			});

			// Build the ability
			const ability = await defineAbilitiesFor(userRole);

			// Check if the user has the required permission
			const hasPermission = ability.can(action, subject);

			if (!hasPermission) {
				// Return an error response with a 403 status code
				return next(
					new ErrorResponse(
						`You do not have permission to ${action.split(':').join(' ')} on ${subject}`,
						'Forbidden permission',
						statusCode.forbiddenCode
					)
				);
			}

			// Call the next middleware in the stack
			next();
		} catch (error) {
			// Return an error response with a 500 status code
			return next(
				new ErrorResponse(
					error,
					'Failed to check user permissions',
					statusCode.internalServerErrorCode
				)
			);
		}
	};

/**
 * Checks if the user has the required role to do that action.
 *
 * @param {...string} roles - The roles to check.
 * @returns {Function} The middleware function.
 */
export const checkRoleMiddleware = (...roles) => {
	/**
	 * The middleware function.
	 *
	 * @param {Request} req - The request object.
	 * @param {Response} res - The response object.
	 * @param {NextFunction} next - The next middleware function.
	 * @returns {void}
	 */
	return (req, res, next) => {
		try {
			// Get the user's role from the session
			const { userRole } = req.session;

			// Check if the user has any of the roles
			const hasRole = roles.some(
				(role) => userRole === role.toUpperCase()
			);

			// If the user does not have the required role, return an error response with a 403 status code
			if (!hasRole)
				return next(
					new ErrorResponse(
						'User does not have the required role',
						'User does not have the required role',
						statusCode.forbiddenCode
					)
				);

			// Call the next middleware in the stack
			next();
		} catch (error) {
			// Return an error response with a 500 status code
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

/**
 * Checks if the `confirmDelete` flag is set to `true` in the request body.
 *
 * If the flag is not set, returns an error response with a 400 status code.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {void}
 */
export const confirmDeleteMiddleware = (req, res, next) => {
	const { confirmDelete } = req.body;

	// Check if the `confirmDelete` flag is set to true
	if (!confirmDelete) {
		// Return an error response with a 400 status code
		return next(
			new ErrorResponse(
				'Confirm delete flag is required',
				'Confirm delete flag is required to delete',
				statusCode.badRequestCode
			)
		);
	}

	// Call the next middleware in the stack
	next();
};

//*====================={Request Validations}====================

/**
 * Checks if the request body contains the required fields for signing up.
 *
 * Checks if the request body contains the required fields for signing up.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {void}
 */
export const VReqToSignUp = (req, res, next) => {
	return VReqTo(req, res, next, singUpSchema);
};

/**
 * check for the request body in Login (ValidateRequest === VReq)
 * Checks if the request body contains the required fields for logging in.
 *
 * Checks if the request body contains the required fields for logging in.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {void}
 */
export const VReqToLogin = (req, res, next) => {
	return VReqTo(req, res, next, loginSchema);
};

/**
 * check for the request body in forgot password request (ValidateRequest === VReq)
 * Checks if the request body contains the required fields for sending a password
 * reset link to the user.
 *
 * Checks if the request body contains the required fields for sending a password
 * reset link to the user.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {void}
 */
export const VReqToEmail = (req, res, next) => {
	return VReqTo(req, res, next, emailScheme);
};

/**
 * check for the request body in reset password request (ValidateRequest === VReq)
 * Checks if the request body contains the required fields for resetting a user's
 * password.
 *
 * Checks if the request body contains the required fields for resetting a user's
 * password.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {void}
 */
export const VReqToResetPassword = (req, res, next) => {
	return VReqTo(req, res, next, resetPasswordScheme);
};

/**
 * check for the request body in update password request (ValidateRequest === VReq)
 * Checks if the request body contains the required fields for updating a user's
 * password.
 *
 * Checks if the request body contains the required fields for updating a user's
 * password.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {void}
 */
export const VReqToUpdatePassword = (req, res, next) => {
	return VReqTo(req, res, next, updatePasswordScheme);
};

/**
 * check for the request body in update user date request (ValidateRequest === VReq)
 * Checks if the request body contains the required fields for updating a user's
 * data.
 *
 * Checks if the request body contains the required fields for updating a user's
 * data.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {void}
 */
export const VReqToUpdateUserData = (req, res, next) => {
	return VReqTo(req, res, next, updateUserDataSchema);
};

/**
 * Checks if the request body contains the required fields for confirming a delete
 * request.
 *
 * Checks if the request body contains the required fields for confirming a delete
 * request.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {void}
 */
export const VReqToConfirmDelete = (req, res, next) => {
	return VReqTo(req, res, next, confirmDeleteSchema);
};

/**
 * if the token in params to reset password is not present or not valid
 * will prevent the request from being
 * Checks if the token in the request params is present and valid.
 *
 * Checks if the token in the request params is present and valid.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {void}
 */
export const VReqToResetToken = (req, res, next) => {
	const { token } = req.params;

	// If the token is not present, prevent the request from being processed
	if (!token) {
		return next(
			new ErrorResponse(
				'Invalid token',
				'Validation failed',
				statusCode.badRequestCode // HTTP status code for Bad Request
			)
		);
	}

	// If the token is present, proceed to the next middleware
	return next();
};

/**
 * Middleware to verify an access token from HttpOnly cookies or the `Authorization` header.
 *
 * - Checks for access token in cookies first, then in the Authorization header.
 * - Verifies the token using `verifyToken`.
 * - If valid, attaches the decoded payload to `req.auth`.
 * - If invalid or expired, responds with an unauthorized error.
 * - If token is missing, responds with a clear error.
 *
 * @function VReqToHeaderToken
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 * @returns {void}
 */
export const VReqToHeaderToken = (req, res, next) => {
	// Prefer access token from cookies, fallback to Authorization header
	const token =
		req.cookies?.accessToken ||
		(req.headers.authorization?.startsWith('Bearer ')
			? req.headers.authorization.split(' ')[1]
			: null);

	// If token is not found
	if (!token) {
		return next(
			new ErrorResponse(
				'Access token not provided',
				'Access token is missing. Please login or provide a valid token.',
				statusCode.unauthorizedCode
			)
		);
	}

	// Verify the token
	const decoded = verifyToken(token);

	// If verification fails
	if (!decoded) {
		return next(
			new ErrorResponse(
				'Invalid access token',
				'Access token is expired or invalid. Please login again.',
				statusCode.unauthorizedCode
			)
		);
	}

	// If valid, attach decoded payload and continue
	req.auth = decoded;
	next();
};

/**
 * Middleware to verify a refresh token from HttpOnly cookies.
 *
 * - Checks if a refresh token exists in cookies.
 * - Verifies the validity of the token using `verifyRefreshToken`.
 * - If valid, attaches the decoded payload to `req.auth` and the raw token to `req.refreshToken`.
 * - If invalid or missing, forwards an appropriate `ErrorResponse`.
 *
 * @function VReqToCookieRefreshToken
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 * @returns {void}
 */
export const VReqToCookieRefreshToken = (req, res, next) => {
	// Prefer refresh token from HttpOnly cookie
	const token = req.cookies?.refreshToken;

	// If no token is found, return error
	if (!token) {
		return next(
			new ErrorResponse(
				'Refresh token not provided',
				'Refresh token is missing. Please login again.',
				statusCode.unauthorizedCode
			)
		);
	}

	// Verify the refresh token
	const decoded = verifyRefreshToken(token);

	// If verification fails
	if (!decoded) {
		return next(
			new ErrorResponse(
				'Invalid refresh token',
				'Refresh token is expired or invalid. Please login again.',
				statusCode.unauthorizedCode
			)
		);
	}

	// If valid, attach info to request and continue
	req.auth = decoded;
	req.refreshToken = token;
	next();
};
//*====================={Request Validations}====================
