import { signAccessToken, signRefreshToken } from '@shared/utils';
import { env, envConfig } from '@config';
import type { Request, Response, CookieOptions } from 'express';
import { Role } from '@prisma/generated/prisma/enums';

const accessTokenName = env.JWT_ACCESS_TOKEN_NAME;
const refreshTokenName = env.JWT_REFRESH_TOKEN_NAME;
const accessConfig: CookieOptions = envConfig.cookies.access;
const refreshConfig: CookieOptions = envConfig.cookies.refresh;

//*=============================={SEND COOKIE}==============================
/**
 * Set cookies for access token and refresh token.
 *
 * @param {Response} res - HTTP response object.
 * @param {String} userId - User id of the user.
 */
export const sendCookies = (res: Response, userId: string): void => {
	const token = signAccessToken(userId);

	const refreshToken = signRefreshToken(userId);

	res.cookie(accessTokenName, token, accessConfig);
	res.cookie(refreshTokenName, refreshToken, refreshConfig);

	return;
};

//*=============================={Clear Cookies}==============================
/**
 * Clears authentication and provider-specific cookies from the response.
 * @function clearCookies
 * @param {Response} res - The response object used to clear cookies.
 * @returns {undefined}
 */
export const clearCookies = (res: Response): void => {
	const cookiesToClear = [accessTokenName, refreshTokenName];

	cookiesToClear.forEach((cookie) => res.clearCookie(cookie));

	return;
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
export const storeSession = (
	req: Request,
	userId: string,
	userRole: Role
): void => {
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
export const deleteSession = async (req: Request): void => {
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
