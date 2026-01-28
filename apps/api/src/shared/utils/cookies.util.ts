import type { Response, CookieOptions } from 'express';
import { Role } from '@prisma-generated/enums';
import { signAccessToken, signRefreshToken } from '@shared/utils';
import { env, envConfig } from '@config';

/**
 * Cookie names used to store JWTs.
 *
 * @remarks
 * Names are injected from environment variables to allow:
 * - Easy rotation
 * - Environment-specific naming
 * - Avoiding hard-coded identifiers
 */
const accessTokenName = env.JWT_ACCESS_TOKEN_NAME;
const refreshTokenName = env.JWT_REFRESH_TOKEN_NAME;

/**
 * Cookie configurations.
 *
 * @remarks
 * - `accessConfig` is specific to access tokens (short-lived)
 * - `baseConfig` contains shared secure defaults for all auth cookies
 *
 * Centralizing cookie options prevents security drift across endpoints.
 */
const accessConfig: CookieOptions = envConfig.cookies.access;
const baseConfig: CookieOptions = envConfig.cookies.base;

/**
 * AuthCookies
 *
 * @remarks
 * Centralized utility for managing authentication cookies.
 *
 * Responsibilities:
 * - Issue access and refresh tokens
 * - Attach tokens to HTTP-only cookies
 * - Apply correct lifetime and security flags
 * - Clear auth cookies on logout or session invalidation
 *
 * This object is intentionally stateless and safe to reuse
 * across controllers, resolvers, and middleware.
 */
export const AuthCookies = {
	/**
	 * Sets the access token cookie.
	 *
	 * @remarks
	 * Access tokens:
	 * - Are short-lived
	 * - Are sent on every authenticated request
	 * - Contain authorization claims (e.g. role)
	 *
	 * They are always stored as HTTP-only cookies
	 * to mitigate XSS attacks.
	 *
	 * @param res - Express response object
	 * @param userId - Authenticated user UUID
	 * @param userRole - User role used for authorization
	 */
	setAccessTokenCookie(res: Response, userId: string, userRole: Role) {
		const accessToken = signAccessToken(userId, userRole);

		/**
		 * Access token cookie is always short-lived.
		 */
		res.cookie(accessTokenName, accessToken, accessConfig);
	},

	/**
	 * Sets the refresh token cookie.
	 *
	 * @remarks
	 * Refresh tokens:
	 * - Are long-lived
	 * - Are used only to issue new access tokens
	 * - Must never be accessible from client-side JavaScript
	 *
	 * Cookie lifetime is determined at runtime based on
	 * the "remember me" option.
	 *
	 * @param res - Express response object
	 * @param userId - Authenticated user UUID
	 * @param rememberMe - Whether the session should persist long-term
	 */
	setRefreshTokenCookie(
		res: Response,
		userId: string,
		rememberMe: boolean = false
	) {
		const refreshToken = signRefreshToken(userId, rememberMe);

		/**
		 * Determine refresh token cookie lifetime.
		 *
		 * @remarks
		 * - Standard sessions expire sooner
		 * - "Remember me" sessions persist longer
		 */
		const refreshMaxAge = rememberMe
			? env.JWT_REFRESH_REMEMBER_MAX_AGE_MS
			: env.JWT_REFRESH_MAX_AGE_MS;

		// Refresh token → session vs persistent
		res.cookie(refreshTokenName, refreshToken, {
			...baseConfig,
			maxAge: refreshMaxAge,
		});
	},

	/**
	 * Sets both access and refresh token cookies.
	 *
	 * @remarks
	 * Used during:
	 * - Login
	 * - Token refresh
	 * - Session re-issuance
	 *
	 * This method guarantees cookies are always
	 * issued in a consistent and atomic manner.
	 *
	 * @param res - Express response object
	 * @param userId - Authenticated user UUID
	 * @param userRole - User role used for authorization
	 * @param rememberMe - Whether to persist the refresh token long-term
	 */
	setCookies(
		res: Response,
		userId: string,
		userRole: Role,
		rememberMe: boolean = false
	) {
		this.setAccessTokenCookie(res, userId, userRole);
		this.setRefreshTokenCookie(res, userId, rememberMe);
	},

	/**
	 * Clears authentication cookies.
	 *
	 * @remarks
	 * Used during:
	 * - Logout
	 * - Session invalidation
	 * - Security enforcement (e.g. token abuse)
	 *
	 * Both access and refresh cookies are cleared
	 * to fully terminate the session.
	 *
	 * @param res - Express response object
	 */
	clear(res: Response) {
		res.clearCookie(accessTokenName);
		res.clearCookie(refreshTokenName);
	},
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
