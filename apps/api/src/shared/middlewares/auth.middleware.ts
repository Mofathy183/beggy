import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type { AuthUser } from '@shared/types';
import { ErrorCode } from '@beggy/shared/constants';
import {
	verifyAccessToken,
	appErrorMap,
	verifyRefreshToken,
} from '@shared/utils';
import { defineAbilityFor, logger } from '@shared/middlewares';
import { env } from '@config';

/**
 * Middleware that extracts authentication tokens from cookies
 * and normalizes them onto the request object.
 *
 * @description
 * Reads JWT tokens from HTTP cookies and attaches them to
 * `req.authTokens` so downstream authentication middleware
 * can access them from a consistent location.
 *
 * @remarks
 * This middleware **does not perform authentication or validation**.
 * It only prepares token data for guards such as `requireAuth`
 * or `requireRefreshToken`.
 *
 * The abstraction allows the token transport mechanism to change
 * (e.g. cookies → headers) without modifying authentication guards.
 *
 * @see requireAuth
 * @see requireRefreshToken
 */
export const authCookieParser: RequestHandler = (
	req: Request,
	_res: Response,
	next: NextFunction
) => {
	/**
	 * Attach normalized token structure to the request.
	 *
	 * Using configured cookie names.
	 * Cookie names are environment-driven to allow safe rotation
	 * and environment-specific configuration.
	 *
	 * Downstream middleware should read tokens exclusively from
	 * `req.authTokens` rather than directly accessing `req.cookies`.
	 */
	req.authTokens = {
		accessToken: req.cookies?.[env.JWT_ACCESS_TOKEN_NAME],
		refreshToken: req.cookies?.[env.JWT_REFRESH_TOKEN_NAME],
	};

	next();
};

/**
 * Authentication guard middleware.
 *
 * @remarks
 * This middleware:
 * - Verifies the access token
 * - Attaches the authenticated user to `req.user`
 * - Initializes the CASL ability and attaches it to `req.ability`
 *
 * It must run **before any authorization middleware**
 * (e.g. `requirePermission`).
 *
 * Downstream middleware can safely assume that:
 * - `req.user` is defined
 * - `req.ability` is initialized
 *
 * @throws {@link AppError}
 * - `UNAUTHORIZED` when no access token is present
 * - Token verification errors when the token is invalid or expired
 */
export const requireAuth: RequestHandler = (
	req: Request,
	_res: Response,
	next: NextFunction
) => {
	const token = req.authTokens?.accessToken;

	if (!token) {
		logger.error(
			{
				domain: 'auth',
				middleware: 'accessToken',
				accessToken: token,
			},
			'token is not found'
		);
		throw appErrorMap.unauthorized(ErrorCode.UNAUTHORIZED);
	}

	logger.info(
		{
			domain: 'auth',
			middleware: 'accessToken',
			accessToken: token,
		},
		'ACCESS TOKEN'
	);

	try {
		const payLoad = verifyAccessToken(token);

		const user: AuthUser = {
			id: payLoad.id,
			role: payLoad.role,
			issuedAt: payLoad.issuedAt,
		};

		req.user = user;

		/**
		 * Initialize the user's authorization ability
		 * based on their role.
		 *
		 * This ability will be consumed by downstream
		 * permission middleware.
		 */
		req.ability = defineAbilityFor(user.role);

		next();
	} catch (error: unknown) {
		logger.error(
			{
				domain: 'auth',
				middleware: 'requireRefreshToken',
				error,
			},
			'Error Occur'
		);
		next(error);
	}
};

/**
 * Refresh token guard middleware.
 *
 * @remarks
 * This middleware:
 * - Extracts the refresh token from `req.authTokens`
 * - Verifies its validity and integrity
 * - Attaches a minimal, non-auth identity payload to the request
 *
 * ⚠️ Important:
 * - This middleware does NOT authenticate the user
 * - It does NOT attach `req.user`
 * - It does NOT initialize permissions or abilities
 *
 * Its sole responsibility is to prove that the client holds
 * a valid refresh token issued by the system.
 *
 * @throws {@link AppError}
 * - `UNAUTHORIZED` when the refresh token is missing or invalid
 *
 * @usage
 * Must be used before the refresh controller handler.
 * Example:
 * `router.post('/refresh-token', requireRefreshToken, controller.refreshToken)`
 */
export const requireRefreshToken: RequestHandler = (
	req: Request,
	_res: Response,
	next: NextFunction
) => {
	// Extract refresh token parsed earlier by authCookieParser
	const token = req.authTokens?.refreshToken;

	// Refresh token is mandatory for this flow
	if (!token) {
		logger.error(
			{
				domain: 'auth',
				middleware: 'requireRefreshToken',
				refreshToken: token,
			},
			'token is not found'
		);
		throw appErrorMap.unauthorized(ErrorCode.UNAUTHORIZED);
	}

	try {
		// Verify refresh token signature, expiry, and claims
		const payload = verifyRefreshToken(token);

		/**
		 * Attach minimal refresh context to the request.
		 *
		 * @remarks
		 * - This is NOT an authenticated user
		 * - This payload should only be trusted for token rotation
		 * - Never use it for authorization or permissions
		 */
		req.refreshPayload = {
			userId: payload.id,
		};

		next();
	} catch (error) {
		logger.error(
			{
				domain: 'auth',
				middleware: 'requireRefreshToken',
				error,
			},
			'Error Occur'
		);
		next(error);
	}
};
