import {
	singUpUser,
	loginUser,
	userForgotPassword,
	resetUserPassword,
	updateUserData,
	updateUserPassword,
	deactivateUserAccount,
} from '../../services/authService.js';
import { ApiUrls } from '../../config/env.js';
import {
	sendEmail,
	sendCookies,
	storeSession,
} from '../../utils/authHelper.js';
import { statusCode } from '../../config/status.js';
import SuccessResponse from '../../utils/successResponse.js';
import ErrorResponse from '../../utils/error.js';

export const signUp = async (req, res, next) => {
	try {
		const { body } = req;

		const { safeUser, role } = await singUpUser(body);

		if (!safeUser || safeUser.error)
			return next(
				new ErrorResponse(
					"User couldn't sign up" || safeUser.error,
					'Invalid user',
					statusCode.notFoundCode
				)
			);

		//* for add the user id to session
		storeSession(safeUser.id, role, req);

		//* send the token as a cookie
		sendCookies(safeUser.id, res);

		return next(
			new SuccessResponse(
				statusCode.createdCode,
				'User signed up successfully',
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
					'Invalid user data',
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
				'User logged in successfully',
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

		const resetToken = await userForgotPassword(email);

		//* send email to reset the password to the user
		//* send a link to reset the password as a patch request
		//* with the resetToken in the params
		const resetURL = `${req.protocol}://${req.get('host')}${ApiUrls.resetPasswordUrl}/${resetToken}`;

		const message =
			'If You Forgot your password?' +
			'\n' +
			'Click here to reset your password:' +
			'\n' +
			resetURL +
			'\n' +
			"if you did't forgot your password, please ignore this email.";

		//* send email using nodemailer or any other email service`
		const sended = await sendEmail({
			to: email,
			subject:
				'Password Reset (you have 10 minutes to reset your password)',
			message,
		});

		if (sended.error || !sended)
			return next(
				new ErrorResponse(
					sended.error || 'Failed to send email',
					'Failed to send reset password email to user',
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

		const { safeUser, role } = await resetUserPassword(body, token);

		if (!safeUser)
			return next(
				new ErrorResponse(
					'Failed to reset password',
					'Failed to reset',
					statusCode.badRequestCode
				)
			);

		if (safeUser.error)
			return next(
				new ErrorResponse(
					safeUser.error,
					"Error Couldn't reset password",
					statusCode.badRequestCode
				)
			);

		//* store the user id and role in session
		storeSession(safeUser.id, role, req);

		//* Log the user in and send JWT token via cookie
		sendCookies(safeUser.id, res);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully updated password',
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
		const { user, body } = req;

		const { safeUser, role } = await updateUserPassword(user.id, body);

		if (!safeUser)
			return next(
				new ErrorResponse(
					'Failed to update password',
					'Failed to update',
					statusCode.badRequestCode
				)
			);

		if (safeUser.error)
			return next(
				new ErrorResponse(
					safeUser.error,
					"Error Couldn't update password",
					statusCode.badRequestCode
				)
			);

		//* store user id and role in session
		storeSession(safeUser.id, role, req);

		//* Log the useer in and send JWT token via cookie
		sendCookies(safeUser.id, res);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully updated password',
				safeUser
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
		const { user, body } = req;

		const { safeUser, role } = await updateUserData(user.id, body);

		if (!safeUser || safeUser.error)
			return next(
				new ErrorResponse(
					'Failed to update user data' || safeUser.error,
					'Failed to update',
					safeUser.error
						? statusCode.badRequestCode
						: statusCode.notFoundCode
				)
			);

		//* store user id and role in session
		storeSession(safeUser.id, role, req);

		//* Log the useer in and send JWT token via cookie
		sendCookies(safeUser.id, res);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully updated user data',
				safeUser,
				token
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
		const { user } = req;

		const deActivateUser = await deactivateUserAccount(user.id);

		if (!deActivateUser || deActivateUser.error)
			return next(
				new ErrorResponse(
					'Failed to deactivate user account' || deActivateUser.error,
					'Failed to deactivate',
					deActivateUser.error
						? statusCode.badRequestCode
						: statusCode.notFoundCode
				)
			);

		return next(
			new SuccessResponse(
				statusCode.noContentCode,
				'Successfully deactivated User Account',
				null
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
