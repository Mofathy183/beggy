import { statusCode } from '../../config/status.js';
import { storeSession, sendProvideCookies } from '../../utils/authHelper.js';
import { ErrorResponse } from '../../utils/error.js';
import {
	loginUserWithGoogle,
	loginUserWithFacebook,
} from '../../services/accountService.js';
import SuccessResponse from '../../utils/successResponse.js';

export const loginWithGoogle = async (req, res, next) => {
	try {
		console.log('***User from REQ**', req.user.profile);
		const { accessToken, profile } = req.user;

		const { role, safeUser } = await loginUserWithGoogle(profile);

		console.log('role, data', role, safeUser);

		sendProvideCookies(accessToken, safeUser.id, 'google', res);

		storeSession(safeUser.id, role, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				`Successfully Logged In with Google`,
				safeUser
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
		const { profile, accessToken } = req.user;

		const { role, safeUser, emailError } =
			await loginUserWithFacebook(profile);

		if (emailError)
			return next(
				new ErrorResponse(
					emailError,
					'We couldn’t access your email from Facebook. ' +
						'Please make sure your Facebook account has an email and you granted permission to share it.',
					statusCode.badRequestCode
				)
			);

		sendProvideCookies(accessToken, safeUser.id, 'facebook', res);

		storeSession(safeUser.id, role, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				`Successfully Logged In with Facebook`,
				safeUser
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
