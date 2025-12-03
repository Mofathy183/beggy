import { statusCode } from '../../config/status.js';
import { frontendOAuth } from '../../config/env.js';
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

		//* that will navigate to home page in frontend
		return res.redirect(`${frontendOAuth.success}?state=success`);
	} catch (error) {
		//* that will navigate to login page in frontend
		return res.redirect(`${frontendOAuth.failed}?state=success`);
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

		//* that will navigate to home page in frontend
		return res.redirect(`${frontendOAuth.success}?state=success`);
	} catch (error) {
		//* that will navigate to login page in frontend
		return res.redirect(`${frontendOAuth.failed}?state=success`);
	}
};
