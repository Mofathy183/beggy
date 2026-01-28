import type { Request, Response } from 'express';
import type {  LoginInput } from "@beggy/shared/types"
import { AuthService } from '@modules/auth';
import { UserService } from '@modules/users';
import { STATUS_CODE } from "@shared/constants";
import { apiResponseMap, setAuthCookies, clearAuthCookies, verifyRefreshToken, appErrorMap } from "@shared/utils";
import { generateCsrfToken } from "@shared/middlewares";
import { ErrorCode } from '@beggy/shared/constants';
import { env } from '@/config';

export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly UserService: UserService
    ) {}

    signup = async (req: Request, res: Response): Promise<void> => {
        const { body: user } = req;

        const { id, role } = await this.authService.signupUser(user);

        setAuthCookies(res, id, role)

        res.status(STATUS_CODE.CREATED).json(
            apiResponseMap.created(null, "SIGNUP_SUCCESS")
        )
    }

    login = async (req: Request, res: Response): Promise<void> => {
        const input = req.body as LoginInput;

        const { id, role } = await this.authService.loginUser(input);

        setAuthCookies(res, id, role, input.rememberMe);

        res.status(STATUS_CODE.OK).json(
            apiResponseMap.ok(null, "LOGIN_SUCCESS")
        )
    }

    logout = async (_req: Request, res: Response): Promise<void> => {
        clearAuthCookies(res)

        res.sendStatus(STATUS_CODE.NO_CONTENT)
    }

    refreshToken = async (req: Request, res: Response): Promise<void> => {
        const refreshToken = req.cookies?.[env.JWT_REFRESH_TOKEN_NAME];
    
        if (!refreshToken) {
            throw appErrorMap.unauthorized(ErrorCode.TOKEN_MISSING);
        }
    
        const { id } = verifyRefreshToken(refreshToken);
    
        const user = await this.UserService.getById(id);
        if (!user) {
            throw appErrorMap.notFound(ErrorCode.USER_NOT_FOUND);
        }
    
        // 🔑 Infer rememberMe from cookie persistence
        const rememberMe = Boolean(
            req.cookies?.[env.JWT_REFRESH_TOKEN_NAME]
        ); 
        // Explanation below 👇
    
        setAuthCookies(res, user.id, user.role, rememberMe);
    
        res.status(STATUS_CODE.OK).json(
            apiResponseMap.ok(null, "TOKEN_REFRESHED")
        );
    };

    csrfToken = async (req: Request, res: Response): Promise<void> => {
        const token = generateCsrfToken(req, res);

        res.status(STATUS_CODE.OK).json(
            apiResponseMap.ok<{ csrfToken: string }>({ csrfToken: token }, "CSRF_TOKEN_ISSUED")
        )
    } 
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
