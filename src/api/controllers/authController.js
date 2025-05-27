import {
	singUpUser,
	loginUser,
	authUser,
	userForgotPassword,
	resetUserPassword,
	updateUserData,
	changeUserEmail,
	verifyUserEmail,
	getUserPermissions,
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
import { ErrorResponse, sendServiceResponse } from '../../utils/error.js';

export const signUp = async (req, res, next) => {
	try {
		const { body } = req;

		const user = await singUpUser(body);

		if (sendServiceResponse(next, user)) return;

		if (!user)
			return next(
				new ErrorResponse(
					'Failed to create user',
					'Failed to create',
					statusCode.badRequestCode
				)
			);

		if (user.error)
			return next(
				new ErrorResponse(
					user.error,
					"Error Couldn't create user " + user.error.message,
					statusCode.badRequestCode
				)
			);

		const { role, id } = user;

		//* for add the user id to session
		storeSession(id, role, req);

		//* send the token as a cookie
		sendCookies(id, res);

		return next(
			new SuccessResponse(
				statusCode.createdCode,
				"You've Signed Up Successfully",
				'Will send email to verify your account'
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				Object.keys(error).length === 0
					? 'Error Occur while Signing Up'
					: error,
				'Failed to Sign Up',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const login = async (req, res, next) => {
	try {
		const { body } = req;

		//* get the user from DB
		const user = await loginUser(body);

		if (sendServiceResponse(next, user)) return;

		if (!user)
			return next(
				new ErrorResponse(
					'User Not Found',
					'User must exist to authenticate',
					statusCode.notFoundCode
				)
			);

		if (user.error)
			return next(
				new ErrorResponse(
					user.error,
					'Error occurred while authenticating user',
					statusCode.badRequestCode
				)
			);

		const { role, id } = user;

		//* for add the user id to session
		storeSession(id, role, req);

		//* send the token as a cookie
		sendCookies(id, res);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				"You've logged In Successfully",
				'Will send email to verify your account'
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				Object.keys(error).length === 0
					? 'Error Occur while Logs In'
					: error,
				'Failed to login',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const authMe = async (req, res, next) => {
	try {
		// Destructure user ID and role from the session
		const { userId, userRole } = req.session;

		// Attempt to authenticate the user by ID
		const user = await authUser(userId);

		if (sendServiceResponse(next, user)) return;

		// If no user is returned, forward a not found error
		if (!user) {
			return next(
				new ErrorResponse(
					'User Not Found',
					'User must exist to authenticate',
					statusCode.notFoundCode
				)
			);
		}

		// If user has an embedded error (e.g., from authUser), forward a bad request error
		if (user.error) {
			return next(
				new ErrorResponse(
					user.error,
					'Error occurred while authenticating user',
					statusCode.badRequestCode
				)
			);
		}

		// Send cookies and update session with user info
		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		// Return a success response with the user data
		return next(
			new SuccessResponse(
				statusCode.okCode,
				"You've Authenticated Successfully",
				user
			)
		);
	} catch (error) {
		// Catch unexpected errors and forward an internal server error response
		next(
			new ErrorResponse(
				Object.keys(error).length === 0
					? 'Error Occur while Authenticating You'
					: error,
				'Failed to authenticate user',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const forgotPassword = async (req, res, next) => {
	try {
		const { email } = req.body;

		const sendEmail = await userForgotPassword(email);

		if (sendServiceResponse(next, sendEmail)) return;

		if (!sendEmail)
			return next(
				new ErrorResponse(
					'Failed to send reset password email to user',
					'Failed to update',
					statusCode.badRequestCode
				)
			);

		if (sendEmail.error)
			return next(
				new ErrorResponse(
					sendEmail.error,
					"Error Couldn't send reset password email to user " +
						sendEmail.error.message,
					statusCode.badRequestCode
				)
			);

		const { resetToken, userName, userEmail } = sendEmail;

		if (!resetToken || !userEmail || !userName)
			return next(
				new ErrorResponse(
					'Failed to send reset password email to user',
					'Failed to generate token and get user email and name',
					statusCode.badRequestCode
				)
			);

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
			'reset',
			'password_reset'
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
				'Reset password email send Successfully',
				'Check your email inbox to reset your password',
				sended
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				Object.keys(error).length === 0
					? 'Error Occur while Send Reset Password Email'
					: error,
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

		if (sendServiceResponse(next, updatePassword)) return;

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
				"You've successfully changed your password",
				"You've Change Password Successfully"
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				Object.keys(error).length === 0
					? 'Error Occur while Reset Password'
					: error,
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

		if (sendServiceResponse(next, updatePassword)) return;

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
				"You've successfully changed your password",
				"You've Updated Password Successfully"
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				Object.keys(error).length === 0
					? 'Error Occur while Update User Password'
					: error,
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

		if (sendServiceResponse(next, updatedUserData)) return;

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
				'Successfully Updated Your Profile',
				"You've Updated Your Profile Successfully"
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				Object.keys(error).length === 0
					? 'Error Occur while Update Your Info'
					: error,
				'Failed to update user data',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const changeEmail = async (req, res, next) => {
	try {
		const { email } = req.body;

		const { userId, userRole } = req.session;

		const updateEmail = await changeUserEmail(userId, email);

		if (sendServiceResponse(next, updateEmail)) return;

		if (!updateEmail)
			return next(
				new ErrorResponse(
					'Failed to change user email',
					'Failed to update',
					statusCode.badRequestCode
				)
			);

		if (updateEmail.error)
			return next(
				new ErrorResponse(
					updateEmail.error,
					"Error Couldn't change user email " +
						updateEmail.error.message,
					statusCode.badRequestCode
				)
			);

		const { token, userEmail, userName } = updateEmail;

		if (!token || !userEmail || !userName)
			return next(
				new ErrorResponse(
					'Failed to change user email',
					'Failed to generate token and get user email and name',
					statusCode.badRequestCode
				)
			);

		const verifyEmailURL = `${req.protocol}://${req.get('host') || 'localhost'}${verifyEmailUrl}?token=${token}type=change_email`;

		const sended = await sendEmail(
			verifyEmailURL,
			userName,
			userEmail,
			'verify-email',
			'verify',
			'change_email'
		);

		if (sended.error)
			return next(
				new ErrorResponse(
					sended.error,
					'Failed to send verification email ' + sended.error.message,
					statusCode.internalServerErrorCode
				)
			);

		storeSession(userId, userRole, req);

		sendCookies(userId, res);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully Updated Your Email',
				'Check your email inbox to verify your email',
				sended
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				Object.keys(error).length === 0
					? 'Error Occur while Change Your Email'
					: error,
				'Failed to change user email',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const sendVerificationEmail = async (req, res, next) => {
	try {
		const { email } = req.body;

		const userToken = await sendVerificationUserEmail(email);

		if (sendServiceResponse(next, userToken)) return;

		if (!userToken)
			return next(
				new ErrorResponse(
					'Failed to send verification email',
					'Failed to update',
					statusCode.badRequestCode
				)
			);

		if (userToken.error)
			return next(
				new ErrorResponse(
					userToken.error,
					"Error Couldn't send verification email " +
						userToken.error.message,
					statusCode.badRequestCode
				)
			);

		const { token, userName } = userToken;

		const verifyEmailURL = `${req.protocol}://${req.get('host')}${verifyEmailUrl}?token=${token}type=email_verification`;

		const sended = await sendEmail(
			verifyEmailURL,
			userName,
			email,
			'verify-email',
			'verify'
		);

		if (sended.error)
			return new ErrorResponse(
				sended.error,
				'Failed to send verification email ' + sended.error.message,
				statusCode.internalServerErrorCode
			);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Verification email send Successfully',
				'Check your email inbox to verify your email',
				sended
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				Object.keys(error).length === 0
					? 'Error Occur while Sending Verification Email'
					: error,
				'Failed to send verification email',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const verifyEmail = async (req, res, next) => {
	try {
		const { token, type } = req.verified;

		const userUpdate = await verifyUserEmail(token, type);

		if (sendServiceResponse(next, userUpdate)) return;

		if (!userUpdate)
			return next(
				new ErrorResponse(
					'userUpdate is null',
					"Couldn't update user",
					'Failed to verify user email'
				)
			);

		if (userUpdate.error)
			return next(
				new ErrorResponse(
					'prisma',
					"Couldn't Find token" + userUpdate.error,
					'Failed to verify user email ' + userUpdate.error.message
				)
			);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully Verified User Email',
				userUpdate
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				Object.keys(error).length === 0
					? 'Error Occur while Verify Your Email'
					: error,
				'Failed to verify email',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const permissions = async (req, res, next) => {
	try {
		const { userId, userRole } = req.session;

		const userPermissions = await getUserPermissions(userRole);

		if (sendServiceResponse(next, userPermissions)) return;

		const { permissions, meta } = userPermissions;

		if (!permissions)
			return next(
				new ErrorResponse(
					'Failed to get user permissions',
					'Failed to get user permissions',
					statusCode.notFoundCode
				)
			);

		if (permissions.error)
			return next(
				new ErrorResponse(
					permissions.error,
					'Failed to get user permissions' +
						permissions.error.message,
					statusCode.badRequestCode
				)
			);

		storeSession(userId, userRole, req);

		sendCookies(userId, res);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully Get User Permissions',
				permissions,
				meta
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				Object.keys(error).length === 0
					? 'Error Occur while Get User Permissions'
					: error,
				'Failed to get user permissions',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const deActivate = async (req, res, next) => {
	try {
		const { userId } = req.session;

		const deActivateUser = await deactivateUserAccount(userId);

		if (sendServiceResponse(next, deActivateUser)) return;

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
				'Your Account Deactivated Successfully'
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				Object.keys(error).length === 0
					? 'Error Occur while Deactivate Your Account'
					: error,
				'Failed to deactivate user account',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const logout = async (req, res, next) => {
	try {
		const { userId } = req.session;

		// Deactivate the user account
		const deactivateUser = await deactivateUserAccount(userId);

		if (sendServiceResponse(next, deactivateUser)) return;

		if (!deactivateUser)
			return next(
				new ErrorResponse(
					'Failed to logout',
					'Failed to logout',
					statusCode.notFoundCode
				)
			);

		if (deactivateUser.error)
			return next(
				new ErrorResponse(
					deactivateUser.error,
					'Failed to logout ' + deactivateUser.error.message,
					statusCode.badRequestCode
				)
			);

		// Clear the cookies
		clearCookies(res);

		// Delete the session
		await deleteSession(req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				"You're Logged Out Successfully",
				"You're Out Now"
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				Object.keys(error).length === 0
					? 'Error Occur while Logout'
					: error,
				'Failed to logout',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const getAccessToken = (req, res, next) => {
	const { refreshToken } = req;

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
				'Session expired or invalid',
				'Please login again to continue.',
				statusCode.badRequestCode
			)
		);

	const { userId, userRole } = req.session;

	sendCookies(userId, res);
	storeSession(userId, userRole, req);

	return next(
		new SuccessResponse(
			statusCode.okCode,
			'Access token sent via cookie',
			'New access token has been successfully generated'
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
			'CSRF token generated Successfully',
			{ csrfToken }
		)
	);
};
