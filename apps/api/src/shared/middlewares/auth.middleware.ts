import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { ErrorCode } from '@beggy/shared/constants';
import { verifyAccessToken, appErrorMap } from '@shared/utils';
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
