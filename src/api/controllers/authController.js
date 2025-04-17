import {
	singUpUser,
	loginUser,
	userForgotPassword,
	resetUserPassword,
	updateUserData,
	updateUserPassword,
    sendVerificationUserEmail,
	deactivateUserAccount,
} from '../../services/authService.js';
import { resetPasswordUrl, verifyEmailUrl } from '../../config/env.js';
import { sendEmail } from '../../utils/sendMail.js';
import { generateCSRFToken } from '../../utils/authHelper.js';
import {
	sendCookies,
	storeSession,
	clearCookies,
	deleteSession,
} from '../../utils/authHelper.js';
import { verifyRefreshToken } from '../../utils/jwt.js';
import { statusCode } from '../../config/status.js';
import SuccessResponse from '../../utils/successResponse.js';
import { ErrorResponse } from '../../utils/error.js';

/**
 * @api {post} /api/beggy/auth/signup
 * @apiName SignUp
 * @apiGroup Auth
 * @apiDescription Sign up a user
 *
 * @apiParam {string} firstName User first name
 * @apiParam {string} lastName User last name
 * @apiParam {string} email User email
 * @apiParam {string} password User password
 * @apiParam {string} confirmPassword User confirm password
 *
 * @apiSuccess {boolean} success Success
 * @apiSuccess {object} user Logged user
 */
export const signUp = async (req, res, next) => {
	try {
		const { body } = req;

		const { safeUser, role } = await singUpUser(body);

		if (!safeUser)
			return next(
				new ErrorResponse(
					"User couldn't sign up",
					'Invalid user',
					statusCode.notFoundCode
				)
			);

		if (safeUser.error)
			return next(
				new ErrorResponse(
					safeUser.error,
					'Invalid user data ' + safeUser.error.message,
					statusCode.badRequestCode
				)
			);

		//* for add the user id to session
		storeSession(safeUser.id, role, req);

		//* send the token as a cookie
		sendCookies(safeUser.id, res);

		return next(
			new SuccessResponse(
				statusCode.createdCode,
				'User Signed Up Successfully',
				safeUser
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to sign up',
				statusCode.internalServerErrorCode
			)
		);
	}
};


/**
 * @api {post} /api/beggy/auth/login
 * @apiName Login
 * @apiGroup Auth
 * @apiDescription Login a user
 *
 * @apiParam {string} email User email
 * @apiParam {string} password User password
 *
 * @apiSuccess {boolean} success Success
 * @apiSuccess {object} user Logged user
 */
export const login = async (req, res, next) => {
	try {
		const { body } = req;

		//* get the user from DB
		const { safeUser, role } = await loginUser(body);

		if (!safeUser) {
			//* if user not found
			return next(
				new ErrorResponse(
					'User not found',
					'Invalid email or password',
					statusCode.notFoundCode
				)
			);
		}

		if (safeUser.error) {
			//* if there is an error in the user data
			return next(
				new ErrorResponse(
					safeUser.error,
					'Invalid user data ' + safeUser.error.message,
					statusCode.badRequestCode
				)
			);
		}

		//* for add the user id to session
		storeSession(safeUser.id, role, req);

		//* send the token as a cookie
		sendCookies(safeUser.id, res);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'User logged In Successfully',
				safeUser
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to login',
				statusCode.internalServerErrorCode
			)
		);
	}
};

/**
 * @api {post} /api/beggy/auth/forgot-password
 * @apiName ForgotPassword
 * @apiGroup Auth
 * @apiDescription Send a password reset link to the user's email
 *
 * @apiParam {string} email User email
 *
 * @apiSuccess {boolean} success Success
 * @apiSuccess {string} message Message
 * @apiSuccess {string} data Reset password instructions
 *
 * @apiError (400) BadRequestError Invalid request
 * @apiError (401) UnauthorizedError Unauthorized
 * @apiError (500) InternalServerErrorError Internal Server Error
 */
