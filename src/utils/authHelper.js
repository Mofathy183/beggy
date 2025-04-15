import { cookieOptions, cookieRefreshOptions } from '../config/env.js';
import { signToken, signRefreshToken } from './jwt.js';
import CSRF from 'csrf';

//*=============================={SEND COOKIE}==============================
export const sendCookies = (userId, res) => {
	const token = signToken(userId);

	const refreshToken = signRefreshToken(userId);

	res.cookie('jwt-access-token', token, cookieOptions);
	res.cookie('jwt-refresh-token', refreshToken, cookieRefreshOptions);

	return;
};

export const sendProvideCookies = (accessToken, userId, provider, res) => {
	res.cookie(`${provider}-access-token`, accessToken, cookieOptions);

	const refreshToken = signRefreshToken(userId);

	res.cookie(`${provider}-refresh-token`, refreshToken, cookieRefreshOptions);
	return;
};

//*=============================={Clear Cookies}==============================
export const clearCookies = (res) => {
	const cookies = [
		'jwt-access-token',
		'jwt-refresh-token',
		'google-access-token',
		'google-refresh-token',
		'facebook-access-token',
		'facebook-refresh-token',
	];

	cookies.forEach((cookie) => res.clearCookie(cookie));

	return;
};

//*=============================={STORE SESSION}==============================
export const storeSession = (userId, userRole, req) => {
	req.session.userId = userId;
	req.session.userRole = userRole;

	return;
};

//*=============================={DELETE SESSION}==============================
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
export const generateCSRFToken = (res) => {
	const csrf = new CSRF();

	const secret = csrf.secretSync();

	res.cookie('x-csrf-secret', secret, {
		...cookieOptions,
		maxAge: 3600000, // 1 hour
	});

	const csrfToken = csrf.create(secret);

	return csrfToken;
};
