import type { Request } from 'express';
import { ErrorCode } from '@beggy/shared/constants';
import { appErrorMap } from '@shared/utils';
import type { AuthUser, OAuthProfile } from '@shared/types';
import type { Logger } from 'pino';

/**
 * Base HTTP controller providing shared cross-cutting behavior.
 *
 * @description
 * Supplies structured logging and authentication guards for
 * transport-layer controllers.
 *
 * @remarks
 * - Contains no business logic.
 * - Throws domain-level errors only.
 */
export class BaseController {
	protected constructor(protected readonly logger: Logger) {}

	/**
	 * Runtime guard for AuthUser.
	 */
	private isAuthUser(user: unknown): user is AuthUser {
		return !!user && typeof user === 'object' && 'id' in user;
	}

	/**
	 * Runtime guard for OAuthProfile.
	 */
	private isOAuthProfile(user: unknown): user is OAuthProfile {
		return !!user && typeof user === 'object' && 'providerId' in user;
	}

	/**
	 * Ensures that the request contains a valid authenticated user.
	 *
	 * @param req - Express request object.
	 *
	 * @throws { AppError } UNAUTHORIZED
	 * If authentication context is missing or malformed.
	 *
	 * @remarks
	 * Acts as a TypeScript type guard. After successful execution,
	 * `req.user` is guaranteed to exist and conform to `AuthUser`.
	 */
	protected assertAuthenticated(
		req: Request
	): asserts req is Request & { user: AuthUser } {
		if (!this.isAuthUser(req.user)) {
			this.logger.error(
				{ path: req.path },
				'Missing authenticated user context'
			);

			throw appErrorMap.unauthorized(ErrorCode.UNAUTHORIZED);
		}
	}

	/**
	 * Ensures request contains a valid OAuth profile.
	 */
	protected assertOAuthProfile(
		req: Request
	): asserts req is Request & { user: OAuthProfile } {
		if (!this.isOAuthProfile(req.user)) {
			this.logger.error(
				{ path: req.path },
				'OAuth profile missing from request'
			);

			throw appErrorMap.unauthorized(ErrorCode.UNAUTHORIZED);
		}
	}
}