export const forgotPassword = async (req, res, next) => {
	try {
		const { email } = req.body;

		const { resetToken, userName, userEmail } =
			await userForgotPassword(email);

		//* send email to reset the password to the user
		//* send a link to reset the password as a patch request
		//* with the resetToken in the params
		const resetURL = `${req.protocol}://${req.get('host')}${resetPasswordUrl}/${resetToken}`;

		//* send email using nodemailer or any other email service`
		const sended = await sendEmail(
			resetURL,
			userName,
			userEmail,
			'reset-password',
			'reset'
		);

		if (sended.error)
			return next(
				new ErrorResponse(
					sended.error,
					'Failed to send email ' + sended.error.message,
					statusCode.internalServerErrorCode
				)
			);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Reset password email sent successfully',
				'Check your email for password reset instructions.'
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to send reset password email to user',
				statusCode.internalServerErrorCode
			)
		);
	}
};

/**
 * @api {patch} /api/beggy/auth/reset-password/:token
 * @apiName ResetPassword
 * @apiGroup Auth
 * @apiDescription Reset user password
 *
 * @apiParam {string} token Reset Token
 * @apiParam {string} currentPassword Current Password
 * @apiParam {string} newPassword New Password
 * @apiParam {string} confirmPassword Confirm Password
 *
 * @apiSuccess {boolean} success Success
 * @apiSuccess {string} message Message
 * @apiSuccess {object} data Updated User Data
 *
 * @apiError (400) BadRequestError Invalid request
 * @apiError (401) UnauthorizedError Unauthorized
 * @apiError (500) InternalServerErrorError Internal Server Error
 */
export const resetPassword = async (req, res, next) => {
	try {
		const { body } = req;
		const { token } = req.params;

		const updatePassword = await resetUserPassword(body, token);

		if (!updatePassword)
			return next(
				new ErrorResponse(
					'Failed to reset password',
					'Failed to reset',
					statusCode.badRequestCode
				)
			);

		if (updatePassword.error)
			return next(
				new ErrorResponse(
					updatePassword.error,
					"Error Couldn't reset password " +
						updatePassword.error.message,
					statusCode.badRequestCode
				)
			);

		//* store the user id and role in session
		storeSession(updatePassword.id, updatePassword.role, req);

		//* Log the user in and send JWT token via cookie
		sendCookies(updatePassword.id, res);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'User Change Password Successfully',
				updatePassword
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to Reset Password',
				statusCode.internalServerErrorCode
			)
		);
	}
};

/**
 * @api {patch} /api/beggy/auth/update-password
 * @apiName UpdatePassword
 * @apiGroup Auth
 * @apiDescription Update user password
 *
 * @apiParam {string} currentPassword Current Password
 * @apiParam {string} newPassword New Password
 * @apiParam {string} confirmPassword Confirm Password
 *
 * @apiSuccess {boolean} success Success
 * @apiSuccess {string} message Message
 * @apiSuccess {object} data Updated User Data
 *
 * @apiError (400) BadRequestError Invalid request
 * @apiError (401) UnauthorizedError Unauthorized
 * @apiError (500) InternalServerErrorError Internal Server Error
 */
export const updatePassword = async (req, res, next) => {
	try {
		const { body } = req;
		const { userId, userRole } = req.session;

		const updatePassword = await updateUserPassword(userId, body);

		if (!updatePassword)
			return next(
				new ErrorResponse(
					'Failed to update password',
					'Failed to update',
					statusCode.badRequestCode
				)
			);

		if (updatePassword.error)
			return next(
				new ErrorResponse(
					updatePassword.error,
					"Error Couldn't update password " +
						updatePassword.error.message,
					statusCode.badRequestCode
				)
			);

		//* store user id and role in session
		storeSession(userId, userRole, req);

		//* Log the user in and send JWT token via cookie
		sendCookies(userId, res);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'User Updated Password Successfully',
				updatePassword
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to update password',
				statusCode.internalServerErrorCode
			)
		);
	}
};

