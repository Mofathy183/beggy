import type { Request, Response } from 'express';
import type { AuthMeDTO, LoginInput } from '@beggy/shared/types';
import { type AuthService, AuthMapper } from '@modules/auth';
import { type UserService } from '@modules/users';
import { STATUS_CODE } from '@shared/constants';
import { apiResponseMap, AuthCookies, appErrorMap } from '@shared/utils';
import { generateCsrfToken, logger } from '@shared/middlewares';
import { ErrorCode } from '@beggy/shared/constants';

/**
 * AuthController
 *
 * Handles HTTP request/response lifecycle for authentication routes.
 * Delegates all business logic to services and manages cookies, status codes,
 * and API response formatting.
 */
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly userService: UserService
	) {}

	/**
	 * Registers a new user and establishes an authenticated session.
	 *
	 * @route POST /auth/signup
	 */
	signup = async (req: Request, res: Response): Promise<void> => {
		const { body: user } = req;

		const { id, role } = await this.authService.signupUser(user);

		AuthCookies.setCookies(res, id, role);

		res.status(STATUS_CODE.CREATED).json(
			apiResponseMap.created(null, 'SIGNUP_SUCCESS')
		);
	};

	/**
	 * Authenticates a user using email/password and issues session cookies.
	 *
	 * @route POST /auth/login
	 */
	login = async (req: Request, res: Response): Promise<void> => {
		const input = req.body as LoginInput;

		const { id, role } = await this.authService.loginUser(input);

		AuthCookies.setCookies(res, id, role, input.rememberMe);

		res.status(STATUS_CODE.OK).json(
			apiResponseMap.ok(null, 'LOGIN_SUCCESS')
		);
	};

	/**
	 * Logs out the current user by clearing authentication cookies.
	 *
	 * @remarks
	 * - Stateless and idempotent
	 * - Always succeeds if called with valid authentication
	 *
	 * @route DELETE /auth/logout
	 */
	logout = async (_req: Request, res: Response): Promise<void> => {
		AuthCookies.clear(res);

		res.sendStatus(STATUS_CODE.NO_CONTENT);
	};

	/**
	 * Issues a new access token using a valid refresh token.
	 *
	 * @remarks
	 * This endpoint:
	 * - Requires `requireRefreshToken` middleware
	 * - Validates that the referenced user still exists
	 * - Issues a new access token and sets it as an HTTP-only cookie
	 *
	 * It does NOT:
	 * - Reuse the old access token
	 * - Authenticate permissions
	 * - Return sensitive user data
	 *
	 * @route POST /auth/refresh-token
	 *
	 * @throws {@link AppError}
	 * - `UNAUTHORIZED` when refresh middleware was not executed
	 * - `USER_NOT_FOUND` when the user no longer exists
	 */
	refreshToken = async (req: Request, res: Response): Promise<void> => {
		// Defensive check: ensures middleware contract was respected
		if (!req.refreshPayload) {
			throw appErrorMap.unauthorized(ErrorCode.UNAUTHORIZED);
		}

		const { userId } = req.refreshPayload;

		// Ensure the user still exists and is valid
		const user = await this.userService.getById(userId);
		if (!user) {
			throw appErrorMap.notFound(ErrorCode.USER_NOT_FOUND);
		}

		/**
		 * Issue and set a new access token.
		 *
		 * @remarks
		 * - Token is written as an HTTP-only cookie
		 * - Role is embedded to support downstream authorization
		 */
		AuthCookies.setAccessTokenCookie(res, user.id, user.role);

		res.status(STATUS_CODE.OK).json(
			apiResponseMap.ok(null, 'TOKEN_REFRESHED')
		);
	};

	/**
	 * Issues a CSRF token for state-changing requests.
	 *
	 * @route GET /auth/csrf-token
	 */
	csrfToken = async (req: Request, res: Response): Promise<void> => {
		const token = generateCsrfToken(req, res);

		res.status(STATUS_CODE.OK).json(
			apiResponseMap.ok<{ csrfToken: string }>(
				{ csrfToken: token },
				'CSRF_TOKEN_ISSUED'
			)
		);
	};

	/**
	 * Returns the authenticated user's auth context.
	 *
	 * @remarks
	 * - Used by frontend to bootstrap auth state
	 * - Single source of truth for identity & permissions
	 *
	 * @route GET /auth/me
	 */
	authMe = async (req: Request, res: Response): Promise<void> => {
		if (!req.user?.id) {
			logger.error(
				{ path: req.path },
				'Auth middleware allowed request without user context'
			);
			throw appErrorMap.unauthorized(ErrorCode.UNAUTHORIZED);
		}

		const userId = req.user.id;

		const { user, permissions } = await this.authService.authUser(userId);

		res.status(STATUS_CODE.OK).json(
			apiResponseMap.ok<AuthMeDTO>(
				AuthMapper.toDTO(user, permissions),
				'AUTH_USER_RETRIEVED'
			)
		);
	};
}

