import { signAccessToken, signRefreshToken } from '@shared/utils';
import { env, envConfig } from '@config';
import type { Response, CookieOptions } from 'express';
import { Role } from '@beggy/shared/constants';
const accessTokenName = env.JWT_ACCESS_TOKEN_NAME;
const refreshTokenName = env.JWT_REFRESH_TOKEN_NAME;

const accessConfig: CookieOptions = envConfig.cookies.access;
const refreshConfig: CookieOptions = envConfig.cookies.refresh;

//* ============================== AUTH COOKIES ============================== */

/**
 * Sets authentication cookies (access & refresh tokens).
 *
 * Tokens are stored as HttpOnly cookies and used for
 * authenticating subsequent API requests.
 *
 * @param res - Express response object
 * @param userId - Authenticated user UUID
 * @param userRole - User role for authorization
 */
export const setAuthCookies = (
	res: Response,
	userId: string,
	userRole: Role
): void => {
	const accessToken = signAccessToken(userId, userRole);
	const refreshToken = signRefreshToken(userId);

	res.cookie(accessTokenName, accessToken, accessConfig);
	res.cookie(refreshTokenName, refreshToken, refreshConfig);
};

/**
 * Clears authentication cookies from the response.
 *
 * This should be called during logout or session invalidation.
 *
 * @param res - Express response object
 */
export const clearAuthCookies = (res: Response): void => {
	res.clearCookie(accessTokenName, accessConfig);
	res.clearCookie(refreshTokenName, refreshConfig);
};

// //* ============================== SESSION ============================== */

// /**
//  * Stores minimal user data in the session.
//  *
//  * Sessions are typically used for:
//  * - OAuth flows
//  * - Temporary server-side state
//  *
//  * @param req - Express request object
//  * @param userId - User UUID
//  * @param userRole - User role
//  */
// export const storeSession = (
// 	req: Request,
// 	userId: string,
// 	userRole: Role
// ): void => {
// 	req.session.userId = userId;
// 	req.session.userRole = userRole;
// };

// /**
//  * Destroys the current user's session.
//  *
//  * This invalidates server-side session data
//  * and should be called during logout.
//  *
//  * @param req - Express request object
//  * @throws SESSION_DESTROY_FAILED
//  */
// export const destroySession = async (req: Request): Promise<void> => {
// 	return new Promise((resolve, reject) => {
// 		if (!req.session) {
// 			return resolve();
// 		}

// 		req.session.destroy((error) => {
// 			if (error) {
// 				return reject(
// 					apiResponseMap.serverError(
// 						ErrorCode.SESSION_DESTROY_FAILED,
// 						error
// 					)
// 				);
// 			}

// 			resolve();
// 		});
// 	});
// };