/**
 * @api {patch} /api/beggy/auth/update-user-data
 * @apiName UpdateUserData
 * @apiGroup Auth
 * @apiDescription Update user data
 *
 * @apiParam {string} firstName First Name
 * @apiParam {string} lastName Last Name
 * @apiParam {string} email Email
 * @apiParam {string} gender Gender
 * @apiParam {date} birth Birth Date
 * @apiParam {string} country Country
 * @apiParam {string} city City
 * @apiParam {string} profilePicture Profile Picture
 *
 * @apiSuccess {boolean} success Success
 * @apiSuccess {string} message Message
 * @apiSuccess {object} data Updated User Data
 *
 * @apiError (400) BadRequestError Invalid request
 * @apiError (401) UnauthorizedError Unauthorized
 * @apiError (500) InternalServerErrorError Internal Server Error
 */
export const updateData = async (req, res, next) => {
	try {
		const { body } = req;
		const { userId, userRole } = req.session;

		const updatedUserData = await updateUserData(userId, body);

		if (!updatedUserData)
			return next(
				new ErrorResponse(
					'Failed to update user data',
					'Failed to update',
					statusCode.badRequestCode
				)
			);

		if (updatedUserData.error)
			return next(
				new ErrorResponse(
					updatedUserData.error,
					"Error Couldn't update user data " +
						updatedUserData.error.message,
					statusCode.badRequestCode
				)
			);

		//* store user id and role in session
		storeSession(userId, userRole, req);

		//* Log the user in and send JWT token via cookie
		sendCookies(userId, res);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully Updated User Profile',
				updatedUserData
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to update user data',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const sendVerificationEmail = async (req, res, next) => {
    try {
        const { email } = req.body;

        const { token, userName } = await sendVerificationUserEmail(email);

        const verifyEmailURL = `${req.protocol}://${req.get('host')}${verifyEmailUrl}?token=${token}email=${email}`;

        const sended = await sendEmail(
            verifyEmailURL,
            userName,
            email,
            "verify-email",
            "verify"
        )

        if (sended.error) return new ErrorResponse(
            sended.error,
            'Failed to send verification email '+sended.error.message,
            statusCode.internalServerErrorCode
        );

        return next(
            new SuccessResponse(
                statusCode.okCode,
                'Verification email sent successfully, Check your email inbox',
                sended
            )
        )
    }

    catch (error) {
        return next(
            new ErrorResponse(
                error,
                'Failed to send verification email',
                statusCode.internalServerErrorCode
            )
        )
    }
}

export const verifyEmail = async (req, res, next) => {
    try {
        
    }

    catch (error) {
        return next(
            new ErrorResponse(
                error,
                'Failed to verify email',
                statusCode.internalServerErrorCode
            )
        )
    }
}

/**
 * @api {delete} /auth/deactivate Deactivate User
 * @apiName Deactivate
 * @apiGroup Auth
 * @apiDescription Deactivate a user account
 *
 * @apiSuccess {boolean} success True if the request was successful
 * @apiSuccess {string} message The message indicating that the user was deactivated
 * @apiSuccess {Object} data The deactivated user data
 *
 * @apiError {boolean} success False if the request was not successful
 * @apiError {string} message The message indicating that the user failed to deactivate
 * @apiError {string} data The message indicating the failure to deactivate
 */
export const deActivate = async (req, res, next) => {
	try {
		const { userId } = req.session;

		const deActivateUser = await deactivateUserAccount(userId);

		if (!deActivateUser)
			return next(
				new ErrorResponse(
					'Failed to deactivate user account',
					'Failed to deactivate',
					statusCode.notFoundCode
				)
			);

		if (deActivateUser.error)
			return next(
				new ErrorResponse(
					deActivateUser.error,
					'Failed to deactivate ' + deActivateUser.error.message,
					statusCode.badRequestCode
				)
			);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully Deactivated User Account',
				deActivateUser
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to deactivate user account',
				statusCode.internalServerErrorCode
			)
		);
	}
};


