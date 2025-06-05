import { cookieOptions, cookieRefreshOptions } from '../config/env.js';
import { signToken, signRefreshToken } from './jwt.js';
import CSRF from 'csrf';

//*=============================={SEND COOKIE}==============================

/**
 * Set cookies for access token and refresh token.
 *
 * @param {String} userId - User id of the user.
 * @param {Response} res - HTTP response object.
 */
export const sendCookies = (userId, res) => {
	const token = signToken(userId);

	const refreshToken = signRefreshToken(userId);

	res.cookie('accessToken', token, cookieOptions);
	res.cookie('refreshToken', refreshToken, cookieRefreshOptions);

	return;
};

//*=============================={Clear Cookies}==============================

/**
 * Clears authentication and provider-specific cookies from the response.
 * @function clearCookies
 * @param {Response} res - The response object used to clear cookies.
 * @returns {undefined}
 */
export const clearCookies = (res) => {
	const cookiesToClear = ['accessToken', 'refreshToken'];

	cookiesToClear.forEach((cookie) => res.clearCookie(cookie));
};

//*=============================={STORE SESSION}==============================

/**
 * Stores the user ID and user role in the session.
 * @function storeSession
 * @param {string} userId - The user's ID.
 * @param {string} userRole - The user's role.
 * @param {Request} req - The request object.
 * @returns {undefined}
 */
export const storeSession = (userId, userRole, req) => {
	req.session.userId = userId;
	req.session.userRole = userRole;

	return;
};

//*=============================={DELETE SESSION}==============================

/**
 * Destroys the session, rejecting the promise if there is an error.
 * @function deleteSession
 * @param {Request} req - The request object.
 * @returns {Promise<void>}
 */
export const deleteSession = async (req) => {
	return new Promise((resolve, reject) => {
		req.session.destroy((error) => {
			if (error) {
				return reject(
					new ErrorHandler('session', error, 'destroy session failed')
				);
			}
			resolve();
		});
	});
};

//*==============================={CSRF Generate Token}=============================

/**
 * Generates a CSRF token and stores it in a cookie.
 *
 * @param {Response} res
 * @returns {string} The generated CSRF token
 */
export const generateCSRFToken = (res) => {
	const csrf = new CSRF();

	const secret = csrf.secretSync();

	res.cookie('X-CSRF-Secret', secret, {
		...cookieOptions,
		maxAge: 3600000, // 1 hour
	});

	const csrfToken = csrf.create(secret);

	return csrfToken;
};
