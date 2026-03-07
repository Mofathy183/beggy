/**
 * 🔐 AUTH — Identity, Credentials & Sessions
 *
 * The Auth domain is responsible for:
 * - User identity
 * - Authentication & authorization context
 * - Credential lifecycle (passwords, email, OAuth)
 * - Session and token management
 *
 * Auth answers the question:
 * "Who are you, and how do you prove it?"
 *
 * ------------------------------------------------------------------
 * Core Authentication
 * ------------------------------------------------------------------
 *
 * POST /auth/signup
 * - Registers a new user using email & password
 * - Creates a user identity and initial credentials
 * - May trigger email verification depending on configuration
 *
 * POST /auth/login
 * - Authenticates a user using credentials (email/password)
 * - Issues access and refresh tokens
 *
 * DELETE /auth/logout
 * - Invalidates the current user session
 * - Revokes refresh tokens where applicable
 *
 * POST /auth/refresh-token
 * - Issues a new access token using a valid refresh token
 * - Used to maintain authenticated sessions without re-login
 *
 * GET /auth/csrf-token
 * - Returns a CSRF token for state-changing requests
 * - Used mainly in cookie-based authentication flows
 *
 * ------------------------------------------------------------------
 * Auth Context
 * ------------------------------------------------------------------
 *
 * GET /auth/me
 * - Returns the current authenticated user's auth context
 * - Used by the frontend to bootstrap authentication state
 *
 * This endpoint is the single source of truth for frontend auth state.
 *
 * ------------------------------------------------------------------
 * Credentials Management
 * ------------------------------------------------------------------
 *
 * POST /auth/password
 * - Sets a password for users who signed up via OAuth
 * - Allowed only if the user does NOT already have a password
 *
 * PATCH /auth/password
 * - Changes the password for users who already have one
 * - Requires current password verification
 *
 * PATCH /auth/email
 * - Changes the user's email address
 * - Triggers a verification flow for the new email
 *
 * Using the same resource with different HTTP verbs:
 * - Keeps the API REST-correct
 * - Makes intent explicit
 * - Simplifies frontend logic
 *
 * ------------------------------------------------------------------
 * Email Verification
 * ------------------------------------------------------------------
 *
 * POST /auth/verification-email
 * - Sends a verification email to the user
 * - Used after signup or email change
 *
 * GET /auth/verify-email
 * - Consumes a verification token
 * - Marks the email as verified
 *
 * Naming distinction:
 * - "verification-email" → action (send)
 * - "verify-email"       → consumption (confirm)
 *
 * ------------------------------------------------------------------
 * Password Recovery
 * ------------------------------------------------------------------
 *
 * POST /auth/forgot-password
 * - Initiates a password reset flow
 * - Sends a password reset email if the user exists
 *
 * PATCH /auth/reset-password/:token
 * - Resets the user's password using a valid reset token
 *
 * ------------------------------------------------------------------
 * OAuth Authentication
 * ------------------------------------------------------------------
 *
 * GET /auth/google
 * GET /auth/google/callback
 *
 * GET /auth/facebook
 * GET /auth/facebook/callback
 *
 * - Initiates and completes OAuth authentication flows
 * - Creates or links user accounts using external providers
 *
 * OAuth endpoints are intentionally simple and provider-specific
 * to keep authentication flows easy to reason about.
 */
import { Router } from 'express';

import { Action, Subject } from '@beggy/shared/constants';
import { AuthSchema } from '@beggy/shared/schemas';
import { oauthConfig, passport } from '@config';
import { type AuthController } from '@modules/auth';
import {
	requireAuth,
	requireRefreshToken,
	requirePermission,
	validateBody,
} from '@shared/middlewares';

/**
 * Creates and configures the Auth router.
 *
 * @remarks
 * - Uses dependency injection for the controller
 * - Keeps routing declarative and testable
 * - Applies validation and auth middleware per route
 *
 * @param authController - AuthController instance
 * @returns Configured Express router
 */
export const createAuthRouter = (authController: AuthController): Router => {
	const router = Router();

	/**
	 * Register a new user using email & password.
	 */
	router.post(
		'/signup',
		validateBody(AuthSchema.signUp),
		authController.signup
	);

	/**
	 * Authenticate a user using LOCAL credentials.
	 */
	router.post('/login', validateBody(AuthSchema.login), authController.login);

	/**
	 * Resolve the currently authenticated user's auth context.
	 *
	 * @remarks
	 * - Used by the frontend to bootstrap authentication state
	 * - Requires a valid access token (via cookies)
	 * - Enforces READ permission on USER subject
	 * - Returns identity + effective permissions
	 *
	 * Middleware chain:
	 * - `requireAuth`:
	 *   - Verifies access token
	 *   - Attaches `req.user`
	 *   - Initializes CASL ability
	 * - `requirePermission`:
	 *   - Ensures the user can READ USER resources
	 *
	 * @route GET /auth/me
	 * @access Authenticated users only
	 */
	router.get(
		'/me',
		requireAuth,
		requirePermission(Action.READ, Subject.USER),
		authController.authMe
	);

	// --- Google OAuth ---

	/**
	 * Initiate Google OAuth flow.
	 * Passport redirects to Google's consent screen.
	 */
	router.get(
		'/google',
		passport.authenticate('google', {
			session: false,
			scope: oauthConfig.google.scope,
		})
	);

	/**
	 * Google OAuth callback.
	 *
	 * Passport verifies the code, calls the strategy, and populates req.user
	 * with the normalized OAuthProfile before calling the controller.
	 *
	 * On failure → redirect to frontend failure URL.
	 */
	router.get(
		'/google/callback',
		passport.authenticate('google', {
			session: false,
			failureRedirect: oauthConfig.frontend.failed,
		}),
		authController.googleCallback
	);

	// --- Facebook OAuth ---

	/**
	 * Initiate Facebook OAuth flow.
	 */
	router.get(
		'/facebook',
		passport.authenticate('facebook', {
			session: false,
			scope: ['email', 'public_profile'],
		})
	);

	/**
	 * Facebook OAuth callback.
	 */
	router.get(
		'/facebook/callback',
		passport.authenticate('facebook', {
			session: false,
			failureRedirect: oauthConfig.frontend.failed,
		}),
		authController.facebookCallback
	);

	/**
	 * Logout the currently authenticated user.
	 *
	 * @remarks
	 * - Stateless and idempotent
	 * - Clears authentication cookies
	 */
	router.delete('/logout', requireAuth, authController.logout);

	/**
	 * Refresh the access token using a valid refresh token.
	 */
	router.post(
		'/refresh-token',
		requireRefreshToken,
		authController.refreshToken
	);

	/**
	 * Issue a CSRF token for protected state-changing requests.
	 */
	router.get('/csrf-token', authController.csrfToken);

	return router;
};