/**
 * @api {post} /auth/logout Logout
 * @apiName Logout
 * @apiGroup Auth
 * @apiDescription Logout a user, clear their session, and deactivate their account
 *
 * @apiSuccess {boolean} success True if the request was successful
 * @apiSuccess {string} message The message indicating that the user was logged out
 * @apiSuccess {string} data The message indicating that the user was logged out
 *
 * @apiError {boolean} success False if the request was not successful
 * @apiError {string} message The message indicating that the user failed to logout
 * @apiError {string} data The message indicating the failure to logout
 */
export const logout = async (req, res, next) => {
	try {
		const { userId } = req.session;

		// Deactivate the user account
		await deactivateUserAccount(userId);

		// Clear the cookies
		clearCookies(res);

		// Delete the session
		await deleteSession(req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'User Logged Out Successfully',
				'User Logout'
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to logout',
				statusCode.internalServerErrorCode
			)
		);
	}
};

/**
 * @api {post} /auth/refresh-token Get Access Token
 * @apiName GetAccessToken
 * @apiGroup Auth
 * @apiDescription Get a new access token with a valid refresh token
 *
 * @apiParam {string} refreshToken The refresh token to get a new access token
 *
 * @apiSuccess {boolean} success True if the request was successful
 * @apiSuccess {string} message The message indicating that the access token was sent via cookie
 * @apiSuccess {string} data The message indicating that the access token was generated
 *
 * @apiError {boolean} success False if the request was not successful
 * @apiError {string} message The message indicating that the refresh token is missing
 * @apiError {string} data The message indicating the failure to get an access token
 * @apiError {number} status The HTTP status code for Bad Request
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "success": false,
 *       "message": "Missing refresh token",
 *       "data": "Failed to get access token",
 *       "status": 400
 *     }
 *
 * @apiUse SuccessResponse
 * @apiUse ErrorResponse
 */
export const getAccessToken = (req, res, next) => {
	const { refreshToken } = req.body;

	if (!refreshToken)
		return next(
			new ErrorResponse(
				'Missing refresh token',
				'Failed to get access token',
				statusCode.badRequestCode
			)
		);

	if (!verifyRefreshToken(refreshToken))
		return next(
			new ErrorResponse(
				'Invalid refresh token',
				'User must be logged in again to get access token',
				statusCode.badRequestCode
			)
		);

	const { userId } = req.session;

	sendCookies(userId, res);

	return next(
		new SuccessResponse(
			statusCode.okCode,
			'Access Token Sending Via Cookie',
			'Access Token Generated'
		)
	);
};

/**
 * @api {get} /api/beggy/auth/csrf-token Get CSRF Token
 * @apiName GetCSRFToken
 * @apiGroup Auth
 *
 * @apiSuccess (200) {String} csrfToken CSRF Token
 *
 * @apiSuccessExample {json} Success-Response:
 *     {
 *       "success": true,
 *       "message": "CSRF token generated, send the token via cookie ( x-csrf-token )",
 *       "data": {
 *         "csrfToken": "X6ZpFJ3WnJrV5sG6pP4oMw=="
 *       },
 *       "statusCode": 200
 *     }
 * @apiDescription
 *    This route is used to get CSRF Token.
 *    The token will be sent via cookie ( x-csrf-secret ) and response body.
 */
export const csrfProtection = (req, res, next) => {
	//* generateCSRFToken will handle send the secret via cookie
	//* and return the generated token
	const csrfToken = generateCSRFToken(res);

	return next(
		new SuccessResponse(
			statusCode.okCode,
			'CSRF token generated, send the token via cookie ( x-csrf-token )'+'\n'
            +'The token will be sent via cookie ( x-csrf-secret ) and response body.',
			{ csrfToken }
		)
	);
};