// import type { PrismaClient } from '../generated/client/index.js';
// import {
// 	singUpUser,
// 	loginUser,
// 	authUser,
// 	userForgotPassword,
// 	resetUserPassword,
// 	updateUserData,
// 	changeUserEmail,
// 	verifyUserEmail,
// 	getUserPermissions,
// 	updateUserPassword,
// 	sendVerificationUserEmail,
// 	deactivateUserAccount,
// } from '../../services/authService.js';
// import { resetPasswordUrl, verifyEmailUrl } from '../../config/env.js';
// import { sendEmail } from '../../utils/sendMail.js';
// import { generateCSRFToken } from '../../utils/authHelper.js';
// import {
// 	sendCookies,
// 	storeSession,
// 	clearCookies,
// 	deleteSession,
// } from '../../utils/authHelper.js';
// import { verifyRefreshToken } from '../../utils/jwt.js';
// import { statusCode } from '../../config/status.js';
// import SuccessResponse from '../../utils/successResponse.js';
// import { ErrorResponse, sendServiceResponse } from '../../utils/error.js';
// import prisma from '@prisma-client';
// import type { Request, Response, NextFunction } from 'express';

// export const signUp = async (req, res, next) => {
// 	try {
// 		const { body } = req as Request<{}, {}, any>;

// 		const user = await singUpUser(body);

// 		if (sendServiceResponse(next, user)) return;

// 		if (!user)
// 			return next(
// 				new ErrorResponse(
// 					'Failed to create user',
// 					'Failed to create',
// 					statusCode.badRequestCode
// 				)
// 			);

// 		if (user.error)
// 			return next(
// 				new ErrorResponse(
// 					user.error,
// 					"Error Couldn't create user " + user.error.message,
// 					statusCode.badRequestCode
// 				)
// 			);

// 		const { role, id } = user;

// 		//* for add the user id to session
// 		storeSession(id, role, req);

// 		//* send the token as a cookie
// 		sendCookies(id, res);

// 		return next(
// 			new SuccessResponse(
// 				statusCode.createdCode,
// 				"You've Signed Up Successfully",
// 				'Will send email to verify your account'
// 			)
// 		);
// 	} catch (error) {
// 		return next(
// 			new ErrorResponse(
// 				Object.keys(error).length === 0
// 					? 'Error Occur while Signing Up'
// 					: error,
// 				'Failed to Sign Up',
// 				statusCode.internalServerErrorCode
// 			)
// 		);
// 	}
// };

// export const login = async (req, res, next) => {
// 	try {
// 		const { body } = req as Request<{}, {}, any>;

// 		//* get the user from DB
// 		const user = await loginUser(body);

// 		if (sendServiceResponse(next, user)) return;

// 		if (!user)
// 			return next(
// 				new ErrorResponse(
// 					'User Not Found',
// 					'User must exist to authenticate',
// 					statusCode.notFoundCode
// 				)
// 			);

// 		if (user.error)
// 			return next(
// 				new ErrorResponse(
// 					user.error,
// 					'Error occurred while authenticating user',
// 					statusCode.badRequestCode
// 				)
// 			);

// 		const { role, id } = user;

