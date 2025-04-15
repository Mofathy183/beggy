import {
	singUpUser,
	loginUser,
	userForgotPassword,
	resetUserPassword,
	updateUserData,
	updateUserPassword,
	deactivateUserAccount,
} from '../../services/authService.js';
import { resetPasswordUrl } from '../../config/env.js';
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

export const login = async (req, res, next) => {
	try {
		const { body } = req;

		const { safeUser, role } = await loginUser(body);

		if (!safeUser)
			return next(
				new ErrorResponse(
					'User not found',
					'Invalid email or password',
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

export const logout = async (req, res, next) => {
	try {
		const { userId } = req.session;

		await deactivateUserAccount(userId);

		clearCookies(res);
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

export const csrfProtection = (req, res, next) => {
	//* generateCSRFToken will handle send the secret via cookie
	//* and return the generated token
	const csrfToken = generateCSRFToken(res);

	return next(
		new SuccessResponse(
			statusCode.okCode,
			'CSRF token generated, send the token via cookie ( x-csrf-token )',
			{ csrfToken }
		)
	);
};
