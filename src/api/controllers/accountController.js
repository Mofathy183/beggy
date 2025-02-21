import { statusCode } from '../../config/status.js';
import { storeSession, sendProvidCookies } from '../../utils/authHelper.js';
import { ErrorResponse } from '../../utils/error.js';
import SuccessResponse from '../../utils/successResponse.js';

export const authenticateWithGoogle = async (req, res, next) => {
	try {
		const { userData, accessToken } = req.user;

		sendProvidCookies(accessToken, userData.id, 'google', res);

		storeSession(userData.id, userData.role, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully Logged in with Google',
				userData
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to authenticate with Google',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const authenticateWithFacebook = async (req, res, next) => {
	try {
		const { userData, accessToken } = req.user;

		sendProvidCookies(accessToken, userData.id, 'facebook', res);

		storeSession(userData.id, userData.role, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully Logged in with Facebook',
				userData
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to authenticate with Facebook',
				statusCode.internalServerErrorCode
			)
		);
	}
};
