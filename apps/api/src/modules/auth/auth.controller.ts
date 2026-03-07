import type { Request, Response } from 'express';
import type { AuthMeDTO, LoginInput } from '@beggy/shared/types';
import { type AuthService, AuthMapper } from '@modules/auth';
import { type UserService } from '@modules/users';
import { STATUS_CODE } from '@shared/constants';
import { oauthConfig } from '@config';
import { apiResponseMap, AuthCookies, appErrorMap } from '@shared/utils';
import { BaseController } from '@shared/core';
import { generateCsrfToken, logger } from '@shared/middlewares';
import { ErrorCode } from '@beggy/shared/constants';

/**
 * AuthController
 *
 * Handles HTTP request/response lifecycle for authentication routes.
 * Delegates all business logic to services and manages cookies, status codes,
 * and API response formatting.
 */
export class AuthController extends BaseController {
	constructor(
		private readonly authService: AuthService,
		private readonly userService: UserService
	) {
		super(
			logger.child({
				domain: 'auth',
				controller: 'AuthController',
			})
		);
	}

	/**
	 * Registers a new user and establishes an authenticated session.
	 *
	 * @route POST /auth/signup
	 */
	signup = async (req: Request, res: Response): Promise<void> => {
		const { body: user } = req;

		const { id, role } = await this.authService.signupUser(user);

		AuthCookies.setCookies(res, id, role);

		res.status(STATUS_CODE.CREATED).json(
			apiResponseMap.created(null, 'SIGNUP_SUCCESS')
		);
	};

	/**
	 * Authenticates a user using email/password and issues session cookies.
	 *
	 * @route POST /auth/login
	 */
	login = async (req: Request, res: Response): Promise<void> => {
		const input = req.body as LoginInput;

		const { id, role } = await this.authService.loginUser(input);

		AuthCookies.setCookies(res, id, role, input.rememberMe);

		res.status(STATUS_CODE.OK).json(
			apiResponseMap.ok(null, 'LOGIN_SUCCESS')
		);
	};

	/**
	 * Logs out the current user by clearing authentication cookies.
	 *
	 * @remarks
	 * - Stateless and idempotent
	 * - Always succeeds if called with valid authentication
	 *
	 * @route DELETE /auth/logout
	 */
	logout = async (_req: Request, res: Response): Promise<void> => {
		AuthCookies.clear(res);

		res.sendStatus(STATUS_CODE.NO_CONTENT);
	};

	/**
	 * Issues a new access token using a valid refresh token.
	 *
	 * @remarks
	 * This endpoint:
	 * - Requires `requireRefreshToken` middleware
	 * - Validates that the referenced user still exists
	 * - Issues a new access token and sets it as an HTTP-only cookie
	 *
	 * It does NOT:
	 * - Reuse the old access token
	 * - Authenticate permissions
	 * - Return sensitive user data
	 *
	 * @route POST /auth/refresh-token
	 *
	 * @throws {@link AppError}
	 * - `UNAUTHORIZED` when refresh middleware was not executed
	 * - `USER_NOT_FOUND` when the user no longer exists
	 */
	refreshToken = async (req: Request, res: Response): Promise<void> => {
		// Defensive check: ensures middleware contract was respected
		if (!req.refreshPayload) {
			throw appErrorMap.unauthorized(ErrorCode.UNAUTHORIZED);
		}

		const { userId } = req.refreshPayload;

		// Ensure the user still exists and is valid
		const user = await this.userService.getById(userId);
		if (!user) {
			throw appErrorMap.notFound(ErrorCode.USER_NOT_FOUND);
		}

		/**
		 * Issue and set a new access token.
		 *
		 * @remarks
		 * - Token is written as an HTTP-only cookie
		 * - Role is embedded to support downstream authorization
		 */
		AuthCookies.setAccessTokenCookie(res, user.id, user.role);

		res.status(STATUS_CODE.OK).json(
			apiResponseMap.ok(null, 'TOKEN_REFRESHED')
		);
	};

	/**
	 * Issues a CSRF token for state-changing requests.
	 *
	 * @route GET /auth/csrf-token
	 */
	csrfToken = async (req: Request, res: Response): Promise<void> => {
		const token = generateCsrfToken(req, res);

		res.status(STATUS_CODE.OK).json(
			apiResponseMap.ok<{ csrfToken: string }>(
				{ csrfToken: token },
				'CSRF_TOKEN_ISSUED'
			)
		);
	};

	/**
	 * Returns the authenticated user's auth context.
	 *
	 * @remarks
	 * - Used by frontend to bootstrap auth state
	 * - Single source of truth for identity & permissions
	 *
	 * @route GET /auth/me
	 */
	authMe = async (req: Request, res: Response): Promise<void> => {
		this.assertAuthenticated(req);
		const userId = req.user.id;

		const { user, permissions } = await this.authService.authUser(userId);

		res.status(STATUS_CODE.OK).json(
			apiResponseMap.ok<AuthMeDTO>(
				AuthMapper.toDTO(user, permissions),
				'AUTH_USER_RETRIEVED'
			)
		);
	};

	/**
	 * Initiates the Google OAuth flow.
	 * Passport redirects to Google — no body/response needed here.
	 *
	 * @route GET /auth/google
	 */
	googleAuth = (_req: Request, res: Response): void => {
		// Handled entirely by passport.authenticate() middleware in the router
		res.status(STATUS_CODE.OK).end();
	};

	/**
	 * Google OAuth callback — called after Google redirects back.
	 *
	 * @remarks
	 * - `req.user` is the normalized OAuthProfile set by the Passport strategy
	 * - Delegates find-or-create logic to authService.oauthUser()
	 * - Issues auth cookies and redirects to the frontend success URL
	 * - On failure, redirects to the frontend failure URL
	 *
	 * @route GET /auth/google/callback
	 */
	googleCallback = async (req: Request, res: Response): Promise<void> => {
		if (!req.user || !('providerId' in req.user)) {
			throw appErrorMap.unauthorized(ErrorCode.UNAUTHORIZED);
		}

		const { id, role } = await this.authService.oauthUser(req.user);

		AuthCookies.setCookies(res, id, role);
		res.redirect(oauthConfig.frontend.success);
	};

	/**
	 * Initiates the Facebook OAuth flow.
	 *
	 * @route GET /auth/facebook
	 */
	facebookAuth = (_req: Request, res: Response): void => {
		res.status(STATUS_CODE.OK).end();
	};

	/**
	 * Facebook OAuth callback — called after Facebook redirects back.
	 *
	 * @route GET /auth/facebook/callback
	 */
	facebookCallback = async (req: Request, res: Response): Promise<void> => {
		if (!req.user || !('providerId' in req.user)) {
			throw appErrorMap.unauthorized(ErrorCode.UNAUTHORIZED);
		}

		const { id, role } = await this.authService.oauthUser(req.user);

		AuthCookies.setCookies(res, id, role);
		res.redirect(oauthConfig.frontend.success);
	};
}