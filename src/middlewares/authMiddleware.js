import { verifyRefreshToken, verifyToken } from '../utils/jwt.js';
import prisma from '../../prisma/prisma.js';
import { AbilityBuilder } from '@casl/ability';
import { createPrismaAbility } from '@casl/prisma';
import { passwordChangeAfter } from '../utils/userHelper.js';
import { storeSession } from '../utils/authHelper.js';
import { statusCode } from '../config/status.js';
import { VReqTo } from './validateRequest.js';
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
 * Middleware to validate JWT token from the Authorization header and authenticate the user.
 *
 * - Ensures the Authorization header exists and starts with "Bearer ".
 * - Verifies the token and checks for user existence in the database.
 * - Confirms the user's password has not been changed after the token was issued.
 * - Adds authenticated user's ID and role to the request session.
 *
 * @async
 * @function headersMiddleware
 * @param {Request} req - Express request object containing headers and JWT payload in `req.auth`.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 * @returns {Promise<void>} Returns nothing but passes control to the next middleware or throws an error.
 *
 * @throws {ErrorResponse} - If the Authorization header is missing or invalid.
 * @throws {ErrorResponse} - If the user is not found or has changed their password.
 */
export const headersMiddleware = async (req, res, next) => {
	//* Check if the request has a valid JWT token
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

	//* if user are authenticated will pass the verification jwt token data to req.auth
	const isAuthenticated = req.auth;

	//* check if the id in the token is the same as the user has
	const userAuth = await prisma.user.findUnique({
		where: { id: isAuthenticated.id },
	});

	//* if the user is not found in the database, return an error response with a 401 status code
	if (!userAuth)
		return next(
			new ErrorResponse(
				'User not found',
				'User not found in the database. Please login again',
				statusCode.unauthorizedCode
			)
		);

	//* if the user has an error, return an error response with a 500 status code
	if (userAuth.error)
		return next(
			new ErrorResponse(
				userAuth.error,
				'Failed to find user by this id ' + userAuth.error.message,
				statusCode.internalServerErrorCode
			)
		);

	//* check if the user changed their password after login
	const passwordHasChanged = passwordChangeAfter(
		userAuth.passwordChangeAt,
		isAuthenticated.iat
	);

	//* if the user has changed their password, return an error response with a 401 status code
	if (passwordHasChanged)
		return next(
			new ErrorResponse(
				'User has changed their password',
				'User has changed their password. Please login again',
				statusCode.unauthorizedCode
			)
		);

	//* if the user is authenticated and the password has not changed, add the user's id and role to the request object
	storeSession(userAuth.id, userAuth.role, req);
	next();
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

export const verifyEmailMiddleware = (req, res, next) => {};

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
 * Middleware to validate the JWT token from the `Authorization` header.
 *
 * - Extracts the token from the `Authorization` header.
 * - Verifies the token using `verifyToken`.
 * - If valid, attaches the user info to `req.auth` and continues the request.
 * - If the token is invalid or expired, responds with an appropriate unauthorized error.
 * - If the token is missing, returns an error indicating that the header is required.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {void}
 */
export const VReqToHeaderToken = (req, res, next) => {
	// Extract token from Authorization header if it exists
	const token = req.headers.authorization?.split(' ')[1];

	// Attempt to verify the token
	const isAuth = verifyToken(token);

	// If token exists and is valid, attach user info to request and continue
	if (token && isAuth) {
		req.auth = isAuth; // Typically includes user ID, role, etc.
		return next();
	}

	// If token is present but invalid or expired, return an error
	if (token && !isAuth) {
		return next(
			new ErrorResponse(
				'Failed to Verify token',
				'The Token is Expired or Secret not match',
				statusCode.unauthorizedCode
			)
		);
	}

	// If token is missing, return a header-related error
	return next(
		new ErrorResponse(
			'Header "Authorization" is required',
			'Authorization must start with "Bearer " and be a valid JWT token',
			statusCode.unauthorizedCode
		)
	);
};

/**
 * Checks if the token in the request headers is present and valid as a refresh token.
 *
 * - If the token is not present, prevents the request from being processed.
 * - If the token is present, adds the authenticated user's ID and role to the request session.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {void}
 */
export const VReqToHeaderRefreshToken = (req, res, next) => {
	const token = req.headers.authorization?.split(' ')[1];

	const isAuth = verifyRefreshToken(token);

	if (token && isAuth) {
		// Add the authenticated user's ID and role to the request session
		req.auth = isAuth;
		return next();
	}

	// If the token is not present, prevent the request from being processed
	return next(
		new ErrorResponse(
			'Header "Authorization" is required',
			'Authorization must start with "Bearer " and be a valid JWT refresh token',
			statusCode.unauthorizedCode
		)
	);
};

//*====================={Request Validations}====================
