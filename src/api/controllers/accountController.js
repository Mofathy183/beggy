import { statusCode } from '../../config/status.js';
import { storeSession, sendCookies } from '../../utils/authHelper.js';
import { ErrorResponse, sendServiceResponse } from '../../utils/error.js';
import {
	loginUserWithGoogle,
	loginUserWithFacebook,
} from '../../services/accountService.js';
import SuccessResponse from '../../utils/successResponse.js';

export const loginWithGoogle = async (req, res, next) => {
	try {
		const { profile } = req.user;

		const user = await loginUserWithGoogle(profile);

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
					"Error Couldn't login with Google " + user.error.message,
					statusCode.badRequestCode
				)
			);

		const { role, userId } = user;

		sendCookies(userId, res);

		storeSession(userId, role, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				`Successfully Logged In with Google`,
				"You're Successfully Logged in with Google"
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				Object.keys(error).length === 0
					? 'Error Occur while Login with Google'
					: error,
				'Failed to authenticate with Google',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const authenticateWithFacebook = async (req, res, next) => {
	try {
		const { profile } = req.user;

		const user = await loginUserWithFacebook(profile);

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
					"Error Couldn't login with Facebook " + user.error.message,
					statusCode.badRequestCode
				)
			);

		const { role, userId } = user;

		sendCookies(userId, res);

		storeSession(userId, role, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				`Successfully Logged In with Facebook`,
				"You're Successfully Logged in with Facebook"
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				Object.keys(error).length === 0
					? 'Error Occur while Login with Facebook'
					: error,
				'Failed to authenticate with Facebook',
				statusCode.internalServerErrorCode
			)
		);
	}
};
