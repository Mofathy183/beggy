import type { Request } from 'express';
import { ErrorCode } from '@beggy/shared/constants';
import { appErrorMap } from '@shared/utils';
import type { AuthUser } from '@shared/types';
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
		if (!req.user?.id) {
			this.logger.error(
				{ path: req.path },
				'Missing authenticated user context'
			);

			throw appErrorMap.unauthorized(ErrorCode.UNAUTHORIZED);
		}
	}
}
