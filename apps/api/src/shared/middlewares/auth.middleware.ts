import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { ErrorCode } from '@beggy/shared/constants';
import {
	verifyAccessToken,
	appErrorMap,
	verifyRefreshToken,
} from '@shared/utils';
import { defineAbilityFor } from '@shared/middlewares';

/**
 * Authentication cookie parser middleware.
 *
 * @remarks
 * - Extracts authentication tokens from HTTP cookies
 * - Normalizes them into `req.authTokens`
 * - Does NOT perform validation or authentication
 *
 * @usage
 * This middleware should be registered globally in `app.ts`
 * before any authentication or authorization middleware.
 */
export const authCookieParser: RequestHandler = (
	req: Request,
	_res: Response,
	next: NextFunction
) => {
	req.authTokens = {
		accessToken: req.cookies?.accessToken,
		refreshToken: req.cookies?.refreshToken,
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
		throw appErrorMap.unauthorized(ErrorCode.UNAUTHORIZED);
	}

	try {
		const payLoad = verifyAccessToken(token);

		req.user = {
			id: payLoad.id,
			role: payLoad.role,
			issuedAt: payLoad.issuedAt,
		};

		/**
		 * Initialize the user's authorization ability
		 * based on their role.
		 *
		 * This ability will be consumed by downstream
		 * permission middleware.
		 */
		req.ability = defineAbilityFor(req.user.role);

		next();
	} catch (error: unknown) {
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
		next(error);
	}
};