// 		//* for add the user id to session
// 		storeSession(id, role, req);

// 		//* send the token as a cookie
// 		sendCookies(id, res);

// 		return next(
// 			new SuccessResponse(
// 				statusCode.okCode,
// 				"You've logged In Successfully",
// 				'Will send email to verify your account'
// 			)
// 		);
// 	} catch (error) {
// 		return next(
// 			new ErrorResponse(
// 				Object.keys(error).length === 0
// 					? 'Error Occur while Logs In'
// 					: error,
// 				'Failed to login',
// 				statusCode.internalServerErrorCode
// 			)
// 		);
// 	}
// };

// export const forgotPassword = async (req, res, next) => {
// 	try {
// 		const { email } = req.body;

// 		const sendEmail = await userForgotPassword(email);

// 		if (sendServiceResponse(next, sendEmail)) return;

// 		if (!sendEmail)
// 			return next(
// 				new ErrorResponse(
// 					'Failed to send reset password email to user',
// 					'Failed to update',
// 					statusCode.badRequestCode
// 				)
// 			);

// 		if (sendEmail.error)
// 			return next(
// 				new ErrorResponse(
// 					sendEmail.error,
// 					"Error Couldn't send reset password email to user " +
// 						sendEmail.error.message,
// 					statusCode.badRequestCode
// 				)
// 			);

// 		const { resetToken, userName, userEmail } = sendEmail;

// 		if (!resetToken || !userEmail || !userName)
// 			return next(
// 				new ErrorResponse(
// 					'Failed to send reset password email to user',
// 					'Failed to generate token and get user email and name',
// 					statusCode.badRequestCode
// 				)
// 			);

// 		//* send email to reset the password to the user
// 		//* send a link to reset the password as a patch request
// 		//* with the resetToken in the params
// 		const resetURL = `${req.protocol}://${req.get('host')}${resetPasswordUrl}/${resetToken}`;

// 		//* send email using nodemailer or any other email service`
// 		const sended = await sendEmail(
// 			resetURL,
// 			userName,
// 			userEmail,
// 			'reset-password',
// 			'reset',
// 			'password_reset'
// 		);

// 		if (sended.error)
// 			return next(
// 				new ErrorResponse(
// 					sended.error,
// 					'Failed to send email ' + sended.error.message,
// 					statusCode.internalServerErrorCode
// 				)
// 			);

// 		return next(
// 			new SuccessResponse(
// 				statusCode.okCode,
// 				'Reset password email send Successfully',
// 				'Check your email inbox to reset your password',
// 				sended
// 			)
// 		);
// 	} catch (error) {
// 		return next(
// 			new ErrorResponse(
// 				Object.keys(error).length === 0
// 					? 'Error Occur while Send Reset Password Email'
// 					: error,
// 				'Failed to send reset password email to user',
// 				statusCode.internalServerErrorCode
// 			)
// 		);
// 	}
// };

// export const resetPassword = async (req, res, next) => {
// 	try {
// 		const { body } = req as Request<{}, {}, any>;
// 		const { token } = req.params;

// 		const updatePassword = await resetUserPassword(body, token);

// 		if (sendServiceResponse(next, updatePassword)) return;

// 		if (!updatePassword)
// 			return next(
// 				new ErrorResponse(
// 					'Failed to reset password',
// 					'Failed to reset',
// 					statusCode.badRequestCode
// 				)
// 			);

// 		if (updatePassword.error)
// 			return next(
// 				new ErrorResponse(
// 					updatePassword.error,
// 					"Error Couldn't reset password " +
// 						updatePassword.error.message,
// 					statusCode.badRequestCode
// 				)
// 			);

// 		//* store the user id and role in session
// 		storeSession(updatePassword.id, updatePassword.role, req);

// 		//* Log the user in and send JWT token via cookie
// 		sendCookies(updatePassword.id, res);

// 		return next(
// 			new SuccessResponse(
// 				statusCode.okCode,
// 				"You've successfully changed your password",
// 				"You've Change Password Successfully"
// 			)
// 		);
// 	} catch (error) {
// 		return next(
// 			new ErrorResponse(
// 				Object.keys(error).length === 0
// 					? 'Error Occur while Reset Password'
// 					: error,
// 				'Failed to Reset Password',
// 				statusCode.internalServerErrorCode
// 			)
// 		);
// 	}
// };

// export const verifyEmail = async (req, res, next) => {
// 	try {
// 		const { token, type } = req.verified;

// 		const userUpdate = await verifyUserEmail(token, type);

// 		if (sendServiceResponse(next, userUpdate)) return;

// 		if (!userUpdate)
// 			return next(
// 				new ErrorResponse(
// 					'userUpdate is null',
// 					"Couldn't update user",
// 					'Failed to verify user email'
// 				)
// 			);

// 		if (userUpdate.error)
// 			return next(
// 				new ErrorResponse(
// 					'prisma',
// 					"Couldn't Find token" + userUpdate.error,
// 					'Failed to verify user email ' + userUpdate.error.message
// 				)
// 			);

// 		return next(
// 			new SuccessResponse(
// 				statusCode.okCode,
// 				'Successfully Verified User Email',
// 				userUpdate
// 			)
// 		);
// 	} catch (error) {
// 		return next(
// 			new ErrorResponse(
// 				Object.keys(error).length === 0
// 					? 'Error Occur while Verify Your Email'
// 					: error,
// 				'Failed to verify email',
// 				statusCode.internalServerErrorCode
// 			)
// 		);
// 	}
// };

// export const logout = async (req, res, next) => {
// 	try {
// 		const { userId } = req.session;

// 		// Deactivate the user account
// 		const deactivateUser = await deactivateUserAccount(userId);

// 		if (sendServiceResponse(next, deactivateUser)) return;

// 		if (!deactivateUser)
// 			return next(
// 				new ErrorResponse(
// 					'Failed to logout',
// 					'Failed to logout',
// 					statusCode.notFoundCode
// 				)
// 			);

// 		if (deactivateUser.error)
// 			return next(
// 				new ErrorResponse(
// 					deactivateUser.error,
// 					'Failed to logout ' + deactivateUser.error.message,
// 					statusCode.badRequestCode
// 				)
// 			);

// 		// Clear the cookies
// 		clearCookies(res);

// 		// Delete the session
// 		await deleteSession(req);

// 		return next(
// 			new SuccessResponse(
// 				statusCode.okCode,
// 				"You're Logged Out Successfully",
// 				"You're Out Now"
// 			)
// 		);
// 	} catch (error) {
// 		return next(
// 			new ErrorResponse(
// 				Object.keys(error).length === 0
// 					? 'Error Occur while Logout'
// 					: error,
// 				'Failed to logout',
// 				statusCode.internalServerErrorCode
// 			)
// 		);
// 	}
// };

// export const getAccessToken = (req, res, next) => {
// 	const { refreshToken } = req;

// 	if (!refreshToken)
// 		return next(
// 			new ErrorResponse(
// 				'Missing refresh token',
// 				'Failed to get access token',
// 				statusCode.badRequestCode
// 			)
// 		);

// 	if (!verifyRefreshToken(refreshToken))
// 		return next(
// 			new ErrorResponse(
// 				'Session expired or invalid',
// 				'Please login again to continue.',
// 				statusCode.badRequestCode
// 			)
// 		);

// 	const { userId, userRole } = req.session;

// 	sendCookies(userId, res);
// 	storeSession(userId, userRole, req);

// 	return next(
// 		new SuccessResponse(
// 			statusCode.okCode,
// 			'Access token sent via cookie',
// 			'New access token has been successfully generated'
// 		)
// 	);
// };

// export const csrfProtection = (req, res, next) => {
// 	//* generateCSRFToken will handle send the secret via cookie
// 	//* and return the generated token
// 	const csrfToken = generateCSRFToken(res);

// 	return next(
// 		new SuccessResponse(
// 			statusCode.okCode,
// 			'CSRF token generated Successfully',
// 			{ csrfToken }
// 		)
// 	);
// };
